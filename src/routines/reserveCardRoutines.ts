import type { ReserveLibraryType, ReserveModel } from '../types/reserveLibrary.js';
import type { RoutineStep } from '../types/vtt.js';

export const GENERAL_SELECTED_CSS = {
  filter: 'none',
  opacity: '1',
  outline: '3px solid #7ccf9b',
  outlineOffset: '-3px',
  boxShadow: '0 0 10px #4fb97b99',
};

export const GENERAL_UNSELECTED_CSS = {
  filter: 'grayscale(1) brightness(.55)',
  opacity: '.82',
  outline: '3px solid #b64b43',
  outlineOffset: '-3px',
  boxShadow: '0 0 10px #8d292999',
};

export const EXTRA_SELECTED_CSS = {
  filter: 'none',
  opacity: '1',
  outline: '3px solid #62bddd',
  outlineOffset: '-3px',
  boxShadow: '0 0 10px #469ab899',
};

export const EXTRA_UNSELECTED_CSS = {
  filter: 'grayscale(.85) brightness(.6)',
  opacity: '.8',
  outline: '3px solid #777',
  outlineOffset: '-3px',
  boxShadow: 'none',
};

export function selectedCss(libraryType: ReserveLibraryType): Record<string, string> {
  return libraryType === 'general' ? GENERAL_SELECTED_CSS : EXTRA_SELECTED_CSS;
}

export function unselectedCss(libraryType: ReserveLibraryType): Record<string, string> {
  return libraryType === 'general' ? GENERAL_UNSELECTED_CSS : EXTRA_UNSELECTED_CSS;
}

export function hostOnlyRoutine(thenRoutine: RoutineStep[], readOnlyMessage = true): RoutineStep[] {
  return [{
    func: 'IF',
    operand1: '${PROPERTY player OF seat-1}',
    relation: '==',
    operand2: '${playerName}',
    thenRoutine,
    ...(readOnlyMessage ? {
      elseRoutine: [{
        func: 'INPUT',
        header: '备牌面板为只读',
        fields: [{ type: 'text', label: '提示', value: '只有玩家 1（房主）可以修改备牌草稿。' }],
        block: false,
      }],
    } : {}),
  }];
}

export function createToggleReserveCardRoutine(libraryType: ReserveLibraryType): RoutineStep[] {
  const toggle: RoutineStep[] = [{
    func: 'IF',
    operand1: '${PROPERTY reserveSelected}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: false },
      { func: 'SET', collection: 'thisButton', property: 'reserveVisualState', value: 'unselected' },
      { func: 'SET', collection: 'thisButton', property: 'css', value: unselectedCss(libraryType) },
    ],
    elseRoutine: [
      { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: true },
      { func: 'SET', collection: 'thisButton', property: 'reserveVisualState', value: 'selected' },
      { func: 'SET', collection: 'thisButton', property: 'css', value: selectedCss(libraryType) },
    ],
  }, {
    func: 'CALL',
    widget: 'reserve-panel-controller',
    routine: 'updateSummaryRoutine',
  }];
  return hostOnlyRoutine(toggle);
}

function categorySummaryBranch(
  libraryType: ReserveLibraryType,
  categoryId: string,
  label: string,
  allCategory: boolean,
): RoutineStep[] {
  const prefix = libraryType === 'general' ? 'currentGeneral' : 'currentExtra';
  const baseCollection = libraryType === 'general' ? 'reserveGeneralCards' : 'reserveExtraCards';
  const selectedCollection = `${prefix}Selected`;
  const unselectedCollection = `${prefix}Unselected`;
  const scopeCollection = `${prefix}Scope`;
  const selectedWord = libraryType === 'general' ? '允许' : '已选';
  const unselectedWord = libraryType === 'general' ? 'Ban' : '未选';

  const steps: RoutineStep[] = [];
  if (allCategory) {
    steps.push({ func: 'SELECT', source: baseCollection, type: 'card', collection: scopeCollection });
  } else {
    steps.push({
      func: 'SELECT', source: baseCollection, type: 'card', property: 'reserveCategoryId', relation: '==', value: categoryId, collection: scopeCollection,
    });
  }
  steps.push(
    { func: 'COUNT', collection: scopeCollection, variable: `${prefix}Total` },
    { func: 'SELECT', source: scopeCollection, type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: selectedCollection },
    { func: 'COUNT', collection: selectedCollection, variable: `${prefix}SelectedCount` },
    { func: 'SELECT', source: scopeCollection, type: 'card', property: 'reserveSelected', relation: '==', value: false, collection: unselectedCollection },
    { func: 'COUNT', collection: unselectedCollection, variable: `${prefix}UnselectedCount` },
    {
      func: 'LABEL',
      label: ['summary-current-box'],
      value: `当前分类：${label}\n总数：\${${prefix}Total}\n${selectedWord}：\${${prefix}SelectedCount}　${unselectedWord}：\${${prefix}UnselectedCount}`,
    },
  );
  return steps;
}

function nestedCategoryIf(
  categories: { id: string; label: string; libraryType: ReserveLibraryType }[],
  libraryType: ReserveLibraryType,
  index = 0,
): RoutineStep {
  const category = categories[index];
  const isAll = category.id === 'gen-all' || category.id === 'extra-all';
  return {
    func: 'IF',
    operand1: '${PROPERTY activeCategoryId OF reserve-panel-controller}',
    relation: '==',
    operand2: category.id,
    thenRoutine: categorySummaryBranch(libraryType, category.id, category.label, isAll),
    ...(index + 1 < categories.length ? { elseRoutine: [nestedCategoryIf(categories, libraryType, index + 1)] } : {}),
  };
}

export function createUpdateReserveSummaryRoutine(model: ReserveModel): RoutineStep[] {
  const generalCategories = model.categories.filter(category => category.libraryType === 'general');
  const extraCategories = model.categories.filter(category => category.libraryType === 'extra');
  return [
    { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'general', collection: 'reserveGeneralCards' },
    { func: 'COUNT', collection: 'reserveGeneralCards', variable: 'reserveGeneralTotal' },
    { func: 'SELECT', source: 'reserveGeneralCards', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveGeneralSelected' },
    { func: 'COUNT', collection: 'reserveGeneralSelected', variable: 'reserveGeneralSelectedCount' },
    { func: 'SELECT', source: 'reserveGeneralCards', type: 'card', property: 'reserveSelected', relation: '==', value: false, collection: 'reserveGeneralUnselected' },
    { func: 'COUNT', collection: 'reserveGeneralUnselected', variable: 'reserveGeneralUnselectedCount' },
    { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'extra', collection: 'reserveExtraCards' },
    { func: 'COUNT', collection: 'reserveExtraCards', variable: 'reserveExtraTotal' },
    { func: 'SELECT', source: 'reserveExtraCards', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveExtraSelected' },
    { func: 'COUNT', collection: 'reserveExtraSelected', variable: 'reserveExtraSelectedCount' },
    { func: 'SELECT', source: 'reserveExtraCards', type: 'card', property: 'reserveSelected', relation: '==', value: false, collection: 'reserveExtraUnselected' },
    { func: 'COUNT', collection: 'reserveExtraUnselected', variable: 'reserveExtraUnselectedCount' },
    {
      func: 'LABEL', label: ['summary-generals-box'],
      value: '武将总数：${reserveGeneralTotal}\n允许入局：${reserveGeneralSelectedCount}\nBan 禁用：${reserveGeneralUnselectedCount}',
    },
    {
      func: 'LABEL', label: ['summary-extras-box'],
      value: '扩展牌总数：${reserveExtraTotal}\n已选择：${reserveExtraSelectedCount}\n未选择：${reserveExtraUnselectedCount}',
    },
    {
      func: 'IF',
      operand1: '${PROPERTY activeTab OF reserve-panel-controller}',
      relation: '==',
      operand2: 'general',
      thenRoutine: [nestedCategoryIf(generalCategories, 'general')],
      elseRoutine: [nestedCategoryIf(extraCategories, 'extra')],
    },
  ];
}

function scopeSteps(libraryType: ReserveLibraryType, categoryId: string, scopeName: string): RoutineStep[] {
  const allId = libraryType === 'general' ? 'gen-all' : 'extra-all';
  const baseName = `${scopeName}Base`;
  const steps: RoutineStep[] = [{
    func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: libraryType, collection: baseName,
  }];
  if (categoryId === allId) {
    steps.push({ func: 'SELECT', source: baseName, type: 'card', collection: scopeName });
  } else {
    steps.push({ func: 'SELECT', source: baseName, type: 'card', property: 'reserveCategoryId', relation: '==', value: categoryId, collection: scopeName });
  }
  return steps;
}

type BatchMode = 'select' | 'unselect' | 'invert';

function batchBranch(libraryType: ReserveLibraryType, categoryId: string, mode: BatchMode): RoutineStep[] {
  const scopeName = 'reserveCurrentScope';
  const steps = scopeSteps(libraryType, categoryId, scopeName);
  if (mode === 'invert') {
    steps.push(
      { func: 'SELECT', source: scopeName, type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'reserveCurrentSelected' },
      { func: 'SELECT', source: scopeName, type: 'card', property: 'reserveSelected', relation: '==', value: false, collection: 'reserveCurrentUnselected' },
      { func: 'SET', collection: 'reserveCurrentSelected', property: 'reserveSelected', value: false },
      { func: 'SET', collection: 'reserveCurrentSelected', property: 'reserveVisualState', value: 'unselected' },
      { func: 'SET', collection: 'reserveCurrentSelected', property: 'css', value: unselectedCss(libraryType) },
      { func: 'SET', collection: 'reserveCurrentUnselected', property: 'reserveSelected', value: true },
      { func: 'SET', collection: 'reserveCurrentUnselected', property: 'reserveVisualState', value: 'selected' },
      { func: 'SET', collection: 'reserveCurrentUnselected', property: 'css', value: selectedCss(libraryType) },
    );
  } else {
    const value = mode === 'select';
    steps.push(
      { func: 'SET', collection: scopeName, property: 'reserveSelected', value },
      { func: 'SET', collection: scopeName, property: 'reserveVisualState', value: value ? 'selected' : 'unselected' },
      { func: 'SET', collection: scopeName, property: 'css', value: value ? selectedCss(libraryType) : unselectedCss(libraryType) },
    );
  }
  steps.push({ func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' });
  return steps;
}

function nestedBatchIf(
  categories: { id: string; libraryType: ReserveLibraryType }[],
  libraryType: ReserveLibraryType,
  mode: BatchMode,
  index = 0,
): RoutineStep {
  const category = categories[index];
  return {
    func: 'IF',
    operand1: '${PROPERTY activeCategoryId OF reserve-panel-controller}',
    relation: '==',
    operand2: category.id,
    thenRoutine: batchBranch(libraryType, category.id, mode),
    ...(index + 1 < categories.length ? { elseRoutine: [nestedBatchIf(categories, libraryType, mode, index + 1)] } : {}),
  };
}

export function createCurrentScopeBatchRoutine(
  model: ReserveModel,
  libraryType: ReserveLibraryType,
  mode: BatchMode,
): RoutineStep[] {
  const categories = model.categories.filter(category => category.libraryType === libraryType);
  return hostOnlyRoutine([nestedBatchIf(categories, libraryType, mode)]);
}
