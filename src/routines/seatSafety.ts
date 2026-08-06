import { createResetPrivatePeekRoutine, resetAllPrivatePeeksRoutine } from './privateZone.js';

const EMPTY_SEAT_COLOR = '#8c7043';
const MAX_PLAYER_COUNT = 12;

const seatIds = Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => `seat-${index + 1}`);

const seatNumberFromId = (seatId: string) => {
  const number = Number(seatId.split('-').at(-1));
  if (!Number.isInteger(number) || number < 1 || number > MAX_PLAYER_COUNT) {
    throw new Error(`Invalid Seat id: ${seatId}`);
  }
  return number;
};

const nicknameInputField = (value: string) => ({
  type: 'string',
  label: '桌内昵称',
  variable: 'seatNickname',
  value,
  regex: '^.{1,10}$',
  regexHint: '请输入 1–10 个字符。昵称只用于本桌显示。',
});

const createApplyNicknameRoutine = (seatId: string, playerLabelId: string) => {
  const playerNumber = seatNumberFromId(seatId);
  return [
    { func: 'SET', collection: [seatId], property: 'tableNickname', value: '${seatNickname}' },
    { func: 'SET', collection: [seatId], property: 'display', value: '${seatNickname}' },
    { func: 'LABEL', label: [playerLabelId], value: `${playerNumber}` },
  ] as const;
};

const createResetSeatDisplayRoutine = (seatId: string, playerLabelId: string, playerNumber: number) => [
  { func: 'SET', collection: [seatId], property: 'player', value: '' },
  { func: 'SET', collection: [seatId], property: 'tableNickname', value: '' },
  { func: 'SET', collection: [seatId], property: 'display', value: 'playerName' },
  { func: 'SET', collection: [seatId], property: 'color', value: EMPTY_SEAT_COLOR },
  { func: 'LABEL', label: [playerLabelId], value: `${playerNumber}` },
  ...createResetPrivatePeekRoutine(playerNumber),
] as const;

/**
 * The nickname is presentation-only. Native Seat.click still writes the real ${playerName}
 * into seat.player, preserving ownership, linked Seat visibility and one-player-one-seat safety.
 */
export const createSafeSeatClickRoutine = (seatId: string, playerLabelId: string) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY player OF ${seatId}}`,
    relation: '==',
    operand2: '${playerName}',
    thenRoutine: [
      {
        func: 'INPUT',
        header: '修改桌内昵称',
        fields: [nicknameInputField(`\${PROPERTY tableNickname OF ${seatId}}`)],
      },
      ...createApplyNicknameRoutine(seatId, playerLabelId),
    ],
    elseRoutine: [
      {
        func: 'IF',
        operand1: `\${PROPERTY player OF ${seatId}}`,
        relation: '!=',
        operand2: '',
        thenRoutine: [
          {
            func: 'INPUT',
            header: '座位已被占用',
            fields: [{ type: 'text', label: '提示', value: '该座位已有玩家。' }],
            block: false,
          },
        ],
        elseRoutine: [
          {
            func: 'SELECT',
            source: 'all',
            type: 'seat',
            property: 'player',
            relation: '==',
            value: '${playerName}',
            collection: 'myOccupiedSeats',
          },
          { func: 'COUNT', collection: 'myOccupiedSeats', variable: 'occupiedSeatCount' },
          {
            func: 'IF',
            operand1: '${occupiedSeatCount}',
            relation: '==',
            operand2: 0,
            thenRoutine: [
              {
                func: 'INPUT',
                header: '入座',
                fields: [nicknameInputField('${playerName}')],
              },
              ...createApplyNicknameRoutine(seatId, playerLabelId),
              { func: 'CLICK', collection: 'thisButton', mode: 'ignoreClickRoutine' },
            ],
            elseRoutine: [
              {
                func: 'INPUT',
                header: '无法入座',
                fields: [{ type: 'text', label: '提示', value: '你已经占用一个座位。' }],
                block: false,
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

/** Deprecated compatibility export; player modules must use createSafeSeatClickRoutine. */
export const safeSeatClickRoutine = createSafeSeatClickRoutine('seat-1', 'player-label-1');

export const createClearSeatRoutine = (seatId: string) => {
  const number = seatNumberFromId(seatId);
  return createResetSeatDisplayRoutine(seatId, `player-label-${number}`, number);
};

export const clearSeat1Routine = createClearSeatRoutine('seat-1');
export const clearSeat2Routine = createClearSeatRoutine('seat-2');
export const clearSeat3Routine = createClearSeatRoutine('seat-3');
export const clearSeat4Routine = createClearSeatRoutine('seat-4');

export const createLeaveSeatRoutine = (seatId: string) => {
  const number = seatNumberFromId(seatId);
  const resetRoutine = createResetSeatDisplayRoutine(seatId, `player-label-${number}`, number);

  return [
    {
      func: 'IF',
      operand1: `\${PROPERTY player OF ${seatId}}`,
      relation: '==',
      operand2: '${playerName}',
      thenRoutine: resetRoutine,
      elseRoutine: [
        {
          func: 'IF',
          operand1: '${PROPERTY player OF seat-1}',
          relation: '==',
          operand2: '${playerName}',
          thenRoutine: resetRoutine,
          elseRoutine: [
            {
              func: 'INPUT',
              header: '无法释放座位',
              fields: [{ type: 'text', label: '提示', value: '只有本座玩家或玩家 1（房主）可以释放该座位。' }],
              block: false,
            },
          ],
        },
      ],
    },
  ] as const;
};

export const leaveSeat1Routine = createLeaveSeatRoutine('seat-1');
export const leaveSeat2Routine = createLeaveSeatRoutine('seat-2');
export const leaveSeat3Routine = createLeaveSeatRoutine('seat-3');
export const leaveSeat4Routine = createLeaveSeatRoutine('seat-4');

export const clearAllSeatsRoutine = [
  {
    func: 'INPUT',
    header: '重置所有玩家座位？',
    fields: [{ type: 'text', text: `将清理全部 ${MAX_PLAYER_COUNT} 个座位、桌内昵称和私密查看状态，需要玩家重新入座。` }],
    block: true,
  },
  { func: 'SET', collection: seatIds, property: 'player', value: '' },
  { func: 'SET', collection: seatIds, property: 'tableNickname', value: '' },
  { func: 'SET', collection: seatIds, property: 'display', value: 'playerName' },
  { func: 'SET', collection: seatIds, property: 'color', value: EMPTY_SEAT_COLOR },
  ...Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => ({
    func: 'LABEL',
    label: [`player-label-${index + 1}`],
    value: `${index + 1}`,
  })),
  ...resetAllPrivatePeeksRoutine,
] as const;

// Extension point for future host-driven clearing of a selected Seat collection.
export const futureHostClearRoutine = [
  { func: 'SET', property: 'player', value: '' },
  { func: 'SET', property: 'tableNickname', value: '' },
  { func: 'SET', property: 'display', value: 'playerName' },
  { func: 'SET', property: 'color', value: EMPTY_SEAT_COLOR },
] as const;
