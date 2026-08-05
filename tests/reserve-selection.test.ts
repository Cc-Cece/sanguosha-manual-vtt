import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createCurrentScopeBatchRoutine } from '../src/routines/reserveCardRoutines.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve selection state', () => {
  const catalog = loadTestCatalog();
  const model = buildReserveModel(catalog);
  const cards = widgetsOf(createFourPlayerPrototype(catalog))
    .filter(widget => widget.type === 'card' && widget.reserveLibraryType);

  it('initializes every managed card as selected, face-up, clickable and not draggable', () => {
    expect(cards).toHaveLength(346);
    for (const card of cards) {
      expect(card.reserveSelected).toBe(true);
      expect(card.reserveDefaultSelected).toBe(true);
      expect(card.reserveState).toBe('draft');
      expect(card.activeFace).toBe(1);
      expect(card.movable).toBe(false);
      expect(card.clickable).toBe(true);
      expect(card.reserveHomeHolder).toBe(card.parent);
    }
  });

  it('single-card toggles and batch operations modify reserveSelected rather than display', () => {
    const cardRoutine = JSON.stringify(cards[0].clickRoutine);
    const batchRoutine = JSON.stringify(createCurrentScopeBatchRoutine(model, 'general', 'unselect'));
    expect(cardRoutine).toContain('reserveSelected');
    expect(cardRoutine).toContain('thisButton');
    expect(batchRoutine).toContain('reserveCategoryId');
    expect(batchRoutine).not.toContain('"property":"display"');
  });
});
