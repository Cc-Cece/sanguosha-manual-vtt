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

// Dormant extension point: deliberately not exposed by a button in phase one.
export const futureHostClearRoutine = [
  { func: 'SET', property: 'player', value: '' },
] as const;
