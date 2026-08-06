import { describe, expect, it } from 'vitest';
import { animatedShuffleRecycleZoneRoutine } from '../src/routines/animatedShuffle.js';
import {
  fixedCollectLooseTableCardsRoutine,
  fixedRequestCollectLooseTableCardsRoutine,
  fixedRequestShuffleRecycleZoneRoutine,
} from '../src/routines/recycleZoneRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { createUniversalPrototype as createBaseUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { SHUFFLE_BUTTON_IDS } from '../src/widgets/shuffleAnimation.js';
import { loadTestCatalog } from './helpers.js';

const asRecord = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

describe('final packaged runtime integration', () => {
  it('keeps the safe recycle runtime in the base prototype', () => {
    const game = createBaseUniversalPrototype(loadTestCatalog());
    const recycleZone = asRecord(game['recycle-zone']);

    expect(recycleZone.alignChildren).toBe(true);
    expect(recycleZone.preventPiles).toBe(true);
    expect(recycleZone.dropOffsetX).toBe(90);
    expect(recycleZone.dropOffsetY).toBe(28);
    expect(asRecord(game['collect-shuffle']).clickRoutine).toEqual(fixedCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-collect-table-cards']).clickRoutine).toEqual(fixedRequestCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-shuffle-recycle-btn']).clickRoutine).toEqual(fixedRequestShuffleRecycleZoneRoutine);
  });

  it('installs the corrected animated recycle routine in the final build without undoing other fixes', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const recycleZone = asRecord(game['recycle-zone']);

    expect(recycleZone.alignChildren).toBe(true);
    expect(recycleZone.preventPiles).toBe(true);
    expect(asRecord(game['collect-shuffle']).clickRoutine).toEqual(fixedCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-collect-table-cards']).clickRoutine).toEqual(fixedRequestCollectLooseTableCardsRoutine);
    expect(asRecord(game['request-shuffle-recycle-btn']).clickRoutine).toEqual(fixedRequestShuffleRecycleZoneRoutine);
    expect(asRecord(game['recycle-shuffle-btn']).clickRoutine).toEqual(animatedShuffleRecycleZoneRoutine);
  });

  it('uses explicit predicates when the animated routine assembles allowed recycle cards', () => {
    const serialized = JSON.stringify(animatedShuffleRecycleZoneRoutine);

    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"recycleShuffleAllowedCards"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"recycleShuffleAllowedCards","mode":"add"');
    expect(serialized).not.toContain('"source":"recycleMainDeckCards","type":"card","collection":"recycleShuffleAllowedCards"');
    expect(serialized).toContain('转换技状态牌');
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

  it('normalizes legacy widget references and MOVEXY syntax in the generated game', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const lockRoutine = asRecord(game['lock-layout']).clickRoutine;
    const arrangeRoutine = asRecord(game['arrange-layout']).clickRoutine as Record<string, unknown>[];

    expect(JSON.stringify(lockRoutine)).toContain('player-mgmt-panel');
    expect(JSON.stringify(lockRoutine)).not.toContain('player-management-panel');
    expect(arrangeRoutine.every(step => step.func !== 'MOVEXY' || ('from' in step && !('collection' in step)))).toBe(true);
  });
});
