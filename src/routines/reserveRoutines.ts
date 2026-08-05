import { buildReserveViewRegistry } from '../data/reserveViewModel.js';

const viewRegistry = buildReserveViewRegistry();

export const allowAllGeneralsRoutine = [
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'general', collection: 'targetGenerals' },
  { func: 'SET', collection: 'targetGenerals', property: 'reserveSelected', value: true },
  { func: 'SET', collection: 'targetGenerals', property: 'css', value: { border: '3px solid #50e080', opacity: 1.0, filter: 'none' } },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
] as const;

export const banAllGeneralsRoutine = [
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'general', collection: 'targetGenerals' },
  { func: 'SET', collection: 'targetGenerals', property: 'reserveSelected', value: false },
  { func: 'SET', collection: 'targetGenerals', property: 'css', value: { border: '3px solid #e04030', opacity: 0.45, filter: 'grayscale(0.8)' } },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
] as const;

export const selectAllExtrasRoutine = [
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'extra', collection: 'targetExtras' },
  { func: 'SET', collection: 'targetExtras', property: 'reserveSelected', value: true },
  { func: 'SET', collection: 'targetExtras', property: 'css', value: { border: '3px solid #50e080', opacity: 1.0, filter: 'none' } },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
] as const;

export const unselectAllExtrasRoutine = [
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'extra', collection: 'targetExtras' },
  { func: 'SET', collection: 'targetExtras', property: 'reserveSelected', value: false },
  { func: 'SET', collection: 'targetExtras', property: 'css', value: { border: '3px solid #e04030', opacity: 0.45, filter: 'grayscale(0.8)' } },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
] as const;

export const resetReserveDraftRoutine = [
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'general', collection: 'targetGenerals' },
  { func: 'SET', collection: 'targetGenerals', property: 'reserveSelected', value: true },
  { func: 'SET', collection: 'targetGenerals', property: 'css', value: { border: '3px solid #50e080', opacity: 1.0, filter: 'none' } },
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'extra', collection: 'targetExtras' },
  { func: 'SET', collection: 'targetExtras', property: 'reserveSelected', value: false },
  { func: 'SET', collection: 'targetExtras', property: 'css', value: { border: '3px solid #e04030', opacity: 0.45, filter: 'grayscale(0.8)' } },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
] as const;

const allGenPages = viewRegistry.pagesByCategory.all_general;
const allExtraPages = viewRegistry.pagesByCategory.all_extra;
const allReservePages = viewRegistry.pages.map(p => p.id);

export const selectGeneralsTabRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [allGenPages[0]], property: 'display', value: true },
  { func: 'SET', collection: ['general-library-title', 'nav-sidebar', 'action-bar', 'bulk-allow-all-btn', 'bulk-ban-all-btn'], property: 'display', value: true },
  { func: 'SET', collection: ['extra-composer-title', 'bulk-select-extras-btn', 'bulk-unselect-extras-btn'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: `1 / ${allGenPages.length}` },
] as const;

export const selectExtrasTabRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [allExtraPages[0]], property: 'display', value: true },
  { func: 'SET', collection: ['extra-composer-title', 'action-bar', 'bulk-select-extras-btn', 'bulk-unselect-extras-btn'], property: 'display', value: true },
  { func: 'SET', collection: ['general-library-title', 'nav-sidebar', 'bulk-allow-all-btn', 'bulk-ban-all-btn'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: `1 / ${allExtraPages.length}` },
] as const;

export const switchGenAllRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [allGenPages[0]], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: `1 / ${allGenPages.length}` },
] as const;

export const switchGenStdRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [viewRegistry.pagesByCategory.general_std[0]], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
] as const;

export const switchGenExpRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [viewRegistry.pagesByCategory.general_feng[0]], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
] as const;

export const prevPageRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [allGenPages[0]], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: `1 / ${allGenPages.length}` },
] as const;

export const nextPageRoutine = [
  { func: 'SET', collection: allReservePages, property: 'display', value: false },
  { func: 'SET', collection: [allGenPages[1] || allGenPages[0]], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: `2 / ${allGenPages.length}` },
] as const;
