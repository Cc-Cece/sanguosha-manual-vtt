import type { Widget } from '../types/vtt.js';
import { apply2v2PresetRoutine, apply4PStandardPresetRoutine, applyJunzhengPresetRoutine, importToReserveTrayRoutine, saveCustomSchemeRoutine } from '../routines/deckAssembly.js';
import { resetDeckbuildingTableRoutine } from '../routines/libraryReset.js';
import { toggleLibraryTrayRoutine } from '../routines/tableActions.js';
import { freeZone, label, widget } from './factory.js';

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    widget('reserve-prep-drawer', 'basic', { x: 150, y: 40, width: 1500, height: 1100, display: false, movable: true, layer: 100, color: '#102420',
      css: { background: '#102420', border: '4px double #d2ae64', borderRadius: '14px', boxShadow: '0 10px 40px #000' } }),

    widget('library-toolbar', 'basic', { parent, x: 12, y: 8, width: 1476, height: 48, display: false, movable: false, layer: 101,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' } }),
    label('library-toolbar-title', '📦 全套备牌工作台 ｜ 勾选配牌与方案编辑', 20, 18, 260, parent, { display: false, layer: 101 }),

    widget('preset-4p-std-btn', 'button', { parent, x: 290, y: 14, width: 130, height: 36, text: '👑 4人标准局', display: false, layer: 101,
      color: '#26483b', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #6b9e84' }, clickRoutine: apply4PStandardPresetRoutine }),
    widget('preset-junzheng-btn', 'button', { parent, x: 428, y: 14, width: 130, height: 36, text: '⚔️ 军争全扩展', display: false, layer: 101,
      color: '#26483b', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #6b9e84' }, clickRoutine: applyJunzhengPresetRoutine }),
    widget('preset-2v2-btn', 'button', { parent, x: 566, y: 14, width: 115, height: 36, text: '🎯 2v2快捷', display: false, layer: 101,
      color: '#26483b', css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #6b9e84' }, clickRoutine: apply2v2PresetRoutine }),

    widget('save-custom-scheme-btn', 'button', { parent, x: 690, y: 14, width: 130, height: 36, text: '💾 保存自定义方案', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: saveCustomSchemeRoutine }),
    widget('reset-library-table-btn', 'button', { parent, x: 828, y: 14, width: 100, height: 36, text: '🔄 重置备牌', display: false, layer: 101,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: resetDeckbuildingTableRoutine }),
    widget('import-to-reserve-tray-btn', 'button', { parent, x: 936, y: 14, width: 195, height: 36, text: '🚀 生成并导入主桌托盘', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '13px', color: '#fff', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: importToReserveTrayRoutine }),
    widget('close-library-tray-btn', 'button', { parent, x: 1340, y: 14, width: 140, height: 36, text: '🙈 收起面板', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleLibraryTrayRoutine }),

    label('general-library-title', '🎴 全套武将牌包 (☑️标准25 ☑️风8 ☑️火8 ☑️林8 ☑️山8 ☑️一将11 ☑️SP15)', 15, 65, 680, parent, { display: false, layer: 101 }),
    freeZone('general-library-view', '🎴 全套武将分类勾选网格｜选取正面武将放入右侧候选区构建备用武将堆', 15, 95, 680, 470, parent, { display: false, layer: 101 }),
  ];
}
