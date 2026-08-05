import type { Widget } from '../types/vtt.js';
import { importToReserveTrayRoutine } from '../routines/deckAssembly.js';
import { resetDeckbuildingTableRoutine } from '../routines/libraryReset.js';
import { toggleLibraryTrayRoutine } from '../routines/tableActions.js';
import { freeZone, label, widget } from './factory.js';

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    widget('reserve-prep-drawer', 'basic', { x: 200, y: 50, width: 1400, height: 1080, display: false, movable: true, layer: 5, color: '#122521f2',
      css: { border: '4px double #d2ae64', borderRadius: '14px', boxShadow: '0 8px 32px #000f' } }),

    widget('library-toolbar', 'basic', { parent, x: 12, y: 8, width: 1376, height: 48, display: false, movable: false,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' } }),
    label('library-toolbar-title', '📦 全套备牌区 ｜ 挑选配牌与制作备牌堆', 25, 18, 280, parent, { display: false }),

    widget('reset-library-table-btn', 'button', { parent, x: 320, y: 14, width: 120, height: 36, text: '🔄 重置备牌区', display: false,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: resetDeckbuildingTableRoutine }),
    widget('import-to-reserve-tray-btn', 'button', { parent, x: 450, y: 14, width: 170, height: 36, text: '🚀 导入主桌备牌托盘', display: false,
      color: '#2b5746', css: { fontSize: '13px', color: '#fff', fontWeight: 'bold', borderRadius: '6px', border: '1px solid #789b83' }, clickRoutine: importToReserveTrayRoutine }),
    widget('close-library-tray-btn', 'button', { parent, x: 1225, y: 14, width: 150, height: 36, text: '🙈 收起备牌区', display: false,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleLibraryTrayRoutine }),

    label('general-library-title', '🎴 全套武将牌库全集 (标准/风火林山/一将/SP/神将)', 15, 65, 620, parent, { display: false }),
    freeZone('general-library-view', '🎴 全套武将分类浏览网格｜选取正面武将放入右侧候选区构建备用武将堆', 15, 95, 620, 460, parent, { display: false }),
  ];
}
