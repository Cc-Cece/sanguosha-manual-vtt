import type { RoutineStep } from '../types/vtt.js';
import { createAnimatedShuffleSteps, type ShuffleAnimationId } from '../widgets/shuffleAnimation.js';

export const HOST_ACTION_REQUEST_CONTROLLER_ID = 'host-action-request-controller';
export const HOST_ACTION_REQUEST_RESET_BUTTON_ID = 'host-action-request-reset';
export const PUBLIC_REQUEST_SEAT_IDS = Array.from({ length: 11 }, (_, index) => `seat-${index + 2}`);

const routine = (...items: RoutineStep[]): RoutineStep[] => items;
const variableRef = (name: string): string => '${' + name + '}';

const localNotice = (header: string, value: string): RoutineStep => ({
  func: 'INPUT',
  header,
  confirmButtonText: '知道了',
  cancelButtonText: null,
  cancelButtonIcon: null,
  fields: [{ type: 'text', label: '结果', value }],
  block: false,
});

const clearPendingRequestSteps = (): RoutineStep[] => routine(
  { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestState', value: 'idle' },
  { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestAction', value: '' },
  { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestTarget', value: '' },
  { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requesterName', value: '' },
  { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requesterSeat', value: '' },
  { func: 'SET', collection: [HOST_ACTION_REQUEST_RESET_BUTTON_ID], property: 'text', value: '🧹 请求复位' },
);

const pendingRequestNotice = (): RoutineStep => localNotice(
  '已有请求等待房主处理',
  '当前请求：${PROPERTY requestAction OF host-action-request-controller}\n请求人：${PROPERTY requesterName OF host-action-request-controller}（${PROPERTY requesterSeat OF host-action-request-controller}）\n\n请等待房主处理，或由房主点击“请求复位”清除异常请求。',
);

const noHostNotice = (): RoutineStep => localNotice(
  '无法提交请求',
  '当前 1 号座位没有玩家。请等待房主进入 1 号座位后再提交。',
);

const staleRequestNotice = (): RoutineStep => localNotice(
  '请求已失效',
  '该请求已被房主复位，或已被更新的请求替代，因此没有执行任何操作。',
);

interface HostApprovalRequestDefinition {
  actionLabel: string;
  targetLabel: string;
  prepareSteps: RoutineStep[];
  requestableCountVariable: string;
  impactText: string;
  executeSteps: RoutineStep[];
  successText: string;
  emptyText: string;
  invalidText?: string;
}

function executionFeedbackSteps(definition: HostApprovalRequestDefinition): RoutineStep[] {
  return routine({
    func: 'IF',
    operand1: '${requestExecutionStatus}',
    relation: '==',
    operand2: 'success',
    thenRoutine: routine(localNotice('房主已同意并执行', definition.successText)),
    elseRoutine: routine({
      func: 'IF',
      operand1: '${requestExecutionStatus}',
      relation: '==',
      operand2: 'invalid',
      thenRoutine: routine(localNotice(
        '房主已同意，但操作被安全检查阻止',
        definition.invalidText ?? definition.emptyText,
      )),
      elseRoutine: routine(localNotice('房主已同意，但没有执行', definition.emptyText)),
    }),
  });
}

function currentRequestGuardSteps(currentRequestRoutine: RoutineStep[]): RoutineStep[] {
  return routine(
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
        thenRoutine: currentRequestRoutine,
        elseRoutine: routine(staleRequestNotice()),
      }),
      elseRoutine: routine(staleRequestNotice()),
    },
  );
}

function createHostApprovalRequestRoutine(definition: HostApprovalRequestDefinition): RoutineStep[] {
  const approvalAndExecution = routine(
    ...definition.prepareSteps,
    {
      func: 'IF',
      operand1: variableRef(definition.requestableCountVariable),
      relation: '==',
      operand2: 0,
      thenRoutine: routine(localNotice('当前没有可处理的牌', definition.emptyText)),
      elseRoutine: routine(
        { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestRevision', relation: '+', value: 1 },
        { func: 'GET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestRevision', variable: 'requestRevision' },
        { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestState', value: 'pending' },
        { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestAction', value: definition.actionLabel },
        { func: 'SET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestTarget', value: definition.targetLabel },
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
            { type: 'title', text: '${playerName}（${seatID}）请求：' + definition.actionLabel },
            { type: 'text', label: definition.targetLabel, value: definition.impactText },
            {
              type: 'checkbox',
              variable: 'hostApproved',
              label: '同意并立即执行（不勾选即拒绝）',
              value: false,
            },
          ],
          block: false,
        },
        ...currentRequestGuardSteps(routine({
          func: 'IF',
          operand1: '${hostApproved}',
          relation: '==',
          operand2: true,
          thenRoutine: routine(
            ...definition.executeSteps,
            ...clearPendingRequestSteps(),
            ...executionFeedbackSteps(definition),
          ),
          elseRoutine: routine(
            ...clearPendingRequestSteps(),
            localNotice('房主已拒绝请求', `房主拒绝了你的“${definition.actionLabel}”请求，未执行任何操作。`),
          ),
        })),
      ),
    },
  );

  return routine({
    func: 'IF',
    operand1: '${seatID}',
    relation: '==',
    operand2: null,
    thenRoutine: routine(localNotice('无法提交请求', '只有已入座的普通玩家可以提交房主操作请求。')),
    elseRoutine: routine({
      func: 'IF',
      operand1: '${seatID}',
      relation: '==',
      operand2: 'seat-1',
      thenRoutine: routine(localNotice('无需提交请求', '房主可以直接使用对应的房主操作按钮。')),
      elseRoutine: routine(
        { func: 'GET', collection: ['seat-1'], property: 'player', variable: 'hostPlayer' },
        {
          func: 'IF',
          operand1: '${hostPlayer}',
          relation: '==',
          operand2: null,
          thenRoutine: routine(noHostNotice()),
          elseRoutine: routine({
            func: 'IF',
            operand1: '${hostPlayer}',
            relation: '==',
            operand2: '',
            thenRoutine: routine(noHostNotice()),
            elseRoutine: routine({
              func: 'IF',
              operand1: '${PROPERTY requestState OF host-action-request-controller}',
              relation: '==',
              operand2: 'pending',
              thenRoutine: routine(pendingRequestNotice()),
              elseRoutine: approvalAndExecution,
            }),
          }),
        },
      ),
    }),
  });
}

function looseCollectableSelectionSteps(prefix: string): RoutineStep[] {
  return routine(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: null, collection: `${prefix}LooseTableCards` },
    { func: 'SELECT', source: `${prefix}LooseTableCards`, type: 'card', property: 'owner', relation: '==', value: null, collection: `${prefix}LooseUnownedTableCards` },
    { func: 'SELECT', source: `${prefix}LooseUnownedTableCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}MainDeckCards` },
    { func: 'SELECT', source: `${prefix}LooseUnownedTableCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}ExtraDeckCards` },
    { func: 'SELECT', source: `${prefix}ExtraDeckCards`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}InUseExtraCards` },
    { func: 'SELECT', source: `${prefix}InUseExtraCards`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: `${prefix}ActiveExtraCards` },
    { func: 'SELECT', source: `${prefix}MainDeckCards`, type: 'card', collection: `${prefix}CollectableCards` },
    { func: 'SELECT', source: `${prefix}ActiveExtraCards`, type: 'card', collection: `${prefix}CollectableCards`, mode: 'add' },
    { func: 'COUNT', collection: `${prefix}MainDeckCards`, variable: `${prefix}MainCount` },
    { func: 'COUNT', collection: `${prefix}ActiveExtraCards`, variable: `${prefix}ExtraCount` },
    { func: 'COUNT', collection: `${prefix}CollectableCards`, variable: `${prefix}Count` },
  );
}

function approvedCollectExecutionSteps(): RoutineStep[] {
  return routine(
    ...looseCollectableSelectionSteps('approvedCollect'),
    {
      func: 'IF',
      operand1: '${approvedCollectCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
      elseRoutine: routine(
        { func: 'MOVE', collection: 'approvedCollectCollectableCards', to: 'recycle-zone', count: 'all' },
        { func: 'SELECT', source: 'approvedCollectCollectableCards', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: 'approvedCollectedRecycleCards' },
        { func: 'COUNT', collection: 'approvedCollectedRecycleCards', variable: 'approvedCollectedRecycleCount' },
        {
          func: 'IF',
          operand1: '${approvedCollectedRecycleCount}',
          relation: '==',
          operand2: 0,
          thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
          elseRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'success', requestExecutionCount: '${approvedCollectedRecycleCount}' } }),
        },
      ),
    },
  );
}

export const requestCollectLooseTableCardsRoutine = createHostApprovalRequestRoutine({
  actionLabel: '收拢桌面牌',
  targetLabel: '桌面顶层散落游戏牌',
  prepareSteps: looseCollectableSelectionSteps('requestCollect'),
  requestableCountVariable: 'requestCollectCount',
  impactText: '当前可收拢主牌 ${requestCollectMainCount} 张、启用扩展牌 ${requestCollectExtraCount} 张，共 ${requestCollectCount} 张。\n\n同意后会重新检查桌面，只把顶层、无 owner 的主牌和启用扩展牌移入待回收区；不会翻面、洗牌或处理任何 Holder。',
  executeSteps: approvedCollectExecutionSteps(),
  successText: '已收拢 ${requestExecutionCount} 张桌面散牌到待回收／待洗牌区。牌面和顺序保持不变。',
  emptyText: '房主批准后桌面状态发生了变化，当前已经没有符合条件的散落游戏牌，因此没有移动任何牌。',
});

function recycleValidationSteps(prefix: string): RoutineStep[] {
  return routine(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: `${prefix}ZoneCards` },
    { func: 'COUNT', collection: `${prefix}ZoneCards`, variable: `${prefix}Count` },
    { func: 'SELECT', source: `${prefix}ZoneCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}MainDeckCards` },
    { func: 'SELECT', source: `${prefix}ZoneCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}ExtraDeckCards` },
    { func: 'SELECT', source: `${prefix}ExtraDeckCards`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}InUseExtraCards` },
    { func: 'SELECT', source: `${prefix}InUseExtraCards`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: `${prefix}ActiveExtraCards` },
    { func: 'SELECT', source: `${prefix}MainDeckCards`, type: 'card', collection: `${prefix}AllowedCards` },
    { func: 'SELECT', source: `${prefix}ActiveExtraCards`, type: 'card', collection: `${prefix}AllowedCards`, mode: 'add' },
    { func: 'COUNT', collection: `${prefix}AllowedCards`, variable: `${prefix}AllowedCount` },
  );
}

function approvedRecycleShuffleSteps(): RoutineStep[] {
  return routine(
    ...recycleValidationSteps('approvedRecycle'),
    {
      func: 'IF',
      operand1: '${approvedRecycleCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
      elseRoutine: routine({
        func: 'IF',
        operand1: '${approvedRecycleAllowedCount}',
        relation: '==',
        operand2: '${approvedRecycleCount}',
        thenRoutine: routine(
          { func: 'FLIP', holder: ['recycle-zone'], face: 0 },
          { func: 'SHUFFLE', holder: ['recycle-zone'], mode: 'true random' },
          { func: 'VAR', variables: { requestExecutionStatus: 'success', requestExecutionCount: '${approvedRecycleCount}' } },
        ),
        elseRoutine: routine({
          func: 'VAR',
          variables: {
            requestExecutionStatus: 'invalid',
            requestExecutionCount: '${approvedRecycleCount}',
            requestAllowedCount: '${approvedRecycleAllowedCount}',
          },
        }),
      }),
    },
  );
}

export const requestShuffleRecycleZoneRoutine = createHostApprovalRequestRoutine({
  actionLabel: '洗牌：待回收区',
  targetLabel: '待回收／待洗牌区',
  prepareSteps: recycleValidationSteps('requestRecycle'),
  requestableCountVariable: 'requestRecycleCount',
  impactText: '当前共有 ${requestRecycleCount} 张牌，其中 ${requestRecycleAllowedCount} 张通过牌型安全检查。\n\n同意后会重新检查；只有全部为主牌或启用且非待移除的扩展牌时，才会全部盖面并真随机洗牌。牌不会自动并入摸牌堆。',
  executeSteps: approvedRecycleShuffleSteps(),
  successText: '已将待回收／待洗牌区中的 ${requestExecutionCount} 张牌全部盖面并真随机洗牌；牌仍留在回收区。',
  emptyText: '房主批准后待回收区已经为空，因此没有执行洗牌。',
  invalidText: '待回收区当前共有 ${requestExecutionCount} 张牌，但只有 ${requestAllowedCount} 张通过安全检查。请先移出武将、身份、体力、未启用扩展牌或待移除扩展牌。此次没有翻面或洗牌。',
});

function approvedHolderShuffleSteps(
  holderId: string,
  animationId: ShuffleAnimationId,
  buttonId: string,
): RoutineStep[] {
  return routine(
    { func: 'COUNT', holder: [holderId], variable: 'approvedHolderCount' },
    {
      func: 'IF',
      operand1: '${approvedHolderCount}',
      relation: '==',
      operand2: 0,
      thenRoutine: routine({ func: 'VAR', variables: { requestExecutionStatus: 'empty', requestExecutionCount: 0 } }),
      elseRoutine: routine(
        ...createAnimatedShuffleSteps(holderId, animationId, buttonId),
        { func: 'VAR', variables: { requestExecutionStatus: 'success', requestExecutionCount: '${approvedHolderCount}' } },
      ),
    },
  );
}

export function createRequestPileShuffleRoutine(
  holderId: string,
  targetLabel: string,
  animationId: ShuffleAnimationId,
  buttonId: string,
): RoutineStep[] {
  return createHostApprovalRequestRoutine({
    actionLabel: `洗牌：${targetLabel}`,
    targetLabel,
    prepareSteps: routine({ func: 'COUNT', holder: [holderId], variable: 'requestTargetCount' }),
    requestableCountVariable: 'requestTargetCount',
    impactText: `当前共有 ${'${requestTargetCount}'} 张牌。\n\n同意后会重新统计，并将“${targetLabel}”内当时存在的全部卡牌盖面、播放洗牌动画并真随机洗牌；不会从其他区域召回卡牌。`,
    executeSteps: approvedHolderShuffleSteps(holderId, animationId, buttonId),
    successText: `已将“${targetLabel}”中的 ${'${requestExecutionCount}'} 张牌全部盖面并真随机洗牌。`,
    emptyText: `房主批准后“${targetLabel}”已经为空，因此没有执行洗牌。`,
  });
}

export const requestShuffleDrawPileRoutine = createRequestPileShuffleRoutine(
  'draw-pile',
  '摸牌堆',
  'draw-pile',
  'shuffle-draw-pile-btn',
);
export const requestShuffleGeneralReserveRoutine = createRequestPileShuffleRoutine(
  'general-reserve',
  '武将备牌',
  'general-reserve',
  'shuffle-general-reserve-btn',
);
export const requestShuffleIdentityReserveRoutine = createRequestPileShuffleRoutine(
  'identity-reserve',
  '身份备牌',
  'identity-reserve',
  'shuffle-identity-reserve-btn',
);
export const requestShuffleExtraReserveRoutine = createRequestPileShuffleRoutine(
  'extra-reserve',
  '扩展备牌',
  'extra-reserve',
  'shuffle-extra-reserve-btn',
);
export const requestShuffleMarkerReserveRoutine = createRequestPileShuffleRoutine(
  'marker-reserve',
  '体力牌',
  'marker-reserve',
  'shuffle-marker-reserve-btn',
);

export const resetHostActionRequestRoutine: RoutineStep[] = [
  { func: 'GET', collection: [HOST_ACTION_REQUEST_CONTROLLER_ID], property: 'requestState', variable: 'resetRequestState' },
  {
    func: 'IF',
    operand1: '${resetRequestState}',
    relation: '==',
    operand2: 'pending',
    thenRoutine: routine(
      ...clearPendingRequestSteps(),
      localNotice('请求状态已复位', '待处理请求已被清除。即使旧审批对话框之后被提交，也会因为请求版本失效而拒绝执行。'),
    ),
    elseRoutine: routine(localNotice('当前没有待处理请求', '请求控制器处于空闲状态，无需复位。')),
  },
];
