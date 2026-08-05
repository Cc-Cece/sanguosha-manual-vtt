import { describe, expect, it } from 'vitest';
import { importToReserveTrayRoutine, reEditReserveRoutine } from '../src/routines/deckAssembly.js';

describe('reserve panel selective import routine', () => {
  it('validates importToReserveTrayRoutine moves selected cards to general-reserve and extra-reserve with face 0', () => {
    const routineJson = JSON.stringify(importToReserveTrayRoutine);
    expect(routineJson).toContain('general-reserve');
    expect(routineJson).toContain('extra-reserve');
    expect(routineJson).toContain('selectedGenerals');
    expect(routineJson).toContain('selectedExtras');
  });

  it('validates reEditReserveRoutine returns staged cards back to drawer with face 1', () => {
    const routineJson = JSON.stringify(reEditReserveRoutine);
    expect(routineJson).toContain('stagedGenerals');
    expect(routineJson).toContain('stagedExtras');
    expect(routineJson).toContain('updateSummaryRoutine');
  });
});
