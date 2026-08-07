import { describe, expect, it } from 'vitest';
import { MODULE_SCALES } from '../src/layouts/continuousBoard.js';
import { getScaledBounds, isOverlappingScaled } from '../src/layouts/scaledBounds.js';
import {
  COMPONENT_SCALE_PERCENTS,
  GLOBAL_CARD_SCALE_PERCENTS,
  createScaleRoutine,
  createSecureModuleScaleRoutine,
} from '../src/routines/componentScaling.js';

describe('component scaling calculations and routines', () => {
  it('supports host component scaling through 400 percent and global cards through 250 percent', () => {
    expect(MODULE_SCALES).toEqual([0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0]);
    expect(COMPONENT_SCALE_PERCENTS).toEqual([50, 75, 100, 125, 150, 200, 250, 300, 400]);
    expect(GLOBAL_CARD_SCALE_PERCENTS).toEqual([75, 100, 125, 150, 175, 200, 250]);
  });

  it('correctly calculates visual bounds based on scale factor with top-left origin', () => {
    const mockWidget = { id: 'test-w', type: 'basic', x: 100, y: 100, width: 400, height: 200, scale: 0.75 } as any;
    const bounds = getScaledBounds(mockWidget);
    expect(bounds.visualWidth).toBe(300);
    expect(bounds.visualHeight).toBe(150);
    expect(bounds.right).toBe(400);
    expect(bounds.bottom).toBe(250);
  });

  it('detects collisions between scaled bounds correctly', () => {
    const a = getScaledBounds({ x: 0, y: 0, width: 100, height: 100, scale: 1.0 } as any);
    const b = getScaledBounds({ x: 80, y: 80, width: 100, height: 100, scale: 0.75 } as any);
    expect(isOverlappingScaled(a, b)).toBe(true);

    const c = getScaledBounds({ x: 200, y: 200, width: 100, height: 100, scale: 1.0 } as any);
    expect(isOverlappingScaled(a, c)).toBe(false);
  });

  it('validates secure module scale routines with seat permission checks', () => {
    const routine = createSecureModuleScaleRoutine(2, 0.9);
    const serialized = JSON.stringify(routine);
    expect(serialized).toContain('${PROPERTY player OF seat-2}');
    expect(serialized).toContain('${PROPERTY player OF seat-1}');
    expect(serialized).toContain('无法缩放组件');
  });
});
