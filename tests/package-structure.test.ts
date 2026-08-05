import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSZip from 'jszip';
import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { validatePrototype } from '../src/validation/validate.js';

it('has unique references and contains no imported game-specific rules', () => {
  const game = createFourPlayerPrototype();
  expect(validatePrototype(game)).toEqual([]);
  const text = JSON.stringify(game);
  for (const forbidden of ['Bao Huang', 'Guan Dan', 'Whodunit', 'Poker', 'distanceRoutine', 'damageRoutine', 'turnRoutine', 'victoryRoutine'])
    expect(text).not.toContain(forbidden);
});

it('build output contains exactly one 0.json variant', async () => {
  const path = resolve('dist', 'Sanguosha-Manual-4P-Prototype.vtt');
  try {
    const zip = await JSZip.loadAsync(await readFile(path));
    expect(Object.keys(zip.files)).toEqual(['0.json']);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
});
