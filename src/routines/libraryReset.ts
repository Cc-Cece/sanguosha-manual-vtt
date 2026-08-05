export const clearCandidatesRoutine = [
  { func: 'FLIP', holder: ['general-candidate-zone', 'general-excluded-zone', 'general-staging-zone'], face: 0 },
  { func: 'RECALL', holder: ['general-reserve'], owned: true, inHolder: true },
  { func: 'INPUT', header: '候选区已清空', fields: [{ type: 'text', label: '提示', value: '候选区、排除区与暂存区的武将牌已重置归位。' }], block: false },
] as const;

export const resetDeckbuildingTableRoutine = [
  { func: 'INPUT', header: '重置编组桌？', fields: [{ type: 'text', text: '将重置候选区、身份构成区及未送出的编组牌堆。主游戏桌正在使用的卡牌不受影响。' }], block: true },
  { func: 'FLIP', holder: ['general-candidate-zone', 'general-excluded-zone', 'general-staging-zone', 'final-general-deck-zone', 'identity-composer-zone', 'final-identity-deck-zone'], face: 0 },
  { func: 'RECALL', holder: ['general-reserve', 'identity-reserve'], owned: true, inHolder: true },
  { func: 'INPUT', header: '编组桌重置完成', fields: [{ type: 'text', label: '提示', value: '编组桌各区域已恢复初始准备状态！' }], block: false },
] as const;
