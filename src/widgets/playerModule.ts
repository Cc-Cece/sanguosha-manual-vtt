import { PLAYER_MODULES } from '../layouts/table.js';
import { leaveSeat1Routine, leaveSeat2Routine, leaveSeat3Routine, leaveSeat4Routine, safeSeatClickRoutine } from '../routines/seatSafety.js';
import { togglePerspective1Routine, togglePerspective2Routine, togglePerspective3Routine, togglePerspective4Routine } from '../routines/tableActions.js';
import type { Widget } from '../types/vtt.js';
import { freeZone, label, widget } from './factory.js';

const leaveSeatRoutines = [leaveSeat1Routine, leaveSeat2Routine, leaveSeat3Routine, leaveSeat4Routine];
const perspectiveRoutines = [togglePerspective1Routine, togglePerspective2Routine, togglePerspective3Routine, togglePerspective4Routine];

export function createPlayerModule(index: number): Widget[] {
  const n = index + 1;
  const moduleId = `player-module-${n}`;
  const seatId = `seat-${n}`;
  const privateId = `private-zone-${n}`;
  const blindId = `blind-zone-${n}`;
  return [
    widget(moduleId, 'basic', { ...PLAYER_MODULES[index], movable: true, color: '#122c25dc', layer: 0,
      css: { border: '3px solid #8a7042', borderRadius: '11px', boxShadow: '0 4px 12px #0008' } }),
    widget(seatId, 'seat', { parent: moduleId, x: 8, y: 7, width: 90, height: 32, index, color: '#6d2922', clickRoutine: safeSeatClickRoutine,
      playerChangeRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }] }),
    label(`player-label-${n}`, `☰ 玩家 ${n}`, 99, 10, 75, moduleId),
    widget(`leave-seat-${n}`, 'button', { parent: moduleId, x: 175, y: 9, width: 42, height: 28, text: '离座',
      color: '#5e2420', css: { fontSize: '11px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #9e4438' }, clickRoutine: leaveSeatRoutines[index] }),
    widget(`toggle-perspective-${n}`, 'button', { parent: moduleId, x: 219, y: 9, width: 45, height: 28, text: '👁️ 视角',
      color: '#1a3038', css: { fontSize: '10px', color: '#80d0ff', borderRadius: '6px', border: '1px solid #488098' }, clickRoutine: perspectiveRoutines[index] }),
    label(`hand-count-title-${n}`, '🃏 手牌', 265, 10, 55, moduleId),
    widget(`hand-count-${n}`, 'label', { parent: moduleId, x: 322, y: 8, width: 95, height: 28, text: 0, movable: false,
      css: { background: '#1a1820', color: '#ffe0a0', fontSize: '17px', textAlign: 'center', fontWeight: '700', border: '1px solid #b89455', borderRadius: '6px' } }),
    freeZone(`public-zone-${n}`, '◎ 对外展示区｜武将・体力・装备・判定・附加牌', 8, 48, 287, 170, moduleId),
    widget(`private-backdrop-${n}`, 'basic', { parent: moduleId, x: 305, y: 48, width: 115, height: 170, movable: false,
      color: '#100f16dd', css: { border: '2px dashed #9e789f', borderRadius: '8px', backgroundImage: 'repeating-linear-gradient(135deg,#ffffff08 0 8px,#0000 8px 16px)' } }),
    label(`private-label-${n}`, '▣ 私密展示区', 307, 53, 110, moduleId),
    widget(privateId, 'holder', { parent: moduleId, x: 309, y: 78, width: 107, height: 136, text: '', layer: 2, alignChildren: false,
      preventPiles: false, linkedToSeat: [seatId],
      onEnter: { activeFace: 0 }, onLeave: { activeFace: 0, owner: null },
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

