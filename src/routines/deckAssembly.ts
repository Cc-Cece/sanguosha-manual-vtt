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

export const assembleExtraDeckRoutine = [
  { func: 'FLIP', holder: ['extra-card-composer-zone'], face: 0 },
  { func: 'MOVE', from: ['extra-card-composer-zone'], to: ['final-extra-deck-zone'], count: 'all', face: 0 },
  { func: 'SHUFFLE', holder: ['final-extra-deck-zone'], mode: 'true random' },
  { func: 'INPUT', header: '扩展牌堆合成完成', fields: [{ type: 'text', label: '提示', value: '已将扩展构成区卡牌盖回、合拢为专属扩展牌堆并完成随机洗牌！' }], block: false },
] as const;

export const importToReserveTrayRoutine = [
  { func: 'MOVE', from: ['final-general-deck-zone'], to: ['general-reserve'], count: 'all' },
  { func: 'MOVE', from: ['final-identity-deck-zone'], to: ['identity-reserve'], count: 'all' },
  { func: 'MOVE', from: ['final-extra-deck-zone'], to: ['extra-reserve'], count: 'all' },
  { func: 'SET', collection: ['reserve-prep-drawer'], property: 'display', value: false },
  { func: 'SET', collection: ['toggle-library-table'], property: 'text', value: '📦 全套备牌' },
  { func: 'INPUT', header: '备牌导入成功', fields: [{ type: 'text', label: '提示', value: '全套备牌方案已成功生成并精准导入主桌备牌托盘！' }], block: false },
] as const;

export const apply4PStandardPresetRoutine = [
  { func: 'INPUT', header: '方案加载成功', fields: [{ type: 'text', label: '已加载方案', value: '👑 4人标准局方案：标准包武将(25张) + 4人身份(1主1忠1反1内) + 标准主牌(104张)' }], block: false },
] as const;

export const applyJunzhengPresetRoutine = [
  { func: 'INPUT', header: '方案加载成功', fields: [{ type: 'text', label: '已加载方案', value: '⚔️ 军争全扩展方案：全扩展包武将 + 全身份牌 + 军争扩展主牌(156张)' }], block: false },
] as const;

export const apply2v2PresetRoutine = [
  { func: 'INPUT', header: '方案加载成功', fields: [{ type: 'text', label: '已加载方案', value: '🎯 2v2快捷方案：精选竞技武将堆 + 2v2 专属身份组合' }], block: false },
] as const;

export const saveCustomSchemeRoutine = [
  { func: 'INPUT', header: '方案保存成功', fields: [{ type: 'text', label: '自定义方案', value: '已将当前勾选与牌堆配置保存为你的专属自定义预设方案！' }], block: false },
] as const;
