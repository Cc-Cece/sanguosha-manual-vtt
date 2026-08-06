import { expect, it } from 'vitest';
import type { Widget } from '../src/types/vtt.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('uses distinct native holder semantics for piles, the stacked recycle target, free areas and the hand', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  for (const id of ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'])
    expect(game[id]).toMatchObject({ alignChildren: true, preventPiles: false, stackOffsetX: 0, stackOffsetY: 0 });

  expect(game['recycle-zone']).toMatchObject({
    alignChildren: true,
    preventPiles: true,
    stackOffsetX: 0,
    stackOffsetY: 0,
    dropOffsetX: 90,
    dropOffsetY: 28,
  });
  expect(game['public-zone-1']).toMatchObject({ alignChildren: false, preventPiles: false });
  expect(game['private-zone-1']).toMatchObject({ alignChildren: false, preventPiles: true });
  expect(game['personal-hand']).toMatchObject({ alignChildren: true, preventPiles: true, childrenPerOwner: true, stackOffsetY: 0 });
});

it('keeps desktop collection separate from recycle-zone-only shuffle', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  const collectButton = game['collect-shuffle'] as Widget;
  const recycleShuffleButton = game['recycle-shuffle-btn'] as Widget;
  const collectRoutine = JSON.stringify(collectButton.clickRoutine);
  const recycleShuffleRoutine = JSON.stringify(recycleShuffleButton.clickRoutine);

  expect(collectRoutine).toContain('"property":"parent","relation":"==","value":null');
  expect(collectRoutine).toContain('"func":"MOVE","collection":"collectCollectableCards","to":"recycle-zone"');
  expect(collectRoutine).not.toContain('"func":"RECALL"');
  expect(collectRoutine).not.toContain('"func":"SHUFFLE"');

  expect(recycleShuffleRoutine).toContain('"property":"parent","relation":"==","value":"recycle-zone"');
  expect(recycleShuffleRoutine).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"recycleShuffleAllowedCards"');
  expect(recycleShuffleRoutine).toContain('"func":"FLIP","holder":["recycle-zone"],"face":0');
  expect(recycleShuffleRoutine).toContain('"func":"SHUFFLE","holder":["recycle-zone"],"mode":"true random"');
  expect(recycleShuffleRoutine).not.toContain('"func":"RECALL"');
  expect(recycleShuffleRoutine).not.toContain('"to":"draw-pile"');
});
