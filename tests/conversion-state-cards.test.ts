import { describe, expect, it } from 'vitest';
import {
  CONVERSION_STATE_COPIES,
  createConversionStateDecks,
} from '../src/data/conversionStateCards.js';
import { RESERVE_TRAY } from '../src/layouts/table.js';
import { resetTableRoutine } from '../src/routines/tableActions.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('conversion skill state cards', () => {
  it('creates one universal deck with twelve cards and no B slot', () => {
    const widgets = createConversionStateDecks();
    const cards = widgets.filter(widget => widget.type === 'card');
    const decks = widgets.filter(widget => widget.type === 'deck');

    expect(decks).toHaveLength(1);
    expect(cards).toHaveLength(CONVERSION_STATE_COPIES);
    expect(cards.every(card => card.parent === 'conversion-state-reserve')).toBe(true);
    expect(decks.map(deck => deck.id)).toEqual(['conversion-state-deck']);
    expect(widgets.some(widget => widget.id.includes('conversion-b'))).toBe(false);
  });

  it('stores cards face down and uses an explicit yin-yang toggle', () => {
    const card = createConversionStateDecks().find(widget => widget.id === 'conversion-state-card-1') as Record<string, unknown>;
    const serialized = JSON.stringify(card.clickRoutine);

    expect(card.activeFace).toBe(0);
    expect(card.clickable).toBe(false);
    expect(card.conversionStateMarker).toBe(true);
    expect(serialized).toContain('"func":"GET","collection":"thisButton","property":"activeFace"');
    expect(serialized).toContain('"operand2":1');
    expect(serialized).toContain('"property":"activeFace","value":2');
    expect(serialized).toContain('"property":"activeFace","value":1');
    expect(serialized).not.toContain('"func":"FLIP"');
  });

  it('initializes taken cards to yang and resets returned cards to a non-clickable back', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const holder = game['conversion-state-reserve'] as Record<string, unknown>;

    expect(holder.onLeave).toEqual({ activeFace: 1, clickable: true });
    expect(holder.onEnter).toEqual({ activeFace: 0, clickable: false });
    expect(game['conversion-state-card-12']).toBeDefined();
    expect(game['conversion-a-reserve']).toBeUndefined();
    expect(game['conversion-b-reserve']).toBeUndefined();
  });

  it('keeps the marker separate from health cards and includes it in full reset', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const healthHolder = game['marker-reserve'] as Record<string, unknown>;
    const conversionHolder = game['conversion-state-reserve'] as Record<string, unknown>;
    const resetSerialized = JSON.stringify(resetTableRoutine);

    expect(healthHolder.text).toBe('体力');
    expect(conversionHolder.text).toBe('转换技');
    expect(RESERVE_TRAY.width).toBe(630);
    expect(resetSerialized).toContain('conversion-state-reserve');
    expect(resetSerialized).not.toContain('conversion-b-reserve');
    expect((game['shuffle-marker-reserve-btn'] as Record<string, unknown>).clickRoutine)
      .not.toEqual((game['conversion-state-help'] as Record<string, unknown>).clickRoutine);
  });
});
