import type { RoutineStep } from '../types/vtt.js';
import { createAnimatedShuffleSteps } from '../widgets/shuffleAnimation.js';
import { fixedShuffleRecycleZoneRoutine } from './recycleZoneRuntime.js';

export const animatedQuickShuffleRoutine: RoutineStep[] = [
  { func: 'COUNT', holder: ['quick-shuffle-zone'], variable: 'shufflePileCount' },
  {
    func: 'IF',
    operand1: '${shufflePileCount}',
    relation: '>',
    operand2: 0,
    thenRoutine: createAnimatedShuffleSteps(
      'quick-shuffle-zone',
      'quick-shuffle',
      'quick-shuffle-btn',
      '🔀 一键洗牌',
    ),
  },
];

/** Compatibility export: recycle shuffling now lives in the free-area runtime implementation. */
export const animatedShuffleRecycleZoneRoutine = fixedShuffleRecycleZoneRoutine;
