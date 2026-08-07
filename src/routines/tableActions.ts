import type { RoutineStep } from '../types/vtt.js';
import {
  arrangeLayoutRoutine,
  decreaseRecycleAreaRoutine,
  increaseRecycleAreaRoutine,
  lockLayoutRoutine,
  unlockLayoutRoutine,
} from './layoutControls.js';
import { clearPlayPhaseRoutine } from './playPhaseMarker.js';
import {
  fixedCollectLooseTableCardsRoutine,
  fixedShuffleRecycleZoneRoutine,
} from './recycleZoneRuntime.js';

export {
  arrangeLayoutRoutine,
  decreaseRecycleAreaRoutine,
  increaseRecycleAreaRoutine,
  lockLayoutRoutine,
  unlockLayoutRoutine,
} from './layoutControls.js';

export const resetTableRoutine = [
  { func: 'INPUT', header: '完整恢复初始桌面？', fields: [{ type: 'text', text: '将收回所有牌；不会清空 Seat；保留当前组件位置、组件大小和全局牌大小。取消可中止。' }], block: true },
  ...clearPlayPhaseRoutine,
  {
    func: 'RECALL',
    holder: [
      'draw-pile',
      'general-reserve',
      'identity-reserve',
      'extra-reserve',
      'marker-reserve',
      'conversion-state-reserve',
    ],
    owned: true,
    inHolder: true,
  },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'fullTableResetRoutine' },
  {
    func: 'FLIP',
    holder: [
      'draw-pile',
      'identity-reserve',
      'marker-reserve',
      'conversion-state-reserve',
    ],
    face: 0,
  },
  { func: 'SHUFFLE', holder: ['draw-pile', 'identity-reserve'], mode: 'true random' },
] as const;

export const quickShuffleRoutine = [
  { func: 'FLIP', holder: ['quick-shuffle-zone'], face: 0 },
  { func: 'SHUFFLE', holder: ['quick-shuffle-zone'], mode: 'true random' },
] as const;

/** Current implementations are re-exported here for existing imports and generated files. */
export const collectLooseTableCardsRoutine: RoutineStep[] = fixedCollectLooseTableCardsRoutine;
export const collectAndShuffleRoutine: RoutineStep[] = fixedCollectLooseTableCardsRoutine;
export const shuffleRecycleZoneRoutine: RoutineStep[] = fixedShuffleRecycleZoneRoutine;

export const toggleReserveTrayRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF reserve-tray}',
    relation: '==',
    operand2: true,
    thenRoutine: [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: false }],
    elseRoutine: [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: true }],
  },
] as const;

export const toggleHostToolbarRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF host-toolbar-panel}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      { func: 'SET', collection: ['host-toolbar-panel'], property: 'display', value: false },
      { func: 'SET', collection: ['toggle-toolbar-btn'], property: 'text', value: '▶ 展开' },
    ],
    elseRoutine: [
      { func: 'SET', collection: ['host-toolbar-panel'], property: 'display', value: true },
      { func: 'SET', collection: ['toggle-toolbar-btn'], property: 'text', value: '🔽 收起' },
    ],
  },
] as const;

export const toggleLibraryTrayRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF reserve-prep-drawer}',
    relation: '==',
    operand2: true,
    thenRoutine: [{ func: 'CALL', widget: 'reserve-panel-controller', routine: 'safeClosePanelRoutine' }],
    elseRoutine: [{ func: 'CALL', widget: 'reserve-panel-controller', routine: 'openPanelRoutine' }],
  },
] as const;

export const updateHandCountsRoutine = Array.from({ length: 12 }, (_, i) => i + 1).flatMap(number => [
  { func: 'SELECT', source: 'all', type: 'card', property: 'owner', relation: '==', value: `\${PROPERTY player OF seat-${number}}`, collection: `seat${number}HandCards` },
  { func: 'COUNT', collection: `seat${number}HandCards`, variable: `seat${number}HandCount` },
  { func: 'LABEL', label: [`hand-count-${number}`], value: `\${seat${number}HandCount}` },
]);

/** Deprecated compatibility exports. Perspective peeking no longer exists. */
export const createTogglePerspectiveRoutine = (_number: number) => [] as const;
export const togglePerspective1Routine = createTogglePerspectiveRoutine(1);
export const togglePerspective2Routine = createTogglePerspectiveRoutine(2);
export const togglePerspective3Routine = createTogglePerspectiveRoutine(3);
export const togglePerspective4Routine = createTogglePerspectiveRoutine(4);
