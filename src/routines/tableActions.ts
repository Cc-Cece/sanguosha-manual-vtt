import type { RoutineStep } from '../types/vtt.js';
import { createPrivatePeekClickRoutine, resetAllPrivatePeeksRoutine } from './privateZone.js';

const routineSteps = (...steps: RoutineStep[]): RoutineStep[] => steps;

const moduleIds = Array.from({ length: 12 }, (_, i) => `player-module-${i + 1}`).concat(['reserve-tray']);
const setupIds = ['player-management-panel', 'reserve-prep-drawer'];

export const lockLayoutRoutine = [
  { func: 'SET', collection: moduleIds, property: 'movable', value: false },
  { func: 'SET', collection: setupIds, property: 'movable', value: false },
] as const;

export const unlockLayoutRoutine = [
  { func: 'SET', collection: moduleIds, property: 'movable', value: true },
  { func: 'SET', collection: setupIds, property: 'movable', value: true },
] as const;

export const arrangeLayoutRoutine = [
  ...Array.from({ length: 12 }, (_, i) => ({
    func: 'MOVEXY',
    collection: [`player-module-${i + 1}`],
    x: 40 + (i % 4) * 440,
    y: 90 + Math.floor(i / 4) * 270,
  })),
  { func: 'MOVEXY', collection: ['reserve-tray'], x: 640, y: 900 },
] as const;

export const resetTableRoutine = [
  { func: 'INPUT', header: '完整恢复初始桌面？', fields: [{ type: 'text', text: '将收回所有牌；不会清空 Seat。取消可中止。' }], block: true },
  ...resetAllPrivatePeeksRoutine,
  {
    func: 'RECALL',
    holder: [
      'draw-pile',
      'general-reserve',
      'identity-reserve',
      'extra-reserve',
      'marker-reserve',
      'conversion-a-reserve',
      'conversion-b-reserve',
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
      'conversion-a-reserve',
      'conversion-b-reserve',
    ],
    face: 0,
  },
  { func: 'SHUFFLE', holder: ['draw-pile', 'identity-reserve'], mode: 'true random' },
  ...arrangeLayoutRoutine,
] as const;

export const quickShuffleRoutine = [
  { func: 'FLIP', holder: ['quick-shuffle-zone'], face: 0 },
  { func: 'SHUFFLE', holder: ['quick-shuffle-zone'], mode: 'true random' },
] as const;

function selectLooseCollectableCardsSteps(): RoutineStep[] {
  return routineSteps(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: null, collection: 'looseTableCards' },
    { func: 'SELECT', source: 'looseTableCards', type: 'card', property: 'owner', relation: '==', value: null, collection: 'looseUnownedTableCards' },
    { func: 'SELECT', source: 'looseUnownedTableCards', type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: 'looseMainDeckCards' },
    { func: 'SELECT', source: 'looseUnownedTableCards', type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: 'looseExtraDeckCards' },
    { func: 'SELECT', source: 'looseExtraDeckCards', type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: 'looseInUseExtraCards' },
    { func: 'SELECT', source: 'looseInUseExtraCards', type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: 'looseActiveExtraCards' },
    { func: 'SELECT', source: 'looseMainDeckCards', type: 'card', collection: 'looseCollectableCards' },
    { func: 'SELECT', source: 'looseActiveExtraCards', type: 'card', collection: 'looseCollectableCards', mode: 'add' },
    { func: 'COUNT', collection: 'looseMainDeckCards', variable: 'looseMainDeckCount' },
    { func: 'COUNT', collection: 'looseActiveExtraCards', variable: 'looseActiveExtraCount' },
    { func: 'COUNT', collection: 'looseCollectableCards', variable: 'looseCollectableCount' },
  );
}

/**
 * Collect only loose, unowned gameplay cards from the top-level table into recycle-zone.
 * Cards inside any holder or player module are excluded because their parent is not null.
 * The routine deliberately preserves each card's face and order so the host can inspect the
 * collected cards before using the recycle-zone shuffle button.
 */
export const collectLooseTableCardsRoutine: RoutineStep[] = [
  ...selectLooseCollectableCardsSteps(),
  {
    func: 'IF',
    operand1: '${looseCollectableCount}',
    relation: '==',
    operand2: 0,
    thenRoutine: routineSteps({
      func: 'INPUT',
      header: '没有可收拢的桌面牌',
      fields: [{ type: 'text', label: '结果', value: '桌面顶层没有符合条件的散落游戏牌。玩家模块、手牌、各牌堆、快捷洗牌区和备牌托盘中的牌均不会被处理。' }],
      block: false,
    }),
    elseRoutine: routineSteps(
      {
        func: 'INPUT',
        header: '收拢桌面散牌？',
        fields: [{
          type: 'text',
          label: '将移动到待回收区',
          value: '主牌 ${looseMainDeckCount} 张，当前启用的扩展牌 ${looseActiveExtraCount} 张，共 ${looseCollectableCount} 张。\n\n不会处理玩家模块、个人手牌、各类 Holder、快捷洗牌区、备牌托盘或牌库编组面板中的牌。请先确认桌面中央没有正在结算或持续生效的卡牌。',
        }],
        block: true,
      },
      { func: 'MOVE', collection: 'looseCollectableCards', to: 'recycle-zone', count: 'all' },
      { func: 'SELECT', source: 'looseCollectableCards', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: 'collectedRecycleCards' },
      { func: 'COUNT', collection: 'collectedRecycleCards', variable: 'collectedRecycleCount' },
      {
        func: 'INPUT',
        header: '桌面牌已收拢',
        fields: [{ type: 'text', label: '结果', value: '实际移入待回收／待洗牌区 ${collectedRecycleCount} 张。牌面与顺序均未改变，请检查后再点击回收区的“洗牌”。' }],
        block: false,
      },
    ),
  },
];

/** Compatibility alias retained for older generated files and imports. */
export const collectAndShuffleRoutine = collectLooseTableCardsRoutine;

function selectRecycleShuffleCardsSteps(): RoutineStep[] {
  return routineSteps(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: 'recycleZoneCards' },
    { func: 'COUNT', collection: 'recycleZoneCards', variable: 'recycleZoneCount' },
    { func: 'SELECT', source: 'recycleZoneCards', type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: 'recycleMainDeckCards' },
    { func: 'SELECT', source: 'recycleZoneCards', type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: 'recycleExtraDeckCards' },
    { func: 'SELECT', source: 'recycleExtraDeckCards', type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: 'recycleInUseExtraCards' },
    { func: 'SELECT', source: 'recycleInUseExtraCards', type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: 'recycleActiveExtraCards' },
    { func: 'SELECT', source: 'recycleMainDeckCards', type: 'card', collection: 'recycleShuffleAllowedCards' },
    { func: 'SELECT', source: 'recycleActiveExtraCards', type: 'card', collection: 'recycleShuffleAllowedCards', mode: 'add' },
    { func: 'COUNT', collection: 'recycleShuffleAllowedCards', variable: 'recycleShuffleAllowedCount' },
  );
}

/**
 * Flip and randomize only the cards already inside recycle-zone.
 * The operation is blocked when the zone contains generals, identities, marker cards,
 * disabled/pending-removal extras, or any other unexpected card type.
 */
export const shuffleRecycleZoneRoutine: RoutineStep[] = [
  ...selectRecycleShuffleCardsSteps(),
  {
    func: 'IF',
    operand1: '${recycleZoneCount}',
    relation: '==',
    operand2: 0,
    thenRoutine: routineSteps({
      func: 'INPUT',
      header: '待回收区为空',
      fields: [{ type: 'text', label: '结果', value: '待回收／待洗牌区中没有卡牌。' }],
      block: false,
    }),
    elseRoutine: routineSteps({
      func: 'IF',
      operand1: '${recycleShuffleAllowedCount}',
      relation: '==',
      operand2: '${recycleZoneCount}',
      thenRoutine: routineSteps(
        { func: 'FLIP', holder: ['recycle-zone'], face: 0 },
        { func: 'SHUFFLE', holder: ['recycle-zone'], mode: 'true random' },
        {
          func: 'INPUT',
          header: '回收区洗牌完成',
          fields: [{ type: 'text', label: '结果', value: '已将待回收／待洗牌区中的 ${recycleZoneCount} 张牌全部盖面并真随机洗牌。牌仍留在回收区，不会自动并入摸牌堆。' }],
          block: false,
        },
      ),
      elseRoutine: routineSteps({
        func: 'INPUT',
        header: '无法洗牌',
        fields: [{
          type: 'text',
          label: '请先检查回收区',
          value: '回收区共有 ${recycleZoneCount} 张牌，但只有 ${recycleShuffleAllowedCount} 张属于可洗牌的主牌或当前启用扩展牌。\n\n请先移出武将牌、身份牌、体力牌、转换技状态牌、未启用扩展牌或待退出牌组的扩展牌。此次没有翻面或洗牌。',
        }],
        block: false,
      }),
    }),
  },
];

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
