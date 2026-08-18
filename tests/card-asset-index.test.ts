import { existsSync } from 'node:fs';
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
