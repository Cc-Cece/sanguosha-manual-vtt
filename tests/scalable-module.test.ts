import { describe, expect, it } from 'vitest';
import { MODULE_SCALES } from '../src/layouts/continuousBoard.js';
import {
  COMPONENT_SCALE_PERCENTS,
  GLOBAL_CARD_SCALE_PERCENTS,
  createSecureModuleScaleRoutine,
} from '../src/routines/componentScaling.js';

describe('component scaling calculations and routines', () => {
  it('supports host component scaling through 400 percent and global cards through 250 percent', () => {
    expect(MODULE_SCALES).toEqual([0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0]);
    expect(COMPONENT_SCALE_PERCENTS).toEqual([50, 75, 100, 125, 150, 200, 250, 300, 400]);
    expect(GLOBAL_CARD_SCALE_PERCENTS).toEqual([75, 100, 125, 150, 175, 200, 250]);
  });

  it('validates secure module scale routines with seat permission checks', () => {
    const routine = createSecureModuleScaleRoutine(2, 0.9);
    const serialized = JSON.stringify(routine);
    expect(serialized).toContain('${PROPERTY player OF seat-2}');
    expect(serialized).toContain('${PROPERTY player OF seat-1}');
    expect(serialized).toContain('无法缩放组件');
  });
});
