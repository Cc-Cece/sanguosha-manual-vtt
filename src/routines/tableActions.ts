import { createPrivatePeekClickRoutine, resetAllPrivatePeeksRoutine } from './privateZone.js';

const moduleIds = Array.from({ length: 12 }, (_, i) => `player-module-${i + 1}`).concat(['reserve-tray']);

export const collectAndShuffleRoutine = [
  { func: 'MOVE', from: ['recycle-zone'], to: ['draw-pile'], count: 'all', face: 0 },
  { func: 'SHUFFLE', holder: ['draw-pile'], mode: 'true random' },
] as const;

export const quickShuffleRoutine = [
  { func: 'FLIP', holder: ['quick-shuffle-zone'], face: 0 },
  { func: 'SHUFFLE', holder: ['quick-shuffle-zone'], mode: 'true random' },
  { func: 'INPUT', header: '洗牌完成', fields: [{ type: 'text', label: '提示', value: '快捷洗牌区已完成随机洗牌，牌叠已自动背置。' }], block: false },
] as const;

export const lockLayoutRoutine = [{ func: 'SET', collection: moduleIds, property: 'movable', value: false }] as const;
export const unlockLayoutRoutine = [{ func: 'SET', collection: moduleIds, property: 'movable', value: true }] as const;

export const arrangeLayoutRoutine = [
  { func: 'SET', collection: ['player-module-1'], property: 'x', value: 685 }, { func: 'SET', collection: ['player-module-1'], property: 'y', value: 90 },
  { func: 'SET', collection: ['player-module-2'], property: 'x', value: 1340 }, { func: 'SET', collection: ['player-module-2'], property: 'y', value: 390 },
  { func: 'SET', collection: ['player-module-3'], property: 'x', value: 685 }, { func: 'SET', collection: ['player-module-3'], property: 'y', value: 790 },
  { func: 'SET', collection: ['player-module-4'], property: 'x', value: 30 }, { func: 'SET', collection: ['player-module-4'], property: 'y', value: 390 },
  { func: 'SET', collection: ['reserve-tray'], property: 'x', value: 30 }, { func: 'SET', collection: ['reserve-tray'], property: 'y', value: 760 },
] as const;

export const resetTableRoutine = [
  { func: 'INPUT', header: '完整恢复初始桌面？', fields: [{ type: 'text', text: '将收回所有牌；不会清空 Seat。取消可中止。' }], block: true },
  ...resetAllPrivatePeeksRoutine,
  { func: 'RECALL', holder: ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'], owned: true, inHolder: true },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'fullTableResetRoutine' },
  { func: 'FLIP', holder: ['draw-pile', 'identity-reserve', 'marker-reserve'], face: 0 },
  { func: 'SHUFFLE', holder: ['draw-pile', 'identity-reserve'], mode: 'true random' },
  ...arrangeLayoutRoutine,
] as const;

export const showReserveTrayRoutine = [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: true }] as const;
export const hideReserveTrayRoutine = [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: false }] as const;

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
      { func: 'SET', collection: ['toggle-toolbar-btn'], property: 'text', value: '👑 房主工具' },
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
    thenRoutine: [{ func: 'CALL', widget: 'reserve-panel-controller', routine: 'closePanelRoutine' }],
    elseRoutine: [{ func: 'CALL', widget: 'reserve-panel-controller', routine: 'openPanelRoutine' }],
  },
] as const;

export const updateHandCountsRoutine = Array.from({ length: 12 }, (_, i) => i + 1).flatMap(number => [
  { func: 'SELECT', source: 'all', type: 'card', property: 'owner', relation: '==', value: `\${PROPERTY player OF seat-${number}}`, collection: `seat${number}HandCards` },
  { func: 'SELECT', source: 'all', type: 'card', property: 'blindSourceSeat', relation: '==', value: `seat-${number}`, collection: `seat${number}HandCards`, mode: 'add' },
  { func: 'COUNT', collection: `seat${number}HandCards`, variable: `seat${number}HandCount` },
  { func: 'LABEL', label: [`hand-count-${number}`], value: `\${seat${number}HandCount}` },
]);

/**
 * Compatibility alias for older imports. It no longer changes shared display state and never
 * grants the host access to another Seat's private face.
 */
export const createTogglePerspectiveRoutine = (number: number) =>
  createPrivatePeekClickRoutine(number);

export const togglePerspective1Routine = createTogglePerspectiveRoutine(1);
export const togglePerspective2Routine = createTogglePerspectiveRoutine(2);
export const togglePerspective3Routine = createTogglePerspectiveRoutine(3);
export const togglePerspective4Routine = createTogglePerspectiveRoutine(4);
