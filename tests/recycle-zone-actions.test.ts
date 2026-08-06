import { describe, expect, it } from 'vitest';
import { RECYCLE_COLLECT_GROUP_ID } from '../src/layouts/shufflePanels.js';
import {
  fixedCollectLooseTableCardsRoutine,
  fixedRequestCollectLooseTableCardsRoutine,
  fixedRequestShuffleRecycleZoneRoutine,
  fixedShuffleRecycleZoneRoutine,
  RECYCLE_COLLECT_STACK_ID,
  RECYCLE_SHUFFLE_BUFFER_ID,
} from '../src/routines/recycleZoneRuntime.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('free recycle area and selective shuffle-to-draw', () => {
  it('collects only loose gameplay cards into the explicit collection stack', () => {
    const serialized = JSON.stringify(fixedCollectLooseTableCardsRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":null');
    expect(serialized).toContain('"property":"owner","relation":"==","value":null');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"collectCollectableCards"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck","collection":"collectCollectableCards","mode":"add"');
    expect(serialized).toContain(`"func":"MOVE","collection":"collectCollectableCards","to":"${RECYCLE_COLLECT_STACK_ID}"`);
    expect(serialized).not.toContain('"func":"RECALL"');
    expect(serialized).not.toContain('"func":"SHUFFLE"');
    expect(serialized).toContain('待回收区其余空间仍可自由摆放');
  });

  it('selects game cards from both the free area and collection stack', () => {
    const serialized = JSON.stringify(fixedShuffleRecycleZoneRoutine);

    expect(serialized).toContain('"property":"parent","relation":"==","value":"recycle-zone","collection":"recycleDirectCards"');
    expect(serialized).toContain(`"property":"parent","relation":"==","value":"${RECYCLE_COLLECT_STACK_ID}","collection":"recycleStackCards"`);
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck","collection":"recycleGameplayCards"');
    expect(serialized).toContain('"property":"reserveState","relation":"==","value":"in-use"');
    expect(serialized).toContain('"property":"reservePendingRemoval","relation":"==","value":false');
  });

  it('shuffles only selected game cards in a hidden buffer and moves them to the draw pile', () => {
    const serialized = JSON.stringify(fixedShuffleRecycleZoneRoutine);

    expect(serialized).toContain(`"func":"MOVE","collection":"recycleGameplayCards","to":"${RECYCLE_SHUFFLE_BUFFER_ID}"`);
    expect(serialized).toContain(`"func":"FLIP","holder":["${RECYCLE_SHUFFLE_BUFFER_ID}"],"face":0`);
    expect(serialized).toContain(`"func":"SHUFFLE","holder":["${RECYCLE_SHUFFLE_BUFFER_ID}"],"mode":"true random"`);
    expect(serialized).toContain(`"func":"MOVE","from":["${RECYCLE_SHUFFLE_BUFFER_ID}"],"to":"draw-pile","count":"all"`);
    expect(serialized).toContain('区域内其他类型的牌没有移动、翻面或重新排列');
    expect(serialized).not.toContain('"func":"FLIP","holder":["recycle-zone"]');
    expect(serialized).not.toContain('"func":"SHUFFLE","holder":["recycle-zone"]');
    expect(serialized).not.toContain('"func":"RECALL"');
  });

  it('patches the generated recycle zone as a free area with a movable stack group and hidden buffer', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const recycleZone = game['recycle-zone'] as Record<string, unknown>;
    const collectGroup = game[RECYCLE_COLLECT_GROUP_ID] as Record<string, unknown>;
    const collectStack = game[RECYCLE_COLLECT_STACK_ID] as Record<string, unknown>;
    const shuffleBuffer = game[RECYCLE_SHUFFLE_BUFFER_ID] as Record<string, unknown>;
    const collectButton = game['collect-shuffle'] as Record<string, unknown>;
    const recycleShuffleButton = game['recycle-shuffle-btn'] as Record<string, unknown>;
    const requestCollectButton = game['request-collect-table-cards'] as Record<string, unknown>;
    const requestRecycleButton = game['request-shuffle-recycle-btn'] as Record<string, unknown>;

    expect(recycleZone.alignChildren).toBe(false);
    expect(recycleZone.preventPiles).toBe(true);
    expect(recycleZone.dropOffsetX).toBe(0);
    expect(recycleZone.dropOffsetY).toBe(0);
    expect(collectGroup).toMatchObject({ parent: 'recycle-zone', movable: true, fixedParent: true });
    expect(collectStack).toMatchObject({ parent: RECYCLE_COLLECT_GROUP_ID, alignChildren: true, preventPiles: true });
    expect(shuffleBuffer).toMatchObject({ display: false, alignChildren: true, preventPiles: true });

    expect(collectButton.clickRoutine).toEqual(fixedCollectLooseTableCardsRoutine);
    expect(recycleShuffleButton.clickRoutine).toEqual(fixedShuffleRecycleZoneRoutine);
    expect(recycleShuffleButton.text).toBe('🔀 洗牌入摸牌堆');
    expect(requestCollectButton.clickRoutine).toEqual(fixedRequestCollectLooseTableCardsRoutine);
    expect(requestRecycleButton.clickRoutine).toEqual(fixedRequestShuffleRecycleZoneRoutine);
    expect(requestRecycleButton.text).toBe('🔐 请求洗牌入堆');
  });

  it('uses the same selective behavior in ordinary-player approval requests', () => {
    const collectSerialized = JSON.stringify(fixedRequestCollectLooseTableCardsRoutine);
    const shuffleSerialized = JSON.stringify(fixedRequestShuffleRecycleZoneRoutine);

    expect(collectSerialized).toContain(`"to":"${RECYCLE_COLLECT_STACK_ID}"`);
    expect(shuffleSerialized).toContain('"collection":"requestRecycleGameplayCards"');
    expect(shuffleSerialized).toContain(`"to":"${RECYCLE_SHUFFLE_BUFFER_ID}"`);
    expect(shuffleSerialized).toContain('"to":"draw-pile"');
    expect(shuffleSerialized).toContain('"func":"DELAY"');
    expect(shuffleSerialized).toContain('其他牌保持原位置');
  });
});
