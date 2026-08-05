import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('classified reserve panel prototype', () => {
  const catalog = loadTestCatalog();
  const model = buildReserveModel(catalog);
  const widgets = widgetsOf(createFourPlayerPrototype(catalog));

  it('contains the controller and every generated page exactly once', () => {
    expect(widgets.find(widget => widget.id === 'reserve-panel-controller')).toBeDefined();
    expect(widgets.find(widget => widget.id === 'reserve-prep-drawer')?.display).toBe(false);
    for (const pageId of model.allPageIds) {
      expect(widgets.filter(widget => widget.id === pageId)).toHaveLength(1);
    }
  });

  it('removes historical candidate/final-deck widgets and fake package holders', () => {
    const ids = new Set(widgets.map(widget => widget.id));
    for (const oldId of [
      'general-candidate-zone', 'general-excluded-zone', 'general-staging-zone',
      'final-general-deck-zone', 'final-identity-deck-zone', 'final-extra-deck-zone',
      'pkg-gen-std-pile', 'pkg-extra-junzheng-pile',
    ]) expect(ids.has(oldId)).toBe(false);
  });
});
