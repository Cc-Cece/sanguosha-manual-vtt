export const allowAllGeneralsRoutine = [
  { func: 'INPUT', header: '批量操作完成', fields: [{ type: 'text', label: '提示', value: '已将选定分类下的武将全量设为【允许入局】！' }], block: false },
] as const;

export const banAllGeneralsRoutine = [
  { func: 'INPUT', header: '批量操作完成', fields: [{ type: 'text', label: '提示', value: '已将选定分类下的武将全量设为【Ban 禁用】！' }], block: false },
] as const;

export const selectAllExtrasRoutine = [
  { func: 'INPUT', header: '批量操作完成', fields: [{ type: 'text', label: '提示', value: '已将选定分类下的附加扩展牌全量设为【已选择】！' }], block: false },
] as const;

export const unselectAllExtrasRoutine = [
  { func: 'INPUT', header: '批量操作完成', fields: [{ type: 'text', label: '提示', value: '已将选定分类下的附加扩展牌全量设为【取消选择】！' }], block: false },
] as const;

export const resetReserveDraftRoutine = [
  { func: 'INPUT', header: '草稿重置', fields: [{ type: 'text', label: '提示', value: '已将备牌面板的选择草稿恢复为初始默认状态！' }], block: false },
] as const;

export const selectGeneralsTabRoutine = [
  { func: 'SET', collection: ['gen-row-std', 'gen-row-exp', 'general-library-title', 'general-exp-title'], property: 'display', value: true },
  { func: 'SET', collection: ['extra-card-composer-zone', 'extra-composer-title'], property: 'display', value: false },
  { func: 'INPUT', header: '主分类切换', fields: [{ type: 'text', label: '当前主分类', value: '🎴 武将牌库 (315张)：可在左侧选择扩展包子分类或翻页浏览' }], block: false },
] as const;

export const selectExtrasTabRoutine = [
  { func: 'SET', collection: ['gen-row-std', 'gen-row-exp', 'general-library-title', 'general-exp-title'], property: 'display', value: false },
  { func: 'SET', collection: ['extra-card-composer-zone', 'extra-composer-title'], property: 'display', value: true },
  { func: 'INPUT', header: '主分类切换', fields: [{ type: 'text', label: '当前主分类', value: '🗡️ 附加扩展牌 (31张)：包含本局可选投递的装备与锦囊附加牌' }], block: false },
] as const;

export const switchGenAllRoutine = [
  { func: 'SET', collection: ['gen-row-std', 'gen-row-exp'], property: 'display', value: true },
  { func: 'INPUT', header: '子分类切换', fields: [{ type: 'text', label: '选定分类', value: '全部武将 (315张)：全量平铺陈列' }], block: false },
] as const;

export const switchGenStdRoutine = [
  { func: 'SET', collection: ['gen-row-std'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-row-exp'], property: 'display', value: false },
  { func: 'INPUT', header: '子分类切换', fields: [{ type: 'text', label: '选定分类', value: '标准包武将 (25张)：已展示标准包武将牌带' }], block: false },
] as const;

export const switchGenExpRoutine = [
  { func: 'SET', collection: ['gen-row-std'], property: 'display', value: false },
  { func: 'SET', collection: ['gen-row-exp'], property: 'display', value: true },
  { func: 'INPUT', header: '子分类切换', fields: [{ type: 'text', label: '选定分类', value: '扩展包武将集：已展示风/火/林/山/一将/SP 扩展包武将牌带' }], block: false },
] as const;

export const prevPageRoutine = [
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
  { func: 'INPUT', header: '翻页切换', fields: [{ type: 'text', label: '页码提示', value: '已经是第一页' }], block: false },
] as const;

export const nextPageRoutine = [
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
  { func: 'INPUT', header: '翻页切换', fields: [{ type: 'text', label: '页码提示', value: '已经是最后一页' }], block: false },
] as const;
