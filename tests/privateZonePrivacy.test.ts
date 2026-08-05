import { describe, expect, it } from 'vitest';
import {
  createPrivatePeekClickRoutine,
  createPrivatePeekEnterRoutine,
  createPrivatePeekLeaveRoutine,
  resetAllPrivatePeeksRoutine,
} from '../src/routines/privateZone.js';
import { createLeaveSeatRoutine, createSafeSeatClickRoutine } from '../src/routines/seatSafety.js';
import { resetTableRoutine } from '../src/routines/tableActions.js';
import { createPlayerModule } from '../src/widgets/playerModule.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

describe('private display zone privacy', () => {
  it('keeps the private zone visible but backed by default', () => {
    const widgets = createPlayerModule(0);
    const privateZone = widgets.find(widget => widget.id === 'private-zone-1');

    expect(privateZone).toBeDefined();
    expect(privateZone?.display).not.toBe(false);
    expect(privateZone?.onlyVisibleForSeat).toBeUndefined();
    expect(privateZone?.linkedToSeat).toBeUndefined();
    expect(privateZone?.showInactiveFaceToSeat).toBeNull();
    expect(privateZone?.preventPiles).toBe(true);
  });

  it('forces cards to enter and leave the private zone face down', () => {
    const privateZone = createPlayerModule(0).find(widget => widget.id === 'private-zone-1');

    expect(privateZone?.onEnter).toEqual(expect.objectContaining({
      activeFace: 0,
      clickable: false,
    }));
    expect(privateZone?.onLeave).toEqual(expect.objectContaining({
      activeFace: 0,
      clickable: true,
    }));
  });

  it('uses a single Seat-only eye icon for hover and touch peeking', () => {
    const eye = createPlayerModule(0).find(widget => widget.id === 'toggle-perspective-1');

    expect(eye).toBeDefined();
    expect(eye?.text).toBe('👁️');
    expect(eye?.onlyVisibleForSeat).toEqual(['seat-1']);
    expect(eye?.linkedToSeat).toEqual(['seat-1']);
    expect(eye?.mobilePeekOpen).toBe(false);
    expect(eye?.enterRoutine).toEqual(createPrivatePeekEnterRoutine(1));
    expect(eye?.leaveRoutine).toEqual(createPrivatePeekLeaveRoutine(1));
    expect(eye?.clickRoutine).toEqual(createPrivatePeekClickRoutine(1));
  });

  it('reveals the inactive face only to the owning Seat', () => {
    const objects = collectObjects(createPrivatePeekEnterRoutine(3));

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'IF',
      operand1: '${PROPERTY player OF seat-3}',
      relation: '==',
      operand2: '${playerName}',
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['private-zone-3'],
      property: 'showInactiveFaceToSeat',
      value: ['seat-3'],
    }));
  });

  it('covers immediately on mouseleave and toggles safely for touch', () => {
    const leaveObjects = collectObjects(createPrivatePeekLeaveRoutine(2));
    const clickObjects = collectObjects(createPrivatePeekClickRoutine(2));

    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['private-zone-2'],
      property: 'showInactiveFaceToSeat',
      value: null,
    }));
    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['toggle-perspective-2'],
      property: 'mobilePeekOpen',
      value: false,
    }));
    expect(clickObjects).toContainEqual(expect.objectContaining({
      func: 'IF',
      operand1: '${PROPERTY mobilePeekOpen OF toggle-perspective-2}',
      relation: '==',
      operand2: true,
    }));
  });

  it('never changes the shared display property or grants host override access', () => {
    const objects = collectObjects(createPrivatePeekClickRoutine(4));

    expect(objects.some(object => object.property === 'display')).toBe(false);
    expect(JSON.stringify(objects)).not.toContain('private-backdrop-4');
    expect(JSON.stringify(objects)).not.toContain('PROPERTY player OF seat-1');
  });

  it('closes peeking when the Seat is released or the table is reset', () => {
    const leaveObjects = collectObjects(createLeaveSeatRoutine('seat-5'));
    const resetObjects = collectObjects(resetTableRoutine);

    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['private-zone-5'],
      property: 'showInactiveFaceToSeat',
      value: null,
    }));
    expect(resetObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      property: 'showInactiveFaceToSeat',
      value: null,
    }));
    expect(resetAllPrivatePeeksRoutine).toHaveLength(2);
  });
});

describe('Seat nickname behavior remains integrated', () => {
  it('shows a localized join prompt and stores nickname separately from player identity', () => {
    const seat = createPlayerModule(0).find(widget => widget.id === 'seat-1');
    const routineObjects = collectObjects(createSafeSeatClickRoutine('seat-1', 'player-label-1'));

    expect(seat?.displayEmpty).toBe('＋ 入座');
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
