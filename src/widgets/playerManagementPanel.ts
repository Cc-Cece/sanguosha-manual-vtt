import { closeLastSeatRoutine, openNextSeatRoutine, scalePlayerModules100Routine, scalePlayerModules75Routine, scalePlayerModules90Routine } from '../routines/playerManagement.js';
import type { Widget } from '../types/vtt.js';
import { label, widget } from './factory.js';

export const togglePlayerMgmtPanelRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF player-mgmt-panel}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      { func: 'SET', collection: ['player-mgmt-panel'], property: 'display', value: false },
      { func: 'SET', collection: ['toggle-player-mgmt-btn'], property: 'text', value: '👥 玩家管理' },
    ],
    elseRoutine: [
      { func: 'SET', collection: ['player-mgmt-panel'], property: 'display', value: true },
      { func: 'SET', collection: ['toggle-player-mgmt-btn'], property: 'text', value: '🔽 收起面板' },
    ],
  },
] as const;

export function createPlayerManagementWidgets(): Widget[] {
  const parent = 'host-toolbar';
  return [
    widget('player-mgmt-panel', 'basic', {
      parent,
      x: 350,
      y: 56,
      width: 480,
      height: 90,
      display: false,
      movable: false,
      layer: 105,
      color: '#1a272be8',
      css: { border: '2px double #b5965b', borderRadius: '8px', boxShadow: '0 6px 20px #000c' },
    }),
    label('player-mgmt-title', '👥 4–12人 席位开放与全局缩放控制', 12, 8, 450, 'player-mgmt-panel', { display: false, layer: 106 }),

    widget('open-next-seat-btn', 'button', {
      parent: 'player-mgmt-panel',
      x: 12,
      y: 38,
      width: 110,
      height: 36,
      text: '＋ 增加席位',
      color: '#2b5746',
      css: { fontSize: '12px', color: '#fff', borderRadius: '6px', border: '1px solid #789b83' },
      clickRoutine: openNextSeatRoutine,
    }),

    widget('close-last-seat-btn', 'button', {
      parent: 'player-mgmt-panel',
      x: 130,
      y: 38,
      width: 110,
      height: 36,
      text: '－ 关闭空席',
      color: '#74322b',
      css: { fontSize: '12px', color: '#ffd0a0', borderRadius: '6px', border: '1px solid #9e4438' },
      clickRoutine: closeLastSeatRoutine,
    }),

    widget('scale-75-btn', 'button', {
      parent: 'player-mgmt-panel',
      x: 255,
      y: 38,
      width: 65,
      height: 36,
      text: '75%',
      color: '#203238',
      css: { fontSize: '12px', color: '#80d0ff', borderRadius: '6px' },
      clickRoutine: scalePlayerModules75Routine,
    }),

    widget('scale-90-btn', 'button', {
      parent: 'player-mgmt-panel',
      x: 328,
      y: 38,
      width: 65,
      height: 36,
      text: '90%',
      color: '#203238',
      css: { fontSize: '12px', color: '#80d0ff', borderRadius: '6px' },
      clickRoutine: scalePlayerModules90Routine,
    }),

    widget('scale-100-btn', 'button', {
      parent: 'player-mgmt-panel',
      x: 401,
      y: 38,
      width: 65,
      height: 36,
      text: '100%',
      color: '#203238',
      css: { fontSize: '12px', color: '#80d0ff', borderRadius: '6px' },
      clickRoutine: scalePlayerModules100Routine,
    }),
  ];
}
