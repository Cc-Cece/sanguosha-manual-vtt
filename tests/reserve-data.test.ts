import { describe, expect, it } from 'vitest';
import { buildExtraMetadataList, buildGeneralMetadataList, EXTRA_CATEGORIES, GENERAL_CATEGORIES } from '../src/data/reserveLibraryCatalog.js';

describe('reserve panel catalog data integrity', () => {
  it('validates general categories cover all 315 generals without missing or duplicate IDs', () => {
    const generals = buildGeneralMetadataList(315);
    expect(generals).toHaveLength(315);

    const widgetIds = new Set(generals.map(g => g.cardWidgetId));
    expect(widgetIds.size).toBe(315);

    const categoryIds = new Set(GENERAL_CATEGORIES.map(c => c.id));
    for (const general of generals) {
      expect(categoryIds.has(general.categoryId)).toBe(true);
    }
  });

  it('validates extra card categories cover all 31 extra cards without missing or duplicate IDs', () => {
    const extras = buildExtraMetadataList(31);
    expect(extras).toHaveLength(31);

    const widgetIds = new Set(extras.map(e => e.cardWidgetId));
    expect(widgetIds.size).toBe(31);

    const categoryIds = new Set(EXTRA_CATEGORIES.map(c => c.id));
    for (const extra of extras) {
      expect(categoryIds.has(extra.categoryId)).toBe(true);
    }
  });
});
