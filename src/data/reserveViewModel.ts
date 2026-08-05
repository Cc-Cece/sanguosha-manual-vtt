import { buildExtraTaxonomy, buildGeneralTaxonomy, ReserveTaxonomyEntry } from './reserveTaxonomy.js';

export interface ReserveRowDefinition {
  id: string;
  pageId: string;
  rowNumber: number;
  label: string;
  cards: ReserveTaxonomyEntry[];
}

export interface ReservePageDefinition {
  id: string;
  libraryType: 'general' | 'extra';
  categoryId: string;
  categoryLabel: string;
  pageNumber: number; // 1-indexed within category
  totalPagesInCategory: number;
  rows: ReserveRowDefinition[];
}

export function buildReserveViewRegistry(): {
  pages: ReservePageDefinition[];
  pagesByCategory: Record<string, string[]>;
  categoryTotalPages: Record<string, number>;
  cardTargetHolders: Record<number, { holderId: string; indexInHolder: number }>;
} {
  const pages: ReservePageDefinition[] = [];
  const pagesByCategory: Record<string, string[]> = {
    all_general: [],
    all_extra: [],
  };
  const categoryTotalPages: Record<string, number> = {};
  const cardTargetHolders: Record<number, { holderId: string; indexInHolder: number }> = {};

  const generals = buildGeneralTaxonomy(315);
  const extras = buildExtraTaxonomy(31);

  // Group generals by category
  const genCatMap = new Map<string, ReserveTaxonomyEntry[]>();
  for (const gen of generals) {
    if (!genCatMap.has(gen.categoryId)) genCatMap.set(gen.categoryId, []);
    genCatMap.get(gen.categoryId)!.push(gen);
  }

  // Build General Pages
  const genCatOrder = ['std', 'feng', 'huo', 'lin', 'shan', 'yijiang', 'sp', 'other'];
  for (const catId of genCatOrder) {
    const items = genCatMap.get(catId) || [];
    const maxPerScale = 68; // Max 68 cards per page (4 rows of 17)
    const pageCount = Math.max(1, Math.ceil(items.length / maxPerScale));
    categoryTotalPages[`general_${catId}`] = pageCount;
    pagesByCategory[`general_${catId}`] = [];

    for (let p = 1; p <= pageCount; p++) {
      const pageId = `gen-page-${catId}-${p}`;
      pagesByCategory[`general_${catId}`].push(pageId);
      pagesByCategory.all_general.push(pageId);

      const pageItems = items.slice((p - 1) * maxPerScale, p * maxPerScale);
      const rows: ReserveRowDefinition[] = [];
      const rowCount = Math.ceil(pageItems.length / 17);

      for (let r = 1; r <= rowCount; r++) {
        const rowId = `${pageId}-row-${r}`;
        const rowItems = pageItems.slice((r - 1) * 17, r * 17);
        rows.push({
          id: rowId,
          pageId,
          rowNumber: r,
          label: `🎴 ${pageItems[0]?.categoryLabel || ''} - 第 ${p} 页 - 第 ${r} 行 (${rowItems.length}张)`,
          cards: rowItems,
        });

        rowItems.forEach((card, idx) => {
          cardTargetHolders[card.sourceSequence] = { holderId: rowId, indexInHolder: idx };
        });
      }

      pages.push({
        id: pageId,
        libraryType: 'general',
        categoryId: catId,
        categoryLabel: pageItems[0]?.categoryLabel || '',
        pageNumber: p,
        totalPagesInCategory: pageCount,
        rows,
      });
    }
  }

  // Group extra cards by category
  const extraCatMap = new Map<string, ReserveTaxonomyEntry[]>();
  for (const ext of extras) {
    if (!extraCatMap.has(ext.categoryId)) extraCatMap.set(ext.categoryId, []);
    extraCatMap.get(ext.categoryId)!.push(ext);
  }

  const extraCatOrder = ['equipment', 'trick', 'special'];
  for (const catId of extraCatOrder) {
    const items = extraCatMap.get(catId) || [];
    const pageId = `extra-page-${catId}-1`;
    categoryTotalPages[`extra_${catId}`] = 1;
    pagesByCategory[`extra_${catId}`] = [pageId];
    pagesByCategory.all_extra.push(pageId);

    const rowId = `${pageId}-row-1`;
    items.forEach((card, idx) => {
      cardTargetHolders[card.sourceSequence + 1000] = { holderId: rowId, indexInHolder: idx };
    });

    pages.push({
      id: pageId,
      libraryType: 'extra',
      categoryId: catId,
      categoryLabel: items[0]?.categoryLabel || '',
      pageNumber: 1,
      totalPagesInCategory: 1,
      rows: [
        {
          id: rowId,
          pageId,
          rowNumber: 1,
          label: `🗡️ ${items[0]?.categoryLabel || ''} (${items.length}张)`,
          cards: items,
        },
      ],
    });
  }

  categoryTotalPages.all_general = pagesByCategory.all_general.length;
  categoryTotalPages.all_extra = pagesByCategory.all_extra.length;

  return { pages, pagesByCategory, categoryTotalPages, cardTargetHolders };
}
