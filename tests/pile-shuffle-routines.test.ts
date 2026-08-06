import { describe, expect, it } from 'vitest';
import {
  shuffleDrawPileRoutine,
  shuffleExtraReserveRoutine,
  shuffleGeneralReserveRoutine,
  shuffleIdentityReserveRoutine,
  shuffleMarkerReserveRoutine,
} from '../src/routines/pileShuffle.js';

const asStep = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

function flattenSteps(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(flattenSteps);
  if (typeof value !== 'object' || value === null) return [];

  const step = value as Record<string, unknown>;
  return [
    step,
    ...flattenSteps(step.thenRoutine),
    ...flattenSteps(step.elseRoutine),
  ];
}

describe('dedicated pile shuffle routines structure', () => {
  const testCases = [
    { name: 'shuffleDrawPileRoutine', routine: shuffleDrawPileRoutine, holder: 'draw-pile' },
    { name: 'shuffleGeneralReserveRoutine', routine: shuffleGeneralReserveRoutine, holder: 'general-reserve' },
    { name: 'shuffleIdentityReserveRoutine', routine: shuffleIdentityReserveRoutine, holder: 'identity-reserve' },
    { name: 'shuffleExtraReserveRoutine', routine: shuffleExtraReserveRoutine, holder: 'extra-reserve' },
    { name: 'shuffleMarkerReserveRoutine', routine: shuffleMarkerReserveRoutine, holder: 'marker-reserve' },
  ];

  for (const { name, routine, holder } of testCases) {
    it(`guards ${name} and performs face-down true-random shuffle for ${holder}`, () => {
      expect(routine[0]).toEqual({
        func: 'COUNT',
        holder: [holder],
        variable: 'shufflePileCount',
      });

      const guard = asStep(routine[1]);
      expect(guard).toEqual(expect.objectContaining({
        func: 'IF',
        operand1: '${shufflePileCount}',
        relation: '>',
        operand2: 0,
      }));

      const executedSteps = flattenSteps(guard.thenRoutine);
      const flipIndex = executedSteps.findIndex(step =>
        step.func === 'FLIP'
        && JSON.stringify(step.holder) === JSON.stringify([holder])
        && step.face === 0,
      );
      const shuffleIndex = executedSteps.findIndex(step =>
        step.func === 'SHUFFLE'
        && JSON.stringify(step.holder) === JSON.stringify([holder])
        && step.mode === 'true random',
      );

      expect(flipIndex).toBeGreaterThanOrEqual(0);
      expect(shuffleIndex).toBeGreaterThan(flipIndex);
      expect(executedSteps.some(step => step.func === 'SET' && step.property === 'clickable' && step.value === false)).toBe(true);
      expect(executedSteps.some(step => step.func === 'SET' && step.property === 'clickable' && step.value === true)).toBe(true);
    });

    it(`keeps ${name} local to its holder without MOVE, RECALL or INPUT`, () => {
      const routineJson = JSON.stringify(routine);
      expect(routineJson).not.toContain('"func":"MOVE"');
      expect(routineJson).not.toContain('"func":"RECALL"');
      expect(routineJson).not.toContain('"func":"INPUT"');
      expect(routineJson).toContain('"func":"DELAY"');
    });
  }
});
