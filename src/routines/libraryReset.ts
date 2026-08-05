import type { RoutineStep } from '../types/vtt.js';

/** Compatibility routine for older buttons. The active reserve controller owns the real reset. */
export const clearCandidatesRoutine: RoutineStep[] = [
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'fullTableResetRoutine' },
];

/** Compatibility routine for older imports. No historical candidate/final-deck holders are used. */
export const resetDeckbuildingTableRoutine: RoutineStep[] = [
  { func: 'INPUT', header: '重置备牌草稿？', fields: [{ type: 'text', text: '将恢复全部武将与扩展牌的默认选择。' }], block: true },
  { func: 'CALL', widget: 'reserve-panel-controller', routine: 'fullTableResetRoutine' },
];
