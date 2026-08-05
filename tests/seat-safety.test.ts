import { describe, expect, it } from 'vitest';
import { safeSeatClickRoutine } from '../src/routines/seatSafety.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { widgetsOf } from '../src/validation/validate.js';

describe('seat safety', () => {
  it('gives every seat the guarded routine while host-clear remains a source-level extension point', () => {
    const seats = widgetsOf(createFourPlayerPrototype()).filter(w => w.type === 'seat');
    expect(seats).toHaveLength(4);
    for (const seat of seats) {
      expect(seat.clickRoutine).toEqual(safeSeatClickRoutine);
    }
  });

  it('checks self-leave, occupied rejection and duplicate seating before native click', () => {
    const serialized = JSON.stringify(safeSeatClickRoutine);
    expect(serialized).toContain('${PROPERTY player}');
    expect(serialized).toContain('座位已被占用');
    expect(serialized).toContain('myOccupiedSeats');
    expect(serialized).toContain('ignoreClickRoutine');
  });
});
