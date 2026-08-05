import { describe, expect, it } from 'vitest';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve summary', () => {
  const widgets = widgetsOf(createFourPlayerPrototype(loadTestCatalog()));
  const controller = widgets.find(widget => widget.id === 'reserve-panel-controller')!;

  it('starts with audited all-selected counts', () => {
    expect(widgets.find(widget => widget.id === 'summary-generals-box')?.text).toContain('允许入局：315');
    expect(widgets.find(widget => widget.id === 'summary-extras-box')?.text).toContain('已选择：31');
  });

  it('contains real SELECT, COUNT and LABEL updates for global and current categories', () => {
    const serialized = JSON.stringify(controller.updateSummaryRoutine);
    expect(serialized).toContain('"func":"SELECT"');
    expect(serialized).toContain('"func":"COUNT"');
    expect(serialized).toContain('summary-generals-box');
    expect(serialized).toContain('summary-extras-box');
    expect(serialized).toContain('summary-current-box');
    expect(serialized).toContain('activeCategoryId');
  });
});
