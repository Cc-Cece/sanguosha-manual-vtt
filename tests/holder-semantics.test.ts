import { expect, it } from 'vitest';
import type { Widget } from '../src/types/vtt.js';
import {
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_COLLECT_GROUP_ID,
  RECYCLE_PANEL_ID,
} from '../src/layouts/shufflePanels.js';
import { RECYCLE_COLLECT_STACK_ID, RECYCLE_SHUFFLE_BUFFER_ID } from '../src/routines/recycleZoneRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('uses movable panel groups while keeping draw pile and hand fixed', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  for (const id of ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'])
    expect(game[id]).toMatchObject({ alignChildren: true, preventPiles: false, stackOffsetX: 0, stackOffsetY: 0 });

  expect(game[QUICK_SHUFFLE_PANEL_ID]).toMatchObject({ movable: true });
  expect(game['quick-shuffle-zone']).toMatchObject({ parent: QUICK_SHUFFLE_PANEL_ID, movable: false });
  expect(game['quick-shuffle-btn']).toMatchObject({ parent: QUICK_SHUFFLE_PANEL_ID, movable: false });

  expect(game[RECYCLE_PANEL_ID]).toMatchObject({ movable: true, recycleSizePercent: 100 });
  expect(game['recycle-zone']).toMatchObject({
    parent: RECYCLE_PANEL_ID,
    movable: false,
    alignChildren: false,
    preventPiles: true,
    stackOffsetX: 0,
    stackOffsetY: 0,
    dropOffsetX: 0,
    dropOffsetY: 0,
  });
  expect(game[RECYCLE_COLLECT_GROUP_ID]).toMatchObject({
    parent: 'recycle-zone',
    movable: true,
    fixedParent: true,
  });
  expect(game[RECYCLE_COLLECT_STACK_ID]).toMatchObject({
    parent: RECYCLE_COLLECT_GROUP_ID,
    movable: false,
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
  expect(game['draw-pile']).toMatchObject({ movable: false });
  expect(game['personal-hand']).toMatchObject({ movable: false, alignChildren: true, preventPiles: true, childrenPerOwner: true, stackOffsetY: 0 });
  expect(game['public-zone-1']).toMatchObject({ alignChildren: false, preventPiles: false });
  expect(game['private-zone-1']).toMatchObject({ alignChildren: false, preventPiles: true });
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
