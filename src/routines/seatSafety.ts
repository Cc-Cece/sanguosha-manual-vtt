export const safeSeatClickRoutine = [
  { func: 'IF', operand1: '${PROPERTY player}', relation: '==', operand2: '${playerName}', thenRoutine: [
    { func: 'CLICK', collection: 'thisButton', mode: 'ignoreClickRoutine' },
  ], elseRoutine: [
    { func: 'IF', operand1: '${PROPERTY player}', relation: '!=', operand2: '', thenRoutine: [
      { func: 'INPUT', header: '座位已被占用', fields: [{ type: 'text', label: '提示', value: '座位已被占用' }], block: false },
    ], elseRoutine: [
      { func: 'SELECT', source: 'all', type: 'seat', property: 'player', relation: '==', value: '${playerName}', collection: 'myOccupiedSeats' },
      { func: 'COUNT', collection: 'myOccupiedSeats', variable: 'occupiedSeatCount' },
      { func: 'IF', operand1: '${occupiedSeatCount}', relation: '==', operand2: 0, thenRoutine: [
        { func: 'CLICK', collection: 'thisButton', mode: 'ignoreClickRoutine' },
      ], elseRoutine: [
        { func: 'INPUT', header: '无法入座', fields: [{ type: 'text', label: '提示', value: '你已经占用一个座位' }], block: false },
      ] },
    ] },
  ] },
] as const;

export const clearSeat1Routine = [{ func: 'SET', collection: ['seat-1'], property: 'player', value: '' }] as const;
export const clearSeat2Routine = [{ func: 'SET', collection: ['seat-2'], property: 'player', value: '' }] as const;
export const clearSeat3Routine = [{ func: 'SET', collection: ['seat-3'], property: 'player', value: '' }] as const;
export const clearSeat4Routine = [{ func: 'SET', collection: ['seat-4'], property: 'player', value: '' }] as const;

export const clearAllSeatsRoutine = [
  { func: 'INPUT', header: '重置所有玩家座位？', fields: [{ type: 'text', text: '将清理全部 4 个座位的占用玩家，需要玩家重新入座。' }], block: true },
  { func: 'SET', collection: ['seat-1', 'seat-2', 'seat-3', 'seat-4'], property: 'player', value: '' },
] as const;

// Extension point for seat resetting
export const futureHostClearRoutine = [
  { func: 'SET', property: 'player', value: '' },
] as const;

