import { describe, expect, it } from 'vitest';
import {
  fixedCollectLooseTableCardsRoutine,
  fixedRequestCollectLooseTableCardsRoutine,
  fixedRequestShuffleRecycleZoneRoutine,
  fixedShuffleRecycleZoneRoutine,
} from '../src/routines/recycleZoneRuntime.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('safe table cleanup and recycle-zone shuffle', () => {
  it('uses explicit filters when combining collectable card collections', () => {
    const serialized = JSON.stringify(fixedCollectLooseTableCardsRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":null');
    expect(serialized).toContain('"property":"owner","relation":"==","value":null');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"collectCollectableCards"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"collectCollectableCards","mode":"add"');
    expect(serialized).toContain('"func":"MOVE","collection":"collectCollectableCards","to":"recycle-zone"');
    expect(serialized).not.toContain('"func":"RECALL"');
    expect(serialized).not.toContain('"func":"SHUFFLE"');
    expect(serialized).toContain('收拢失败');
    expect(serialized).toContain('部分收拢完成');
  });

  it('builds the allowed recycle collection without relying on SELECT defaults', () => {
    const serialized = JSON.stringify(fixedShuffleRecycleZoneRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":"recycle-zone"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"recycleAllowedCards"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"recycleAllowedCards","mode":"add"');
    expect(serialized).toContain('"func":"FLIP","holder":["recycle-zone"],"face":0');
    expect(serialized).toContain('"func":"SHUFFLE","holder":["recycle-zone"],"mode":"true random"');
    expect(serialized).not.toContain('"func":"RECALL"');
    expect(serialized).not.toContain('"to":"draw-pile"');
  });

  it('patches the generated recycle zone into a visible stacked target', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const recycleZone = game['recycle-zone'] as Record<string, unknown>;
    const collectButton = game['collect-shuffle'] as Record<string, unknown>;
    const recycleShuffleButton = game['recycle-shuffle-btn'] as Record<string, unknown>;
    const requestCollectButton = game['request-collect-table-cards'] as Record<string, unknown>;
    const requestRecycleButton = game['request-shuffle-recycle-btn'] as Record<string, unknown>;

    expect(recycleZone.alignChildren).toBe(true);
    expect(recycleZone.preventPiles).toBe(true);
    expect(recycleZone.dropOffsetX).toBe(90);
    expect(recycleZone.dropOffsetY).toBe(28);

    expect(collectButton.clickRoutine).toEqual(fixedCollectLooseTableCardsRoutine);
    expect(recycleShuffleButton.clickRoutine).toEqual(fixedShuffleRecycleZoneRoutine);
    expect(requestCollectButton.clickRoutine).toEqual(fixedRequestCollectLooseTableCardsRoutine);
    expect(requestRecycleButton.clickRoutine).toEqual(fixedRequestShuffleRecycleZoneRoutine);
  });

  it('keeps ordinary-player requests on the corrected selection logic', () => {
    const collectSerialized = JSON.stringify(fixedRequestCollectLooseTableCardsRoutine);
    const shuffleSerialized = JSON.stringify(fixedRequestShuffleRecycleZoneRoutine);

    expect(collectSerialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"requestCollectCollectableCards"');
    expect(collectSerialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"requestCollectCollectableCards","mode":"add"');
    expect(shuffleSerialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"requestRecycleAllowedCards"');
    expect(shuffleSerialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"requestRecycleAllowedCards","mode":"add"');
  });
});
