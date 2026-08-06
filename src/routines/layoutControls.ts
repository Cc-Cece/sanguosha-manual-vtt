import {
  DEFAULT_RECYCLE_AREA_SIZE,
  QUICK_SHUFFLE_PANEL,
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_AREA_SIZES,
  RECYCLE_COLLECT_GROUP_DEFAULT_POSITION,
  RECYCLE_COLLECT_GROUP_ID,
  RECYCLE_PANEL_ID,
  RECYCLE_PANEL_POSITION,
  RECYCLE_SIZE_DOWN_BUTTON_ID,
  RECYCLE_SIZE_LABEL_ID,
  RECYCLE_SIZE_UP_BUTTON_ID,
  type RecycleAreaSize,
} from '../layouts/shufflePanels.js';
import type { RoutineStep } from '../types/vtt.js';

const movableLayoutIds = Array.from({ length: 12 }, (_, index) => `player-module-${index + 1}`).concat([
  'reserve-tray',
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_PANEL_ID,
  RECYCLE_COLLECT_GROUP_ID,
]);

const setupIds = ['player-mgmt-panel', 'reserve-prep-drawer'];
const sizeControlIds = [RECYCLE_SIZE_DOWN_BUTTON_ID, RECYCLE_SIZE_UP_BUTTON_ID];

function recycleAreaSizeSteps(size: RecycleAreaSize): RoutineStep[] {
  return [
    { func: 'SET', collection: [RECYCLE_PANEL_ID], property: 'recycleSizePercent', value: size.percent },
    { func: 'SET', collection: [RECYCLE_PANEL_ID], property: 'width', value: size.panelWidth },
    { func: 'SET', collection: [RECYCLE_PANEL_ID], property: 'height', value: size.panelHeight },
    { func: 'SET', collection: ['recycle-zone'], property: 'width', value: size.zoneWidth },
    { func: 'SET', collection: ['recycle-zone'], property: 'height', value: size.zoneHeight },
    { func: 'SET', collection: ['recycle-shuffle-btn', 'request-shuffle-recycle-btn'], property: 'y', value: size.actionButtonY },
    { func: 'SET', collection: [RECYCLE_SIZE_LABEL_ID], property: 'text', value: `${size.percent}%` },
  ];
}

const size100 = RECYCLE_AREA_SIZES[0];
const size125 = RECYCLE_AREA_SIZES[1];
const size150 = RECYCLE_AREA_SIZES[2];
const size200 = RECYCLE_AREA_SIZES[3];

export const increaseRecycleAreaRoutine: RoutineStep[] = [
  {
    func: 'IF',
    operand1: '${PROPERTY recycleSizePercent OF recycle-panel}',
    relation: '==',
    operand2: 100,
    thenRoutine: recycleAreaSizeSteps(size125),
    elseRoutine: [
      {
        func: 'IF',
        operand1: '${PROPERTY recycleSizePercent OF recycle-panel}',
        relation: '==',
        operand2: 125,
        thenRoutine: recycleAreaSizeSteps(size150),
        elseRoutine: recycleAreaSizeSteps(size200),
      },
    ],
  },
];

export const decreaseRecycleAreaRoutine: RoutineStep[] = [
  {
    func: 'IF',
    operand1: '${PROPERTY recycleSizePercent OF recycle-panel}',
    relation: '==',
    operand2: 200,
    thenRoutine: recycleAreaSizeSteps(size150),
    elseRoutine: [
      {
        func: 'IF',
        operand1: '${PROPERTY recycleSizePercent OF recycle-panel}',
        relation: '==',
        operand2: 150,
        thenRoutine: recycleAreaSizeSteps(size125),
        elseRoutine: recycleAreaSizeSteps(size100),
      },
    ],
  },
];

export const lockLayoutRoutine: RoutineStep[] = [
  { func: 'SET', collection: movableLayoutIds, property: 'movable', value: false },
  { func: 'SET', collection: setupIds, property: 'movable', value: false },
  { func: 'SET', collection: sizeControlIds, property: 'clickable', value: false },
];

export const unlockLayoutRoutine: RoutineStep[] = [
  { func: 'SET', collection: movableLayoutIds, property: 'movable', value: true },
  { func: 'SET', collection: setupIds, property: 'movable', value: true },
  { func: 'SET', collection: sizeControlIds, property: 'clickable', value: true },
  { func: 'SET', collection: ['draw-pile', 'personal-hand'], property: 'movable', value: false },
];

export const arrangeLayoutRoutine: RoutineStep[] = [
  ...Array.from({ length: 12 }, (_, index) => ({
    func: 'MOVEXY',
    from: [`player-module-${index + 1}`],
    x: 40 + (index % 4) * 440,
    y: 90 + Math.floor(index / 4) * 270,
  } as RoutineStep)),
  { func: 'MOVEXY', from: ['reserve-tray'], x: 640, y: 900 },
  { func: 'MOVEXY', from: [QUICK_SHUFFLE_PANEL_ID], x: QUICK_SHUFFLE_PANEL.x, y: QUICK_SHUFFLE_PANEL.y },
  { func: 'MOVEXY', from: [RECYCLE_PANEL_ID], x: RECYCLE_PANEL_POSITION.x, y: RECYCLE_PANEL_POSITION.y },
  {
    func: 'MOVEXY',
    from: [RECYCLE_COLLECT_GROUP_ID],
    x: RECYCLE_COLLECT_GROUP_DEFAULT_POSITION.x,
    y: RECYCLE_COLLECT_GROUP_DEFAULT_POSITION.y,
  },
  ...recycleAreaSizeSteps(DEFAULT_RECYCLE_AREA_SIZE),
  { func: 'SET', collection: ['draw-pile', 'personal-hand'], property: 'movable', value: false },
];
