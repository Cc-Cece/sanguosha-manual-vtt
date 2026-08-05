import { findReserveView } from '../data/reserveViewRegistry.js';
import type { ReserveLibraryType, ReserveModel } from '../types/reserveLibrary.js';
import type { RoutineStep } from '../types/vtt.js';
import { hostOnlyRoutine, selectedCss, unselectedCss } from './reserveCardRoutines.js';
import { createCloseReservePanelRoutine, switchViewSteps } from './reserveNavigation.js';

const routineSteps = (...steps: RoutineStep[]): RoutineStep[] => steps;

function safeCollectionName(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}

function trayId(libraryType: ReserveLibraryType): string {
  return libraryType === 'general' ? 'general-reserve' : 'extra-reserve';
}

function restoreReservedCardsSteps(model: ReserveModel): RoutineStep[] {
  const steps: RoutineStep[] = [];
  for (const page of model.pages) {
    for (const row of page.rows) {
      const prefix = `restore_${safeCollectionName(row.id)}`;
      const tray = trayId(page.libraryType);
      steps.push(...routineSteps(
        { func: 'SELECT', source: 'all', type: 'card', property: 'reserveHomeHolder', relation: '==', value: row.id, collection: `${prefix}_home` },
        { func: 'SELECT', source: `${prefix}_home`, type: 'card', property: 'reserveState', relation: '==', value: 'reserved', collection: `${prefix}_reserved` },
        { func: 'SELECT', source: `${prefix}_reserved`, type: 'card', property: 'parent', relation: '==', value: tray, collection: `${prefix}_tray` },
        { func: 'MOVE', collection: `${prefix}_tray`, to: row.id, count: 'all', face: 1 },
        { func: 'SET', collection: `${prefix}_tray`, property: 'reserveState', value: 'draft' },
        { func: 'SET', collection: `${prefix}_tray`, property: 'reservePendingRemoval', value: false },
        { func: 'SET', collection: `${prefix}_tray`, property: 'movable', value: false },
        { func: 'SET', collection: `${prefix}_tray`, property: 'clickable', value: true },
        { func: 'SET', collection: `${prefix}_tray`, property: 'activeFace', value: 1 },
        { func: 'SELECT', source: `${prefix}_tray`, type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: `${prefix}_selected` },
        { func: 'SET', collection: `${prefix}_selected`, property: 'reserveVisualState', value: 'selected' },
        { func: 'SET', collection: `${prefix}_selected`, property: 'css', value: selectedCss(page.libraryType) },
        { func: 'SELECT', source: `${prefix}_tray`, type: 'card', property: 'reserveSelected', relation: '==', value: false, collection: `${prefix}_unselected` },
        { func: 'SET', collection: `${prefix}_unselected`, property: 'reserveVisualState', value: 'unselected' },
        { func: 'SET', collection: `${prefix}_unselected`, property: 'css', value: unselectedCss(page.libraryType) },
      ));
    }
  }
  return steps;
}

function cleanupPendingReturnedCardsSteps(model: ReserveModel): RoutineStep[] {
  const steps: RoutineStep[] = [];
  for (const page of model.pages) {
    for (const row of page.rows) {
      const prefix = `cleanup_${safeCollectionName(row.id)}`;
      const tray = trayId(page.libraryType);
      steps.push(...routineSteps(
        { func: 'SELECT', source: 'all', type: 'card', property: 'reserveHomeHolder', relation: '==', value: row.id, collection: `${prefix}_home` },
        { func: 'SELECT', source: `${prefix}_home`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: true, collection: `${prefix}_pending` },
        { func: 'SELECT', source: `${prefix}_pending`, type: 'card', property: 'parent', relation: '==', value: tray, collection: `${prefix}_returned` },
        { func: 'MOVE', collection: `${prefix}_returned`, to: row.id, count: 'all', face: 1 },
        { func: 'SET', collection: `${prefix}_returned`, property: 'reserveState', value: 'draft' },
        { func: 'SET', collection: `${prefix}_returned`, property: 'reservePendingRemoval', value: false },
        { func: 'SET', collection: `${prefix}_returned`, property: 'reserveVisualState', value: 'unselected' },
        { func: 'SET', collection: `${prefix}_returned`, property: 'movable', value: false },
        { func: 'SET', collection: `${prefix}_returned`, property: 'clickable', value: true },
        { func: 'SET', collection: `${prefix}_returned`, property: 'activeFace', value: 1 },
        { func: 'SET', collection: `${prefix}_returned`, property: 'css', value: unselectedCss(page.libraryType) },
      ));
    }
  }
  return steps;
}

export function createCleanupReturnedPendingCardsRoutine(model: ReserveModel): RoutineStep[] {
  return [
    ...cleanupPendingReturnedCardsSteps(model),
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
  ];
}

export function createRestoreReservedCardsRoutine(model: ReserveModel): RoutineStep[] {
  return [
    ...restoreReservedCardsSteps(model),
    ...routineSteps(
      { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'editing' },
      { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
    ),
  ];
}

/** Backwards-compatible export for older generated files. */
export const createRestoreStagedCardsRoutine = createRestoreReservedCardsRoutine;

function selectDraftCards(libraryType: ReserveLibraryType, collection: string): RoutineStep[] {
  return routineSteps(
    { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: libraryType, collection: `${collection}Base` },
    { func: 'SELECT', source: `${collection}Base`, type: 'card', property: 'reserveState', relation: '==', value: 'draft', collection },
  );
}

export function createResetReserveDraftRoutine(model: ReserveModel): RoutineStep[] {
  const raw = routineSteps(
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'restoreReservedCardsRoutine' },
    { func: 'SET', collection: model.generalCardIds, property: 'reserveSelected', value: true },
    { func: 'SET', collection: model.generalCardIds, property: 'reservePendingRemoval', value: false },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveSelected', value: true },
    { func: 'SET', collection: model.extraCardIds, property: 'reservePendingRemoval', value: false },
    ...selectDraftCards('general', 'resetDraftGenerals'),
    { func: 'SET', collection: 'resetDraftGenerals', property: 'reserveVisualState', value: 'selected' },
    { func: 'SET', collection: 'resetDraftGenerals', property: 'movable', value: false },
    { func: 'SET', collection: 'resetDraftGenerals', property: 'clickable', value: true },
    { func: 'SET', collection: 'resetDraftGenerals', property: 'activeFace', value: 1 },
    { func: 'SET', collection: 'resetDraftGenerals', property: 'css', value: selectedCss('general') },
    ...selectDraftCards('extra', 'resetDraftExtras'),
    { func: 'SET', collection: 'resetDraftExtras', property: 'reserveVisualState', value: 'selected' },
    { func: 'SET', collection: 'resetDraftExtras', property: 'movable', value: false },
    { func: 'SET', collection: 'resetDraftExtras', property: 'clickable', value: true },
    { func: 'SET', collection: 'resetDraftExtras', property: 'activeFace', value: 1 },
    { func: 'SET', collection: 'resetDraftExtras', property: 'css', value: selectedCss('extra') },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'editing' },
    ...switchViewSteps(model, findReserveView(model, 'general:gen-all')),
  );
  return hostOnlyRoutine(raw);
}

function createForceRestoreAllCardsSteps(model: ReserveModel): RoutineStep[] {
  const steps: RoutineStep[] = [];
  for (const page of model.pages) {
    for (const row of page.rows) {
      const collection = `force_restore_${safeCollectionName(row.id)}`;
      steps.push(...routineSteps(
        { func: 'SELECT', source: 'all', type: 'card', property: 'reserveHomeHolder', relation: '==', value: row.id, collection },
        { func: 'MOVE', collection, to: row.id, count: 'all', face: 1 },
        { func: 'SET', collection, property: 'reserveState', value: 'draft' },
        { func: 'SET', collection, property: 'reservePendingRemoval', value: false },
        { func: 'SET', collection, property: 'reserveSelected', value: true },
        { func: 'SET', collection, property: 'reserveVisualState', value: 'selected' },
        { func: 'SET', collection, property: 'movable', value: false },
        { func: 'SET', collection, property: 'clickable', value: true },
        { func: 'SET', collection, property: 'activeFace', value: 1 },
        { func: 'SET', collection, property: 'css', value: selectedCss(page.libraryType) },
      ));
    }
  }
  for (const card of model.cards) {
    steps.push({ func: 'SET', collection: [card.cardWidgetId], property: 'z', value: card.cardOrder + 1 });
  }
  return steps;
}

export function createFullTableReserveResetRoutine(model: ReserveModel): RoutineStep[] {
  return [
    ...createForceRestoreAllCardsSteps(model),
    ...routineSteps(
      { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'editing' },
      { func: 'SET', collection: ['reserve-prep-drawer'], property: 'display', value: false },
      { func: 'SET', collection: model.allPageIds, property: 'display', value: false },
      { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
    ),
  ];
}

function selectLibraryCards(libraryType: ReserveLibraryType, collection: string): RoutineStep[] {
  return routineSteps(
    { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: libraryType, collection },
  );
}

function createApplyInUseSelectionSteps(libraryType: ReserveLibraryType, prefix: string): RoutineStep[] {
  return routineSteps(
    ...selectLibraryCards(libraryType, `${prefix}All`),
    { func: 'SELECT', source: `${prefix}All`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}InUse` },
    { func: 'COUNT', collection: `${prefix}InUse`, variable: `${prefix}InUseCount` },
    { func: 'SELECT', source: `${prefix}InUse`, type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: `${prefix}Keep` },
    { func: 'SET', collection: `${prefix}Keep`, property: 'reservePendingRemoval', value: false },
    { func: 'SELECT', source: `${prefix}InUse`, type: 'card', property: 'reserveSelected', relation: '==', value: false, collection: `${prefix}RemoveLater` },
    { func: 'SET', collection: `${prefix}RemoveLater`, property: 'reservePendingRemoval', value: true },
    { func: 'COUNT', collection: `${prefix}RemoveLater`, variable: `${prefix}PendingCount` },
  );
}

function selectSelectedDraftCards(libraryType: ReserveLibraryType, prefix: string): RoutineStep[] {
  return routineSteps(
    ...selectLibraryCards(libraryType, `${prefix}All`),
    { func: 'SELECT', source: `${prefix}All`, type: 'card', property: 'reserveState', relation: '==', value: 'draft', collection: `${prefix}Draft` },
    { func: 'SELECT', source: `${prefix}Draft`, type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: `${prefix}SelectedDraft` },
    { func: 'COUNT', collection: `${prefix}SelectedDraft`, variable: `${prefix}AddedCount` },
  );
}

export function createImportToReserveTrayRoutine(model: ReserveModel): RoutineStep[] {
  const failureRoutine = routineSteps({
    func: 'INPUT',
    header: '无法确认备牌',
    fields: [{ type: 'text', label: '提示', value: '至少需要允许 1 张武将牌。' }],
    block: false,
  });

  const successRoutine = routineSteps(
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'restoreReservedCardsRoutine' },
    ...selectLibraryCards('extra', 'reserveImportExtraBase'),
    { func: 'SELECT', source: 'reserveImportExtraBase', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveImportExtraSelected' },
    { func: 'COUNT', collection: 'reserveImportExtraSelected', variable: 'reserveImportExtraCount' },
    ...selectSelectedDraftCards('general', 'reserveImportGeneral'),
    ...selectSelectedDraftCards('extra', 'reserveImportExtra'),
    { func: 'SET', collection: 'reserveImportGeneralSelectedDraft', property: 'reservePendingRemoval', value: false },
    { func: 'SET', collection: 'reserveImportGeneralSelectedDraft', property: 'movable', value: true },
    { func: 'SET', collection: 'reserveImportGeneralSelectedDraft', property: 'clickable', value: false },
    { func: 'SET', collection: 'reserveImportGeneralSelectedDraft', property: 'css', value: {} },
    { func: 'MOVE', collection: 'reserveImportGeneralSelectedDraft', to: 'general-reserve', count: 'all', face: 0 },
    { func: 'SET', collection: 'reserveImportGeneralSelectedDraft', property: 'reserveState', value: 'reserved' },
    { func: 'SET', collection: 'reserveImportExtraSelectedDraft', property: 'reservePendingRemoval', value: false },
    { func: 'SET', collection: 'reserveImportExtraSelectedDraft', property: 'movable', value: true },
    { func: 'SET', collection: 'reserveImportExtraSelectedDraft', property: 'clickable', value: false },
    { func: 'SET', collection: 'reserveImportExtraSelectedDraft', property: 'css', value: {} },
    { func: 'MOVE', collection: 'reserveImportExtraSelectedDraft', to: 'extra-reserve', count: 'all', face: 0 },
    { func: 'SET', collection: 'reserveImportExtraSelectedDraft', property: 'reserveState', value: 'reserved' },
    ...createApplyInUseSelectionSteps('general', 'reserveImportGeneral'),
    ...createApplyInUseSelectionSteps('extra', 'reserveImportExtra'),
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'confirmed' },
    ...createCloseReservePanelRoutine(model),
    {
      func: 'INPUT',
      header: '备牌更新成功',
      fields: [{
        type: 'text',
        label: '结果',
        value: '当前配置：武将 ${reserveImportGeneralCount} 张、扩展牌 ${reserveImportExtraCount} 张。\n本次补充到托盘：武将 ${reserveImportGeneralAddedCount} 张、扩展牌 ${reserveImportExtraAddedCount} 张。\n游戏中保持原位：武将 ${reserveImportGeneralInUseCount} 张、扩展牌 ${reserveImportExtraInUseCount} 张；其中待归还后移除 ${reserveImportGeneralPendingCount} / ${reserveImportExtraPendingCount} 张。',
      }],
      block: false,
    },
  );

  const raw = routineSteps(
    ...selectLibraryCards('general', 'reserveImportGeneralBase'),
    { func: 'SELECT', source: 'reserveImportGeneralBase', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveImportGeneralSelected' },
    { func: 'COUNT', collection: 'reserveImportGeneralSelected', variable: 'reserveImportGeneralCount' },
    {
      func: 'IF',
      operand1: '${reserveImportGeneralCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: failureRoutine,
      elseRoutine: successRoutine,
    },
  );
  return hostOnlyRoutine(raw);
}
