import type { Widget } from '../types/vtt.js';
import { resetDeckbuildingTableRoutine } from '../routines/libraryReset.js';
import { toggleLibraryTrayRoutine } from '../routines/tableActions.js';
import { freeZone, label, widget } from './factory.js';

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'library-tray';
  return [
    widget('library-tray', 'basic', { x: 350, y: 80, width: 1100, height: 950, display: false, movable: true, layer: 5, color: '#142523f0',
      css: { border: '4px double #b68c50', borderRadius: '12px', boxShadow: '0 8px 24px #000c' } }),

    widget('library-toolbar', 'basic', { parent, x: 10, y: 8, width: 1080, height: 46, display: false, movable: false,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' } }),
    label('library-toolbar-title', '📚 武将与身份牌库编组抽屉', 20, 18, 240, parent, { display: false }),

    widget('reset-library-table-btn', 'button', { parent, x: 270, y: 14, width: 120, height: 34, text: '🔄 重置编组桌', display: false,
      color: '#74322b', css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: resetDeckbuildingTableRoutine }),
    widget('close-library-tray-btn', 'button', { parent, x: 940, y: 14, width: 130, height: 34, text: '🙈 收起抽屉', display: false,
      color: '#382c1e', css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleLibraryTrayRoutine }),

    label('general-library-title', '🎴 扩展包武将浏览区 (正面向面展示)', 15, 62, 500, parent, { display: false }),
    freeZone('general-library-view', '🎴 武将分类浏览网格｜从左侧分类选取正面武将放入右侧候选区', 15, 92, 500, 450, parent, { display: false }),
  ];
}
