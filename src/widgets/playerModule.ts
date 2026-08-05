import { PLAYER_MODULE_STAGING_POSITIONS } from '../layouts/playerModuleStaging.js';
import { createOpenBlindSelectionRoutine } from '../routines/blindSelection.js';
import {
  createPrivatePeekClickRoutine,
  createPrivatePeekEnterRoutine,
  createPrivatePeekLeaveRoutine,
} from '../routines/privateZone.js';
import { createLeaveSeatRoutine, createSafeSeatClickRoutine } from '../routines/seatSafety.js';
import type { Widget } from '../types/vtt.js';
import { freeZone, label, widget } from './factory.js';

export function createPlayerModule(index: number): Widget[] {
  const n = index + 1;
  const moduleId = `player-module-${n}`;
  const seatId = `seat-${n}`;
  const playerLabelId = `player-label-${n}`;
  const privateId = `private-zone-${n}`;
  const privatePeekButtonId = `toggle-perspective-${n}`;
  const bounds = PLAYER_MODULE_STAGING_POSITIONS[n] || { x: 685, y: 90, width: 430, height: 260 };
  const initialDisplay = n <= 4;

  return [
    widget(moduleId, 'basic', {
      ...bounds,
      display: initialDisplay,
      movable: true,
      color: '#122c25dc',
      layer: n > 4 ? 10 : 0,
      css: { border: '3px solid #8a7042', borderRadius: '11px', boxShadow: '0 4px 12px #0008', transformOrigin: 'top left' },
    }),
    widget(seatId, 'seat', {
      parent: moduleId,
      x: 8,
      y: 7,
      width: 75,
      height: 32,
      index,
      hand: 'personal-hand',
      displayEmpty: '＋ 入座',
      display: 'playerName',
      tableNickname: '',
      color: '#6d2922',
      colorEmpty: '#6d2922',
      clickRoutine: createSafeSeatClickRoutine(seatId, playerLabelId),
      css: { fontSize: '13px', color: '#ffd0a0', textAlign: 'center', lineHeight: '32px' },
      playerChangeRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }],
    }),
    label(playerLabelId, `☰ 玩家 ${n}`, 85, 10, 70, moduleId),
    widget(`leave-seat-${n}`, 'button', {
      parent: moduleId,
      x: 157,
      y: 9,
      width: 42,
      height: 28,
      text: '离座',
      color: '#5e2420',
      css: { fontSize: '11px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #9e4438' },
      clickRoutine: createLeaveSeatRoutine(seatId),
    }),
    widget(privatePeekButtonId, 'button', {
      parent: moduleId,
      x: 201,
      y: 9,
      width: 36,
      height: 28,
      text: '👁️',
      color: '#1a3038',
      mobilePeekOpen: false,
      onlyVisibleForSeat: [seatId],
      linkedToSeat: [seatId],
      css: { fontSize: '13px', color: '#80d0ff', borderRadius: '6px', border: '1px solid #488098' },
      enterRoutine: createPrivatePeekEnterRoutine(n),
      leaveRoutine: createPrivatePeekLeaveRoutine(n),
      clickRoutine: createPrivatePeekClickRoutine(n),
    }),
    label(`hand-count-title-${n}`, '🃏 手牌', 239, 10, 62, moduleId),
    widget(`hand-count-${n}`, 'label', {
      parent: moduleId,
      x: 303,
      y: 8,
      width: 117,
      height: 28,
      text: 0,
      movable: false,
      css: { background: '#1a1820', color: '#ffe0a0', fontSize: '17px', textAlign: 'center', fontWeight: '700', border: '1px solid #b89455', borderRadius: '6px' },
    }),
    freeZone(`public-zone-${n}`, '◎ 对外展示区｜武将・体力・装备・判定・附加牌', 8, 48, 287, 170, moduleId),
    widget(`private-backdrop-${n}`, 'basic', {
      parent: moduleId,
      x: 305,
      y: 48,
      width: 115,
      height: 170,
      movable: false,
      color: '#100f16dd',
      css: { border: '2px dashed #9e789f', borderRadius: '8px', backgroundImage: 'repeating-linear-gradient(135deg,#ffffff08 0 8px,#0000 8px 16px)' },
    }),
    label(`private-label-${n}`, '▣ 私密展示区', 307, 53, 110, moduleId),
    widget(privateId, 'holder', {
      parent: moduleId,
      x: 309,
      y: 78,
      width: 107,
      height: 136,
      text: '',
      layer: 2,
      alignChildren: false,
      preventPiles: true,
      showInactiveFaceToSeat: null,
      onEnter: {
        activeFace: 0,
        clickable: false,
      },
      onLeave: {
        activeFace: 0,
        clickable: true,
        owner: null,
      },
      color: '#0000',
      css: { border: '1px solid #c6a0c7', borderRadius: '7px' },
    }),
    widget(`open-blind-selection-${n}`, 'button', {
      parent: moduleId,
      x: 305,
      y: 198,
      width: 111,
      height: 18,
      text: '🂠 暗选手牌',
      movable: false,
      color: '#2b3d3a',
      css: { fontSize: '10px', color: '#d8e6df', borderRadius: '5px', border: '1px solid #617d72' },
      onlyVisibleForSeat: [seatId],
      linkedToSeat: [seatId],
      clickRoutine: createOpenBlindSelectionRoutine(n),
    }),
  ];
}
