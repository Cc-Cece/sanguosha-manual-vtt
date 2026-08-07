import type { GameFile, RoutineStep } from '../types/vtt.js';
import { handZoneCoverLeavingIdentityRoutine } from './playerHand.js';

type PlainRecord = Record<string, unknown>;

const MAX_PLAYER_COUNT = 12;
const identityLeaveRoutine = handZoneCoverLeavingIdentityRoutine as unknown as RoutineStep[];

function isRecord(value: unknown): value is PlainRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asRoutine(value: unknown): RoutineStep[] {
  return Array.isArray(value) ? value as RoutineStep[] : [];
}

function hasIdentityLeaveGuard(routine: RoutineStep[]): boolean {
  return JSON.stringify(routine).includes('leavingIdentityCards');
}

function updateMetadata(root: PlainRecord): void {
  const meta = isRecord(root._meta) ? root._meta : null;
  const info = meta && isRecord(meta.info) ? meta.info : null;
  if (!info) return;

  if (typeof info.description === 'string') {
    info.description = info.description.replace('独立私密展示区', '始终盖面的暗置牌区');
  }

  if (typeof info.ruleText === 'string') {
    info.ruleText = info.ruleText.replace(
      '3. 卡牌在私密展示区与个人手牌区保持原生视角隔离，防偷窥与翻牌提示。',
      '3. 暗置牌区中的牌始终盖面且不可直接查看；需要私下查看的牌必须移入个人手牌区。身份牌离开手牌时会自动盖回。',
    );
  }

  if (typeof info.helpText === 'string') {
    const oldHandHelp = '8. 个人手牌：将卡牌移入右下角「🖐️ 我的手牌」即自动对其他玩家隐藏具体牌面，模块仅显示手牌数。';
    const newHandHelp = '8. 个人手牌：将卡牌移入右下角「🖐️ 我的手牌」即自动对其他玩家隐藏具体牌面，模块仅显示手牌数。身份牌进入手牌后保持盖面，点击即可无提示私下查看；再次点击可盖回，移出手牌时会自动盖回；\n9. 暗置牌区：玩家模块右侧的暗置牌区始终只显示牌背，区内卡牌不可点击翻面。需要查看时先将牌移入自己的手牌区。身份备牌堆同样始终盖面且不可点击查看。';

    if (info.helpText.includes(oldHandHelp)) {
      info.helpText = info.helpText.replace(oldHandHelp, newHandHelp);
    } else if (!info.helpText.includes('暗置牌区始终只显示牌背')) {
      info.helpText += `\n${newHandHelp}`;
    }
  }
}

/**
 * Applies the final privacy model after the base prototype has been assembled:
 * - private-zone-* holders are permanent face-down zones with no peek capability;
 * - the identity reserve remains covered and inert until a card leaves it;
 * - legacy eye widgets are removed if an older base happens to provide them;
 * - identity cards leaving the personal hand are covered before the move completes;
 * - user-facing metadata explains the single safe viewing path.
 */
export function applyFaceDownPrivacyRuntime<T extends GameFile>(game: T): T {
  const root = game as unknown as PlainRecord;

  for (let number = 1; number <= MAX_PLAYER_COUNT; number += 1) {
    delete root[`toggle-perspective-${number}`];

    const label = root[`private-label-${number}`];
    if (isRecord(label)) label.text = '暗置牌区';

    const zone = root[`private-zone-${number}`];
    if (!isRecord(zone)) continue;

    zone.text = '始终盖面\n查看请移入手牌';
    zone.textColor = '#c7aec8aa';
    zone.showInactiveFaceToSeat = null;
    zone.onEnter = {
      ...(isRecord(zone.onEnter) ? zone.onEnter : {}),
      activeFace: 0,
      clickable: false,
    };
    zone.onLeave = {
      ...(isRecord(zone.onLeave) ? zone.onLeave : {}),
      activeFace: 0,
      clickable: true,
      owner: null,
    };
    delete zone.enterRoutine;
    delete zone.leaveRoutine;
    delete zone.clickRoutine;
  }

  const identityReserve = root['identity-reserve'];
  if (isRecord(identityReserve)) {
    identityReserve.onEnter = {
      ...(isRecord(identityReserve.onEnter) ? identityReserve.onEnter : {}),
      activeFace: 0,
      clickable: false,
    };
    identityReserve.onLeave = {
      ...(isRecord(identityReserve.onLeave) ? identityReserve.onLeave : {}),
      activeFace: 0,
      clickable: true,
    };
  }

  const personalHand = root['personal-hand'];
  if (isRecord(personalHand)) {
    const currentLeaveRoutine = asRoutine(personalHand.leaveRoutine);
    personalHand.leaveRoutine = hasIdentityLeaveGuard(currentLeaveRoutine)
      ? currentLeaveRoutine
      : [...identityLeaveRoutine, ...currentLeaveRoutine];
  }

  updateMetadata(root);
  return game;
}
