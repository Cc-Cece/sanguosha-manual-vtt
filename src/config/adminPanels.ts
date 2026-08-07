import type { AdminPanel } from '../types/vtt.js';

export const ADMIN_PANELS: AdminPanel[] = [
  {
    id: 'draw-pile-audit',
    type: 'holderInspector',
    title: '摸牌堆审计',
    holder: 'draw-pile',
  },
];
