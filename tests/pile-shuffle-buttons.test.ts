import { describe, expect, it } from 'vitest';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('dedicated pile shuffle buttons placement and permissions', () => {
  it('validates 5 dedicated shuffle buttons exist in prototype with host permissions', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const buttonIds = [
      'shuffle-draw-pile-btn',
      'shuffle-general-reserve-btn',
      'shuffle-identity-reserve-btn',
      'shuffle-extra-reserve-btn',
      'shuffle-marker-reserve-btn',
    ];

    for (const id of buttonIds) {
      const btn = widgets.find(w => w.id === id);
      expect(btn).toBeDefined();
      expect(btn?.type).toBe('button');
      expect(btn?.movable).toBe(false);
      expect(btn?.onlyVisibleForSeat).toEqual(['seat-1']);
      expect(btn?.linkedToSeat).toEqual(['seat-1']);
      expect(btn?.clickRoutine).toBeDefined();
    }

    const drawBtn = widgets.find(w => w.id === 'shuffle-draw-pile-btn');
    expect(drawBtn?.parent).toBeUndefined();

    const trayButtons = [
      'shuffle-general-reserve-btn',
      'shuffle-identity-reserve-btn',
      'shuffle-extra-reserve-btn',
      'shuffle-marker-reserve-btn',
    ];
    for (const id of trayButtons) {
      const btn = widgets.find(w => w.id === id);
      expect(btn?.parent).toBe('reserve-tray');
    }
  });
});
