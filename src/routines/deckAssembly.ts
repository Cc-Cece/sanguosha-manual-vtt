export const assembleGeneralDeckRoutine = [
  { func: 'FLIP', holder: ['general-candidate-zone'], face: 0 },
  { func: 'MOVE', from: ['general-candidate-zone'], to: ['final-general-deck-zone'], count: 'all', face: 0 },
  { func: 'SHUFFLE', holder: ['final-general-deck-zone'], mode: 'true random' },
  { func: 'INPUT', header: '武将牌堆合成完成', fields: [{ type: 'text', label: '提示', value: '已将候选区武将盖回、合拢为专属武将牌堆并完成随机洗牌！' }], block: false },
] as const;

export const sendGeneralsToMainTableRoutine = [
  { func: 'MOVE', from: ['final-general-deck-zone'], to: ['general-reserve'], count: 'all' },
  { func: 'INPUT', header: '送入主桌成功', fields: [{ type: 'text', label: '提示', value: '编组的武将牌堆已送入主游戏桌武将备牌位！' }], block: false },
] as const;

export const assembleIdentityDeckRoutine = [
  { func: 'FLIP', holder: ['identity-composer-zone'], face: 0 },
  { func: 'MOVE', from: ['identity-composer-zone'], to: ['final-identity-deck-zone'], count: 'all', face: 0 },
  { func: 'SHUFFLE', holder: ['final-identity-deck-zone'], mode: 'true random' },
  { func: 'INPUT', header: '身份牌堆合成完成', fields: [{ type: 'text', label: '提示', value: '已将本局身份构成牌盖回、合拢为专属身份牌堆并完成随机洗牌！' }], block: false },
] as const;

export const sendIdentitiesToMainTableRoutine = [
  { func: 'MOVE', from: ['final-identity-deck-zone'], to: ['identity-reserve'], count: 'all' },
  { func: 'INPUT', header: '送入主桌成功', fields: [{ type: 'text', label: '提示', value: '编组的身份牌堆已送入主游戏桌身份备牌位！' }], block: false },
] as const;
