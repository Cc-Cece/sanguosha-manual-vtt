import type { AssetCatalog } from '../types/assets.js';
import type {
  ReserveCardMetadata,
  ReserveModel,
  ReservePageDefinition,
  ReserveRowDefinition,
  ReserveViewDefinition,
} from '../types/reserveLibrary.js';
import { buildExtraMetadataList, buildGeneralMetadataList, buildReserveCategories } from './reserveLibraryCatalog.js';

export const RESERVE_CARDS_PER_ROW = 16;
export const RESERVE_ROWS_PER_PAGE = 4;
export const RESERVE_CARDS_PER_PAGE = RESERVE_CARDS_PER_ROW * RESERVE_ROWS_PER_PAGE;

function pageIdFor(categoryId: string, pageNumber: number): string {
  return `${categoryId}-page-${pageNumber}`;
}

function rowIdFor(pageId: string, rowNumber: number): string {
  return `${pageId}-row-${rowNumber}`;
}

function paginateCategory(
  cards: Omit<ReserveCardMetadata, 'homePageId' | 'homeRowId' | 'homeIndex'>[],
): { pages: ReservePageDefinition[]; cards: ReserveCardMetadata[] } {
  if (!cards.length) return { pages: [], cards: [] };
  const categoryId = cards[0].categoryId;
  const categoryLabel = cards[0].categoryLabel;
  const pages: ReservePageDefinition[] = [];
  const completedCards: ReserveCardMetadata[] = [];

  for (let pageOffset = 0; pageOffset < cards.length; pageOffset += RESERVE_CARDS_PER_PAGE) {
    const pageNumber = Math.floor(pageOffset / RESERVE_CARDS_PER_PAGE) + 1;
    const id = pageIdFor(categoryId, pageNumber);
    const pageCards = cards.slice(pageOffset, pageOffset + RESERVE_CARDS_PER_PAGE);
    const rows: ReserveRowDefinition[] = [];

    for (let rowOffset = 0; rowOffset < pageCards.length; rowOffset += RESERVE_CARDS_PER_ROW) {
      const rowNumber = Math.floor(rowOffset / RESERVE_CARDS_PER_ROW) + 1;
      const rowId = rowIdFor(id, rowNumber);
      const rowCards = pageCards.slice(rowOffset, rowOffset + RESERVE_CARDS_PER_ROW);
      rows.push({
        id: rowId,
        label: `第 ${rowNumber} 行（${rowCards.length} 张）`,
        pageId: id,
        rowIndex: rowNumber - 1,
        cardSequences: rowCards.map(card => card.sequence),
      });
      rowCards.forEach((card, homeIndex) => completedCards.push({
        ...card,
        homePageId: id,
        homeRowId: rowId,
        homeIndex,
      }));
    }

    pages.push({
      id,
      libraryType: pageCards[0].libraryType,
      categoryId,
      categoryLabel,
      categoryPage: pageNumber,
      cardSequences: pageCards.map(card => card.sequence),
      rows,
    });
  }

  return { pages, cards: completedCards };
}

export function buildReserveModel(catalog: AssetCatalog): ReserveModel {
  const categories = buildReserveCategories(catalog.assets);
  const generalBase = buildGeneralMetadataList(catalog.assets);
  const extraBase = buildExtraMetadataList(catalog.assets);
  const pages: ReservePageDefinition[] = [];
  const cards: ReserveCardMetadata[] = [];

  const generalCategoryIds = categories
    .filter(category => category.libraryType === 'general' && category.id !== 'gen-all')
    .sort((a, b) => a.order - b.order)
    .map(category => category.id);

  for (const categoryId of generalCategoryIds) {
    const result = paginateCategory(generalBase.filter(card => card.categoryId === categoryId));
    pages.push(...result.pages);
    cards.push(...result.cards);
  }

  const extraResult = paginateCategory(extraBase);
  pages.push(...extraResult.pages);
  cards.push(...extraResult.cards);

  const generalPages = pages.filter(page => page.libraryType === 'general');
  const views: ReserveViewDefinition[] = [
    {
      key: 'general:gen-all',
      libraryType: 'general',
      categoryId: 'gen-all',
      label: '全部武将',
      count: generalBase.length,
      pageIds: generalPages.map(page => page.id),
    },
    ...generalCategoryIds.map(categoryId => {
      const category = categories.find(item => item.id === categoryId)!;
      return {
        key: `general:${categoryId}`,
        libraryType: 'general' as const,
        categoryId,
        label: category.label,
        count: category.count,
        pageIds: generalPages.filter(page => page.categoryId === categoryId).map(page => page.id),
      };
    }),
    {
      key: 'extra:extra-all',
      libraryType: 'extra',
      categoryId: 'extra-all',
      label: '全部扩展牌',
      count: extraBase.length,
      pageIds: extraResult.pages.map(page => page.id),
    },
  ];

  const allPageIds = pages.map(page => page.id);
  if (new Set(allPageIds).size !== allPageIds.length) throw new Error('Duplicate reserve page IDs');
  if (new Set(cards.map(card => card.sequence)).size !== cards.length) throw new Error('Duplicate reserve card sequences');
  if (cards.length !== generalBase.length + extraBase.length) throw new Error('Reserve card pagination lost cards');

  return {
    categories,
    cards: cards.sort((a, b) => a.sequence - b.sequence),
    pages,
    views,
    allPageIds,
    generalCardIds: cards.filter(card => card.libraryType === 'general').map(card => card.cardWidgetId),
    extraCardIds: cards.filter(card => card.libraryType === 'extra').map(card => card.cardWidgetId),
  };
}

export function findReserveView(model: ReserveModel, key: string): ReserveViewDefinition {
  const view = model.views.find(candidate => candidate.key === key);
  if (!view) throw new Error(`Unknown reserve view: ${key}`);
  return view;
}
