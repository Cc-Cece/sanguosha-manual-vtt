import type { RoutineStep } from '../types/vtt.js';
import { createAnimatedShuffleSteps } from '../widgets/shuffleAnimation.js';

const routineSteps = (...steps: RoutineStep[]): RoutineStep[] => steps;

export const animatedQuickShuffleRoutine: RoutineStep[] = [
  { func: 'COUNT', holder: ['quick-shuffle-zone'], variable: 'shufflePileCount' },
  {
    func: 'IF',
    operand1: '${shufflePileCount}',
    relation: '>',
    operand2: 0,
    thenRoutine: createAnimatedShuffleSteps(
      'quick-shuffle-zone',
      'quick-shuffle',
      'quick-shuffle-btn',
      '🔀 一键洗牌',
    ),
  },
];

function selectRecycleShuffleCardsSteps(): RoutineStep[] {
  return routineSteps(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: 'recycleZoneCards' },
    { func: 'COUNT', collection: 'recycleZoneCards', variable: 'recycleZoneCount' },
    { func: 'SELECT', source: 'recycleZoneCards', type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: 'recycleMainDeckCards' },
    { func: 'SELECT', source: 'recycleZoneCards', type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: 'recycleExtraDeckCards' },
    { func: 'SELECT', source: 'recycleExtraDeckCards', type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: 'recycleInUseExtraCards' },
    { func: 'SELECT', source: 'recycleInUseExtraCards', type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: 'recycleActiveExtraCards' },

    // Every SELECT used to assemble the allowed collection keeps an explicit predicate. A SELECT
    // without property/value defaults to parent == null in VirtualTabletop and would incorrectly
    // discard every card already parented to recycle-zone.
    { func: 'SELECT', source: 'recycleZoneCards', type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: 'recycleShuffleAllowedCards' },
    { func: 'SELECT', source: 'recycleActiveExtraCards', type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: 'recycleShuffleAllowedCards', mode: 'add' },
    { func: 'COUNT', collection: 'recycleShuffleAllowedCards', variable: 'recycleShuffleAllowedCount' },
  );
}

export const animatedShuffleRecycleZoneRoutine: RoutineStep[] = [
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
        ...createAnimatedShuffleSteps('recycle-zone', 'recycle-zone', 'recycle-shuffle-btn'),
        {
          func: 'INPUT',
          header: '回收区洗牌完成',
          fields: [{
            type: 'text',
            label: '结果',
            value: '已将待回收／待洗牌区中的 ${recycleZoneCount} 张牌集中盖面并真随机洗牌。牌仍留在回收区，不会自动并入摸牌堆。',
          }],
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
