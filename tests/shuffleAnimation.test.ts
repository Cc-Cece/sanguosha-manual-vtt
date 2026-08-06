import { describe, expect, it } from 'vitest';
import { shuffleDrawPileRoutine } from '../src/routines/pileShuffle.js';
import {
  createAnimatedShuffleSteps,
  createShuffleAnimationRoutine,
  createShuffleAnimationWidgets,
  SHUFFLE_BUTTON_IDS,
} from '../src/widgets/shuffleAnimation.js';

const asStep = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

describe('shuffle animation', () => {
  it('creates six non-interactive visual cards for every shuffle surface', () => {
    const widgets = createShuffleAnimationWidgets();
    expect(widgets).toHaveLength(42);
    expect(new Set(widgets.map(widget => widget.id)).size).toBe(42);
    expect(widgets.every(widget => widget.display === false)).toBe(true);
    expect(widgets.every(widget => widget.clickable === false)).toBe(true);
  });

  it('animates with delays and hides the proxy cards after settling', () => {
    const routine = createShuffleAnimationRoutine('draw-pile');
    expect(routine.some(step => step.func === 'DELAY')).toBe(true);
    expect(routine.some(step => step.func === 'SET' && step.property === 'display' && step.value === true)).toBe(true);
    expect(routine.at(-1)).toEqual(expect.objectContaining({ func: 'SET', property: 'display', value: false }));
  });

  it('locks every shuffle control while real cards are flipped and randomized', () => {
    const steps = createAnimatedShuffleSteps('draw-pile', 'draw-pile', 'shuffle-draw-pile-btn');
    expect(steps[0]).toEqual(expect.objectContaining({
      collection: [...SHUFFLE_BUTTON_IDS],
      property: 'clickable',
      value: false,
    }));
    const flipIndex = steps.findIndex(step => step.func === 'FLIP');
    const shuffleIndex = steps.findIndex(step => step.func === 'SHUFFLE');
    const unlockIndex = steps
      .map(step => step.func === 'SET' && step.property === 'clickable' && step.value === true)
      .lastIndexOf(true);
    expect(flipIndex).toBeGreaterThan(0);
    expect(shuffleIndex).toBeGreaterThan(flipIndex);
    expect(unlockIndex).toBeGreaterThan(shuffleIndex);
  });

  it('skips the draw-pile animation when the holder is empty', () => {
    expect(shuffleDrawPileRoutine[0]).toEqual(expect.objectContaining({ func: 'COUNT', holder: ['draw-pile'] }));
    const guard = asStep(shuffleDrawPileRoutine[1]);
    expect(guard).toEqual(expect.objectContaining({ func: 'IF', relation: '>', operand2: 0 }));
    expect(Array.isArray(guard.thenRoutine)).toBe(true);
  });
});
