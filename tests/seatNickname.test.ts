import { describe, expect, it } from 'vitest';
import {
  clearAllSeatsRoutine,
  createClearSeatRoutine,
  createLeaveSeatRoutine,
  createSafeSeatClickRoutine,
} from '../src/routines/seatSafety.js';
import { createPlayerModule } from '../src/widgets/playerModule.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

describe('table-local seat nicknames', () => {
  it('uses the Seat displayEmpty property for the localized join prompt', () => {
    const seat = createPlayerModule(0).find(widget => widget.id === 'seat-1');

    expect(seat).toBeDefined();
    expect(seat?.displayEmpty).toBe('＋ 入座');
    expect(seat?.display).toBe('playerName');
    expect(seat?.tableNickname).toBe('');
    expect(seat?.colorEmpty).toBe('#6d2922');
    expect(seat?.text).toBeUndefined();
  });

  it('asks for a nickname but keeps native playerName as the technical Seat identity', () => {
    const routine = createSafeSeatClickRoutine('seat-1', 'player-label-1');
    const objects = collectObjects(routine);

    const nicknameFields = objects.filter(object => object.variable === 'seatNickname');
    expect(nicknameFields).toHaveLength(2);
    expect(nicknameFields.every(field => field.type === 'string')).toBe(true);

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['seat-1'],
      property: 'tableNickname',
      value: '${seatNickname}',
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['seat-1'],
      property: 'display',
      value: '${seatNickname}',
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'CLICK',
      collection: 'thisButton',
      mode: 'ignoreClickRoutine',
    }));

    const unsafeNicknameIdentityWrites = objects.filter(object =>
      object.func === 'SET'
      && object.property === 'player'
      && object.value === '${seatNickname}');
    expect(unsafeNicknameIdentityWrites).toHaveLength(0);
  });

  it('clears player identity, nickname, display text, color and module title together', () => {
    const clearRoutine = createClearSeatRoutine('seat-2', 'player-label-2', 2);

    expect(clearRoutine).toEqual(expect.arrayContaining([
      expect.objectContaining({ func: 'SET', collection: ['seat-2'], property: 'player', value: '' }),
      expect.objectContaining({ func: 'SET', collection: ['seat-2'], property: 'tableNickname', value: '' }),
      expect.objectContaining({ func: 'SET', collection: ['seat-2'], property: 'display', value: 'playerName' }),
      expect.objectContaining({ func: 'SET', collection: ['seat-2'], property: 'color', value: '#6d2922' }),
      expect.objectContaining({ func: 'LABEL', label: ['player-label-2'], value: '☰ 玩家 2' }),
    ]));
  });

  it('uses the same complete reset for self-leave and host-forced leave', () => {
    const leaveObjects = collectObjects(createLeaveSeatRoutine('seat-3', 'player-label-3', 3));
    const resetTitleSteps = leaveObjects.filter(object =>
      object.func === 'LABEL'
      && JSON.stringify(object.label) === JSON.stringify(['player-label-3'])
      && object.value === '☰ 玩家 3');

    expect(resetTitleSteps.length).toBeGreaterThanOrEqual(2);
    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['seat-3'],
      property: 'tableNickname',
      value: '',
    }));
  });

  it('resets all current Seat nicknames and all player module titles', () => {
    const objects = collectObjects(clearAllSeatsRoutine);
    const nicknameReset = objects.find(object => object.func === 'SET' && object.property === 'tableNickname');

    expect(nicknameReset?.collection).toEqual(['seat-1', 'seat-2', 'seat-3', 'seat-4']);
    for (let number = 1; number <= 4; number += 1) {
      expect(objects).toContainEqual(expect.objectContaining({
        func: 'LABEL',
        label: [`player-label-${number}`],
        value: `☰ 玩家 ${number}`,
      }));
    }
  });
});
