import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('keeps only public and private play regions in each movable module', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  for (let n = 1; n <= 12; n++) {
    expect(game[`player-module-${n}`]).toMatchObject({ movable: true });
    for (const prefix of ['seat', 'public-zone', 'private-backdrop', 'private-zone'])
      expect(game[`${prefix}-${n}`]).toMatchObject({ parent: `player-module-${n}` });
    for (const removed of ['general-zone', 'health', 'equipment', 'judgment', 'attachment']) expect(game[`${removed}-${n}`]).toBeUndefined();
  }
});

it('enables native enlarge on real cards, generals and identities', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  expect(game['main-deck']).toHaveProperty('cardDefaults.enlarge', 4.7);
  expect(game['general-deck']).toHaveProperty('cardDefaults.enlarge', 5.0);
  expect(game['identity-deck']).toHaveProperty('cardDefaults.enlarge', 5.0);
});
