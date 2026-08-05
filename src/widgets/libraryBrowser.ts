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

    label('general-library-title', '🎴 武将牌全集 (正面向面展示，直接拖至主桌备牌托盘)', 15, 62, 1470, parent, { display: false, layer: 101 }),
    freeZone('general-library-view', '🎴 武将牌全集陈列区', 15, 90, 1470, 480, parent, { display: false, layer: 101, preventPiles: true }),

    label('identity-composer-title', '👑 身份牌全集 (正面向面展示)', 15, 580, 720, parent, { display: false, layer: 101 }),
    freeZone('identity-composer-zone', '👑 身份牌全集陈列区', 15, 608, 720, 470, parent, { display: false, layer: 101, preventPiles: true }),

    label('extra-composer-title', '🗡️ 扩展牌与体力卡 (正面向面展示)', 750, 580, 735, parent, { display: false, layer: 101 }),
    freeZone('extra-card-composer-zone', '🗡️ 扩展牌与体力卡陈列区', 750, 608, 735, 470, parent, { display: false, layer: 101, preventPiles: true }),
  ];
}
