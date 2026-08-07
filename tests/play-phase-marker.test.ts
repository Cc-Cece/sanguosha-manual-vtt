import { describe, expect, it } from 'vitest';
import {
  advancePlayPhaseRoutine,
  clearPlayPhaseRoutine,
  createSetPlayPhaseRoutine,
  MAX_PLAY_PHASE_SEATS,
  PLAY_PHASE_BADGE_IDS,
  PLAY_PHASE_FRAME_IDS,
} from '../src/routines/playPhaseMarker.js';
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

describe('play-phase marker', () => {
  it('adds badge, frame and controls on every player module', () => {
    for (let index = 0; index < MAX_PLAY_PHASE_SEATS; index += 1) {
      const n = index + 1;
      const widgets = createPlayerModule(index);
      const byId = Object.fromEntries(widgets.map(widget => [widget.id, widget]));
      const badgeCss = byId[`play-phase-badge-${n}`]?.css as Record<string, unknown>;
      const frameCss = byId[`play-phase-frame-${n}`]?.css as Record<string, unknown>;

      expect(byId[`play-phase-badge-${n}`]).toMatchObject({
        text: '出牌中',
        display: false,
        parent: `player-module-${n}`,
        movable: false,
        movableInEdit: false,
        clickable: false,
      });
      expect(byId[`play-phase-frame-${n}`]).toMatchObject({
        display: false,
        parent: `player-module-${n}`,
        movable: false,
        movableInEdit: false,
        clickable: false,
      });
      expect(badgeCss['pointer-events']).toBe('none');
      expect(frameCss['pointer-events']).toBe('none');
      expect(badgeCss.pointerEvents).toBeUndefined();
      expect(frameCss.pointerEvents).toBeUndefined();
      expect(byId[`set-play-phase-${n}`]).toMatchObject({
        text: '出牌',
        parent: `player-module-${n}`,
      });
      expect(byId[`advance-play-phase-${n}`]).toMatchObject({
        text: '下一位',
        parent: `player-module-${n}`,
      });
      expect(byId[`set-play-phase-${n}`]?.onlyVisibleForSeat).toBeUndefined();
      expect(byId[`play-phase-badge-${n}`]?.onlyVisibleForSeat).toBeUndefined();
    }
  });

  it('keeps Seat width usable after adding play-phase buttons', () => {
    const seat = createPlayerModule(0).find(widget => widget.id === 'seat-1');
    expect(Number(seat?.width)).toBeGreaterThanOrEqual(120);
  });

  it('sets a single active seat and clears all badges first', () => {
    const routine = createSetPlayPhaseRoutine(3);
    const steps = collectObjects(routine);

    expect(steps).toContainEqual(
      expect.objectContaining({
        func: 'SET',
        collection: PLAY_PHASE_BADGE_IDS,
        property: 'display',
        value: false,
      }),
    );
    expect(steps).toContainEqual(
      expect.objectContaining({
        func: 'SET',
        collection: PLAY_PHASE_FRAME_IDS,
        property: 'display',
        value: false,
      }),
    );
    expect(steps).toContainEqual(
      expect.objectContaining({
        func: 'SET',
        collection: ['play-phase-badge-3'],
        property: 'display',
        value: true,
      }),
    );
    expect(steps).toContainEqual(
      expect.objectContaining({
        func: 'SET',
        collection: ['table-controller'],
        property: 'activePlaySeat',
        value: 'seat-3',
      }),
    );
  });

  it('clears global play-phase state', () => {
    const steps = collectObjects(clearPlayPhaseRoutine);
    expect(steps).toContainEqual(
      expect.objectContaining({
        func: 'SET',
        collection: ['table-controller'],
        property: 'activePlaySeat',
        value: '',
      }),
    );
  });

  it('advances by scanning visible modules from the current seat', () => {
    const steps = collectObjects(advancePlayPhaseRoutine);
    expect(steps.some(step => step.func === 'IF')).toBe(true);
    expect(
      steps.some(
        step =>
          step.func === 'IF'
          && String(step.operand1).includes('activePlaySeat OF table-controller'),
      ),
    ).toBe(true);
    expect(
      steps.some(
        step =>
          step.func === 'IF'
          && String(step.operand1).includes('display OF player-module-'),
      ),
    ).toBe(true);
  });

  it('resets play-phase markers during full table reset', () => {
    const steps = collectObjects(resetTableRoutine);
    expect(steps).toContainEqual(
      expect.objectContaining({
        func: 'SET',
        collection: ['table-controller'],
        property: 'activePlaySeat',
        value: '',
      }),
    );
  });
});
