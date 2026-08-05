const moduleIds = ['player-module-1', 'player-module-2', 'player-module-3', 'player-module-4', 'reserve-tray'];

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
  { func: 'RECALL', holder: ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'], owned: true, inHolder: true },
  { func: 'FLIP', holder: ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'], face: 0 },
  { func: 'SHUFFLE', holder: ['draw-pile', 'general-reserve', 'identity-reserve'], mode: 'true random' },
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

export const updateHandCountsRoutine = [1, 2, 3, 4].flatMap(number => [
  { func: 'SELECT', source: 'all', type: 'card', property: 'owner', relation: '==', value: `\${PROPERTY player OF seat-${number}}`, collection: `seat${number}HandCards` },
  { func: 'COUNT', collection: `seat${number}HandCards`, variable: `seat${number}HandCount` },
  { func: 'LABEL', label: [`hand-count-${number}`], value: `\${seat${number}HandCount}` },
]);
