export type ReserveLibraryType = 'general' | 'extra';

export interface ReserveCategory {
  id: string;
  label: string;
  order: number;
  libraryType: ReserveLibraryType;
}

export interface ReserveCardMetadata {
  sequence: number;
  cardWidgetId: string;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  cardLabel: string;
  defaultSelected: boolean;
}

export interface ReservePanelState {
  activeTab: ReserveLibraryType;
  activeCategory: string;
  currentPage: number;
  pageCount: number;
}
