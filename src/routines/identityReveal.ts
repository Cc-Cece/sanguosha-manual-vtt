import { dialogText, dialogTitle } from './inputDialog.js';

const MAX_PLAYER_COUNT = 12;

const privateZoneIdFor = (number: number) => `private-zone-${number}`;
const privatePeekButtonIdFor = (number: number) => `toggle-perspective-${number}`;
const seatIdFor = (number: number) => `seat-${number}`;

const confirmPrivateRevealRoutine = (number: number) => [
  {
    func: 'INPUT',
    header: '查看身份牌？',
    fields: [
      dialogTitle(`当前区域：玩家 ${number} 的私密展示区`),
      dialogText(`确认后只有玩家 ${number} 能看到身份牌正面；其他玩家仍然只能看到牌背。`),
    ],
    block: true,
    confirmButtonText: '确认查看',
    cancelButtonText: '取消',
  },
  {
    func: 'SET',
    collection: [privateZoneIdFor(number)],
    property: 'showInactiveFaceToSeat',
    value: [seatIdFor(number)],
  },
  {
    func: 'SET',
    collection: [privatePeekButtonIdFor(number)],
    property: 'mobilePeekOpen',
    value: true,
  },
] as const;

const confirmHandRevealRoutine = (cardId: string) => [
  {
    func: 'INPUT',
    header: '查看身份牌？',
    fields: [
      dialogTitle('当前区域：个人手牌区'),
      dialogText('确认后仅当前手牌所有者可见身份牌正面。将身份牌移出手牌前，请先将其盖回。'),
    ],
    block: true,
    confirmButtonText: '确认查看',
    cancelButtonText: '取消',
  },
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
    block: true,
    confirmButtonText: '确认公开',
    cancelButtonText: '取消',
  },
  { func: 'FLIP', collection: [cardId], face: 1 },
] as const;

const createPrivateZoneBranch = (cardId: string, number: number): Record<string, unknown> => ({
  func: 'IF',
  operand1: `\${PROPERTY parent OF ${cardId}}`,
  relation: '==',
  operand2: privateZoneIdFor(number),
  thenRoutine: confirmPrivateRevealRoutine(number),
  elseRoutine: number < MAX_PLAYER_COUNT
    ? [createPrivateZoneBranch(cardId, number + 1)]
    : [
        {
          func: 'IF',
          operand1: `\${PROPERTY parent OF ${cardId}}`,
          relation: '==',
          operand2: 'personal-hand',
          thenRoutine: confirmHandRevealRoutine(cardId),
          elseRoutine: confirmPublicRevealRoutine(cardId),
        },
      ],
});

/**
 * Identity cards are the only cards whose back-to-front transition is always guarded.
 * Front-to-back is intentionally immediate because covering information is a safe action.
 *
 * Private-zone confirmation never changes the shared activeFace. Instead it enables the
 * existing Seat-local inactive-face view, so every other client continues to see the back.
 */
export const createIdentityCardClickRoutine = (cardId: string) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY activeFace OF ${cardId}}`,
    relation: '==',
    operand2: 0,
    thenRoutine: [createPrivateZoneBranch(cardId, 1)],
    elseRoutine: [{ func: 'FLIP', collection: [cardId], face: 0 }],
  },
] as const;
