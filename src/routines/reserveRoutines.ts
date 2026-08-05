export const allowAllGeneralsRoutine = [
  { func: 'SET', collection: ['gen-page-1', 'gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: true },
] as const;

export const banAllGeneralsRoutine = [
  { func: 'SET', collection: ['gen-page-1', 'gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
] as const;

export const selectAllExtrasRoutine = [
  { func: 'SET', collection: ['extra-card-composer-zone'], property: 'display', value: true },
] as const;

export const unselectAllExtrasRoutine = [
  { func: 'SET', collection: ['extra-card-composer-zone'], property: 'display', value: false },
] as const;

export const resetReserveDraftRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
] as const;

export const selectGeneralsTabRoutine = [
  { func: 'SET', collection: ['gen-page-1', 'general-library-title', 'nav-gen-all', 'nav-gen-std', 'nav-gen-feng', 'nav-gen-huo', 'nav-gen-lin', 'nav-gen-shan', 'nav-gen-yijiang', 'nav-gen-sp', 'nav-gen-other'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5', 'extra-card-composer-zone', 'extra-composer-title'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
] as const;

export const selectExtrasTabRoutine = [
  { func: 'SET', collection: ['gen-page-1', 'gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5', 'general-library-title', 'nav-gen-all', 'nav-gen-std', 'nav-gen-feng', 'nav-gen-huo', 'nav-gen-lin', 'nav-gen-shan', 'nav-gen-yijiang', 'nav-gen-sp', 'nav-gen-other'], property: 'display', value: false },
  { func: 'SET', collection: ['extra-card-composer-zone', 'extra-composer-title'], property: 'display', value: true },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
] as const;

export const switchGenAllRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
] as const;

export const switchGenStdRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 1' },
] as const;

export const switchGenExpRoutine = [
  { func: 'SET', collection: ['gen-page-2'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-1', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '2 / 5' },
] as const;

export const prevPageRoutine = [
  { func: 'SET', collection: ['gen-page-1'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-2', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '1 / 5' },
] as const;

export const nextPageRoutine = [
  { func: 'SET', collection: ['gen-page-2'], property: 'display', value: true },
  { func: 'SET', collection: ['gen-page-1', 'gen-page-3', 'gen-page-4', 'gen-page-5'], property: 'display', value: false },
  { func: 'LABEL', label: ['page-indicator'], value: '2 / 5' },
] as const;
