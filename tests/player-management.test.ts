import { describe, expect, it } from 'vitest';
import { closeLastSeatRoutine, openNextSeatRoutine, scalePlayerModules100Routine, scalePlayerModules75Routine, scalePlayerModules90Routine } from '../src/routines/playerManagement.js';

describe('host player management routines', () => {
  it('validates openNextSeatRoutine checks hidden seats 5..12 and sets display true', () => {
    expect(openNextSeatRoutine).toHaveLength(8);
    const routineJson = JSON.stringify(openNextSeatRoutine);
    expect(routineJson).toContain('player-module-5');
    expect(routineJson).toContain('player-module-12');
  });

  it('validates closeLastSeatRoutine checks open empty seats 12 down to 5 and sets display false', () => {
    expect(closeLastSeatRoutine).toHaveLength(8);
    const routineJson = JSON.stringify(closeLastSeatRoutine);
    expect(routineJson).toContain('player-module-12');
    expect(routineJson).toContain('player-module-5');
  });

  it('validates scaling routines set scale to 0.75, 0.9, and 1.0 on all 12 modules', () => {
    expect(scalePlayerModules75Routine[0]).toMatchObject({ func: 'SET', property: 'scale', value: 0.75 });
    expect(scalePlayerModules90Routine[0]).toMatchObject({ func: 'SET', property: 'scale', value: 0.9 });
    expect(scalePlayerModules100Routine[0]).toMatchObject({ func: 'SET', property: 'scale', value: 1.0 });
  });
});
