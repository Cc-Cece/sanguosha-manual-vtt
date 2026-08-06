import { describe, expect, it } from 'vitest';
import {
  collectLooseTableCardsRoutine,
  shuffleRecycleZoneRoutine,
} from '../src/routines/tableActions.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('safe table cleanup and recycle-zone shuffle', () => {
  it('collects only unowned top-level gameplay cards into recycle-zone', () => {
    const serialized = JSON.stringify(collectLooseTableCardsRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":null');
    expect(serialized).toContain('"property":"owner","relation":"==","value":null');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck"');
    expect(serialized).toContain('"property":"reserveState","relation":"==","value":"in-use"');
    expect(serialized).toContain('"property":"reservePendingRemoval","relation":"==","value":false');
    expect(serialized).toContain('"func":"MOVE","collection":"looseCollectableCards","to":"recycle-zone"');
    expect(serialized).not.toContain('"func":"RECALL"');
    expect(serialized).not.toContain('"func":"FLIP"');
    expect(serialized).not.toContain('"func":"SHUFFLE"');
    expect(serialized).toContain('玩家模块、手牌');
  });

  it('shuffles only validated cards already in recycle-zone', () => {
    const serialized = JSON.stringify(shuffleRecycleZoneRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":"recycle-zone"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck"');
    expect(serialized).toContain('"property":"reservePendingRemoval","relation":"==","value":false');
    expect(serialized).toContain('"func":"FLIP","holder":["recycle-zone"],"face":0');
    expect(serialized).toContain('"func":"SHUFFLE","holder":["recycle-zone"],"mode":"true random"');
    expect(serialized).not.toContain('"func":"RECALL"');
    expect(serialized).not.toContain('"to":"draw-pile"');
    expect(serialized).toContain('不会自动并入摸牌堆');
    expect(serialized).toContain('此次没有翻面或洗牌');
  });

  it('exposes separate collect and recycle shuffle controls in the generated table', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const collectButton = game['collect-shuffle'] as Record<string, unknown>;
    const recycleShuffleButton = game['recycle-shuffle-btn'] as Record<string, unknown>;

    expect(collectButton.text).toBe('↻ 收拢桌面牌');
    expect(collectButton.clickRoutine).toEqual(collectLooseTableCardsRoutine);
    expect(recycleShuffleButton.text).toBe('🔀 洗牌');
    expect(recycleShuffleButton.clickRoutine).toEqual(shuffleRecycleZoneRoutine);
    expect(recycleShuffleButton.onlyVisibleForSeat).toEqual(['seat-1']);
  });
});
