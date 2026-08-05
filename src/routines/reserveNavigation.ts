import { findReserveView } from '../data/reserveViewRegistry.js';
import type { ReserveModel, ReserveViewDefinition } from '../types/reserveLibrary.js';
import type { RoutineStep } from '../types/vtt.js';
import { hostOnlyRoutine } from './reserveCardRoutines.js';

export const NAV_BUTTON_CSS = {
  fontSize: '12px',
  color: '#c5e0d4',
  borderRadius: '5px',
  border: '1px solid #3b5b4c',
  background: '#1a2e27',
};

export const NAV_BUTTON_ACTIVE_CSS = {
  fontSize: '12px',
  color: '#fff',
  fontWeight: '700',
  borderRadius: '5px',
  border: '2px solid #75b895',
  background: '#2e5947',
  boxShadow: '0 0 8px #4fb97b88',
};

export const TAB_BUTTON_CSS = {
  fontSize: '13px',
  color: '#a8c9bd',
  borderRadius: '6px',
  border: '1px solid #4d6a5d',
  background: '#1a3030',
};

export const TAB_BUTTON_ACTIVE_CSS = {
  fontSize: '13px',
  color: '#fff',
  fontWeight: '700',
  borderRadius: '6px',
  border: '2px solid #7ccf9b',
  background: '#2b5746',
  boxShadow: '0 0 8px #4fb97b88',
};

export const GENERAL_ACTION_IDS = ['bulk-allow-current-btn', 'bulk-ban-current-btn', 'bulk-invert-general-btn'];
export const EXTRA_ACTION_IDS = ['bulk-select-current-btn', 'bulk-unselect-current-btn', 'bulk-invert-extra-btn'];

export function navButtonId(categoryId: string): string {
  return `nav-${categoryId}`;
}

function navIds(model: ReserveModel, libraryType: 'general' | 'extra'): string[] {
  return model.categories.filter(category => category.libraryType === libraryType).map(category => navButtonId(category.id));
}

export function switchViewSteps(model: ReserveModel, view: ReserveViewDefinition): RoutineStep[] {
  const firstPage = view.pageIds[0];
  if (!firstPage) throw new Error(`Reserve view ${view.key} has no pages`);
  const generalNav = navIds(model, 'general');
  const extraNav = navIds(model, 'extra');
  const selectedNav = navButtonId(view.categoryId);
  const generalTab = view.libraryType === 'general';

  return [
    { func: 'SET', collection: model.allPageIds, property: 'display', value: false },
    { func: 'SET', collection: [firstPage], property: 'display', value: true },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'activeTab', value: view.libraryType },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'activeCategoryId', value: view.categoryId },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'activeViewKey', value: view.key },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'currentPage', value: 1 },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'pageCount', value: view.pageIds.length },
    { func: 'LABEL', label: ['library-view-title'], value: `${view.libraryType === 'general' ? '武将牌' : '扩展牌'}｜${view.label}（${view.count} 张）` },
    { func: 'LABEL', label: ['page-indicator'], value: `1 / ${view.pageIds.length}` },
    { func: 'SET', collection: generalNav, property: 'display', value: generalTab },
    { func: 'SET', collection: extraNav, property: 'display', value: !generalTab },
    { func: 'SET', collection: [...generalNav, ...extraNav], property: 'css', value: NAV_BUTTON_CSS },
    { func: 'SET', collection: [selectedNav], property: 'css', value: NAV_BUTTON_ACTIVE_CSS },
    { func: 'SET', collection: ['main-tab-generals', 'main-tab-extras'], property: 'css', value: TAB_BUTTON_CSS },
    { func: 'SET', collection: [generalTab ? 'main-tab-generals' : 'main-tab-extras'], property: 'css', value: TAB_BUTTON_ACTIVE_CSS },
    { func: 'SET', collection: GENERAL_ACTION_IDS, property: 'display', value: generalTab },
    { func: 'SET', collection: EXTRA_ACTION_IDS, property: 'display', value: !generalTab },
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
  ];
}

export function createSwitchViewRoutine(model: ReserveModel, viewKey: string): RoutineStep[] {
  return hostOnlyRoutine(switchViewSteps(model, findReserveView(model, viewKey)));
}

function pageSwitchSteps(view: ReserveViewDefinition, currentIndex: number, nextIndex: number): RoutineStep[] {
  return [
    { func: 'SET', collection: [view.pageIds[currentIndex]], property: 'display', value: false },
    { func: 'SET', collection: [view.pageIds[nextIndex]], property: 'display', value: true },
    { func: 'SET', collection: ['reserve-panel-controller'], property: 'currentPage', value: nextIndex + 1 },
    { func: 'LABEL', label: ['page-indicator'], value: `${nextIndex + 1} / ${view.pageIds.length}` },
  ];
}

function nestedPageIf(view: ReserveViewDefinition, direction: 'prev' | 'next', index = 0): RoutineStep | null {
  const currentPage = index + 1;
  const nextIndex = direction === 'next' ? index + 1 : index - 1;
  const canMove = nextIndex >= 0 && nextIndex < view.pageIds.length;
  const step: RoutineStep = {
    func: 'IF',
    operand1: '${PROPERTY currentPage OF reserve-panel-controller}',
    relation: '==',
    operand2: currentPage,
    thenRoutine: canMove ? pageSwitchSteps(view, index, nextIndex) : [],
  };
  if (index + 1 < view.pageIds.length) step.elseRoutine = [nestedPageIf(view, direction, index + 1)!];
  return step;
}

function nestedViewIf(views: ReserveViewDefinition[], direction: 'prev' | 'next', index = 0): RoutineStep {
  const view = views[index];
  return {
    func: 'IF',
    operand1: '${PROPERTY activeViewKey OF reserve-panel-controller}',
    relation: '==',
    operand2: view.key,
    thenRoutine: view.pageIds.length > 1 ? [nestedPageIf(view, direction)!] : [],
    ...(index + 1 < views.length ? { elseRoutine: [nestedViewIf(views, direction, index + 1)] } : {}),
  };
}

export function createPageNavigationRoutine(model: ReserveModel, direction: 'prev' | 'next'): RoutineStep[] {
  return hostOnlyRoutine([nestedViewIf(model.views, direction)]);
}

export function createOpenReservePanelRoutine(model: ReserveModel): RoutineStep[] {
  const initialView = findReserveView(model, 'general:gen-all');
  return [
    {
      func: 'IF',
      operand1: '${PROPERTY draftState OF reserve-panel-controller}',
      relation: '==',
      operand2: 'confirmed',
      thenRoutine: [{ func: 'CALL', widget: 'reserve-panel-controller', routine: 'restoreStagedCardsRoutine' }],
    },
    { func: 'SET', collection: ['reserve-prep-drawer'], property: 'display', value: true },
    { func: 'SET', collection: ['toggle-library-table'], property: 'text', value: '🙈 收起备牌' },
    ...switchViewSteps(model, initialView),
  ];
}

export function createCloseReservePanelRoutine(model: ReserveModel): RoutineStep[] {
  return [
    { func: 'SET', collection: model.allPageIds, property: 'display', value: false },
    { func: 'SET', collection: ['reserve-prep-drawer'], property: 'display', value: false },
    { func: 'SET', collection: ['toggle-library-table'], property: 'text', value: '📚 牌库编组' },
  ];
}
