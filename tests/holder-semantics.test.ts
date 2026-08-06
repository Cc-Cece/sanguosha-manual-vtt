import { expect, it } from 'vitest';
import type { Widget } from '../src/types/vtt.js';
import { RECYCLE_COLLECT_STACK_ID, RECYCLE_SHUFFLE_BUFFER_ID } from '../src/routines/recycleZoneRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('uses distinct native holder semantics for piles, the free recycle area and the hand', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  for (const id of ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'])
    expect(game[id]).toMatchObject({ alignChildren: true, preventPiles: false, stackOffsetX: 0, stackOffsetY: 0 });

  expect(game['recycle-zone']).toMatchObject({
    alignChildren: false,
    preventPiles: true,
    stackOffsetX: 0,
    stackOffsetY: 0,
    dropOffsetX: 0,
    dropOffsetY: 0,
  });
  expect(game[RECYCLE_COLLECT_STACK_ID]).toMatchObject({
    parent: 'recycle-zone',
    alignChildren: true,
    preventPiles: true,
    stackOffsetX: 0,
    stackOffsetY: 0,
  });
  expect(game[RECYCLE_SHUFFLE_BUFFER_ID]).toMatchObject({
    display: false,
    alignChildren: true,
    preventPiles: true,
  });
  expect(game['public-zone-1']).toMatchObject({ alignChildren: false, preventPiles: false });
  expect(game['private-zone-1']).toMatchObject({ alignChildren: false, preventPiles: true });
  expect(game['personal-hand']).toMatchObject({ alignChildren: true, preventPiles: true, childrenPerOwner: true, stackOffsetY: 0 });
});

it('keeps desktop collection separate from selective recycle-to-draw shuffle', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  const collectButton = game['collect-shuffle'] as Widget;
  const recycleShuffleButton = game['recycle-shuffle-btn'] as Widget;
  const collectRoutine = JSON.stringify(collectButton.clickRoutine);
  const recycleShuffleRoutine = JSON.stringify(recycleShuffleButton.clickRoutine);

  expect(collectRoutine).toContain('"property":"parent","relation":"==","value":null');
  expect(collectRoutine).toContain(`"func":"MOVE","collection":"collectCollectableCards","to":"${RECYCLE_COLLECT_STACK_ID}"`);
  expect(collectRoutine).not.toContain('"func":"RECALL"');
  expect(collectRoutine).not.toContain('"func":"SHUFFLE"');

  expect(recycleShuffleRoutine).toContain('"property":"parent","relation":"==","value":"recycle-zone"');
  expect(recycleShuffleRoutine).toContain(`"property":"parent","relation":"==","value":"${RECYCLE_COLLECT_STACK_ID}"`);
  expect(recycleShuffleRoutine).toContain(`"func":"SHUFFLE","holder":["${RECYCLE_SHUFFLE_BUFFER_ID}"],"mode":"true random"`);
  expect(recycleShuffleRoutine).toContain(`"func":"MOVE","from":["${RECYCLE_SHUFFLE_BUFFER_ID}"],"to":"draw-pile"`);
  expect(recycleShuffleRoutine).not.toContain('"func":"RECALL"');
  expect(recycleShuffleRoutine).not.toContain('"func":"SHUFFLE","holder":["recycle-zone"]');
});
