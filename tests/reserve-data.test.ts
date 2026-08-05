import { describe, expect, it } from 'vitest';
import { buildExtraMetadataList, buildGeneralMetadataList, EXTRA_CATEGORIES, GENERAL_CATEGORIES } from '../src/data/reserveLibraryCatalog.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve panel catalog data integrity', () => {
  const catalog = loadTestCatalog();

  it('uses explicit package metadata for every general', () => {
    const generalAssets = catalog.assets.filter(asset => asset.category === 'generals');
    const generals = buildGeneralMetadataList(catalog.assets);
    expect(generals).toHaveLength(generalAssets.length);

    const widgetIds = new Set(generals.map(general => general.cardWidgetId));
    expect(widgetIds.size).toBe(generals.length);

    const categoryIds = new Set(GENERAL_CATEGORIES.map(category => category.id));
    for (const general of generals) {
      expect(categoryIds.has(general.categoryId)).toBe(true);
    }
  });

  it('covers every expansion playing card without sequence-based guessing', () => {
    const extraAssets = catalog.assets.filter(asset => asset.category === 'gameplay-extra');
    const extras = buildExtraMetadataList(catalog.assets);
    expect(extras).toHaveLength(extraAssets.length);

    const widgetIds = new Set(extras.map(extra => extra.cardWidgetId));
    expect(widgetIds.size).toBe(extras.length);

    const categoryIds = new Set(EXTRA_CATEGORIES.map(category => category.id));
    for (const extra of extras) {
      expect(categoryIds.has(extra.categoryId)).toBe(true);
    }
  });
});
