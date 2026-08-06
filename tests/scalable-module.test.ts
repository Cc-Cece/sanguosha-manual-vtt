import { describe, expect, it } from 'vitest';
import { MODULE_SCALES } from '../src/layouts/continuousBoard.js';
import { getScaledBounds, isOverlappingScaled } from '../src/layouts/scaledBounds.js';
import { createScaleRoutine, createSecureModuleScaleRoutine } from '../src/routines/componentScaling.js';

describe('component scaling calculations and routines', () => {
  it('supports discrete scale presets 75%, 90%, 100%, 115%', () => {
    expect(MODULE_SCALES).toEqual([0.75, 0.9, 1.0, 1.15]);
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
