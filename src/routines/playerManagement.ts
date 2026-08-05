import { playerModuleIds } from '../config/playerCapacity.js';

export const openNextSeatRoutine = [
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 5; // Modules 5 to 12
    const moduleId = `player-module-${n}`;
    return {
      func: 'IF',
      operand1: `\${PROPERTY display OF ${moduleId}}`,
      relation: '==',
      operand2: false,
      thenRoutine: [
        { func: 'SET', collection: [moduleId], property: 'display', value: true },
        { func: 'INPUT', header: '席位已开放', fields: [{ type: 'text', label: '提示', value: `已成功开放玩家 ${n} 席位！` }], block: false },
      ],
    };
  }),
] as const;

export const closeLastSeatRoutine = [
  ...Array.from({ length: 8 }, (_, i) => {
    const n = 12 - i; // Modules 12 down to 5
    const moduleId = `player-module-${n}`;
    const seatId = `seat-${n}`;
    return {
      func: 'IF',
      operand1: `\${PROPERTY display OF ${moduleId}}`,
      relation: '==',
      operand2: true,
      thenRoutine: [
        {
          func: 'IF',
          operand1: `\${PROPERTY player OF ${seatId}}`,
          relation: '==',
          operand2: '',
          thenRoutine: [
            { func: 'SET', collection: [moduleId], property: 'display', value: false },
            { func: 'INPUT', header: '席位已关闭', fields: [{ type: 'text', label: '提示', value: `已成功关闭玩家 ${n} 席位！` }], block: false },
          ],
          elseRoutine: [
            { func: 'INPUT', header: '无法关闭席位', fields: [{ type: 'text', label: '原因', value: `玩家 ${n} 席位当前仍有玩家在座，请离座后再关闭！` }], block: false },
          ],
        },
      ],
    };
  }),
] as const;

export const scalePlayerModules75Routine = [
  { func: 'SET', collection: playerModuleIds(12), property: 'scale', value: 0.75 },
  { func: 'INPUT', header: '全局缩放调节', fields: [{ type: 'text', label: '当前比例', value: '已将全部玩家模块统一缩放至 75%！' }], block: false },
] as const;

export const scalePlayerModules90Routine = [
  { func: 'SET', collection: playerModuleIds(12), property: 'scale', value: 0.9 },
  { func: 'INPUT', header: '全局缩放调节', fields: [{ type: 'text', label: '当前比例', value: '已将全部玩家模块统一缩放至 90%！' }], block: false },
] as const;

export const scalePlayerModules100Routine = [
  { func: 'SET', collection: playerModuleIds(12), property: 'scale', value: 1.0 },
  { func: 'INPUT', header: '全局缩放调节', fields: [{ type: 'text', label: '当前比例', value: '已将全部玩家模块统一恢复至 100% 原始尺寸！' }], block: false },
] as const;
