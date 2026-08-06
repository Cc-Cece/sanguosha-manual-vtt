import type { RoutineStep } from '../types/vtt.js';
import { createAnimatedShuffleSteps, type ShuffleAnimationId } from '../widgets/shuffleAnimation.js';

export const createPileShuffleRoutine = (
  holderId: string,
  animationId: ShuffleAnimationId,
  buttonId: string,
  restingButtonText = '🔀 洗牌',
): RoutineStep[] => [
  { func: 'COUNT', holder: [holderId], variable: 'shufflePileCount' },
  {
    func: 'IF',
    operand1: '${shufflePileCount}',
    relation: '>',
    operand2: 0,
    thenRoutine: createAnimatedShuffleSteps(holderId, animationId, buttonId, restingButtonText),
  },
];

export const shuffleDrawPileRoutine = createPileShuffleRoutine(
  'draw-pile',
  'draw-pile',
  'shuffle-draw-pile-btn',
);
export const shuffleGeneralReserveRoutine = createPileShuffleRoutine(
  'general-reserve',
  'general-reserve',
  'shuffle-general-reserve-btn',
);
export const shuffleIdentityReserveRoutine = createPileShuffleRoutine(
  'identity-reserve',
  'identity-reserve',
  'shuffle-identity-reserve-btn',
);
export const shuffleExtraReserveRoutine = createPileShuffleRoutine(
  'extra-reserve',
  'extra-reserve',
  'shuffle-extra-reserve-btn',
);
export const shuffleMarkerReserveRoutine = createPileShuffleRoutine(
  'marker-reserve',
  'marker-reserve',
  'shuffle-marker-reserve-btn',
);
