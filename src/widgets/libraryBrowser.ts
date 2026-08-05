import {
  allowAllGeneralsRoutine,
  banAllGeneralsRoutine,
  nextPageRoutine,
  prevPageRoutine,
  resetReserveDraftRoutine,
  selectAllExtrasRoutine,
  selectExtrasTabRoutine,
  selectGeneralsTabRoutine,
  switchGenAllRoutine,
  switchGenExpRoutine,
  switchGenStdRoutine,
  unselectAllExtrasRoutine,
} from '../routines/reserveRoutines.js';
import { importToReserveTrayRoutine, reEditReserveRoutine } from '../routines/deckAssembly.js';
import { buildReserveViewRegistry } from '../data/reserveViewModel.js';
import type { Widget } from '../types/vtt.js';
import { label, widget } from './factory.js';

const viewRegistry = buildReserveViewRegistry();

function spreadRowZone(
  id: string,
  labelText: string,
  relX: number,
  relY: number,
  width: number,
  parent: string,
  extraProps: Record<string, unknown> = {},
  stackOffsetX = 56,
): Widget[] {
  return [
    label(`${id}-title`, labelText, relX + 4, relY + 4, width - 8, parent, { display: true, layer: (extraProps.layer as number) || 101 }),
    widget(id, 'holder', {
      parent,
      x: relX,
      y: relY + 24,
      width,
      height: 110,
      alignChildren: true,
      preventPiles: true,
      stackOffsetX,
      stackOffsetY: 0,
      color: '#182b26c0',
      css: { border: '1px dashed #7a9c8e', borderRadius: '6px' },
      ...extraProps,
    }),
  ];
}

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';

  return [
    // 1. 全局背景与边框
    widget('reserve-prep-drawer', 'basic', {
      x: 150,
      y: 50,
      width: 1500,
      height: 1100,
      display: false,
      movable: false,
      layer: 100,
      color: '#102420',
      css: { border: '4px double #b68c50', borderRadius: '12px', boxShadow: '0 8px 30px #000f' },
    }),

    // 2. 顶部综合工具栏 (Library Toolbar)
    widget('library-toolbar', 'basic', {
      parent,
      x: 18,
      y: 12,
      width: 1464,
      height: 44,
      display: false,
      movable: false,
      layer: 101,
      color: '#1b3831',
      css: { borderBottom: '2px solid #3c6e60' },
    }),
    label('library-toolbar-title', '📚 全套备牌编组面板', 28, 22, 280, parent, { display: false, layer: 101 }),

    // 主分类 Tab
    widget('main-tab-generals', 'button', {
      parent,
      x: 310,
      y: 18,
      width: 130,
      height: 32,
      text: '🎴 武将牌库 (315)',
      display: false,
      layer: 101,
      color: '#2a5246',
      css: { fontSize: '13px', color: '#ffe0a0', fontWeight: '700', borderRadius: '6px 6px 0 0' },
      clickRoutine: selectGeneralsTabRoutine,
    }),
    widget('main-tab-extras', 'button', {
      parent,
      x: 448,
      y: 18,
      width: 140,
      height: 32,
      text: '🗡️ 军争扩展牌 (31)',
      display: false,
      layer: 101,
      color: '#1c363b',
      css: { fontSize: '13px', color: '#a0e0ff', fontWeight: '700', borderRadius: '6px 6px 0 0' },
      clickRoutine: selectExtrasTabRoutine,
    }),

    widget('import-to-reserve-tray-btn', 'button', {
      parent,
      x: 1220,
      y: 18,
      width: 140,
      height: 32,
      text: '📥 确认导入备牌托盘',
      display: false,
      layer: 101,
      color: '#285e49',
      css: { fontSize: '12px', color: '#ffffff', borderRadius: '6px', border: '1px solid #62b393' },
      clickRoutine: importToReserveTrayRoutine,
    }),
    widget('close-library-tray-btn', 'button', {
      parent,
      x: 1368,
      y: 18,
      width: 100,
      height: 32,
      text: '✖ 关闭抽屉',
      display: false,
      layer: 101,
      color: '#632520',
      css: { fontSize: '12px', color: '#ffcfcf', borderRadius: '6px', border: '1px solid #a64740' },
      clickRoutine: [{ func: 'SET', collection: ['reserve-prep-drawer'], property: 'display', value: false }],
    }),

    // 3. 左侧二级分类导航侧栏 (Left Category Navigation Sidebar)
    widget('nav-sidebar', 'basic', {
      parent,
      x: 18,
      y: 62,
      width: 184,
      height: 950,
      display: false,
      movable: false,
      layer: 101,
      color: '#142923',
      css: { borderRight: '1px solid #2d4f45' },
    }),
    label('nav-sidebar-title', '📂 卡牌扩展分类', 26, 75, 160, parent, { display: false, layer: 101 }),

    // 二级分类按钮
    widget('nav-gen-all', 'button', { parent, x: 18, y: 100, width: 178, height: 32, text: '全部武将 (315)', display: false, layer: 101,
      color: '#26483d', css: { fontSize: '12px', color: '#fff', borderRadius: '5px' }, clickRoutine: switchGenAllRoutine }),
    widget('nav-gen-std', 'button', { parent, x: 18, y: 138, width: 178, height: 32, text: '标准包 (25)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenStdRoutine }),
    widget('nav-gen-feng', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 176, width: 178, height: 32, text: '风包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-huo', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 214, width: 178, height: 32, text: '火包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-lin', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 252, width: 178, height: 32, text: '林包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-shan', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 290, width: 178, height: 32, text: '山包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-yijiang', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 328, width: 178, height: 32, text: '一将成名 (11)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-sp', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 366, width: 178, height: 32, text: 'SP武将 (15)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-other', 'button', { parent: 'reserve-prep-drawer', x: 18, y: 404, width: 178, height: 32, text: '其他扩展 (232)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),

    // 4. 中间共享主视口与页面 Holder (ViewRegistry Driven Pages)
    label('general-library-title', '🎴 武将牌库 (315张 ｜ 点击卡牌切换 [允许 / Ban])', 210, 65, 980, parent, { display: false, layer: 101 }),

    ...viewRegistry.pages.flatMap(page => [
      widget(page.id, 'basic', { parent, x: 210, y: 92, width: 980, height: 560, display: false, movable: false, layer: 101, color: '#0000' }),
      ...page.rows.flatMap(row => spreadRowZone(row.id, row.label, 0, (row.rowNumber - 1) * 140, 980, page.id, { display: true, layer: 101 }, 56)),
    ]),

    label('extra-composer-title', '🗡️ 军争与附加扩展牌 (31张 ｜ 点击卡牌切换 [选中 / 未选])', 210, 65, 980, parent, { display: false, layer: 101 }),

    // 5. 右侧实时摘要侧栏 (Right Summary Sidebar)
    widget('summary-sidebar', 'basic', { parent, x: 1200, y: 62, width: 288, height: 950, display: false, movable: false, layer: 101,
      color: '#142923', css: { borderLeft: '1px solid #2d4f45' } }),
    label('summary-sidebar-title', '📊 备牌配置实时摘要', 1215, 75, 260, parent, { display: false, layer: 101 }),

    widget('summary-generals-box', 'basic', { parent, x: 1212, y: 100, width: 264, height: 90, display: false, movable: false, layer: 101,
      color: '#1b362e', css: { border: '1px solid #3d6e5e', borderRadius: '6px' } }),
    label('summary-generals-title', '🎴 武将允许情况 (默认全允许)', 1222, 108, 240, parent, { display: false, layer: 101 }),
    widget('summary-generals-count', 'label', { parent, x: 1222, y: 135, width: 240, height: 40, text: '315 / 315', display: false, movable: false, layer: 101,
      css: { fontSize: '20px', color: '#50e080', fontWeight: '700', textAlign: 'center' } }),

    widget('summary-extras-box', 'basic', { parent, x: 1212, y: 205, width: 264, height: 90, display: false, movable: false, layer: 101,
      color: '#1b362e', css: { border: '1px solid #3d6e5e', borderRadius: '6px' } }),
    label('summary-extras-title', '🗡️ 附加牌选择情况 (默认全取消)', 1222, 213, 240, parent, { display: false, layer: 101 }),
    widget('summary-extras-count', 'label', { parent, x: 1222, y: 240, width: 240, height: 40, text: '0 / 31', display: false, movable: false, layer: 101,
      css: { fontSize: '20px', color: '#ffb050', fontWeight: '700', textAlign: 'center' } }),

    widget('re-edit-reserve-btn', 'button', { parent, x: 1212, y: 310, width: 264, height: 36, text: '↺ 重新编辑备牌 (撤销确认)', display: false, layer: 101,
      color: '#2b443c', css: { fontSize: '12px', color: '#80ffff', borderRadius: '6px', border: '1px solid #588f80' }, clickRoutine: reEditReserveRoutine }),

    widget('reset-draft-btn', 'button', { parent, x: 1212, y: 356, width: 264, height: 36, text: '↺ 恢复默认配置', display: false, layer: 101,
      color: '#3d2522', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #7d443e' }, clickRoutine: resetReserveDraftRoutine }),

    // 6. 底部分页与批量控制条 (Bottom Pagination & Action Bar)
    widget('action-bar', 'basic', { parent, x: 210, y: 660, width: 980, height: 50, display: false, movable: false, layer: 101,
      color: '#183029', css: { borderRadius: '6px', border: '1px solid #325e51' } }),

    widget('bulk-allow-all-btn', 'button', { parent, x: 220, y: 669, width: 120, height: 32, text: '全允许当前包', display: false, layer: 101,
      color: '#265443', css: { fontSize: '12px', color: '#a0ffa0', borderRadius: '5px' }, clickRoutine: allowAllGeneralsRoutine }),
    widget('bulk-ban-all-btn', 'button', { parent, x: 348, y: 669, width: 120, height: 32, text: '全Ban当前包', display: false, layer: 101,
      color: '#542626', css: { fontSize: '12px', color: '#ffa0a0', borderRadius: '5px' }, clickRoutine: banAllGeneralsRoutine }),

    widget('bulk-select-extras-btn', 'button', { parent, x: 220, y: 669, width: 120, height: 32, text: '全选当前包', display: false, layer: 101,
      color: '#265443', css: { fontSize: '12px', color: '#a0ffa0', borderRadius: '5px' }, clickRoutine: selectAllExtrasRoutine }),
    widget('bulk-unselect-extras-btn', 'button', { parent, x: 348, y: 669, width: 120, height: 32, text: '全取消当前包', display: false, layer: 101,
      color: '#542626', css: { fontSize: '12px', color: '#ffa0a0', borderRadius: '5px' }, clickRoutine: unselectAllExtrasRoutine }),

    widget('prev-page-btn', 'button', { parent, x: 860, y: 669, width: 75, height: 32, text: '◀ 上一页', display: false, layer: 101,
      color: '#203a32', css: { fontSize: '12px', color: '#d0f0e0', borderRadius: '5px' }, clickRoutine: prevPageRoutine }),
    widget('page-indicator', 'label', { parent, x: 942, y: 676, width: 70, height: 20, text: '1 / 11', display: false, layer: 101,
      css: { fontSize: '13px', color: '#ffe0a0', textAlign: 'center', fontWeight: '700' } }),
    widget('next-page-btn', 'button', { parent, x: 1018, y: 669, width: 75, height: 32, text: '下一页 ▶', display: false, layer: 101,
      color: '#203a32', css: { fontSize: '12px', color: '#d0f0e0', borderRadius: '5px' }, clickRoutine: nextPageRoutine }),
  ];
}
