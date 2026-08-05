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
  { func: 'SET', collection: ['gen-page-1', 'general-library-title'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5', 'extra-card-composer-zone', 'extra-composer-title'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
  { func: 'INPUT', header: '主分类切换', fields: [{ type: 'text', label: '当前主分类', value: '🎴 武将牌库 (315张)：共 5 页，当前展示第 1 页 (68张)' }], block: false },
] as const;

export const selectExtrasTabRoutine = [
  { func: 'SET', collection: ['gen-page-1', 'gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5', 'general-library-title'], property: 'display', value: false },
  { func: 'SET', collection: ['extra-card-composer-zone', 'extra-composer-title'], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
  { func: 'INPUT', header: '主分类切换', fields: [{ type: 'text', label: '当前主分类', value: '🗡️ 附加扩展牌 (31张)：包含本局可选投递的装备与锦囊附加牌' }], block: false },
] as const;

export const switchGenAllRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
  { func: 'INPUT', header: '子分类切换', fields: [{ type: 'text', label: '选定分类', value: '全部武将 (315张)：切换至第 1 页' }], block: false },
] as const;

export const switchGenStdRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
  { func: 'INPUT', header: '子分类切换', fields: [{ type: 'text', label: '选定分类', value: '标准包武将 (25张)：已展于第 1 页' }], block: false },
] as const;

export const switchGenExpRoutine = [
  { func: 'SET', collection: ['gen-page-2'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-1', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '2 / 5' },
  { func: 'INPUT', header: '子分类切换', fields: [{ type: 'text', label: '选定分类', value: '扩展包武将集：已切换至扩展页 (第 2 页)' }], block: false },
] as const;

export const prevPageRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
  { func: 'INPUT', header: '翻页切换', fields: [{ type: 'text', label: '页码提示', value: '已切换至第 1 页' }], block: false },
] as const;

export const nextPageRoutine = [
  { func: 'SET', collection: ['gen-page-2'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-1', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '2 / 5' },
  { func: 'INPUT', header: '翻页切换', fields: [{ type: 'text', label: '页码提示', value: '已切换至第 2 页' }], block: false },
] as const;
