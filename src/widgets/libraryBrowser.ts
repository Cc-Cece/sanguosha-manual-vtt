import type { Widget } from '../types/vtt.js';
import { toggleLibraryTrayRoutine } from '../routines/tableActions.js';
import { freeZone, label, widget } from './factory.js';

export function createLibraryTableWidgets(): Widget[] {
  const parent = 'reserve-prep-drawer';
  return [
    widget('reserve-prep-drawer', 'basic', { x: 150, y: 40, width: 1500, height: 1100, display: false, movable: true, layer: 100, color: '#102420',
      css: { background: '#102420', border: '4px double #d2ae64', borderRadius: '14px', boxShadow: '0 10px 40px #000' } }),

    widget('library-toolbar', 'basic', { parent, x: 12, y: 8, width: 1476, height: 48, display: false, movable: false, layer: 101,
      color: '#1a272be8', css: { border: '1px solid #8a9ea8', borderRadius: '8px' } }),
    label('library-toolbar-title', '📦 全套卡牌陈列集 ｜ 鼠标悬浮享 2倍放大预览，可直接拖牌至主桌备牌托盘', 25, 18, 500, parent, { display: false, layer: 101 }),

    widget('close-library-tray-btn', 'button', { parent, x: 1330, y: 14, width: 150, height: 36, text: '🙈 收起备牌面板', display: false, layer: 101,
      color: '#382c1e', css: { fontSize: '13px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleLibraryTrayRoutine }),

    label('general-library-title', '🎴 标准武将包 (25张 ｜ 正面向面平铺，直接拖至主桌备牌托盘)', 15, 62, 1470, parent, { display: false, layer: 101 }),
    freeZone('gen-row-std', '🎴 标准武将包 (25张)', 15, 90, 1470, 150, parent, { display: false, layer: 101, alignChildren: true, preventPiles: true, stackOffsetX: 98, stackOffsetY: 0 }),

    label('general-exp-title', '🎴 扩展包武将 (风/火/林/山/一将/SP ｜ 正面向面平铺)', 15, 255, 1470, parent, { display: false, layer: 101 }),
    freeZone('gen-row-exp', '🎴 扩展包武将集', 15, 283, 1470, 150, parent, { display: false, layer: 101, alignChildren: true, preventPiles: true, stackOffsetX: 98, stackOffsetY: 0 }),

    label('identity-composer-title', '👑 全套身份牌 (主/忠/反/内 ｜ 正面向面平铺)', 15, 448, 1470, parent, { display: false, layer: 101 }),
    freeZone('identity-composer-zone', '👑 全套身份牌集', 15, 476, 1470, 150, parent, { display: false, layer: 101, alignChildren: true, preventPiles: true, stackOffsetX: 98, stackOffsetY: 0 }),

    label('extra-composer-title', '🗡️ 军争扩展牌 (52张 ｜ 正面向面平铺)', 15, 641, 1470, parent, { display: false, layer: 101 }),
    freeZone('extra-card-composer-zone', '🗡️ 军争扩展牌集', 15, 669, 1470, 150, parent, { display: false, layer: 101, alignChildren: true, preventPiles: true, stackOffsetX: 98, stackOffsetY: 0 }),
  ];
}
