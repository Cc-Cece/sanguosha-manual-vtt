import type { RoutineStep } from '../types/vtt.js';
import {
  HOST_ACTION_REQUEST_CONTROLLER_ID,
  HOST_ACTION_REQUEST_RESET_BUTTON_ID,
} from './hostActionRequests.js';

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

function selectRecycleZoneCards(prefix: string): RoutineStep[] {
  return routine(
    { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: `${prefix}ZoneCards` },
    { func: 'COUNT', collection: `${prefix}ZoneCards`, variable: `${prefix}Count` },
    { func: 'SELECT', source: `${prefix}ZoneCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}MainCards` },
    { func: 'SELECT', source: `${prefix}ZoneCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}ExtraCards` },
    { func: 'SELECT', source: `${prefix}ExtraCards`, type: 'card', property: 'reserveState', relation: '==', value: 'in-use', collection: `${prefix}InUseExtraCards` },
    { func: 'SELECT', source: `${prefix}InUseExtraCards`, type: 'card', property: 'reservePendingRemoval', relation: '==', value: false, collection: `${prefix}ActiveExtraCards` },
    { func: 'SELECT', source: `${prefix}ZoneCards`, type: 'card', property: 'deck', relation: '==', value: 'main-deck', collection: `${prefix}AllowedCards` },
    { func: 'SELECT', source: `${prefix}ActiveExtraCards`, type: 'card', property: 'deck', relation: '==', value: 'extra-deck', collection: `${prefix}AllowedCards`, mode: 'add' },
    { func: 'COUNT', collection: `${prefix}AllowedCards`, variable: `${prefix}AllowedCount` },
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
          label: '将移动到待回收区',
          value: '主牌 ${collectMainCount} 张，当前启用的扩展牌 ${collectExtraCount} 张，共 ${collectCount} 张。\n\n不会处理玩家模块、个人手牌、各类 Holder、快捷洗牌区、备牌托盘或牌库编组面板中的牌。请先确认桌面中央没有正在结算或持续生效的卡牌。',
        }],
        block: true,
      },
      { func: 'MOVE', collection: 'collectCollectableCards', to: 'recycle-zone', count: 'all' },
      { func: 'SELECT', source: 'collectCollectableCards', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: 'collectMovedCards' },
      { func: 'COUNT', collection: 'collectMovedCards', variable: 'collectMovedCount' },
      {
        func: 'IF',
        operand1: '${collectMovedCount}',
        relation: '==',
        operand2: '${collectCount}',
        thenRoutine: routine(notice(
          '桌面牌已收拢',
          '已将 ${collectMovedCount} 张牌集中到待回收／待洗牌区。牌面状态保持不变，请检查后再点击回收区的“洗牌”。',
        )),
        elseRoutine: routine({
          func: 'IF',
          operand1: '${collectMovedCount}',
          relation: '==',
          operand2: 0,
          thenRoutine: routine(notice(
            '收拢失败',
            '本次识别到 ${collectCount} 张可收拢牌，但没有任何牌实际进入待回收区。没有执行洗牌或翻面。',
          )),
          elseRoutine: routine(notice(
            '部分收拢完成',
            '本次识别到 ${collectCount} 张可收拢牌，其中 ${collectMovedCount} 张实际进入待回收区。请检查仍留在桌面的卡牌。',
          )),
        }),
      },
    ),
  },
];

export const fixedShuffleRecycleZoneRoutine: RoutineStep[] = [
  ...selectRecycleZoneCards('recycle'),
  {
    func: 'IF',
    operand1: '${recycleCount}',
    relation: '==',
    operand2: 0,
    thenRoutine: routine(notice('待回收区为空', '待回收／待洗牌区中没有卡牌。')),
    elseRoutine: routine({
      func: 'IF',
      operand1: '${recycleAllowedCount}',
      relation: '==',
      operand2: '${recycleCount}',
      thenRoutine: routine(
        { func: 'FLIP', holder: ['recycle-zone'], face: 0 },
        { func: 'SHUFFLE', holder: ['recycle-zone'], mode: 'true random' },
        notice(
          '回收区洗牌完成',
          '已将待回收／待洗牌区中的 ${recycleCount} 张牌集中盖面并真随机洗牌。牌仍留在回收区，不会自动并入摸牌堆。',
        ),
      ),
      elseRoutine: routine(notice(
        '无法洗牌',
        '回收区共有 ${recycleCount} 张牌，但只有 ${recycleAllowedCount} 张属于可洗牌的主牌或当前启用扩展牌。\n\n请先移出武将牌、身份牌、体力牌、转换技状态牌、未启用扩展牌或待退出牌组的扩展牌。此次没有翻面或洗牌。',
      )),
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
        { func: 'MOVE', collection: 'approvedCollectCollectableCards', to: 'recycle-zone', count: 'all' },
        { func: 'SELECT', source: 'approvedCollectCollectableCards', type: 'card', property: 'parent', relation: '==', value: 'recycle-zone', collection: 'approvedCollectMovedCards' },
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
    ...selectRecycleZoneCards('approvedRecycle'),
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

export const fixedRequestCollectLooseTableCardsRoutine = createApprovalRoutine({
  action: '收拢桌面牌',
  target: '桌面顶层散落游戏牌',
  prepare: selectLooseCollectableCards('requestCollect'),
  countVariable: 'requestCollectCount',
  impact: '当前可收拢主牌 ${requestCollectMainCount} 张、启用扩展牌 ${requestCollectExtraCount} 张，共 ${requestCollectCount} 张。\n\n同意后会重新检查桌面，只把顶层、无 owner 的主牌和启用扩展牌集中移入待回收区。',
  execute: executeApprovedCollect(),
  success: '已将 ${requestExecutionCount} 张桌面散牌集中到待回收／待洗牌区。',
  empty: '房主批准后桌面状态发生变化，或卡牌未能实际进入待回收区，因此没有完成收拢。',
});

export const fixedRequestShuffleRecycleZoneRoutine = createApprovalRoutine({
  action: '洗牌：待回收区',
  target: '待回收／待洗牌区',
  prepare: selectRecycleZoneCards('requestRecycle'),
  countVariable: 'requestRecycleCount',
  impact: '当前共有 ${requestRecycleCount} 张牌，其中 ${requestRecycleAllowedCount} 张通过牌型安全检查。\n\n同意后会重新检查；只有全部为主牌或启用且非待移除的扩展牌时，才会集中盖面并真随机洗牌。',
  execute: executeApprovedRecycleShuffle(),
  success: '已将待回收／待洗牌区中的 ${requestExecutionCount} 张牌集中盖面并真随机洗牌；牌仍留在回收区。',
  empty: '房主批准后待回收区已经为空，因此没有执行洗牌。',
  invalid: '待回收区当前共有 ${requestExecutionCount} 张牌，但只有 ${requestAllowedCount} 张通过安全检查。请先移出异常牌。此次没有翻面或洗牌。',
});

type PlainRecord = Record<string, unknown>;

function asRecord(value: unknown): PlainRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as PlainRecord
    : null;
}

/**
 * Applies the corrected runtime routines after the table is assembled. Keeping this finalization
 * step centralized also protects generated files from the legacy routines still retained for
 * source compatibility.
 */
export function applyRecycleZoneRuntimeFixes<T>(game: T): T {
  const root = asRecord(game);
  if (!root) return game;

  const recycleZone = asRecord(root['recycle-zone']);
  if (recycleZone) {
    recycleZone.alignChildren = true;
    recycleZone.preventPiles = true;
    recycleZone.stackOffsetX = 0;
    recycleZone.stackOffsetY = 0;
    recycleZone.dropOffsetX = 90;
    recycleZone.dropOffsetY = 28;
  }

  const collectButton = asRecord(root['collect-shuffle']);
  if (collectButton) collectButton.clickRoutine = fixedCollectLooseTableCardsRoutine;

  const recycleShuffleButton = asRecord(root['recycle-shuffle-btn']);
  if (recycleShuffleButton) recycleShuffleButton.clickRoutine = fixedShuffleRecycleZoneRoutine;

  const requestCollectButton = asRecord(root['request-collect-table-cards']);
  if (requestCollectButton) requestCollectButton.clickRoutine = fixedRequestCollectLooseTableCardsRoutine;

  const requestRecycleShuffleButton = asRecord(root['request-shuffle-recycle-btn']);
  if (requestRecycleShuffleButton) requestRecycleShuffleButton.clickRoutine = fixedRequestShuffleRecycleZoneRoutine;

  return game;
}
