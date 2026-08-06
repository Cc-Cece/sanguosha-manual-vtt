import { describe, expect, it } from 'vitest';
import { createAssetDecks } from '../src/data/assetDecks.js';
import { buildReserveModel, RESERVE_CARDS_PER_ROW } from '../src/data/reserveViewRegistry.js';
import { createLibraryTableWidgets } from '../src/widgets/libraryBrowser.js';
import {
  RESERVE_ROW_CARD_STEP,
  RESERVE_ROW_DROP_OFFSET_X,
  RESERVE_ROW_DROP_OFFSET_Y,
} from '../src/widgets/reserveSpreadRow.js';
import { loadTestCatalog } from './helpers.js';

function isReserveRow(widget: Record<string, unknown>): boolean {
  return widget.type === 'holder' && Array.isArray(widget.reserveCardSequences);
}

describe('reserve panel overlapping rows', () => {
  const catalog = loadTestCatalog();
  const model = buildReserveModel(catalog);
  const browserWidgets = createLibraryTableWidgets(model);
  const deckWidgets = createAssetDecks(catalog, model);

  it('uses a hand-like horizontal stack for every reserve row', () => {
    const rows = browserWidgets.filter(widget => isReserveRow(widget));
    expect(rows.length).toBeGreaterThan(0);

    for (const row of rows) {
      expect(row.alignChildren).toBe(true);
      expect(row.preventPiles).toBe(true);
      expect(row.stackOffsetX).toBe(RESERVE_ROW_CARD_STEP);
      expect(row.stackOffsetY).toBe(0);
      expect(row.dropOffsetX).toBe(RESERVE_ROW_DROP_OFFSET_X);
      expect(row.dropOffsetY).toBe(RESERVE_ROW_DROP_OFFSET_Y);
      expect(row.dropTarget).toEqual({ type: 'card', reserveHomeHolder: row.id });
    }
  });

  it('marks reserve cards as overlapping and prepositions them across their home row', () => {
    const reserveCards = deckWidgets.filter(widget => widget.type === 'card' && typeof widget.reserveLibraryType === 'string');
    expect(reserveCards).toHaveLength(model.cards.length);

    for (const card of reserveCards) {
      const homeIndex = card.reserveHomeIndex as number;
      expect(card.overlap).toBe(true);
      expect(card.parent).toBe(card.reserveHomeHolder);
      expect(card.x).toBe(RESERVE_ROW_DROP_OFFSET_X + homeIndex * RESERVE_ROW_CARD_STEP);
      expect(card.y).toBe(RESERVE_ROW_DROP_OFFSET_Y);
    }
  });

  it('fits a full sixteen-card row inside the 980-pixel reserve viewport', () => {
    const cardWidth = 90;
    const occupiedWidth = RESERVE_ROW_DROP_OFFSET_X
      + (RESERVE_CARDS_PER_ROW - 1) * RESERVE_ROW_CARD_STEP
      + cardWidth;
    expect(occupiedWidth).toBeLessThanOrEqual(980);
    expect(RESERVE_ROW_CARD_STEP).toBeLessThan(cardWidth);
  });
});
