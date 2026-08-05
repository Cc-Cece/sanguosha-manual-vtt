export const toggleReserveCardRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY reserveSelected}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: false },
      { func: 'SET', collection: 'thisButton', property: 'css', value: { border: '3px solid #e04030', opacity: 0.45, filter: 'grayscale(0.8)' } },
    ],
    elseRoutine: [
      { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: true },
      { func: 'SET', collection: 'thisButton', property: 'css', value: { border: '3px solid #50e080', opacity: 1.0, filter: 'none' } },
    ],
  },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
] as const;
