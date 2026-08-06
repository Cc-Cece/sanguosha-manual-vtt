export type ReserveLibraryType = 'general' | 'extra';
export type ReserveDraftState = 'editing' | 'confirmed';
export type ReserveCardState = 'draft' | 'reserved' | 'in-use';

export interface ReserveCategory {
  id: string;
  label: string;
  order: number;
  libraryType: ReserveLibraryType;
  count: number;
}

export interface ReserveCardMetadata {
  assetId: string;
  sequence: number;
  cardWidgetId: string;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  categoryOrder: number;
  cardLabel: string;
  cardOrder: number;
  defaultSelected: boolean;
  homePageId: string;
  homeRowId: string;
  homeIndex: number;
}

export interface ReserveRowDefinition {
  id: string;
  label: string;
  pageId: string;
  rowIndex: number;
  cardSequences: number[];
}

export interface ReservePageDefinition {
  id: string;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  categoryPage: number;
  cardSequences: number[];
  rows: ReserveRowDefinition[];
}

export interface ReserveViewDefinition {
  key: string;
  libraryType: ReserveLibraryType;
  categoryId: string;
  label: string;
  count: number;
  pageIds: string[];
}

export interface ReserveModel {
  categories: ReserveCategory[];
  cards: ReserveCardMetadata[];
  pages: ReservePageDefinition[];
  views: ReserveViewDefinition[];
  allPageIds: string[];
  generalCardIds: string[];
  extraCardIds: string[];
}

export interface ReservePanelState {
  activeTab: ReserveLibraryType;
  activeCategoryId: string;
  activeViewKey: string;
  currentPage: number;
  pageCount: number;
  draftState: ReserveDraftState;
}
