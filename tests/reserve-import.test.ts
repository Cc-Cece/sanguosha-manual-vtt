import { describe, expect, it } from 'vitest';
import { importToReserveTrayRoutine } from '../src/routines/deckAssembly.js';

describe('reserve panel selective import routine', () => {
  it('validates importToReserveTrayRoutine moves generals to general-reserve and extras to extra-reserve with face 0', () => {
    const routineJson = JSON.stringify(importToReserveTrayRoutine);
    expect(routineJson).toContain('general-reserve');
    expect(routineJson).toContain('extra-reserve');
    expect(importToReserveTrayRoutine[0].face).toBe(0);
    expect(importToReserveTrayRoutine[1].face).toBe(0);
  });
});
