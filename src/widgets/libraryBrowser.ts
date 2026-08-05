import type { Widget } from '../types/vtt.js';
import { importToReserveTrayRoutine } from '../routines/deckAssembly.js';
import { allowAllGeneralsRoutine, banAllGeneralsRoutine, nextPageRoutine, prevPageRoutine, resetReserveDraftRoutine, selectAllExtrasRoutine, selectExtrasTabRoutine, selectGeneralsTabRoutine, switchGenAllRoutine, switchGenExpRoutine, switchGenStdRoutine, unselectAllExtrasRoutine } from '../routines/reserveRoutines.js';
import { toggleLibraryTrayRoutine } from '../routines/tableActions.js';
import { label, widget } from './factory.js';
import { spreadRowZone } from './reserveSpreadRow.js';

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    // 1. 覆盖式抽屉根节点 (1500 × 1100, Layer 100, 实心 100% 不透明背板)
    widget('reserve-prep-drawer', 'basic', { x: 150, y: 40, width: 1500, height: 1100, display: false, movable: true, layer: 100, color: '#102420',
      css: { background: '#102420', border: '4px double #d2ae64', borderRadius: '14px', boxShadow: '0 10px 40px #000' } }),

    // 2. 顶部工具栏 (Header Bar)
    widget('library-toolbar', 'basic', { parent, x: 12, y: 8, width: 1476, height: 48, display: false, movable: false, layer: 101,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' } }),
    label('library-toolbar-title', '📦 全套备牌工作台 ｜ 315位武将与附加扩展牌编组管理', 20, 18, 420, parent, { display: false, layer: 101 }),

    widget('main-tab-generals', 'button', { parent, x: 450, y: 14, width: 140, height: 36, text: '🎴 武将牌 (315)', display: false, layer: 101,
      color: '#26483b', css: { fontSize: '13px', color: '#fff', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #6b9e84' }, clickRoutine: selectGeneralsTabRoutine }),
    widget('main-tab-extras', 'button', { parent, x: 600, y: 14, width: 140, height: 36, text: '🗡️ 附加牌 (31)', display: false, layer: 101,
      color: '#1a3038', css: { fontSize: '13px', color: '#80d0ff', borderRadius: '6px', border: '1px solid #488098' }, clickRoutine: selectExtrasTabRoutine }),

    widget('import-to-reserve-tray-btn', 'button', { parent, x: 980, y: 14, width: 180, height: 36, text: '🚀 确认备牌并导入托盘', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '13px', color: '#fff', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: importToReserveTrayRoutine }),
    widget('close-library-tray-btn', 'button', { parent, x: 1330, y: 14, width: 150, height: 36, text: '🙈 收起备牌面板', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '13px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleLibraryTrayRoutine }),

    // 3. 左侧二级分类导航侧栏 (Left Sub-Category Navigation)
    widget('nav-sidebar', 'basic', { parent, x: 12, y: 62, width: 190, height: 950, display: false, movable: false, layer: 101,
      color: '#14221de8', css: { border: '1px solid #4b6659', borderRadius: '8px' } }),
    label('nav-sidebar-title', '📂 扩展包分类导航', 16, 70, 182, parent, { display: false, layer: 101 }),

    widget('nav-gen-all', 'button', { parent, x: 18, y: 100, width: 178, height: 32, text: '全部武将 (315)', display: false, layer: 101,
      color: '#243b32', css: { fontSize: '12px', color: '#fff', borderRadius: '5px' }, clickRoutine: switchGenAllRoutine }),
    widget('nav-gen-std', 'button', { parent, x: 18, y: 138, width: 178, height: 32, text: '标准包 (25)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenStdRoutine }),
    widget('nav-gen-feng', 'button', { parent, x: 18, y: 176, width: 178, height: 32, text: '风包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-huo', 'button', { parent, x: 18, y: 214, width: 178, height: 32, text: '火包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-lin', 'button', { parent, x: 18, y: 252, width: 178, height: 32, text: '林包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-shan', 'button', { parent, x: 18, y: 290, width: 178, height: 32, text: '山包 (8)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-yijiang', 'button', { parent, x: 18, y: 328, width: 178, height: 32, text: '一将成名 (11)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-sp', 'button', { parent, x: 18, y: 366, width: 178, height: 32, text: 'SP 武将包 (15)', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),
    widget('nav-gen-other', 'button', { parent, x: 18, y: 404, width: 178, height: 32, text: '其他扩展武将', display: false, layer: 101,
      color: '#1a2e27', css: { fontSize: '12px', color: '#c5e0d4', borderRadius: '5px' }, clickRoutine: switchGenExpRoutine }),

    // 4. 中间手牌式部分重叠牌带浏览视口 (Middle Overlapping Browsing Viewport)
    label('general-library-title', '🎴 标准武将包 (25张 ｜ 手牌式重叠平铺，点击切换 [允许 / Ban])', 210, 65, 980, parent, { display: false, layer: 101 }),
    spreadRowZone('gen-row-std', '🎴 标准武将包 (25张)', 210, 92, 980, parent, { display: false, layer: 101 }, 56),

    label('general-exp-title', '🎴 扩展包武将集 (风/火/林/山/一将/SP ｜ 56px 重叠步进)', 210, 240, 980, parent, { display: false, layer: 101 }),
    spreadRowZone('gen-row-exp', '🎴 扩展包武将集', 210, 268, 980, parent, { display: false, layer: 101 }, 56),

    label('identity-composer-title', '👑 全套身份牌 (主/忠/反/内 ｜ 手牌式重叠平铺)', 210, 416, 980, parent, { display: false, layer: 101 }),
    spreadRowZone('identity-composer-zone', '👑 全套身份牌集', 210, 444, 980, parent, { display: false, layer: 101 }, 56),

    label('extra-composer-title', '🗡️ 军争与附加扩展牌 (31张 ｜ 手牌式重叠平铺)', 210, 592, 980, parent, { display: false, layer: 101 }),
    spreadRowZone('extra-card-composer-zone', '🗡️ 军争与附加扩展牌集', 210, 620, 980, parent, { display: false, layer: 101 }, 56),

    // 5. 右侧实时摘要侧栏 (Right Summary Sidebar)
    widget('summary-sidebar', 'basic', { parent, x: 1200, y: 62, width: 288, height: 950, display: false, movable: false, layer: 101,
      color: '#1a2420e8', css: { border: '1px solid #5b786a', borderRadius: '8px' } }),
    label('summary-sidebar-title', '📊 本局备牌草稿摘要', 1208, 70, 272, parent, { display: false, layer: 101 }),

    widget('summary-generals-box', 'label', { parent, x: 1210, y: 102, width: 268, height: 80, text: '🎴 武将总数: 315\n🟢 允许入局: 315\n🔴 Ban 禁用: 0', display: false, layer: 101,
      css: { background: '#121c18', color: '#c5e0d4', fontSize: '13px', lineHeight: '24px', textAlign: 'left', border: '1px solid #3b5448', borderRadius: '6px', padding: '6px' } }),

    widget('summary-extras-box', 'label', { parent, x: 1210, y: 195, width: 268, height: 80, text: '🗡️ 附加牌总数: 31\n🟢 已选择: 31\n⚪ 未选择: 0', display: false, layer: 101,
      css: { background: '#121c18', color: '#c5e0d4', fontSize: '13px', lineHeight: '24px', textAlign: 'left', border: '1px solid #3b5448', borderRadius: '6px', padding: '6px' } }),

    widget('reset-draft-btn', 'button', { parent, x: 1210, y: 290, width: 268, height: 36, text: '🔄 恢复默认草稿', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: resetReserveDraftRoutine }),

    // 6. 底部批量操作与分页栏 (Bottom Action & Pagination Bar)
    widget('action-bar', 'basic', { parent, x: 210, y: 1020, width: 1278, height: 50, display: false, movable: false, layer: 101,
      color: '#172722e8', css: { border: '1px solid #4a685b', borderRadius: '8px' } }),

    widget('bulk-allow-all-btn', 'button', { parent, x: 220, y: 1027, width: 140, height: 36, text: '⚡ 当前类全部允许', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: allowAllGeneralsRoutine }),
    widget('bulk-ban-all-btn', 'button', { parent, x: 370, y: 1027, width: 140, height: 36, text: '🚫 当前类全部 Ban', display: false, layer: 101,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px' }, clickRoutine: banAllGeneralsRoutine }),
    widget('bulk-select-extras-btn', 'button', { parent, x: 520, y: 1027, width: 140, height: 36, text: '☑️ 附加牌全选', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: selectAllExtrasRoutine }),
    widget('bulk-unselect-extras-btn', 'button', { parent, x: 670, y: 1027, width: 140, height: 36, text: '☐ 附加牌全取消', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px' }, clickRoutine: unselectAllExtrasRoutine }),

    widget('prev-page-btn', 'button', { parent, x: 1200, y: 1027, width: 90, height: 36, text: '◄ 上一页', display: false, layer: 101,
      color: '#243b32', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: prevPageRoutine }),
    label('page-indicator', '1 / 1', 1295, 1033, 80, parent, { display: false, layer: 101 }),
    widget('next-page-btn', 'button', { parent, x: 1380, y: 1027, width: 90, height: 36, text: '下一页 ►', display: false, layer: 101,
      color: '#243b32', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: nextPageRoutine }),
  ];
}
