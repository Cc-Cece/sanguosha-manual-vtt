import type { RoutineStep } from '../types/vtt.js';
import {
  createShuffleAnimationRoutine,
  lockShuffleControlsRoutine,
  unlockShuffleControlsRoutine,
} from '../widgets/shuffleAnimation.js';
import {
  HOST_ACTION_REQUEST_CONTROLLER_ID,
  HOST_ACTION_REQUEST_RESET_BUTTON_ID,
} from './hostActionRequests.js';

export const RECYCLE_COLLECT_STACK_ID = 'recycle-collect-stack';
export const RECYCLE_SHUFFLE_BUFFER_ID = 'recycle-shuffle-buffer';

const RECYCLE_ZONE_ID = 'recycle-zone';
const DRAW_PILE_ID = 'draw-pile';
const RECYCLE_SHUFFLE_BUTTON_ID = 'recycle-shuffle-btn';

const routine = (...steps: RoutineStep[]): RoutineStep[] => steps;

function notice(header: string, text: string): RoutineStep {
  return {
    func: 'INPUT',
    header,
    confirmButtonText: '知道了',
    cancelButtonText: null,
    cancelButtonIcon: null,
    fields: [{ type: 'text', label: '结果', value: text }],
    block: false,
  };
}

function selectLooseCollectableCards(prefix: string): RoutineStep[] {
  return routine(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: null, collection: `${prefix}LooseCards` },
    { func: 'SELECT', source: `${prefix}LooseCards`, type: 'card', property: 'owner', relation: '==', value: null, collection: `${prefix}UnownedCards` },
    { func: 'SELECT', source: `${prefix}UnownedCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}MainCards` },
    { func: 'SELECT', source: `${prefix}UnownedCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}ExtraCards` },
    { func: 'SELECT', source: `${prefix}ExtraCards`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}InUseExtraCards` },
    { func: 'SELECT', source: `${prefix}InUseExtraCards`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: `${prefix}ActiveExtraCards` },
    { func: 'SELECT', source: `${prefix}UnownedCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}CollectableCards` },
    { func: 'SELECT', source: `${prefix}ActiveExtraCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}CollectableCards`, mode: 'add' },
    { func: 'COUNT', collection: `${prefix}MainCards`, variable: `${prefix}MainCount` },
    { func: 'COUNT', collection: `${prefix}ActiveExtraCards`, variable: `${prefix}ExtraCount` },
    { func: 'COUNT', collection: `${prefix}CollectableCards`, variable: `${prefix}Count` },
  );
}

/**
 * Selects gameplay cards that are currently inside the free recycle area or its explicit
 * collection stack. The general area prevents piles, so these two direct-parent selections cover
 * every card the recycle action is allowed to process without recursively touching other zones.
 */
function selectRecycleGameplayCards(prefix: string): RoutineStep[] {
  return routine(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: RECYCLE_ZONE_ID, collection: `${prefix}DirectCards` },
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: RECYCLE_COLLECT_STACK_ID, collection: `${prefix}StackCards` },
    { func: 'COUNT', collection: `${prefix}DirectCards`, variable: `${prefix}DirectCount` },
    { func: 'COUNT', collection: `${prefix}StackCards`, variable: `${prefix}StackCount` },

    { func: 'SELECT', source: `${prefix}DirectCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}DirectExtraCards` },
    { func: 'SELECT', source: `${prefix}DirectExtraCards`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}DirectInUseExtraCards` },
    { func: 'SELECT', source: `${prefix}DirectInUseExtraCards`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: `${prefix}DirectActiveExtraCards` },

    { func: 'SELECT', source: `${prefix}StackCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}StackExtraCards` },
    { func: 'SELECT', source: `${prefix}StackExtraCards`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}StackInUseExtraCards` },
    { func: 'SELECT', source: `${prefix}StackInUseExtraCards`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: `${prefix}StackActiveExtraCards` },

    { func: 'SELECT', source: `${prefix}DirectCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}GameplayCards` },
    { func: 'SELECT', source: `${prefix}StackCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}GameplayCards`, mode: 'add' },
    { func: 'SELECT', source: `${prefix}DirectActiveExtraCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}GameplayCards`, mode: 'add' },
    { func: 'SELECT', source: `${prefix}StackActiveExtraCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}GameplayCards`, mode: 'add' },
    { func: 'COUNT', collection: `${prefix}GameplayCards`, variable: `${prefix}GameplayCount` },
  );
}

function animateRecycleBufferToDrawPile(prefix: string): RoutineStep[] {
  return routine(
    ...lockShuffleControlsRoutine,
    { func: 'SET', collection: [RECYCLE_SHUFFLE_BUTTON_ID], property: 'text', value: '⏳ 洗牌中…' },
    { func: 'MOVE', collection: `${prefix}GameplayCards`, to: RECYCLE_SHUFFLE_BUFFER_ID, count: 'all' },
    { func: 'COUNT', holder: [RECYCLE_SHUFFLE_BUFFER_ID], variable: `${prefix}BufferedCount` },
    { func: 'FLIP', holder: [RECYCLE_SHUFFLE_BUFFER_ID], face: 0 },
    ...createShuffleAnimationRoutine('recycle-zone'),
    { func: 'SHUFFLE', holder: [RECYCLE_SHUFFLE_BUFFER_ID], mode: 'true random' },
    { func: 'MOVE', from: [RECYCLE_SHUFFLE_BUFFER_ID], to: DRAW_PILE_ID, count: 'all' },
    { func: 'SET', collection: [RECYCLE_SHUFFLE_BUTTON_ID], property: 'text', value: '🔀 洗牌入摸牌堆' },
    ...unlockShuffleControlsRoutine,
    { func: 'SELECT', source: `${prefix}GameplayCards`, type: 'card', property: 'parent', relation: '==', value: DRAW_PILE_ID, collection: `${prefix}MovedToDrawCards` },
    { func: 'COUNT', collection: `${prefix}MovedToDrawCards`, variable: `${prefix}MovedToDrawCount` },
  );
}

export const fixedCollectLooseTableCardsRoutine: RoutineStep[] = [
  ...selectLooseCollectableCards('collect'),
  {
    func: 'IF',
    operand1: '${collectCount}',
    relation: '==',
    operand2: 0,
    thenRoutine: routine(notice(
      '没有可收拢的桌面牌',
      '桌面顶层没有符合条件的散落游戏牌。玩家模块、手牌、各牌堆、快捷洗牌区和备牌托盘中的牌均不会被处理。',
    )),
    elseRoutine: routine(
      {
        func: 'INPUT',
        header: '收拢桌面散牌？',
        fields: [{
          type: 'text',
          label: '将移动到回收区的收拢牌堆',
          value: '主牌 ${collectMainCount} 张，当前启用的扩展牌 ${collectExtraCount} 张，共 ${collectCount} 张。\n\n只处理桌面顶层且无 owner 的游戏牌。待回收区的自由放置区域、其中已有的其他牌、玩家模块、个人手牌及其他 Holder 均不会被重新排列。',
        }],
        block: true,
      },
      { func: 'MOVE', collection: 'collectCollectableCards', to: RECYCLE_COLLECT_STACK_ID, count: 'all' },
      { func: 'SELECT', source: 'collectCollectableCards', type: 'card', property: 'parent', relation: '==', value: RECYCLE_COLLECT_STACK_ID, collection: 'collectMovedCards' },
      { func: 'COUNT', collection: 'collectMovedCards', variable: 'collectMovedCount' },
      {
        func: 'IF',
        operand1: '${collectMovedCount}',
        relation: '==',
        operand2: '${collectCount}',
        thenRoutine: routine(notice(
          '桌面牌已收拢',
          '已将 ${collectMovedCount} 张游戏牌移入待回收区左侧的“收拢牌堆”。待回收区其余空间仍可自由摆放，牌面状态保持不变。',
        )),
        elseRoutine: routine({
          func: 'IF',
          operand1: '${collectMovedCount}',
          relation: '==',
          operand2: 0,
          thenRoutine: routine(notice(
            '收拢失败',
            '本次识别到 ${collectCount} 张可收拢牌，但没有任何牌实际进入收拢牌堆。没有执行翻面或洗牌。',
          )),
          elseRoutine: routine(notice(
            '部分收拢完成',
            '本次识别到 ${collectCount} 张可收拢牌，其中 ${collectMovedCount} 张实际进入收拢牌堆。请检查仍留在桌面的卡牌。',
          )),
        }),
      },
    ),
  },
];

export const fixedShuffleRecycleZoneRoutine: RoutineStep[] = [
  ...selectRecycleGameplayCards('recycle'),
  { func: 'COUNT', holder: [RECYCLE_SHUFFLE_BUFFER_ID], variable: 'recycleStaleBufferCount' },
  {
    func: 'IF',
    operand1: '${recycleStaleBufferCount}',
    relation: '>',
    operand2: 0,
    thenRoutine: routine(notice(
      '临时洗牌区存在遗留牌',
      '检测到上一次操作中断后遗留的临时牌。为避免把未知牌混入摸牌堆，本次没有移动、翻面或洗牌。请执行整桌重置后重试。',
    )),
    elseRoutine: routine({
      func: 'IF',
      operand1: '${recycleGameplayCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: routine(notice(
        '没有可洗牌的游戏牌',
        '待回收／待洗牌区中没有主牌，也没有当前启用且非待移除的扩展牌。区域内的武将、身份、体力、转换技状态牌及其他牌均保持原位置和牌面。',
      )),
      elseRoutine: routine(
        ...animateRecycleBufferToDrawPile('recycle'),
        {
          func: 'IF',
          operand1: '${recycleMovedToDrawCount}',
          relation: '==',
          operand2: '${recycleGameplayCount}',
          thenRoutine: routine(notice(
            '洗牌并入摸牌堆完成',
            '已将待回收区中的 ${recycleMovedToDrawCount} 张游戏牌盖面、播放洗牌动画、真随机打乱，并叠放到现有摸牌堆。区域内其他类型的牌没有移动、翻面或重新排列。',
          )),
          elseRoutine: routine(notice(
            '部分牌已进入摸牌堆',
            '本次识别到 ${recycleGameplayCount} 张可处理游戏牌，其中 ${recycleMovedToDrawCount} 张实际进入摸牌堆。待回收区中的其他类型牌仍保持原位置，请检查临时洗牌区和摸牌堆。',
          )),
        },
      ),
    }),
  },
];

function clearPendingRequest(): RoutineStep[] {
  return routine(
    { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestState', value: 'idle' },
    { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestAction', value: '' },
    { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestTarget', value: '' },
    { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requesterName', value: '' },
    { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requesterSeat', value: '' },
    { func: 'SET', collection: [HOST_ACTION_REQUEST_RESET_BUTTON_ID], property: 'text', value: '🧹 请求复位' },
  );
}

interface ApprovalDefinition {
  action: string;
  target: string;
  prepare: RoutineStep[];
  countVariable: string;
  impact: string;
  execute: RoutineStep[];
  success: string;
  empty: string;
  invalid?: string;
}

function createApprovalRoutine(definition: ApprovalDefinition): RoutineStep[] {
  return routine({
    func: 'IF',
    operand1: '${seatID}',
    relation: '==',
    operand2: null,
    thenRoutine: routine(notice('无法提交请求', '只有已入座的普通玩家可以提交房主操作请求。')),
    elseRoutine: routine(
      { func: 'GET', collection: ['seat-1'], property: 'player', variable: 'hostPlayer' },
      {
        func: 'IF',
        operand1: '${hostPlayer}',
        relation: '==',
        operand2: null,
        thenRoutine: routine(notice('无法提交请求', '当前 1 号座位没有玩家。请等待房主进入 1 号座位后再提交。')),
        elseRoutine: routine({
          func: 'IF',
          operand1: '${PROPERTY requestState OF host-action-request-controller}',
          relation: '==',
          operand2: 'pending',
          thenRoutine: routine(notice(
            '已有请求等待房主处理',
            '当前请求：${PROPERTY requestAction OF host-action-request-controller}\n请求人：${PROPERTY requesterName OF host-action-request-controller}（${PROPERTY requesterSeat OF host-action-request-controller}）',
          )),
          elseRoutine: routine(
            ...definition.prepare,
            {
              func: 'IF',
              operand1: '${' + definition.countVariable + '}',
              relation: '==',
              operand2: 0,
              thenRoutine: routine(notice('当前没有可处理的牌', definition.empty)),
              elseRoutine: routine(
                { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestRevision', relation: '+', value: 1 },
                { func: 'GET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestRevision', variable: 'requestRevision' },
                { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestState', value: 'pending' },
                { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestAction', value: definition.action },
                { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestTarget', value: definition.target },
                { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requesterName', value: '${playerName}' },
                { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requesterSeat', value: '${seatID}' },
                { func: 'SET', collection: [HOST_ACTION_REQUEST_RESET_BUTTON_ID], property: 'text', value: '🧹 取消请求' },
                {
                  func: 'INPUT',
                  player: '${hostPlayer}',
                  header: '房主操作请求',
                  confirmButtonText: '提交决定',
                  cancelButtonText: null,
                  cancelButtonIcon: null,
                  fields: [
                    { type: 'title', text: '${playerName}（${seatID}）请求：' + definition.action },
                    { type: 'text', label: definition.target, value: definition.impact },
                    { type: 'checkbox', variable: 'hostApproved', label: '同意并立即执行（不勾选即拒绝）', value: false },
                  ],
                  block: false,
                },
                { func: 'GET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestState', variable: 'currentRequestState' },
                { func: 'GET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestRevision', variable: 'currentRequestRevision' },
                {
                  func: 'IF',
                  operand1: '${currentRequestState}',
                  relation: '==',
                  operand2: 'pending',
                  thenRoutine: routine({
                    func: 'IF',
                    operand1: '${currentRequestRevision}',
                    relation: '==',
                    operand2: '${requestRevision}',
                    thenRoutine: routine({
                      func: 'IF',
                      operand1: '${hostApproved}',
                      relation: '==',
                      operand2: true,
                      thenRoutine: routine(
                        ...definition.execute,
                        ...clearPendingRequest(),
                        {
                          func: 'IF',
                          operand1: '${requestExecutionStatus}',
                          relation: '==',
                          operand2: 'success',
                          thenRoutine: routine(notice('房主已同意并执行', definition.success)),
                          elseRoutine: routine({
                            func: 'IF',
                            operand1: '${requestExecutionStatus}',
                            relation: '==',
                            operand2: 'invalid',
                            thenRoutine: routine(notice('房主已同意，但操作被安全检查阻止', definition.invalid ?? definition.empty)),
                            elseRoutine: routine(notice('房主已同意，但没有执行', definition.empty)),
                          }),
                        },
                      ),
                      elseRoutine: routine(
                        ...clearPendingRequest(),
                        notice('房主已拒绝请求', `房主拒绝了你的“${definition.action}”请求，未执行任何操作。`),
                      ),
                    }),
                    elseRoutine: routine(notice('请求已失效', '该请求已被房主复位或被其他请求替代，因此没有执行任何操作。')),
                  }),
                  elseRoutine: routine(notice('请求已失效', '该请求已被房主复位或被其他请求替代，因此没有执行任何操作。')),
                },
              ),
            },
          ),
        }),
      },
    ),
  });
}

function executeApprovedCollect(): RoutineStep[] {
  return routine(
    ...selectLooseCollectableCards('approvedCollect'),
    {
      func: 'IF',
      operand1: '${approvedCollectCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
      elseRoutine: routine(
        { func: 'MOVE', collection: 'approvedCollectCollectableCards', to: RECYCLE_COLLECT_STACK_ID, count: 'all' },
        { func: 'SELECT', source: 'approvedCollectCollectableCards', type: 'card', property: 'parent', relation: '==', value: RECYCLE_COLLECT_STACK_ID, collection: 'approvedCollectMovedCards' },
        { func: 'COUNT', collection: 'approvedCollectMovedCards', variable: 'approvedCollectMovedCount' },
        {
          func: 'IF',
          operand1: '${approvedCollectMovedCount}',
          relation: '==',
          operand2: '${approvedCollectCount}',
          thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'success', requestExecutionCount: '${approvedCollectMovedCount}' } }),
          elseRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: '${approvedCollectMovedCount}' } }),
        },
      ),
    },
  );
}

function executeApprovedRecycleShuffle(): RoutineStep[] {
  return routine(
    ...selectRecycleGameplayCards('approvedRecycle'),
    { func: 'COUNT', holder: [RECYCLE_SHUFFLE_BUFFER_ID], variable: 'approvedRecycleStaleBufferCount' },
    {
      func: 'IF',
      operand1: '${approvedRecycleStaleBufferCount}',
      relation: '>',
      operand2: 0,
      thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'invalid', requestExecutionCount: 0 } }),
      elseRoutine: routine({
        func: 'IF',
        operand1: '${approvedRecycleGameplayCount}',
        relation: '==',
        operand2: 0,
        thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
        elseRoutine: routine(
          ...animateRecycleBufferToDrawPile('approvedRecycle'),
          {
            func: 'IF',
            operand1: '${approvedRecycleMovedToDrawCount}',
            relation: '>',
            operand2: 0,
            thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'success', requestExecutionCount: '${approvedRecycleMovedToDrawCount}' } }),
            elseRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
          },
        ),
      }),
    },
  );
}

export const fixedRequestCollectLooseTableCardsRoutine = createApprovalRoutine({
  action: '收拢桌面牌',
  target: '桌面顶层散落游戏牌',
  prepare: selectLooseCollectableCards('requestCollect'),
  countVariable: 'requestCollectCount',
  impact: '当前可收拢主牌 ${requestCollectMainCount} 张、启用扩展牌 ${requestCollectExtraCount} 张，共 ${requestCollectCount} 张。\n\n同意后会重新检查，只把顶层、无 owner 的游戏牌移入待回收区左侧的收拢牌堆；待回收区其余自由空间和已有牌不会被重新排列。',
  execute: executeApprovedCollect(),
  success: '已将 ${requestExecutionCount} 张桌面散牌移入待回收区的收拢牌堆。',
  empty: '房主批准后桌面状态发生变化，或卡牌未能实际进入收拢牌堆，因此没有完成收拢。',
});

export const fixedRequestShuffleRecycleZoneRoutine = createApprovalRoutine({
  action: '洗牌并入摸牌堆',
  target: '待回收／待洗牌区中的游戏牌',
  prepare: selectRecycleGameplayCards('requestRecycle'),
  countVariable: 'requestRecycleGameplayCount',
  impact: '当前可处理游戏牌 ${requestRecycleGameplayCount} 张。\n\n同意后会重新检查，只提取主牌和当前启用且非待移除的扩展牌，播放洗牌动画、盖面并真随机打乱后叠放到摸牌堆；区域内其他类型牌保持原位置和牌面。',
  execute: executeApprovedRecycleShuffle(),
  success: '已将 ${requestExecutionCount} 张游戏牌洗牌并叠放到摸牌堆；待回收区中的其他牌保持原位置。',
  empty: '房主批准后待回收区已没有可处理的主牌或启用扩展牌，因此没有执行洗牌。',
  invalid: '临时洗牌区存在上一次中断操作遗留的牌。为避免混牌，本次没有执行；请整桌重置后重试。',
});

type PlainRecord = Record<string, unknown>;

function asRecord(value: unknown): PlainRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as PlainRecord
    : null;
}

/** Applies the free-area recycle semantics and current runtime routines after table assembly. */
export function applyRecycleZoneRuntimeFixes<T>(game: T): T {
  const root = asRecord(game);
  if (!root) return game;

  const recycleZone = asRecord(root[RECYCLE_ZONE_ID]);
  if (recycleZone) {
    recycleZone.alignChildren = false;
    recycleZone.preventPiles = true;
    recycleZone.stackOffsetX = 0;
    recycleZone.stackOffsetY = 0;
    recycleZone.dropOffsetX = 0;
    recycleZone.dropOffsetY = 0;
  }

  const collectStack = asRecord(root[RECYCLE_COLLECT_STACK_ID]);
  if (collectStack) {
    collectStack.alignChildren = true;
    collectStack.preventPiles = true;
    collectStack.stackOffsetX = 0;
    collectStack.stackOffsetY = 0;
  }

  const shuffleBuffer = asRecord(root[RECYCLE_SHUFFLE_BUFFER_ID]);
  if (shuffleBuffer) {
    shuffleBuffer.alignChildren = true;
    shuffleBuffer.preventPiles = true;
    shuffleBuffer.stackOffsetX = 0;
    shuffleBuffer.stackOffsetY = 0;
  }

  const collectButton = asRecord(root['collect-shuffle']);
  if (collectButton) collectButton.clickRoutine = fixedCollectLooseTableCardsRoutine;

  const recycleShuffleButton = asRecord(root[RECYCLE_SHUFFLE_BUTTON_ID]);
  if (recycleShuffleButton) {
    recycleShuffleButton.text = '🔀 洗牌入摸牌堆';
    recycleShuffleButton.clickRoutine = fixedShuffleRecycleZoneRoutine;
  }

  const requestCollectButton = asRecord(root['request-collect-table-cards']);
  if (requestCollectButton) requestCollectButton.clickRoutine = fixedRequestCollectLooseTableCardsRoutine;

  const requestRecycleShuffleButton = asRecord(root['request-shuffle-recycle-btn']);
  if (requestRecycleShuffleButton) {
    requestRecycleShuffleButton.text = '🔐 请求洗牌入堆';
    requestRecycleShuffleButton.clickRoutine = fixedRequestShuffleRecycleZoneRoutine;
  }

  return game;
}
