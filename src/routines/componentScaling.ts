import type { RoutineStep } from '../types/vtt.js';

export const COMPONENT_SCALE_PERCENTS = [50, 75, 100, 125, 150, 200, 250, 300, 400] as const;
export const GLOBAL_CARD_SCALE_PERCENTS = [75, 100, 125, 150, 175, 200, 250] as const;

export function createScaleRoutine(widgetId: string, scaleValue: number): RoutineStep[] {
  return [
    {
      func: 'SET',
      collection: [widgetId],
      property: 'scale',
      value: scaleValue,
    },
  ];
}

export function createSecureModuleScaleRoutine(moduleNumber: number, scaleValue: number): RoutineStep[] {
  const targetId = `player-module-${moduleNumber}`;
  const seatId = `seat-${moduleNumber}`;
  return [
    {
      func: 'IF',
      operand1: `\${PROPERTY player OF ${seatId}}`,
      relation: '==',
      operand2: '${playerName}',
      thenRoutine: [
        { func: 'SET', collection: [targetId], property: 'scale', value: scaleValue },
      ],
      elseRoutine: [
        {
          func: 'IF',
          operand1: '${PROPERTY player OF seat-1}',
          relation: '==',
          operand2: '${playerName}',
          thenRoutine: [
            { func: 'SET', collection: [targetId], property: 'scale', value: scaleValue },
          ],
          elseRoutine: [
            { func: 'INPUT', header: '无法缩放组件', fields: [{ type: 'text', label: '提示', value: '只能缩放本人所属模块或由房主统一操作' }], block: false },
          ],
        },
      ],
    },
  ];
}
