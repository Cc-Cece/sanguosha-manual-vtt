import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createCurrentScopeBatchRoutine } from '../src/routines/reserveCardRoutines.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve selection and lifecycle state', () => {
  const catalog = loadTestCatalog();
  const model = buildReserveModel(catalog);
  const widgets = widgetsOf(createFourPlayerPrototype(catalog));
  const cards = widgets.filter(widget => widget.type === 'card' && widget.reserveLibraryType);

  it('initializes every managed card as an editable draft without pending removal', () => {
    expect(cards).toHaveLength(346);
    for (const card of cards) {
      expect(card.reserveSelected).toBe(true);
      expect(card.reserveDefaultSelected).toBe(true);
      expect(card.reserveState).toBe('draft');
      expect(card.reservePendingRemoval).toBe(false);
      expect(card.activeFace).toBe(1);
      expect(card.movable).toBe(false);
      expect(card.clickable).toBe(true);
      expect(card.reserveHomeHolder).toBe(card.parent);
    }
  });

  it('marks cards reserved on tray entry and in-use on tray exit', () => {
    const generalReserve = widgets.find(widget => widget.id === 'general-reserve')!;
    const extraReserve = widgets.find(widget => widget.id === 'extra-reserve')!;

    expect(generalReserve.onEnter).toEqual(expect.objectContaining({ activeFace: 0, reserveState: 'reserved' }));
    expect(generalReserve.onLeave).toEqual(expect.objectContaining({ reserveState: 'in-use' }));
    expect(extraReserve.onEnter).toEqual(expect.objectContaining({ activeFace: 0, reserveState: 'reserved' }));
    expect(extraReserve.onLeave).toEqual(expect.objectContaining({ reserveState: 'in-use' }));
  });

  it('batch operations change configuration for all states but only restyle draft cards', () => {
    const cardRoutine = JSON.stringify(cards[0].clickRoutine);
    const batchRoutine = JSON.stringify(createCurrentScopeBatchRoutine(model, 'general', 'unselect'));
    expect(cardRoutine).toContain('reserveSelected');
    expect(cardRoutine).toContain('thisButton');
    expect(batchRoutine).toContain('reserveCategoryId');
    expect(batchRoutine).toContain('"property":"reserveState","relation":"==","value":"draft"');
    expect(batchRoutine).not.toContain('"property":"display"');
  });
});
