import type { ReserveModel } from '../types/reserveLibrary.js';
import type { RoutineStep } from '../types/vtt.js';
import { selectedCss, hostOnlyRoutine } from './reserveCardRoutines.js';
import { createCloseReservePanelRoutine, switchViewSteps } from './reserveNavigation.js';
import { findReserveView } from '../data/reserveViewRegistry.js';

function safeCollectionName(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}

export function createRestoreStagedCardsRoutine(model: ReserveModel): RoutineStep[] {
  const steps: RoutineStep[] = [];
  for (const page of model.pages) {
    for (const row of page.rows) {
      const prefix = `restore_${safeCollectionName(row.id)}`;
      steps.push(
        { func: 'SELECT', source: 'all', type: 'card', property: 'reserveHomeHolder', relation: '==', value: row.id, collection: `${prefix}_home` },
        { func: 'SELECT', source: `${prefix}_home`, type: 'card', property: 'reserveState', relation: '==', value: 'staged', collection: `${prefix}_staged` },
        { func: 'MOVE', from: `${prefix}_staged`, to: row.id, count: 'all', face: 1 },
        { func: 'SET', collection: `${prefix}_staged`, property: 'reserveState', value: 'draft' },
        { func: 'SET', collection: `${prefix}_staged`, property: 'movable', value: false },
        { func: 'SET', collection: `${prefix}_staged`, property: 'clickable', value: true },
        { func: 'SET', collection: `${prefix}_staged`, property: 'css', value: selectedCss(page.libraryType) },
      );
    }
  }
  for (const card of model.cards) {
    steps.push({ func: 'SET', collection: [card.cardWidgetId], property: 'z', value: card.cardOrder + 1 });
  }
  steps.push(
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'editing' },
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
  );
  return steps;
}

export function createResetReserveDraftRoutine(model: ReserveModel): RoutineStep[] {
  const raw: RoutineStep[] = [
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'restoreStagedCardsRoutine' },
    { func: 'SET', collection: model.generalCardIds, property: 'reserveSelected', value: true },
    { func: 'SET', collection: model.generalCardIds, property: 'reserveVisualState', value: 'selected' },
    { func: 'SET', collection: model.generalCardIds, property: 'reserveState', value: 'draft' },
    { func: 'SET', collection: model.generalCardIds, property: 'movable', value: false },
    { func: 'SET', collection: model.generalCardIds, property: 'clickable', value: true },
    { func: 'SET', collection: model.generalCardIds, property: 'activeFace', value: 1 },
    { func: 'SET', collection: model.generalCardIds, property: 'css', value: selectedCss('general') },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveSelected', value: true },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveVisualState', value: 'selected' },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveState', value: 'draft' },
    { func: 'SET', collection: model.extraCardIds, property: 'movable', value: false },
    { func: 'SET', collection: model.extraCardIds, property: 'clickable', value: true },
    { func: 'SET', collection: model.extraCardIds, property: 'activeFace', value: 1 },
    { func: 'SET', collection: model.extraCardIds, property: 'css', value: selectedCss('extra') },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'editing' },
    ...switchViewSteps(model, findReserveView(model, 'general:gen-all')),
  ];
  return hostOnlyRoutine(raw);
}

function createForceRestoreAllCardsSteps(model: ReserveModel): RoutineStep[] {
  const steps: RoutineStep[] = [];
  for (const page of model.pages) {
    for (const row of page.rows) {
      const collection = `force_restore_${safeCollectionName(row.id)}`;
      steps.push(
        { func: 'SELECT', source: 'all', type: 'card', property: 'reserveHomeHolder', relation: '==', value: row.id, collection },
        { func: 'MOVE', from: collection, to: row.id, count: 'all', face: 1 },
        { func: 'SET', collection, property: 'reserveState', value: 'draft' },
        { func: 'SET', collection, property: 'movable', value: false },
        { func: 'SET', collection, property: 'clickable', value: true },
        { func: 'SET', collection, property: 'css', value: selectedCss(page.libraryType) },
      );
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
    { func: 'SET', collection: model.generalCardIds, property: 'reserveSelected', value: true },
    { func: 'SET', collection: model.generalCardIds, property: 'reserveVisualState', value: 'selected' },
    { func: 'SET', collection: model.generalCardIds, property: 'reserveState', value: 'draft' },
    { func: 'SET', collection: model.generalCardIds, property: 'movable', value: false },
    { func: 'SET', collection: model.generalCardIds, property: 'clickable', value: true },
    { func: 'SET', collection: model.generalCardIds, property: 'activeFace', value: 1 },
    { func: 'SET', collection: model.generalCardIds, property: 'css', value: selectedCss('general') },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveSelected', value: true },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveVisualState', value: 'selected' },
    { func: 'SET', collection: model.extraCardIds, property: 'reserveState', value: 'draft' },
    { func: 'SET', collection: model.extraCardIds, property: 'movable', value: false },
    { func: 'SET', collection: model.extraCardIds, property: 'clickable', value: true },
    { func: 'SET', collection: model.extraCardIds, property: 'activeFace', value: 1 },
    { func: 'SET', collection: model.extraCardIds, property: 'css', value: selectedCss('extra') },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'editing' },
    { func: 'SET', collection: ['reserve-prep-drawer'], property: 'display', value: false },
    { func: 'SET', collection: model.allPageIds, property: 'display', value: false },
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
  ];
}

export function createImportToReserveTrayRoutine(model: ReserveModel): RoutineStep[] {
  const raw: RoutineStep[] = [
    { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'general', collection: 'reserveImportGeneralBase' },
    { func: 'SELECT', source: 'reserveImportGeneralBase', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveImportGenerals' },
    { func: 'COUNT', collection: 'reserveImportGenerals', variable: 'reserveImportGeneralCount' },
    {
      func: 'IF',
      operand1: '${reserveImportGeneralCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: [{
        func: 'INPUT', header: '无法确认备牌', fields: [{ type: 'text', label: '提示', value: '至少需要允许 1 张武将牌。' }], block: false,
      }],
      elseRoutine: [
        { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'extra', collection: 'reserveImportExtraBase' },
        { func: 'SELECT', source: 'reserveImportExtraBase', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveImportExtras' },
        { func: 'COUNT', collection: 'reserveImportExtras', variable: 'reserveImportExtraCount' },
        { func: 'SET', collection: 'reserveImportGenerals', property: 'reserveState', value: 'staged' },
        { func: 'SET', collection: 'reserveImportGenerals', property: 'movable', value: true },
        { func: 'SET', collection: 'reserveImportGenerals', property: 'clickable', value: false },
        { func: 'SET', collection: 'reserveImportGenerals', property: 'css', value: {} },
        { func: 'MOVE', from: 'reserveImportGenerals', to: 'general-reserve', count: 'all', face: 0 },
        { func: 'SET', collection: 'reserveImportExtras', property: 'reserveState', value: 'staged' },
        { func: 'SET', collection: 'reserveImportExtras', property: 'movable', value: true },
        { func: 'SET', collection: 'reserveImportExtras', property: 'clickable', value: false },
        { func: 'SET', collection: 'reserveImportExtras', property: 'css', value: {} },
        { func: 'MOVE', from: 'reserveImportExtras', to: 'extra-reserve', count: 'all', face: 0 },
        { func: 'SET', collection: ['reserve-panel-controller'], property: 'draftState', value: 'confirmed' },
        ...createCloseReservePanelRoutine(model),
        {
          func: 'INPUT', header: '备牌导入成功',
          fields: [{ type: 'text', label: '结果', value: '已导入武将 ${reserveImportGeneralCount} 张、扩展牌 ${reserveImportExtraCount} 张。重新打开备牌面板可召回并继续编辑。' }],
          block: false,
        },
      ],
    },
  ];
  return hostOnlyRoutine(raw);
}
