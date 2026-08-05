import { PLAYER_MODULES } from '../layouts/table.js';
import { safeSeatClickRoutine } from '../routines/seatSafety.js';
import type { Widget } from '../types/vtt.js';
import { freeZone, label, widget } from './factory.js';

export function createPlayerModule(index: number): Widget[] {
  const n = index + 1;
  const moduleId = `player-module-${n}`;
  const seatId = `seat-${n}`;
  const privateId = `private-zone-${n}`;
  const blindId = `blind-zone-${n}`;
  return [
    widget(moduleId, 'basic', { ...PLAYER_MODULES[index], movable: true, color: '#122c25dc', layer: 0,
      css: { border: '3px solid #8a7042', borderRadius: '11px', boxShadow: '0 4px 12px #0008' } }),
    widget(seatId, 'seat', { parent: moduleId, x: 8, y: 7, width: 105, height: 34, index, color: '#6d2922', clickRoutine: safeSeatClickRoutine,
      playerChangeRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }] }),
    label(`player-label-${n}`, `☰ 玩家 ${n}`, 118, 10, 155, moduleId),
    label(`hand-count-title-${n}`, '手牌数', 280, 10, 70, moduleId),
    widget(`hand-count-${n}`, 'label', { parent: moduleId, x: 352, y: 9, width: 55, height: 25, text: 0, movable: false,
      css: { color: '#ffe0a0', fontSize: '18px', textAlign: 'center', fontWeight: '700' } }),
    freeZone(`public-zone-${n}`, '◎ 对外展示区｜武将・体力・装备・判定・附加牌', 8, 48, 287, 170, moduleId),
    widget(`private-backdrop-${n}`, 'basic', { parent: moduleId, x: 305, y: 48, width: 115, height: 170, movable: false,
      color: '#100f16dd', css: { border: '2px dashed #9e789f', borderRadius: '8px', backgroundImage: 'repeating-linear-gradient(135deg,#ffffff08 0 8px,#0000 8px 16px)' } }),
    label(`private-label-${n}`, '▣ 私密展示区', 307, 53, 110, moduleId),
    widget(privateId, 'holder', { parent: moduleId, x: 309, y: 78, width: 107, height: 136, text: '', alignChildren: false,
      preventPiles: false, onlyVisibleForSeat: [seatId], linkedToSeat: [seatId], childrenPerOwner: true,
      onEnter: { activeFace: 0, onlyVisibleForSeat: [seatId] }, onLeave: { activeFace: 0, onlyVisibleForSeat: null, owner: null },
      color: '#0000', css: { border: '1px solid #c6a0c7', borderRadius: '7px' } }),
    widget(`show-blind-${n}`, 'button', { parent: moduleId, x: 305, y: 198, width: 54, height: 18, text: '盲选', css: { fontSize: '10px' },
      onlyVisibleForSeat: [seatId], linkedToSeat: [seatId], clickRoutine: [{ func: 'SET', collection: [blindId], property: 'display', value: true }] }),
    widget(`hide-blind-${n}`, 'button', { parent: moduleId, x: 362, y: 198, width: 54, height: 18, text: '收起', css: { fontSize: '10px' },
      onlyVisibleForSeat: [seatId], linkedToSeat: [seatId], clickRoutine: [{ func: 'SET', collection: [blindId], property: 'display', value: false }] }),
    widget(blindId, 'holder', { x: 630 + index * 25, y: 335 + index * 18, width: 540, height: 150, display: false,
      text: `玩家 ${n} 手牌背面盲选（由本人摆放等量代理）`, alignChildren: true, preventPiles: true, stackOffsetX: 45, stackOffsetY: 0,
      color: '#28333be8', textColor: '#e0e8ed', css: { border: '2px dashed #9bb0bd', borderRadius: '9px' } }),
    ...Array.from({ length: 10 }, (_, proxy) => widget(`blind-proxy-${n}-${proxy + 1}`, 'basic', { parent: blindId, width: 72, height: 101,
      movable: true, enlarge: 2, faces: [{ objects: [{ type: 'text', x: 4, y: 40, width: 64, height: 20, value: '牌背', color: '#e6c980', fontSize: 14, textAlign: 'center' }],
        css: { background: 'radial-gradient(circle,#713027,#301010)', border: '3px double #c39b54', borderRadius: '6px' } }] })),
  ];
}
