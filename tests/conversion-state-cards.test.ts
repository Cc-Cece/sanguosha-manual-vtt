import { describe, expect, it } from 'vitest';
import {
  CONVERSION_STATE_COPIES_PER_SLOT,
  createConversionStateDecks,
} from '../src/data/conversionStateCards.js';
import { RESERVE_TRAY } from '../src/layouts/table.js';
import { resetTableRoutine } from '../src/routines/tableActions.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('conversion skill state cards', () => {
  it('creates twelve A cards and twelve B cards in separate reserve holders', () => {
    const widgets = createConversionStateDecks();
    const cards = widgets.filter(widget => widget.type === 'card');
    const decks = widgets.filter(widget => widget.type === 'deck');

    expect(decks).toHaveLength(2);
    expect(cards).toHaveLength(CONVERSION_STATE_COPIES_PER_SLOT * 2);
    expect(cards.filter(card => card.parent === 'conversion-a-reserve')).toHaveLength(12);
    expect(cards.filter(card => card.parent === 'conversion-b-reserve')).toHaveLength(12);
    expect(decks.map(deck => deck.id)).toEqual(['conversion-a-deck', 'conversion-b-deck']);
  });

  it('stores cards face down and uses an explicit yin-yang toggle instead of native three-face cycling', () => {
    const card = createConversionStateDecks().find(widget => widget.id === 'conversion-a-card-1') as Record<string, unknown>;
    const serialized = JSON.stringify(card.clickRoutine);

    expect(card.activeFace).toBe(0);
    expect(card.clickable).toBe(false);
    expect(card.conversionStateSlot).toBe('A');
    expect(serialized).toContain('"func":"GET","collection":"thisButton","property":"activeFace"');
    expect(serialized).toContain('"operand2":1');
    expect(serialized).toContain('"property":"activeFace","value":2');
    expect(serialized).toContain('"property":"activeFace","value":1');
    expect(serialized).not.toContain('"func":"FLIP"');
  });

  it('initializes taken cards to yang and resets returned cards to a non-clickable back', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const aHolder = game['conversion-a-reserve'] as Record<string, unknown>;
    const bHolder = game['conversion-b-reserve'] as Record<string, unknown>;

    expect(aHolder.onLeave).toEqual({ activeFace: 1, clickable: true });
    expect(aHolder.onEnter).toEqual({ activeFace: 0, clickable: false });
    expect(bHolder.onLeave).toEqual({ activeFace: 1, clickable: true });
    expect(bHolder.onEnter).toEqual({ activeFace: 0, clickable: false });
    expect(game['conversion-a-card-12']).toBeDefined();
    expect(game['conversion-b-card-12']).toBeDefined();
  });

  it('keeps conversion markers separate from the health pile and includes them in full reset', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const healthHolder = game['marker-reserve'] as Record<string, unknown>;
    const aHolder = game['conversion-a-reserve'] as Record<string, unknown>;
    const bHolder = game['conversion-b-reserve'] as Record<string, unknown>;
    const resetSerialized = JSON.stringify(resetTableRoutine);

    expect(healthHolder.text).toBe('体力');
    expect(aHolder.text).toBe('转换 A');
    expect(bHolder.text).toBe('转换 B');
    expect(RESERVE_TRAY.width).toBe(750);
    expect(resetSerialized).toContain('conversion-a-reserve');
    expect(resetSerialized).toContain('conversion-b-reserve');
    expect((game['shuffle-marker-reserve-btn'] as Record<string, unknown>).clickRoutine)
      .not.toEqual((game['conversion-state-help'] as Record<string, unknown>).clickRoutine);
  });
});
