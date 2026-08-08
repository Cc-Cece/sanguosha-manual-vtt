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
