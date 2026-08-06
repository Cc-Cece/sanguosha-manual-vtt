import { describe, expect, it } from 'vitest';
import {
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_COLLECT_GROUP_ID,
  RECYCLE_PANEL_ID,
} from '../src/layouts/shufflePanels.js';
import { animatedShuffleRecycleZoneRoutine } from '../src/routines/animatedShuffle.js';
import {
  fixedCollectLooseTableCardsRoutine,
  fixedRequestCollectLooseTableCardsRoutine,
  fixedRequestShuffleRecycleZoneRoutine,
  RECYCLE_COLLECT_STACK_ID,
  RECYCLE_SHUFFLE_BUFFER_ID,
} from '../src/routines/recycleZoneRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { createUniversalPrototype as createBaseUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { SHUFFLE_BUTTON_IDS } from '../src/widgets/shuffleAnimation.js';
import { loadTestCatalog } from './helpers.js';

const asRecord = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

describe('final packaged runtime integration', () => {
  it('keeps the free recycle runtime inside a movable panel in the base prototype', () => {
    const game = createBaseUniversalPrototype(loadTestCatalog());
    const recyclePanel = asRecord(game[RECYCLE_PANEL_ID]);
    const recycleZone = asRecord(game['recycle-zone']);
    const collectGroup = asRecord(game[RECYCLE_COLLECT_GROUP_ID]);

    expect(recyclePanel).toMatchObject({ movable: true, recycleSizePercent: 100 });
    expect(recycleZone).toMatchObject({ parent: RECYCLE_PANEL_ID, movable: false });
    expect(recycleZone.alignChildren).toBe(false);
    expect(recycleZone.preventPiles).toBe(true);
    expect(recycleZone.dropOffsetX).toBe(0);
    expect(recycleZone.dropOffsetY).toBe(0);
    expect(collectGroup).toMatchObject({ parent: 'recycle-zone', movable: true, fixedParent: true });
    expect(asRecord(game[RECYCLE_COLLECT_STACK_ID])).toMatchObject({ parent: RECYCLE_COLLECT_GROUP_ID, alignChildren: true });
    expect(asRecord(game[RECYCLE_SHUFFLE_BUFFER_ID])).toMatchObject({ display: false, alignChildren: true });
    expect(asRecord(game['collect-shuffle']).clickRoutine).toEqual(fixedCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-collect-table-cards']).clickRoutine).toEqual(fixedRequestCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-shuffle-recycle-btn']).clickRoutine).toEqual(fixedRequestShuffleRecycleZoneRoutine);
  });

  it('installs panel-relative animation widgets without undoing recycle fixes', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const recycleZone = asRecord(game['recycle-zone']);
    const recycleRoutine = asRecord(game['recycle-shuffle-btn']).clickRoutine;
    const recycleAnimationCard = asRecord(game['shuffle-animation-recycle-zone-1']);
    const quickAnimationCard = asRecord(game['shuffle-animation-quick-shuffle-1']);

    expect(recycleZone.alignChildren).toBe(false);
    expect(recycleZone.preventPiles).toBe(true);
    expect(asRecord(game[QUICK_SHUFFLE_PANEL_ID])).toMatchObject({ movable: true });
    expect(asRecord(game['collect-shuffle']).clickRoutine).toEqual(fixedCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-collect-table-cards']).clickRoutine).toEqual(fixedRequestCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-shuffle-recycle-btn']).clickRoutine).toEqual(fixedRequestShuffleRecycleZoneRoutine);
    expect(recycleRoutine).toEqual(animatedShuffleRecycleZoneRoutine);
    expect(JSON.stringify(recycleRoutine)).toContain('"func":"DELAY"');
    expect(recycleAnimationCard).toMatchObject({ parent: RECYCLE_COLLECT_GROUP_ID, display: false, clickable: false, layer: 90 });
    expect(quickAnimationCard).toMatchObject({ parent: QUICK_SHUFFLE_PANEL_ID, display: false, clickable: false, layer: 90 });
    expect(JSON.stringify(recycleRoutine)).toContain('"type":"subtitle"');
    expect(JSON.stringify(recycleRoutine)).not.toContain('"type":"text","label"');
  });

  it('extracts only valid gameplay cards and leaves other recycle-area cards untouched', () => {
    const serialized = JSON.stringify(animatedShuffleRecycleZoneRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":"recycle-zone","collection":"recycleDirectCards"');
    expect(serialized).toContain(`"property":"parent","relation":"==","value":"${RECYCLE_COLLECT_STACK_ID}","collection":"recycleStackCards"`);
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"recycleGameplayCards"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"recycleGameplayCards","mode":"add"');
    expect(serialized).toContain(`"to":"${RECYCLE_SHUFFLE_BUFFER_ID}"`);
    expect(serialized).toContain('"to":"draw-pile"');
    expect(serialized).not.toContain('"holder":["recycle-zone"],"mode":"true random"');
  });

  it('locks ordinary-player request controls during every shuffle animation', () => {
    expect(SHUFFLE_BUTTON_IDS).toEqual(expect.arrayContaining([
      'collect-shuffle',
      'request-collect-table-cards',
      'request-shuffle-draw-pile-btn',
      'request-shuffle-recycle-btn',
      'request-shuffle-general-reserve-btn',
      'request-shuffle-identity-reserve-btn',
      'request-shuffle-extra-reserve-btn',
      'request-shuffle-marker-reserve-btn',
    ]));
  });

  it('normalizes widget references while keeping movable panel layout operations valid', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const lockRoutine = asRecord(game['lock-layout']).clickRoutine;
    const arrangeRoutine = asRecord(game['arrange-layout']).clickRoutine as Record<string, unknown>[];

    expect(JSON.stringify(lockRoutine)).toContain('player-mgmt-panel');
    expect(JSON.stringify(lockRoutine)).not.toContain('player-management-panel');
    expect(JSON.stringify(lockRoutine)).toContain(QUICK_SHUFFLE_PANEL_ID);
    expect(JSON.stringify(lockRoutine)).toContain(RECYCLE_PANEL_ID);
    expect(JSON.stringify(lockRoutine)).toContain(RECYCLE_COLLECT_GROUP_ID);
    expect(arrangeRoutine.every(step => step.func !== 'MOVEXY' || ('from' in step && !('collection' in step)))).toBe(true);
  });
});
