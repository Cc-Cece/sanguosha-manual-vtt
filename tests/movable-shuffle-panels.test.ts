import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RECYCLE_AREA_SIZE,
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_COLLECT_GROUP_ID,
  RECYCLE_PANEL_ID,
  RECYCLE_SIZE_DOWN_BUTTON_ID,
  RECYCLE_SIZE_UP_BUTTON_ID,
} from '../src/layouts/shufflePanels.js';
import {
  arrangeLayoutRoutine,
  decreaseRecycleAreaRoutine,
  increaseRecycleAreaRoutine,
  lockLayoutRoutine,
  unlockLayoutRoutine,
} from '../src/routines/layoutControls.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

const serialized = (value: unknown): string => JSON.stringify(value);

describe('movable shuffle panels and recycle sizing', () => {
  it('groups quick shuffle controls and recycle controls under movable panels', () => {
    const game = createUniversalPrototype(loadTestCatalog());

    expect(game[QUICK_SHUFFLE_PANEL_ID]).toMatchObject({ movable: true });
    expect(game['quick-shuffle-zone']).toMatchObject({ parent: QUICK_SHUFFLE_PANEL_ID, movable: false });
    expect(game['quick-shuffle-btn']).toMatchObject({ parent: QUICK_SHUFFLE_PANEL_ID, movable: false });

    expect(game[RECYCLE_PANEL_ID]).toMatchObject({
      movable: true,
      recycleSizePercent: 100,
      width: DEFAULT_RECYCLE_AREA_SIZE.panelWidth,
      height: DEFAULT_RECYCLE_AREA_SIZE.panelHeight,
    });
    expect(game['recycle-zone']).toMatchObject({ parent: RECYCLE_PANEL_ID, movable: false });
    expect(game[RECYCLE_COLLECT_GROUP_ID]).toMatchObject({ parent: 'recycle-zone', movable: true, fixedParent: true });
    expect(game['recycle-shuffle-btn']).toMatchObject({ parent: RECYCLE_PANEL_ID, movable: false });
    expect(game['request-shuffle-recycle-btn']).toMatchObject({ parent: RECYCLE_PANEL_ID, movable: false });
  });

  it('changes real dimensions at 100, 125, 150 and 200 percent without using scale', () => {
    const increase = serialized(increaseRecycleAreaRoutine);
    const decrease = serialized(decreaseRecycleAreaRoutine);

    for (const percent of [100, 125, 150, 200])
      expect(increase + decrease).toContain(`"value":${percent}`);
    expect(increase).toContain('"property":"width"');
    expect(increase).toContain('"property":"height"');
    expect(increase).toContain('"property":"recycleSizePercent"');
    expect(increase).not.toContain('"property":"scale"');
    expect(decrease).not.toContain('"property":"scale"');
  });

  it('locks and unlocks movable layout groups without ever unlocking draw pile or hand', () => {
    const lock = serialized(lockLayoutRoutine);
    const unlock = serialized(unlockLayoutRoutine);

    for (const id of [QUICK_SHUFFLE_PANEL_ID, RECYCLE_PANEL_ID, RECYCLE_COLLECT_GROUP_ID]) {
      expect(lock).toContain(id);
      expect(unlock).toContain(id);
    }
    expect(lock).toContain(RECYCLE_SIZE_DOWN_BUTTON_ID);
    expect(lock).toContain(RECYCLE_SIZE_UP_BUTTON_ID);
    expect(unlock).toContain('"collection":["draw-pile","personal-hand"],"property":"movable","value":false');
    expect(unlock).not.toContain('"collection":["draw-pile","personal-hand"],"property":"movable","value":true');
  });

  it('automatic layout restores panel positions, collect-stack position and 100 percent size', () => {
    const arrange = serialized(arrangeLayoutRoutine);

    expect(arrange).toContain(`"from":["${QUICK_SHUFFLE_PANEL_ID}"]`);
    expect(arrange).toContain(`"from":["${RECYCLE_PANEL_ID}"]`);
    expect(arrange).toContain(`"from":["${RECYCLE_COLLECT_GROUP_ID}"]`);
    expect(arrange).toContain('"property":"recycleSizePercent","value":100');
    expect(arrange).toContain(`"property":"width","value":${DEFAULT_RECYCLE_AREA_SIZE.zoneWidth}`);
    expect(arrange).toContain(`"property":"height","value":${DEFAULT_RECYCLE_AREA_SIZE.zoneHeight}`);
  });
});
