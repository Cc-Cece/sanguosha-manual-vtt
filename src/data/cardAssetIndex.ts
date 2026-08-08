import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { AssetSubCategory, CardAsset } from '../types/assets.js';

/** Metadata entry from assets/cards-webp/index.json */
export interface CardIndexEntry {
  path: string;
  sourceId: number | string;
  sourceFile: string;
  chineseName: string;
  fullChinese: string;
  type: string;
  category: string;
  assetGroup: string;
  filename: string;
  copyIndex?: number;
  englishName?: string;
  subtype?: string;
}

export interface ResolvedCardAssetPaths {
  optimizedFile: string;
  label: string;
  subCategory: AssetSubCategory;
}

interface RawIndexEntry {
  source_id: number | string;
  source_file: string;
  chinese_name?: string;
  full_chinese?: string;
  type?: string;
  category?: string;
  asset_group?: string;
  filename?: string;
  copy_index?: number;
  english_name?: string;
  subtype?: string;
}

/** Legacy identity filenames keyed by catalog sequence (not cardId). */
const identityOldPathBySequence: Record<number, string> = {
  74: 'identity-cards/role_renegade_01.webp',
  75: 'identity-cards/role_renegade_02.webp',
  76: 'identity-cards/role_rebel_01.webp',
  77: 'identity-cards/role_rebel_02.webp',
  78: 'identity-cards/role_rebel_03.webp',
  79: 'identity-cards/role_rebel_04.webp',
  80: 'identity-cards/role_loyalist_01.webp',
  81: 'identity-cards/role_loyalist_02.webp',
  82: 'identity-cards/role_loyalist_03.webp',
  83: 'identity-cards/role_lord.webp',
};

const BACK_FILE_MAP: Record<string, string> = {
  'other/back-generals.webp': 'other/Back_Generals.webp',
  'other/back-identities.webp': 'other/Back_Identities.webp',
  'other/back-main.webp': 'other/Back_Main.webp',
  'other\\back-generals.webp': 'other/Back_Generals.webp',
  'other\\back-identities.webp': 'other/Back_Identities.webp',
  'other\\back-main.webp': 'other/Back_Main.webp',
};

const COVER_OPTIMIZED_FILE = 'other/Cover.webp';

let cachedRoot: string | undefined;
let byNumericId: Map<number, CardIndexEntry> | undefined;
let bySourceFile: Map<string, CardIndexEntry> | undefined;
let byPath: Map<string, CardIndexEntry> | undefined;
let renameOldToNew: Map<string, string> | undefined;

function normalizeRel(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\.\//, '');
}

function parseIndexEntry(path: string, raw: RawIndexEntry): CardIndexEntry {
  return {
    path: normalizeRel(path),
    sourceId: raw.source_id,
    sourceFile: raw.source_file,
    chineseName: raw.chinese_name ?? '',
    fullChinese: raw.full_chinese ?? raw.chinese_name ?? '',
    type: raw.type ?? '',
    category: raw.category ?? '',
    assetGroup: raw.asset_group ?? '',
    filename: raw.filename ?? path.split('/').pop() ?? path,
    copyIndex: raw.copy_index,
    englishName: raw.english_name,
    subtype: raw.subtype,
  };
}

/** Extract trailing numeric id from legacy files like basic_12300.webp / other_15800.webp. */
function numericIdFromSourceFile(sourceFile: string): number | undefined {
  const match = sourceFile.match(/_(\d+)\.webp$/i);
  if (!match) return undefined;
  return Number(match[1]);
}

function defaultIndexRoot(): string {
  return resolve('assets', 'cards-webp');
}

export function loadCardAssetIndex(root: string = defaultIndexRoot()): void {
  if (cachedRoot === root && byNumericId && bySourceFile && byPath && renameOldToNew) return;

  const indexPath = resolve(root, 'index.json');
  const renamePath = resolve(root, 'rename_map.txt');
  const rawIndex = JSON.parse(readFileSync(indexPath, 'utf8')) as Record<string, RawIndexEntry>;

  byNumericId = new Map();
  bySourceFile = new Map();
  byPath = new Map();

  for (const [path, raw] of Object.entries(rawIndex)) {
    const entry = parseIndexEntry(path, raw);
    byPath.set(entry.path, entry);
    bySourceFile.set(entry.sourceFile, entry);

    if (typeof entry.sourceId === 'number') {
      byNumericId.set(entry.sourceId, entry);
    }

    const fromFile = numericIdFromSourceFile(entry.sourceFile);
    if (fromFile !== undefined && !byNumericId.has(fromFile)) {
      byNumericId.set(fromFile, entry);
    }
  }

  renameOldToNew = new Map();
  const renameText = readFileSync(renamePath, 'utf8');
  for (const line of renameText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('->')) continue;
    const [fromRaw, toRaw] = trimmed.split('->').map(part => normalizeRel(part.trim()));
    if (fromRaw && toRaw) renameOldToNew.set(fromRaw, toRaw);
  }

  cachedRoot = root;
}

/** Test helper: drop cached maps so the next load re-reads disk. */
export function resetCardAssetIndexCache(): void {
  cachedRoot = undefined;
  byNumericId = undefined;
  bySourceFile = undefined;
  byPath = undefined;
  renameOldToNew = undefined;
}

function ensureLoaded(root?: string): void {
  loadCardAssetIndex(root ?? defaultIndexRoot());
}

export function getCardIndexEntryByCardId(cardId: number, root?: string): CardIndexEntry | undefined {
  ensureLoaded(root);
  return byNumericId!.get(cardId);
}

export function getCardIndexEntryByPath(path: string, root?: string): CardIndexEntry | undefined {
  ensureLoaded(root);
  return byPath!.get(normalizeRel(path));
}

export function resolveRenamedPath(oldRelativePath: string, root?: string): string {
  ensureLoaded(root);
  const key = normalizeRel(oldRelativePath);
  return renameOldToNew!.get(key) ?? BACK_FILE_MAP[key] ?? key;
}

export function getCoverOptimizedFile(): string {
  return COVER_OPTIMIZED_FILE;
}

export function resolveBackOptimizedFile(optimizedFile: string, root?: string): string {
  const normalized = normalizeRel(optimizedFile);
  if (BACK_FILE_MAP[normalized]) return BACK_FILE_MAP[normalized];
  return resolveRenamedPath(normalized, root);
}

function subCategoryFromPath(path: string): AssetSubCategory {
  const parts = normalizeRel(path).split('/');
  if (parts[0] === 'generals' && parts[1]) return parts[1] as AssetSubCategory;
  if (parts[0] === 'playing-cards' && parts[1] === 'basic') return 'basic';
  if (parts[0] === 'playing-cards' && parts[1] === 'expansions') return 'expansions';
  if (parts[0] === 'identity-cards') return 'identity';
  if (parts[0] === 'health-cards') return 'health';
  if (parts[0] === 'other') return 'other';
  throw new Error(`Cannot derive subCategory from path: ${path}`);
}

function labelForEntry(entry: CardIndexEntry, asset: CardAsset): string {
  if (asset.category === 'identities') {
    const name = entry.chineseName || '身份牌';
    if (entry.subtype === 'Lord' || entry.englishName === 'Lord' || name === '主公') return name;
    const copy = entry.copyIndex ?? 1;
    return `${name} ${copy}`;
  }

  if (asset.category === 'generals') {
    return entry.chineseName || entry.fullChinese || `武将牌 ${asset.cardId}`;
  }

  if (
    asset.category === 'gameplay-standard-junzheng-160'
    || asset.category === 'gameplay-extra'
  ) {
    return entry.fullChinese || entry.chineseName || `牌 ${asset.cardId}`;
  }

  if (asset.category === 'markers-and-reference') {
    return entry.chineseName || entry.fullChinese || `标记 ${asset.cardId}`;
  }

  return entry.fullChinese || entry.chineseName || `牌 ${asset.cardId}`;
}

function resolveIdentityEntry(asset: CardAsset, root?: string): CardIndexEntry {
  ensureLoaded(root);
  const oldPath = identityOldPathBySequence[asset.sequence];
  if (!oldPath) {
    throw new Error(`Missing identity sequence mapping for sequence ${asset.sequence}`);
  }
  const newPath = resolveRenamedPath(oldPath, root);
  const entry = byPath!.get(newPath) ?? bySourceFile!.get(oldPath.split('/').pop()!);
  if (!entry) {
    throw new Error(`Missing identity index entry for sequence ${asset.sequence} (${oldPath} -> ${newPath})`);
  }
  return entry;
}

/**
 * Resolve organized path + label for a catalog face using index.json / rename_map.
 * Throws if the asset cannot be mapped — silent template guessing is not allowed.
 */
export function resolveCardAssetFromIndex(asset: CardAsset, root?: string): ResolvedCardAssetPaths {
  ensureLoaded(root);

  let entry: CardIndexEntry | undefined;

  if (asset.category === 'identities') {
    entry = resolveIdentityEntry(asset, root);
  } else {
    entry = byNumericId!.get(asset.cardId);
  }

  if (!entry) {
    throw new Error(
      `No card asset index entry for cardId=${asset.cardId} sequence=${asset.sequence} category=${asset.category}`,
    );
  }

  return {
    optimizedFile: entry.path,
    label: labelForEntry(entry, asset),
    subCategory: subCategoryFromPath(entry.path),
  };
}
