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
