import { describe, expect, it } from 'vitest';
import { clearAllSeatsRoutine, clearSeat1Routine, clearSeat2Routine, clearSeat3Routine, clearSeat4Routine } from '../src/routines/seatSafety.js';
import { toggleReserveTrayRoutine } from '../src/routines/tableActions.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('host control toolbar and routines', () => {
  it('contains host toolbar with clear-seats and toggle-tray buttons linked to Seat 1', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const toolbar = widgets.find(w => w.id === 'host-toolbar');
    expect(toolbar).toBeDefined();
    expect(toolbar?.onlyVisibleForSeat).toEqual(['seat-1']);
    expect(toolbar?.linkedToSeat).toEqual(['seat-1']);

    const clearSeatsBtn = widgets.find(w => w.id === 'clear-seats');
    expect(clearSeatsBtn).toBeDefined();
    expect(clearSeatsBtn?.parent).toBe('host-toolbar-panel');
    expect(clearSeatsBtn?.clickRoutine).toEqual(clearAllSeatsRoutine);

    const toggleTrayBtn = widgets.find(w => w.id === 'toggle-tray');
    expect(toggleTrayBtn).toBeDefined();
    expect(toggleTrayBtn?.parent).toBe('host-toolbar-panel');
    expect(toggleTrayBtn?.clickRoutine).toEqual(toggleReserveTrayRoutine);

    const toggleLibBtn = widgets.find(w => w.id === 'toggle-library-table');
    expect(toggleLibBtn).toBeDefined();
    expect(toggleLibBtn?.parent).toBe('host-toolbar-panel');
  });

  it('provides individual and batch seat clearing routines', () => {
    const clear1Str = JSON.stringify(clearSeat1Routine);
    expect(clear1Str).toContain('seat-1');
    expect(clear1Str).toContain('player');

    const clearAllSerialized = JSON.stringify(clearAllSeatsRoutine);
    expect(clearAllSerialized).toContain('seat-1');
    expect(clearAllSerialized).toContain('seat-4');
    expect(clearAllSerialized).toContain('重置所有玩家座位？');
  });

  it('toggles reserve tray display status conditionally', () => {
    const toggleSerialized = JSON.stringify(toggleReserveTrayRoutine);
    expect(toggleSerialized).toContain('reserve-tray');
    expect(toggleSerialized).toContain('display');
  });
});
