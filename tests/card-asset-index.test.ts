import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import {
  getCardIndexEntryByCardId,
  loadCardAssetIndex,
  resetCardAssetIndexCache,
  resolveBackOptimizedFile,
  resolveCardAssetFromIndex,
  resolveRenamedPath,
} from '../src/data/cardAssetIndex.js';

const root = resolve('assets', 'cards-webp');

function existsWithExactCase(relativePath: string): boolean {
  const segments = relativePath.replaceAll('\\', '/').split('/').filter(Boolean);
  let current = root;

  for (const segment of segments) {
    if (!existsSync(current)) return false;
    const entries = readdirSync(current);
    if (!entries.includes(segment)) return false;
    current = resolve(current, segment);
  }

  return existsSync(current);
}

it('loads index.json and rename_map as the asset naming source of truth', () => {
  resetCardAssetIndexCache();
  expect(existsSync(resolve(root, 'index.json'))).toBe(true);
  expect(existsSync(resolve(root, 'rename_map.txt'))).toBe(true);

  loadCardAssetIndex(root);

  const iceSword = getCardIndexEntryByCardId(12300, root);
  expect(iceSword?.chineseName).toBe('寒冰剑');
  expect(iceSword?.path).toBe('playing-cards/basic/Equip_S_2_IceSword.webp');

  expect(resolveRenamedPath('playing-cards/basic/basic_12300.webp', root))
    .toBe('playing-cards/basic/Equip_S_2_IceSword.webp');
  expect(resolveBackOptimizedFile('other\\back-main.webp', root)).toBe('other/Back_Main.webp');
});

it('keeps every semantic index and rename target backed by an exact-case repository file', () => {
  const rawIndex = JSON.parse(readFileSync(resolve(root, 'index.json'), 'utf8')) as Record<string, unknown>;
  for (const path of Object.keys(rawIndex)) {
    expect(existsWithExactCase(path), `Missing exact-case index target: ${path}`).toBe(true);
  }

  const renameText = readFileSync(resolve(root, 'rename_map.txt'), 'utf8');
  for (const line of renameText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('->')) continue;
    const target = trimmed.split('->', 2)[1]?.trim();
    if (!target) continue;
    expect(existsWithExactCase(target), `Missing exact-case rename target: ${target}`).toBe(true);
  }
});

it('resolves a general from a legacy numeric path via the index', () => {
  resetCardAssetIndexCache();
  const resolved = resolveCardAssetFromIndex({
    id: 'asset-dianwei',
    sequence: 1,
    cardId: 11500,
    category: 'generals',
    source: 'cleaned-and-classified-cards/generals/fire_11500.webp',
    optimizedFile: 'generals/fire/fire_11500.webp',
    asset: '/assets/0_0',
    bytes: 1,
    width: 1,
    height: 1,
    label: 'unnamed',
  }, root);

  expect(resolved.optimizedFile).toBe('generals/fire/General_Fire_Dianwei.webp');
  expect(resolved.label).toContain('典韦');
  expect(resolved.subCategory).toBe('fire');
});

it('resolves other_* markers whose index source_id is a legacy filename string', () => {
  resetCardAssetIndexCache();
  const resolved = resolveCardAssetFromIndex({
    id: 'asset-314',
    sequence: 314,
    cardId: 15800,
    category: 'markers-and-reference',
    source: 'cleaned-and-classified-cards/markers-and-reference/0314-201def-15800-unnamed.png',
    optimizedFile: 'other/other_15800.webp',
    asset: '/assets/0_0',
    bytes: 1,
    width: 1,
    height: 1,
    label: 'unnamed',
  }, root);

  expect(resolved.optimizedFile).toBe('other/Treasure_Muniuliuma.webp');
  expect(resolved.label).toContain('木牛流马');
  expect(resolved.subCategory).toBe('other');
});
