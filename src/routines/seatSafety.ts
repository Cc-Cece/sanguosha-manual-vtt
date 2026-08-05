const EMPTY_SEAT_COLOR = '#6d2922';
const CURRENT_SEAT_COUNT = 4;

const nicknameInputField = (value: string) => ({
  type: 'string',
  label: '桌内昵称',
  variable: 'seatNickname',
  value,
  regex: '^.{1,10}$',
  regexHint: '请输入 1–10 个字符。昵称只用于本桌显示。',
});

const createApplyNicknameRoutine = (seatId: string, playerLabelId: string) => [
  { func: 'SET', collection: [seatId], property: 'tableNickname', value: '${seatNickname}' },
  { func: 'SET', collection: [seatId], property: 'display', value: '${seatNickname}' },
  { func: 'LABEL', label: [playerLabelId], value: '☰ ${seatNickname}' },
] as const;

const createResetSeatDisplayRoutine = (seatId: string, playerLabelId: string, playerNumber: number) => [
  { func: 'SET', collection: [seatId], property: 'player', value: '' },
  { func: 'SET', collection: [seatId], property: 'tableNickname', value: '' },
  { func: 'SET', collection: [seatId], property: 'display', value: 'playerName' },
  { func: 'SET', collection: [seatId], property: 'color', value: EMPTY_SEAT_COLOR },
  { func: 'LABEL', label: [playerLabelId], value: `☰ 玩家 ${playerNumber}` },
] as const;

/**
 * Seat click behavior:
 * - empty seat: validate one-player-one-seat, ask for a table-local nickname, then use the
 *   native Seat click to bind the real ${playerName};
 * - own seat: edit only the table-local nickname;
 * - occupied by somebody else: refuse the action.
 *
 * tableNickname/display are presentation-only. The seat.player property must always remain the
 * real VirtualTabletop playerName so hand ownership, linkedToSeat and private visibility continue
 * to work correctly.
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
          { func: 'INPUT', header: '座位已被占用', fields: [{ type: 'text', label: '提示', value: '该座位已有玩家。' }], block: false },
        ],
        elseRoutine: [
          { func: 'SELECT', source: 'all', type: 'seat', property: 'player', relation: '==', value: '${playerName}', collection: 'myOccupiedSeats' },
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
              { func: 'INPUT', header: '无法入座', fields: [{ type: 'text', label: '提示', value: '你已经占用一个座位。' }], block: false },
            ],
          },
        ],
      },
    ],
  },
] as const;

export const createClearSeatRoutine = (seatId: string, playerLabelId: string, playerNumber: number) =>
  createResetSeatDisplayRoutine(seatId, playerLabelId, playerNumber);

export const clearSeat1Routine = createClearSeatRoutine('seat-1', 'player-label-1', 1);
export const clearSeat2Routine = createClearSeatRoutine('seat-2', 'player-label-2', 2);
export const clearSeat3Routine = createClearSeatRoutine('seat-3', 'player-label-3', 3);
export const clearSeat4Routine = createClearSeatRoutine('seat-4', 'player-label-4', 4);

export const createLeaveSeatRoutine = (seatId: string, playerLabelId: string, playerNumber: number) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY player OF ${seatId}}`,
    relation: '==',
    operand2: '${playerName}',
    thenRoutine: createResetSeatDisplayRoutine(seatId, playerLabelId, playerNumber),
    elseRoutine: [
      {
        func: 'IF',
        operand1: '${PROPERTY player OF seat-1}',
        relation: '==',
        operand2: '${playerName}',
        thenRoutine: createResetSeatDisplayRoutine(seatId, playerLabelId, playerNumber),
        elseRoutine: [
          { func: 'INPUT', header: '无法释放座位', fields: [{ type: 'text', label: '提示', value: '只有本座玩家或玩家 1（房主）可以释放该座位。' }], block: false },
        ],
      },
    ],
  },
] as const;

export const leaveSeat1Routine = createLeaveSeatRoutine('seat-1', 'player-label-1', 1);
export const leaveSeat2Routine = createLeaveSeatRoutine('seat-2', 'player-label-2', 2);
export const leaveSeat3Routine = createLeaveSeatRoutine('seat-3', 'player-label-3', 3);
export const leaveSeat4Routine = createLeaveSeatRoutine('seat-4', 'player-label-4', 4);

const currentSeatIds = Array.from({ length: CURRENT_SEAT_COUNT }, (_, index) => `seat-${index + 1}`);

export const clearAllSeatsRoutine = [
  { func: 'INPUT', header: '重置所有玩家座位？', fields: [{ type: 'text', text: `将清理全部 ${CURRENT_SEAT_COUNT} 个座位的占用玩家和桌内昵称，需要玩家重新入座。` }], block: true },
  { func: 'SET', collection: currentSeatIds, property: 'player', value: '' },
  { func: 'SET', collection: currentSeatIds, property: 'tableNickname', value: '' },
  { func: 'SET', collection: currentSeatIds, property: 'display', value: 'playerName' },
  { func: 'SET', collection: currentSeatIds, property: 'color', value: EMPTY_SEAT_COLOR },
  ...Array.from({ length: CURRENT_SEAT_COUNT }, (_, index) => ({
    func: 'LABEL',
    label: [`player-label-${index + 1}`],
    value: `☰ 玩家 ${index + 1}`,
  })),
] as const;

// Extension point for future host-driven clearing of a selected Seat collection.
export const futureHostClearRoutine = [
  { func: 'SET', property: 'player', value: '' },
  { func: 'SET', property: 'tableNickname', value: '' },
  { func: 'SET', property: 'display', value: 'playerName' },
  { func: 'SET', property: 'color', value: EMPTY_SEAT_COLOR },
] as const;
