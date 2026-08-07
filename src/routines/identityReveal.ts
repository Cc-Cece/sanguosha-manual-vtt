import { dialogText, dialogTitle } from './inputDialog.js';

const MAX_PLAYER_COUNT = 12;

const faceDownZoneIdFor = (number: number) => `private-zone-${number}`;

const revealInHandRoutine = (cardId: string) => [
  { func: 'FLIP', collection: [cardId], face: 1 },
] as const;

const confirmPublicRevealRoutine = (cardId: string) => [
  {
    func: 'INPUT',
    header: '公开身份牌？',
    fields: [
      dialogTitle(`当前区域：公开或未标记区域（区域标识：\${PROPERTY parent OF ${cardId}}）`),
      dialogText('确认后身份牌将以共享状态翻到正面，所有能够看到当前区域的玩家都能看到身份。'),
    ],
    block: false,
    confirmButtonText: '确认公开',
    cancelButtonText: '取消',
  },
  { func: 'FLIP', collection: [cardId], face: 1 },
] as const;

const createFaceDownZoneBranch = (cardId: string, number: number): Record<string, unknown> => ({
  func: 'IF',
  operand1: `\${PROPERTY parent OF ${cardId}}`,
  relation: '==',
  operand2: faceDownZoneIdFor(number),
  // Cards in a face-down zone are intentionally inert. The holder also sets clickable=false,
  // while this empty branch protects against stale click events during a drag or network update.
  thenRoutine: [],
  elseRoutine: number < MAX_PLAYER_COUNT
    ? [createFaceDownZoneBranch(cardId, number + 1)]
    : [
        {
          func: 'IF',
          operand1: `\${PROPERTY parent OF ${cardId}}`,
          relation: '==',
          operand2: 'personal-hand',
          thenRoutine: revealInHandRoutine(cardId),
          elseRoutine: confirmPublicRevealRoutine(cardId),
        },
      ],
});

const createCoveredContextBranch = (cardId: string): Record<string, unknown> => ({
  func: 'IF',
  operand1: `\${PROPERTY parent OF ${cardId}}`,
  relation: '==',
  operand2: 'identity-reserve',
  // The reserve is a covered source pile, not a viewing area.
  thenRoutine: [],
  elseRoutine: [createFaceDownZoneBranch(cardId, 1)],
});

/**
 * Identity cards have four explicit contexts:
 * - the identity reserve and face-down zones never reveal them;
 * - the owning personal hand toggles them privately without a dialog;
 * - every public or unmarked area requires a local, non-blocking confirmation before reveal.
 *
 * Front-to-back is always immediate because covering information is safe.
 */
export const createIdentityCardClickRoutine = (cardId: string) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY activeFace OF ${cardId}}`,
    relation: '==',
    operand2: 0,
    thenRoutine: [createCoveredContextBranch(cardId)],
    elseRoutine: [{ func: 'FLIP', collection: [cardId], face: 0 }],
  },
] as const;
