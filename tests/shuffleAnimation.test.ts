import { describe, expect, it } from 'vitest';
import { shuffleDrawPileRoutine } from '../src/routines/pileShuffle.js';
import {
  createAnimatedShuffleSteps,
  createShuffleAnimationRoutine,
  createShuffleAnimationWidgets,
  SHUFFLE_BUTTON_IDS,
} from '../src/widgets/shuffleAnimation.js';

const asStep = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;
const backs = {
  generals: '/assets/test-generals',
  identities: '/assets/test-identities',
  main: '/assets/test-main',
};

describe('shuffle animation', () => {
  it('creates six non-interactive visual cards for every shuffle surface', () => {
    const widgets = createShuffleAnimationWidgets(backs);
    expect(widgets).toHaveLength(42);
    expect(new Set(widgets.map(widget => widget.id)).size).toBe(42);
    expect(widgets.every(widget => widget.display === false)).toBe(true);
    expect(widgets.every(widget => widget.clickable === false)).toBe(true);
    expect(widgets.every(widget => widget.layer === 90)).toBe(true);
  });

  it('uses valid CSS property names and the matching real card back', () => {
    const widgets = createShuffleAnimationWidgets(backs);
    const backgroundImageOf = (id: string): string => {
      const target = widgets.find(widget => widget.id === id);
      const css = target?.css as { default?: Record<string, string> } | undefined;
      return css?.default?.['background-image'] ?? '';
    };

    expect(backgroundImageOf('shuffle-animation-general-reserve-1')).toBe('url("/assets/test-generals")');
    expect(backgroundImageOf('shuffle-animation-identity-reserve-1')).toBe('url("/assets/test-identities")');
    expect(backgroundImageOf('shuffle-animation-draw-pile-1')).toBe('url("/assets/test-main")');
    expect(backgroundImageOf('shuffle-animation-quick-shuffle-1')).toBe('url("/assets/test-main")');
    expect(backgroundImageOf('shuffle-animation-recycle-zone-1')).toBe('url("/assets/test-main")');
    expect(backgroundImageOf('shuffle-animation-extra-reserve-1')).toBe('url("/assets/test-main")');
    expect(backgroundImageOf('shuffle-animation-marker-reserve-1')).toBe('url("/assets/test-main")');

    const first = widgets[0];
    const css = first.css as { default?: Record<string, string>; inline?: Record<string, string> };
    expect(css.default).toHaveProperty('background-size', '100% 100%');
    expect(css.default).toHaveProperty('border-radius', '6px');
    expect(css.default).toHaveProperty('will-change');
    expect(css.inline).toHaveProperty('translate', '${PROPERTY shuffleX}px ${PROPERTY shuffleY}px');
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
