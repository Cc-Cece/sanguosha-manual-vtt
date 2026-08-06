import { describe, expect, it } from 'vitest';
import { buildReserveModel, RESERVE_CARDS_PER_PAGE, RESERVE_CARDS_PER_ROW, RESERVE_ROWS_PER_PAGE } from '../src/data/reserveViewRegistry.js';
import { loadTestCatalog } from './helpers.js';

describe('classified reserve model', () => {
  const catalog = loadTestCatalog();
  const model = buildReserveModel(catalog);

  it('uses the audited card counts and hides the empty standard category', () => {
    expect(model.generalCardIds).toHaveLength(315);
    expect(model.extraCardIds).toHaveLength(31);
    expect(Object.fromEntries(model.categories.map(category => [category.id, category.count]))).toEqual({
      'gen-all': 315,
      'gen-feng': 8,
      'gen-huo': 8,
      'gen-lin': 8,
      'gen-shan': 8,
      'gen-yijiang': 33,
      'gen-sp': 121,
      'gen-other': 129,
      'extra-all': 31,
    });
    expect(model.categories.some(category => category.id === 'gen-std')).toBe(false);
  });

  it('creates ten reusable general pages and one expansion page', () => {
    expect(model.views.find(view => view.key === 'general:gen-all')?.pageIds).toHaveLength(10);
    expect(model.views.find(view => view.key === 'general:gen-sp')?.pageIds).toHaveLength(2);
    expect(model.views.find(view => view.key === 'general:gen-other')?.pageIds).toHaveLength(3);
    expect(model.views.find(view => view.key === 'extra:extra-all')?.pageIds).toHaveLength(1);
    expect(model.pages).toHaveLength(11);
  });

  it('covers every managed card exactly once within layout capacity', () => {
    expect(model.cards).toHaveLength(346);
    expect(new Set(model.cards.map(card => card.sequence)).size).toBe(346);
    expect(new Set(model.cards.map(card => card.cardWidgetId)).size).toBe(346);
    for (const page of model.pages) {
      expect(page.cardSequences.length).toBeLessThanOrEqual(RESERVE_CARDS_PER_PAGE);
      expect(page.rows.length).toBeLessThanOrEqual(RESERVE_ROWS_PER_PAGE);
      for (const row of page.rows) {
        expect(row.cardSequences.length).toBeGreaterThan(0);
        expect(row.cardSequences.length).toBeLessThanOrEqual(RESERVE_CARDS_PER_ROW);
        expect(row.label).toContain(`${row.cardSequences.length} 张`);
      }
    }
  });
});
