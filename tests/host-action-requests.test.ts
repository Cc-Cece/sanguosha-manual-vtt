import { describe, expect, it } from 'vitest';
import {
  PUBLIC_REQUEST_SEAT_IDS,
  requestCollectLooseTableCardsRoutine,
  requestShuffleDrawPileRoutine,
  requestShuffleRecycleZoneRoutine,
  resetHostActionRequestRoutine,
} from '../src/routines/hostActionRequests.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('host-approved public action requests', () => {
  it('routes a seated ordinary player request to the seat-1 player', () => {
    const serialized = JSON.stringify(requestShuffleDrawPileRoutine);

    expect(serialized).toContain('"collection":["seat-1"],"property":"player","variable":"hostPlayer"');
    expect(serialized).toContain('"player":"${hostPlayer}"');
    expect(serialized).toContain('"header":"房主操作请求"');
    expect(serialized).toContain('"type":"checkbox","variable":"hostApproved"');
    expect(serialized).toContain('"operand1":"${hostApproved}","relation":"==","operand2":true');
    expect(serialized).toContain('"requestState","value":"pending"');
    expect(serialized).toContain('"requestRevision","relation":"+","value":1');
    expect(serialized).toContain('"operand1":"${currentRequestRevision}"');
    expect(serialized).toContain('"func":"FLIP","holder":["draw-pile"],"face":0');
    expect(serialized).toContain('"func":"SHUFFLE","holder":["draw-pile"],"mode":"true random"');
    expect(serialized).not.toContain('"func":"RECALL"');

    const approvalIndex = serialized.indexOf('"operand1":"${hostApproved}"');
    const shuffleIndex = serialized.indexOf('"func":"SHUFFLE"');
    expect(approvalIndex).toBeGreaterThan(-1);
    expect(shuffleIndex).toBeGreaterThan(approvalIndex);
  });

  it('revalidates table collection after approval and never combines it with shuffle', () => {
    const serialized = JSON.stringify(requestCollectLooseTableCardsRoutine);

    expect(serialized.match(/"property":"parent","relation":"==","value":null/g)?.length).toBeGreaterThanOrEqual(2);
    expect(serialized.match(/"property":"owner","relation":"==","value":null/g)?.length).toBeGreaterThanOrEqual(2);
    expect(serialized).toContain('"property":"reservePendingRemoval","relation":"==","value":false');
    expect(serialized).toContain('"func":"MOVE","collection":"approvedCollectCollectableCards","to":"recycle-zone"');
    expect(serialized).not.toContain('"func":"FLIP"');
    expect(serialized).not.toContain('"func":"SHUFFLE"');
    expect(serialized).not.toContain('"func":"RECALL"');
  });

  it('revalidates recycle-zone card types before an approved shuffle', () => {
    const serialized = JSON.stringify(requestShuffleRecycleZoneRoutine);

    expect(serialized.match(/"property":"parent","relation":"==","value":"recycle-zone"/g)?.length).toBeGreaterThanOrEqual(2);
    expect(serialized).toContain('"property":"deck","relation":"==","value":"main-deck"');
    expect(serialized).toContain('"property":"deck","relation":"==","value":"extra-deck"');
    expect(serialized).toContain('"property":"reserveState","relation":"==","value":"in-use"');
    expect(serialized).toContain('"property":"reservePendingRemoval","relation":"==","value":false');
    expect(serialized).toContain('"requestExecutionStatus":"invalid"');
    expect(serialized).toContain('此次没有翻面或洗牌');
    expect(serialized).not.toContain('"to":"draw-pile"');
  });

  it('exposes direct host buttons and overlapping request buttons to the correct seats', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const hostDrawButton = game['shuffle-draw-pile-btn'] as Record<string, unknown>;
    const requestDrawButton = game['request-shuffle-draw-pile-btn'] as Record<string, unknown>;
    const hostRecycleButton = game['recycle-shuffle-btn'] as Record<string, unknown>;
    const requestRecycleButton = game['request-shuffle-recycle-btn'] as Record<string, unknown>;
    const requestToolbar = game['player-action-request-toolbar'] as Record<string, unknown>;
    const requestCollectButton = game['request-collect-table-cards'] as Record<string, unknown>;
    const controller = game['host-action-request-controller'] as Record<string, unknown>;
    const resetButton = game['host-action-request-reset'] as Record<string, unknown>;

    expect(hostDrawButton.onlyVisibleForSeat).toEqual(['seat-1']);
    expect(requestDrawButton.onlyVisibleForSeat).toEqual(PUBLIC_REQUEST_SEAT_IDS);
    expect(requestDrawButton.text).toBe('🔐 请求洗牌');
    expect(hostRecycleButton.onlyVisibleForSeat).toEqual(['seat-1']);
    expect(requestRecycleButton.onlyVisibleForSeat).toEqual(PUBLIC_REQUEST_SEAT_IDS);
    expect(requestToolbar.onlyVisibleForSeat).toEqual(PUBLIC_REQUEST_SEAT_IDS);
    expect(requestCollectButton.text).toBe('🔐 请求收拢桌面牌');
    expect(controller.requestState).toBe('idle');
    expect(controller.requestRevision).toBe(0);
    expect(controller.resetRequestRoutine).toEqual(resetHostActionRequestRoutine);
    expect(resetButton.onlyVisibleForSeat).toBeUndefined();
    expect(resetButton.parent).toBe('host-toolbar-panel');
  });

  it('keeps reserve request buttons limited to ordinary seated players', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const requestIds = [
      'request-shuffle-general-reserve-btn',
      'request-shuffle-identity-reserve-btn',
      'request-shuffle-extra-reserve-btn',
      'request-shuffle-marker-reserve-btn',
    ];

    for (const id of requestIds) {
      const button = game[id] as Record<string, unknown>;
      expect(button.parent).toBe('reserve-tray');
      expect(button.onlyVisibleForSeat).toEqual(PUBLIC_REQUEST_SEAT_IDS);
      expect(button.linkedToSeat).toEqual(PUBLIC_REQUEST_SEAT_IDS);
      expect(button.text).toBe('🔐 请求洗牌');
    }
  });

  it('provides a host reset that invalidates abandoned approval dialogs', () => {
    const serialized = JSON.stringify(resetHostActionRequestRoutine);

    expect(serialized).toContain('"requestState","value":"idle"');
    expect(serialized).toContain('"requestAction","value":""');
    expect(serialized).toContain('"requesterName","value":""');
    expect(serialized).toContain('旧审批对话框之后被提交');
  });
});
