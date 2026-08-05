import { describe, expect, it } from 'vitest';
import {
  shuffleDrawPileRoutine,
  shuffleExtraReserveRoutine,
  shuffleGeneralReserveRoutine,
  shuffleIdentityReserveRoutine,
  shuffleMarkerReserveRoutine,
} from '../src/routines/pileShuffle.js';

describe('dedicated pile shuffle routines structure', () => {
  const testCases = [
    { name: 'shuffleDrawPileRoutine', routine: shuffleDrawPileRoutine, holder: 'draw-pile' },
    { name: 'shuffleGeneralReserveRoutine', routine: shuffleGeneralReserveRoutine, holder: 'general-reserve' },
    { name: 'shuffleIdentityReserveRoutine', routine: shuffleIdentityReserveRoutine, holder: 'identity-reserve' },
    { name: 'shuffleExtraReserveRoutine', routine: shuffleExtraReserveRoutine, holder: 'extra-reserve' },
    { name: 'shuffleMarkerReserveRoutine', routine: shuffleMarkerReserveRoutine, holder: 'marker-reserve' },
  ];

  for (const { name, routine, holder } of testCases) {
    it(`validates ${name} contains strictly FLIP face 0 and SHUFFLE true random for ${holder}`, () => {
      expect(routine).toHaveLength(2);
      expect(routine[0]).toEqual({
        func: 'FLIP',
        holder: [holder],
        face: 0,
      });
      expect(routine[1]).toEqual({
        func: 'SHUFFLE',
        holder: [holder],
        mode: 'true random',
      });
    });

    it(`ensures ${name} contains NO prohibited actions (MOVE, RECALL, INPUT, SET)`, () => {
      const routineJson = JSON.stringify(routine);
      expect(routineJson).not.toContain('MOVE');
      expect(routineJson).not.toContain('RECALL');
      expect(routineJson).not.toContain('INPUT');
      expect(routineJson).not.toContain('SET');
    });
  }
});
