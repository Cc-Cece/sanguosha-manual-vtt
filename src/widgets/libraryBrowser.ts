import type { Widget } from '../types/vtt.js';
import { apply2v2PresetRoutine, apply4PStandardPresetRoutine, applyJunzhengPresetRoutine, importExpansionGenPackageRoutine, importJunzhengPackageRoutine, importStandardGenPackageRoutine, importToReserveTrayRoutine, saveCustomSchemeRoutine } from '../routines/deckAssembly.js';
import { resetDeckbuildingTableRoutine } from '../routines/libraryReset.js';
import { toggleLibraryTrayRoutine } from '../routines/tableActions.js';
import { freeZone, label, pileZone, widget } from './factory.js';

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    widget('reserve-prep-drawer', 'basic', { x: 150, y: 40, width: 1500, height: 1100, display: false, movable: true, layer: 100, color: '#102420',
      css: { background: '#102420', border: '4px double #d2ae64', borderRadius: '14px', boxShadow: '0 10px 40px #000' } }),

    widget('library-toolbar', 'basic', { parent, x: 12, y: 8, width: 1476, height: 48, display: false, movable: false, layer: 101,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' } }),
    label('library-toolbar-title', '📦 全套备牌工作台 ｜ 扩展包堆叠与快捷引包', 20, 18, 260, parent, { display: false, layer: 101 }),

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

    label('general-library-title', '🎴 分类扩展包独立牌堆 (右键/展开可2倍高清放大预览)', 15, 65, 680, parent, { display: false, layer: 101 }),

    pileZone('pkg-gen-std-pile', '🎴 标准武将(25)', 18, 95, 118, 160, parent, { display: false, layer: 101 }),
    widget('btn-import-gen-std', 'button', { parent, x: 18, y: 260, width: 118, height: 32, text: '➕ 引入标准包', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: importStandardGenPackageRoutine }),

    pileZone('pkg-gen-feng-pile', '🎴 风包(8)', 152, 95, 118, 160, parent, { display: false, layer: 101 }),
    pileZone('pkg-gen-huo-pile', '🎴 火包(8)', 286, 95, 118, 160, parent, { display: false, layer: 101 }),
    pileZone('pkg-gen-lin-pile', '🎴 林包(8)', 420, 95, 118, 160, parent, { display: false, layer: 101 }),
    pileZone('pkg-gen-shan-pile', '🎴 山包(8)', 554, 95, 118, 160, parent, { display: false, layer: 101 }),
    widget('btn-import-gen-exp', 'button', { parent, x: 152, y: 260, width: 520, height: 32, text: '➕ 引入全套风火林山/一将/SP扩展包', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: importExpansionGenPackageRoutine }),

    pileZone('pkg-gen-yijiang-pile', '🎴 一将成名(11)', 18, 310, 118, 160, parent, { display: false, layer: 101 }),
    pileZone('pkg-gen-sp-pile', '🎴 SP武将包(15)', 152, 310, 118, 160, parent, { display: false, layer: 101 }),

    pileZone('pkg-extra-junzheng-pile', '🗡️ 军争扩展(52)', 286, 310, 118, 160, parent, { display: false, layer: 101 }),
    widget('btn-import-junzheng', 'button', { parent, x: 286, y: 475, width: 118, height: 32, text: '➕ 引入军争包', display: false, layer: 101,
      color: '#2b5746', css: { fontSize: '12px', color: '#fff', borderRadius: '6px' }, clickRoutine: importJunzhengPackageRoutine }),
  ];
}
