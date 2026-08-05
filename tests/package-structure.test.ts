import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { validatePrototype } from '../src/validation/validate.js';
import { loadTestCatalog } from './helpers.js';

it('has unique references and contains no imported game-specific rules', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  expect(validatePrototype(game)).toEqual([]);
  const text = JSON.stringify(game);
  for (const forbidden of ['Bao Huang', 'Guan Dan', 'Whodunit', 'Poker', 'distanceRoutine', 'damageRoutine', 'turnRoutine', 'victoryRoutine'])
    expect(text).not.toContain(forbidden);
});

it('build output contains one variant and all optimized card faces', async () => {
  const path = resolve('dist', 'Sanguosha-Manual-4P-Prototype.vtt');
  try {
    const zip = await JSZip.loadAsync(await readFile(path));
    expect(zip.file('0.json')).not.toBeNull();
    const uniqueAssets = new Set(loadTestCatalog().assets.filter(asset => asset.category !== 'markers-and-reference').map(asset => asset.asset));
    expect(Object.keys(zip.files).filter(name => name.startsWith('assets/') && !name.endsWith('/'))).toHaveLength(uniqueAssets.size);
    const game = JSON.parse(await zip.file('0.json')!.async('string')) as Record<string, any>;
    const assetReferences = new Set<string>();
    for (const value of Object.values(game))
      if (value?.type === 'deck') for (const cardType of Object.values(value.cardTypes ?? {}) as any[])
        if (cardType.asset) assetReferences.add(cardType.asset);
    expect(assetReferences).toEqual(uniqueAssets);
    for (const file of Object.values(zip.files).filter(file => file.name.startsWith('assets/') && !file.dir)) {
      const internal = (file as any)._data;
      expect(assetReferences.has(`/assets/${internal.crc32}_${internal.uncompressedSize}`)).toBe(true);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
});
