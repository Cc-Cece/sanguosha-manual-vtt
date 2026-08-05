import type { ReserveCategory, ReserveModel } from '../types/reserveLibrary.js';
import type { Widget } from '../types/vtt.js';
import { createCurrentScopeBatchRoutine, hostOnlyRoutine } from '../routines/reserveCardRoutines.js';
import { createImportToReserveTrayRoutine, createResetReserveDraftRoutine } from '../routines/reserveImportRoutines.js';
import {
  createPageNavigationRoutine,
  createSwitchViewRoutine,
  GENERAL_ACTION_IDS,
  NAV_BUTTON_CSS,
  navButtonId,
  TAB_BUTTON_ACTIVE_CSS,
  TAB_BUTTON_CSS,
} from '../routines/reserveNavigation.js';
import { label, widget } from './factory.js';
import { spreadRowZone } from './reserveSpreadRow.js';
import { createReservePanelController } from './reservePanelController.js';

const hostCall = (routine: string) => hostOnlyRoutine([{ func: 'CALL', widget: 'reserve-panel-controller', routine }]);

function categoryButton(category: ReserveCategory, y: number, model: ReserveModel): Widget {
  const viewKey = `${category.libraryType}:${category.id}`;
  return widget(navButtonId(category.id), 'button', {
    parent: 'reserve-prep-drawer',
    x: 18,
    y,
    width: 178,
    height: 32,
    text: `${category.label}（${category.count}）`,
    display: category.libraryType === 'general',
    movable: false,
    layer: 101,
    css: NAV_BUTTON_CSS,
    clickRoutine: createSwitchViewRoutine(model, viewKey),
  });
}

function pageWidgets(model: ReserveModel): Widget[] {
  return model.pages.flatMap(page => [
    widget(page.id, 'basic', {
      parent: 'reserve-prep-drawer',
      x: 210,
      y: 92,
      width: 980,
      height: 560,
      display: false,
      movable: false,
      layer: 101,
      color: '#0000',
      css: { overflow: 'hidden' },
      reserveLibraryType: page.libraryType,
      reserveCategoryId: page.categoryId,
      reserveCategoryPage: page.categoryPage,
      reserveCardSequences: page.cardSequences,
    }),
    ...page.rows.map(row => spreadRowZone(
      row.id,
      row.label,
      0,
      row.rowIndex * 140,
      980,
      page.id,
      {
        display: true,
        layer: 101,
        reserveLibraryType: page.libraryType,
        reserveCategoryId: page.categoryId,
        reserveCardSequences: row.cardSequences,
      },
      56,
    )),
  ]);
}

export function createLibraryTableWidgets(model: ReserveModel): Widget[] {
  const generalCategories = model.categories.filter(category => category.libraryType === 'general');
  const extraCategories = model.categories.filter(category => category.libraryType === 'extra');
  const allGeneralView = model.views.find(view => view.key === 'general:gen-all')!;
  const allExtraView = model.views.find(view => view.key === 'extra:extra-all')!;
  const actionButtonBase = { parent: 'reserve-prep-drawer', y: 1027, width: 150, height: 36, movable: false, layer: 101 } as const;

  return [
    createReservePanelController(model),
    widget('reserve-prep-drawer', 'basic', {
      x: 150, y: 40, width: 1500, height: 1100, display: false, movable: false, layer: 100, color: '#102420',
      css: { background: '#102420', border: '4px double #d2ae64', borderRadius: '14px', boxShadow: '0 10px 40px #000' },
    }),
    widget('library-toolbar', 'basic', {
      parent: 'reserve-prep-drawer', x: 12, y: 8, width: 1476, height: 48, movable: false, layer: 101,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' },
    }),
    label('library-toolbar-title', '📦 全套备牌工作台', 20, 18, 360, 'reserve-prep-drawer', { layer: 101 }),
    widget('main-tab-generals', 'button', {
      parent: 'reserve-prep-drawer', x: 400, y: 14, width: 150, height: 36,
      text: `🎴 武将牌（${allGeneralView.count}）`, movable: false, layer: 101,
      css: TAB_BUTTON_ACTIVE_CSS, clickRoutine: createSwitchViewRoutine(model, allGeneralView.key),
    }),
    widget('main-tab-extras', 'button', {
      parent: 'reserve-prep-drawer', x: 560, y: 14, width: 150, height: 36,
      text: `🗡️ 扩展牌（${allExtraView.count}）`, movable: false, layer: 101,
      css: TAB_BUTTON_CSS, clickRoutine: createSwitchViewRoutine(model, allExtraView.key),
    }),
    widget('import-to-reserve-tray-btn', 'button', {
      parent: 'reserve-prep-drawer', x: 960, y: 14, width: 210, height: 36,
      text: '🚀 确认备牌并导入托盘', movable: false, layer: 101, color: '#2b5746',
      css: { fontSize: '13px', color: '#fff', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #789b83' },
      clickRoutine: createImportToReserveTrayRoutine(model),
    }),
    widget('close-library-tray-btn', 'button', {
      parent: 'reserve-prep-drawer', x: 1320, y: 14, width: 160, height: 36,
      text: '🙈 收起备牌面板', movable: false, layer: 101, color: '#382c1e',
      css: { fontSize: '13px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' },
      clickRoutine: hostCall('closePanelRoutine'),
    }),

    widget('nav-sidebar', 'basic', {
      parent: 'reserve-prep-drawer', x: 12, y: 62, width: 190, height: 950, movable: false, layer: 101,
      color: '#14221de8', css: { border: '1px solid #4b6659', borderRadius: '8px' },
    }),
    label('nav-sidebar-title', '📂 分类导航', 16, 70, 182, 'reserve-prep-drawer', { layer: 101 }),
    ...generalCategories.map((category, index) => categoryButton(category, 100 + index * 38, model)),
    ...extraCategories.map((category, index) => categoryButton(category, 100 + index * 38, model)),

    label('library-view-title', `武将牌｜全部武将（${allGeneralView.count} 张）`, 210, 65, 980, 'reserve-prep-drawer', { layer: 101 }),
    ...pageWidgets(model),

    widget('summary-sidebar', 'basic', {
      parent: 'reserve-prep-drawer', x: 1200, y: 62, width: 288, height: 950, movable: false, layer: 101,
      color: '#1a2420e8', css: { border: '1px solid #5b786a', borderRadius: '8px' },
    }),
    label('summary-sidebar-title', '📊 本局备牌草稿摘要', 1208, 70, 272, 'reserve-prep-drawer', { layer: 101 }),
    widget('summary-generals-box', 'label', {
      parent: 'reserve-prep-drawer', x: 1210, y: 102, width: 268, height: 82,
      text: `武将总数：${model.generalCardIds.length}\n允许入局：${model.generalCardIds.length}\nBan 禁用：0`, movable: false, layer: 101,
      css: { background: '#121c18', color: '#c5e0d4', fontSize: '13px', lineHeight: '24px', textAlign: 'left', border: '1px solid #3b5448', borderRadius: '6px', padding: '6px' },
    }),
    widget('summary-extras-box', 'label', {
      parent: 'reserve-prep-drawer', x: 1210, y: 195, width: 268, height: 82,
      text: `扩展牌总数：${model.extraCardIds.length}\n已选择：${model.extraCardIds.length}\n未选择：0`, movable: false, layer: 101,
      css: { background: '#121c18', color: '#c5e0d4', fontSize: '13px', lineHeight: '24px', textAlign: 'left', border: '1px solid #3b5448', borderRadius: '6px', padding: '6px' },
    }),
    widget('summary-current-box', 'label', {
      parent: 'reserve-prep-drawer', x: 1210, y: 288, width: 268, height: 104,
      text: `当前分类：全部武将\n总数：${model.generalCardIds.length}\n允许：${model.generalCardIds.length}　Ban：0`, movable: false, layer: 101,
      css: { background: '#121c18', color: '#f3dfb3', fontSize: '13px', lineHeight: '25px', textAlign: 'left', border: '1px solid #806a3f', borderRadius: '6px', padding: '6px' },
    }),
    widget('summary-help-box', 'label', {
      parent: 'reserve-prep-drawer', x: 1210, y: 410, width: 268, height: 130,
      text: '操作说明\n• 单击牌面切换允许/禁用\n• 批量按钮只作用于当前分类\n• 确认后仅导入已选牌\n• 再次打开可召回继续编辑', movable: false, layer: 101,
      css: { background: '#101916', color: '#9eb8ad', fontSize: '12px', lineHeight: '22px', textAlign: 'left', border: '1px solid #354a40', borderRadius: '6px', padding: '6px' },
    }),
    widget('reset-draft-btn', 'button', {
      parent: 'reserve-prep-drawer', x: 1210, y: 560, width: 268, height: 36, text: '🔄 恢复全部默认选择',
      movable: false, layer: 101, color: '#382c1e',
      css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' },
      clickRoutine: createResetReserveDraftRoutine(model),
    }),

    widget('action-bar', 'basic', {
      parent: 'reserve-prep-drawer', x: 210, y: 1020, width: 1278, height: 50, movable: false, layer: 101,
      color: '#172722e8', css: { border: '1px solid #4a685b', borderRadius: '8px' },
    }),
    widget(GENERAL_ACTION_IDS[0], 'button', {
      ...actionButtonBase, x: 220, text: '⚡ 当前分类全部允许', color: '#2b5746',
      css: { fontSize: '12px', color: '#fff', borderRadius: '6px' },
      clickRoutine: createCurrentScopeBatchRoutine(model, 'general', 'select'),
    }),
    widget(GENERAL_ACTION_IDS[1], 'button', {
      ...actionButtonBase, x: 380, text: '🚫 当前分类全部 Ban', color: '#74322b',
      css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px' },
      clickRoutine: createCurrentScopeBatchRoutine(model, 'general', 'unselect'),
    }),
    widget(GENERAL_ACTION_IDS[2], 'button', {
      ...actionButtonBase, x: 540, text: '🔁 当前分类反选', color: '#254448',
      css: { fontSize: '12px', color: '#d8eff5', borderRadius: '6px' },
      clickRoutine: createCurrentScopeBatchRoutine(model, 'general', 'invert'),
    }),
    widget('bulk-select-current-btn', 'button', {
      ...actionButtonBase, x: 220, text: '☑️ 当前分类全选', display: false, color: '#2b5746',
      css: { fontSize: '12px', color: '#fff', borderRadius: '6px' },
      clickRoutine: createCurrentScopeBatchRoutine(model, 'extra', 'select'),
    }),
    widget('bulk-unselect-current-btn', 'button', {
      ...actionButtonBase, x: 380, text: '☐ 当前分类全取消', display: false, color: '#382c1e',
      css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px' },
      clickRoutine: createCurrentScopeBatchRoutine(model, 'extra', 'unselect'),
    }),
    widget('bulk-invert-extra-btn', 'button', {
      ...actionButtonBase, x: 540, text: '🔁 当前分类反选', display: false, color: '#254448',
      css: { fontSize: '12px', color: '#d8eff5', borderRadius: '6px' },
      clickRoutine: createCurrentScopeBatchRoutine(model, 'extra', 'invert'),
    }),
    widget('prev-page-btn', 'button', {
      parent: 'reserve-prep-drawer', x: 1195, y: 1027, width: 90, height: 36, text: '◄ 上一页', movable: false, layer: 101,
      color: '#243b32', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' },
      clickRoutine: createPageNavigationRoutine(model, 'prev'),
    }),
    label('page-indicator', `1 / ${allGeneralView.pageIds.length}`, 1290, 1033, 90, 'reserve-prep-drawer', { layer: 101 }),
    widget('next-page-btn', 'button', {
      parent: 'reserve-prep-drawer', x: 1385, y: 1027, width: 90, height: 36, text: '下一页 ►', movable: false, layer: 101,
      color: '#243b32', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' },
      clickRoutine: createPageNavigationRoutine(model, 'next'),
    }),
  ];
}
