import { dialogText, dialogTitle } from './inputDialog.js';

const MAX_PLAYER_COUNT = 12;

export const privateZoneIds = Array.from(
  { length: MAX_PLAYER_COUNT },
  (_, index) => `private-zone-${index + 1}`,
);

export const privatePeekButtonIds = Array.from(
  { length: MAX_PLAYER_COUNT },
  (_, index) => `toggle-perspective-${index + 1}`,
);

const seatIdFor = (number: number) => `seat-${number}`;
const privateZoneIdFor = (number: number) => `private-zone-${number}`;
const privatePeekButtonIdFor = (number: number) => `toggle-perspective-${number}`;
const privateIdentityCollectionFor = (number: number) => `privateIdentityCards${number}`;
const privateIdentityCountFor = (number: number) => `privateIdentityCount${number}`;

/**
 * Default privacy state: every client sees only the active face (face 0 / card back).
 * The holder's showInactiveFaceToSeat property is enabled only while the owning Seat peeks.
 */
export const createResetPrivatePeekRoutine = (number: number) => [
  {
    func: 'SET',
    collection: [privateZoneIdFor(number)],
    property: 'showInactiveFaceToSeat',
    value: null,
  },
  {
    func: 'SET',
    collection: [privatePeekButtonIdFor(number)],
    property: 'mobilePeekOpen',
    value: false,
  },
] as const;

export const resetAllPrivatePeeksRoutine = [
  {
    func: 'SET',
    collection: privateZoneIds,
    property: 'showInactiveFaceToSeat',
    value: null,
  },
  {
    func: 'SET',
    collection: privatePeekButtonIds,
    property: 'mobilePeekOpen',
    value: false,
  },
] as const;

const createOwnedSeatGuard = (number: number, allowedRoutine: readonly Record<string, unknown>[]) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY player OF ${seatIdFor(number)}}`,
    relation: '==',
    operand2: '${playerName}',
    thenRoutine: allowedRoutine,
    elseRoutine: createResetPrivatePeekRoutine(number),
  },
] as const;

const createCollectPrivateIdentityCardsRoutine = (number: number) => [
  {
    func: 'SELECT',
    source: 'all',
    type: 'card',
    property: 'parent',
    relation: '==',
    value: privateZoneIdFor(number),
    collection: privateIdentityCollectionFor(number),
  },
  {
    func: 'SELECT',
    source: privateIdentityCollectionFor(number),
    type: 'card',
    property: 'deck',
    relation: '==',
    value: 'identity-deck',
    collection: privateIdentityCollectionFor(number),
    mode: 'intersect',
  },
  {
    func: 'COUNT',
    collection: privateIdentityCollectionFor(number),
    variable: privateIdentityCountFor(number),
  },
] as const;

const createOpenPrivatePeekRoutine = (number: number) => [
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

const createConfirmPrivateIdentityPeekRoutine = (number: number) => [
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
  ...createOpenPrivatePeekRoutine(number),
] as const;

/**
 * Desktop hover remains immediate for ordinary private cards. When an identity card is present,
 * hover deliberately stays covered; the owner must click the eye and confirm the visible scope.
 */
export const createPrivatePeekEnterRoutine = (number: number) =>
  createOwnedSeatGuard(number, [
    ...createCollectPrivateIdentityCardsRoutine(number),
    {
      func: 'IF',
      operand1: `\${${privateIdentityCountFor(number)}}`,
      relation: '==',
      operand2: 0,
      thenRoutine: createOpenPrivatePeekRoutine(number),
      elseRoutine: createResetPrivatePeekRoutine(number),
    },
  ]);

/** Desktop: leaving the eye button immediately returns everyone, including the owner, to backs. */
export const createPrivatePeekLeaveRoutine = (number: number) =>
  createResetPrivatePeekRoutine(number);

/**
 * Touch devices use one tap to open and the next tap to cover. The same click path is also used
 * on desktop whenever the private zone contains an identity card, so identity viewing can never
 * bypass the confirmation dialogue.
 */
export const createPrivatePeekClickRoutine = (number: number) =>
  createOwnedSeatGuard(number, [
    {
      func: 'IF',
      operand1: `\${PROPERTY mobilePeekOpen OF ${privatePeekButtonIdFor(number)}}`,
      relation: '==',
      operand2: true,
      thenRoutine: createResetPrivatePeekRoutine(number),
      elseRoutine: [
        ...createCollectPrivateIdentityCardsRoutine(number),
        {
          func: 'IF',
          operand1: `\${${privateIdentityCountFor(number)}}`,
          relation: '>',
          operand2: 0,
          thenRoutine: createConfirmPrivateIdentityPeekRoutine(number),
          elseRoutine: createOpenPrivatePeekRoutine(number),
        },
      ],
    },
  ]);
