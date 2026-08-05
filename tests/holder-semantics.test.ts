import { expect, it } from 'vitest';
import { collectAndShuffleRoutine } from '../src/routines/tableActions.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('uses distinct native holder semantics for piles, free areas and the hand', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  for (const id of ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'])
    expect(game[id]).toMatchObject({ alignChildren: true, preventPiles: false, stackOffsetX: 0, stackOffsetY: 0 });
  for (const id of ['recycle-zone', 'public-zone-1', 'private-zone-1'])
    expect(game[id]).toMatchObject({ alignChildren: false, preventPiles: false });
  expect(game['personal-hand']).toMatchObject({ alignChildren: true, preventPiles: true, childrenPerOwner: true, stackOffsetY: 0 });
});

it('collects only from the recycle zone and shuffles only the draw pile', () => {
  expect(collectAndShuffleRoutine).toEqual([
    { func: 'MOVE', from: ['recycle-zone'], to: ['draw-pile'], count: 'all', face: 0 },
    { func: 'SHUFFLE', holder: ['draw-pile'], mode: 'true random' },
  ]);
});
