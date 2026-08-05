import type { Widget } from '../types/vtt.js';
import { resetDeckbuildingTableRoutine } from '../routines/libraryReset.js';
import { freeZone, label, widget } from './factory.js';

export function createLibraryTableWidgets(): Widget[] {
  return [
    widget('library-table-background', 'basic', { x: 1540, y: 30, width: 920, height: 1140, movable: false, layer: -10, color: '#162828',
      css: { background: 'radial-gradient(circle,#1d3836,#0f1f1e)', border: '18px solid #3c2a1c' } }),

    widget('library-toolbar', 'basic', { x: 1560, y: 14, width: 880, height: 50, movable: false,
      color: '#1a272be8', css: { border: '2px double #8a9ea8', borderRadius: '10px', boxShadow: '0 4px 14px #000a' } }),
    label('library-toolbar-title', '📚 武将与身份牌库编组桌', 1568, 26, 220),

    widget('reset-library-table-btn', 'button', { parent: 'library-toolbar', x: 250, y: 7, width: 130, height: 36, text: '🔄 重置编组桌',
      color: '#74322b', css: { fontSize: '13px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #c8685c' }, clickRoutine: resetDeckbuildingTableRoutine }),

    label('general-library-title', '🎴 扩展包武将浏览区 (正面向面展示)', 1560, 75, 440),
    freeZone('general-library-view', '🎴 武将分类浏览网格｜从左侧分类选取正面武将放入右侧候选区', 1560, 105, 440, 450),

    widget('transition-area', 'basic', { x: 1470, y: 30, width: 60, height: 1140, movable: false, layer: -9, color: '#111f1a',
      css: { background: 'linear-gradient(90deg, #102c25, #111f1a, #0f1f1e)', borderRight: '2px dashed #486858', borderLeft: '2px dashed #486858' } }),
    label('transition-hint-1', '← 主游戏桌', 1475, 250, 50),
    label('transition-hint-2', '牌库编组桌 →', 1475, 850, 50),
  ];
}
