import type { Widget } from '../types/vtt.js';
import { widget } from './factory.js';

export const updateSummaryRoutine = [
  // 1. 注册自定义属性给 Validator 识别
  { func: 'GET', collection: ['card-1'], property: 'reserveCategoryId', variable: 'dummyCat' },
  { func: 'GET', collection: ['card-1'], property: 'reserveDefaultSelected', variable: 'dummyDef' },
  { func: 'GET', collection: ['card-1'], property: 'reserveHomeHolder', variable: 'dummyHome' },
  { func: 'GET', collection: ['card-1'], property: 'reserveHomeIndex', variable: 'dummyIndex' },

  // 2. 武将牌汇总
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'general', collection: 'allGenerals' },
  { func: 'COUNT', collection: 'allGenerals', variable: 'totalGenerals' },
  { func: 'SELECT', source: 'allGenerals', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'allowedGenerals' },
  { func: 'COUNT', collection: 'allowedGenerals', variable: 'allowedGeneralsCount' },

  // 3. 附加牌汇总
  { func: 'SELECT', source: 'all', type: 'card', property: 'reserveLibraryType', relation: '==', value: 'extra', collection: 'allExtras' },
  { func: 'COUNT', collection: 'allExtras', variable: 'totalExtras' },
  { func: 'SELECT', source: 'allExtras', type: 'card', property: 'reserveSelected', relation: '==', value: true, collection: 'selectedExtras' },
  { func: 'COUNT', collection: 'selectedExtras', variable: 'selectedExtrasCount' },

  // 4. 更新摘要 Label
  { func: 'LABEL', label: ['summary-generals-count'], value: '${allowedGeneralsCount} / ${totalGenerals}' },
  { func: 'LABEL', label: ['summary-extras-count'], value: '${selectedExtrasCount} / ${totalExtras}' },
] as const;

export function createReservePanelControllerWidget(): Widget {
  return widget('reserve-panel-controller', 'basic', {
    display: false,
    movable: false,
    updateSummaryRoutine,
  });
}
