import { describe, expect, it } from 'vitest';
import {
  createPrivatePeekClickRoutine,
  createPrivatePeekEnterRoutine,
  createPrivatePeekLeaveRoutine,
  privatePeekButtonIds,
  resetAllPrivatePeeksRoutine,
} from '../src/routines/privateZone.js';
import { createSafeSeatClickRoutine } from '../src/routines/seatSafety.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { createPlayerModule } from '../src/widgets/playerModule.js';
import { loadTestCatalog } from './helpers.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

describe('permanent face-down zone privacy', () => {
  it('keeps the face-down zone public, visible and permanently backed', () => {
    const widgets = createPlayerModule(0);
    const zone = widgets.find(widget => widget.id === 'private-zone-1');
    const label = widgets.find(widget => widget.id === 'private-label-1');

    expect(zone).toBeDefined();
    expect(label?.text).toBe('暗置牌区');
    expect(zone?.text).toContain('始终盖面');
    expect(zone?.display).not.toBe(false);
    expect(zone?.onlyVisibleForSeat).toBeUndefined();
    expect(zone?.linkedToSeat).toBeUndefined();
    expect(zone?.showInactiveFaceToSeat).toBeNull();
    expect(zone?.preventPiles).toBe(true);
  });

  it('forces cards to enter and leave face down and disables clicking while inside', () => {
    const zone = createPlayerModule(0).find(widget => widget.id === 'private-zone-1');

    expect(zone?.onEnter).toEqual(expect.objectContaining({
      activeFace: 0,
      clickable: false,
    }));
    expect(zone?.onLeave).toEqual(expect.objectContaining({
      activeFace: 0,
      clickable: true,
      owner: null,
    }));
  });

  it('removes every eye widget and retires all legacy peek routines', () => {
    const widgets = createPlayerModule(0);

    expect(widgets.some(widget => widget.id === 'toggle-perspective-1')).toBe(false);
    expect(privatePeekButtonIds).toEqual([]);
    expect(createPrivatePeekEnterRoutine(1)).toEqual([]);
    expect(createPrivatePeekLeaveRoutine(1)).toEqual([]);
    expect(createPrivatePeekClickRoutine(1)).toEqual([]);
    expect(resetAllPrivatePeeksRoutine).toEqual([]);
  });

  it('installs the identity hand-exit guard and updated instructions on every final private hand', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const hand = game['personal-hand-seat-1'] as Record<string, unknown>;
    const leaveObjects = collectObjects(hand.leaveRoutine);
    const info = (game._meta as Record<string, unknown>).info as Record<string, unknown>;

    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      source: 'child',
      property: 'deck',
      value: 'identity-deck',
    }));
    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'FLIP',
      collection: 'leavingIdentityCards',
      face: 0,
    }));
    expect(String(info.description)).toContain('始终盖面的暗置牌区');
    expect(String(info.ruleText)).toContain('暗置牌区中的牌始终盖面');
    expect(String(info.helpText)).toContain('身份牌进入手牌后保持盖面');
    expect(String(info.helpText)).toContain('暗置牌区始终只显示牌背');
    expect(String(info.helpText)).toContain('展示牌背');
    expect(String(info.description)).not.toContain('独立私密展示区');
  });
});

describe('Seat nickname behavior remains integrated', () => {
  it('shows a localized join prompt and stores nickname separately from player identity', () => {
    const seat = createPlayerModule(0).find(widget => widget.id === 'seat-1');
    const routineObjects = collectObjects(createSafeSeatClickRoutine('seat-1', 'player-label-1'));

    expect(seat?.displayEmpty).toBe('入座');
    expect(seat?.display).toBe('playerName');
    expect(seat?.tableNickname).toBe('');
    expect(routineObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      property: 'tableNickname',
      value: '${seatNickname}',
    }));
    expect(routineObjects.some(object =>
      object.func === 'SET'
      && object.property === 'player'
      && object.value === '${seatNickname}')).toBe(false);
  });
});
