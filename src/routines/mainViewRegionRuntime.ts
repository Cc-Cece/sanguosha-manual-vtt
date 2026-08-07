import { MAIN_TABLE_BOUNDS } from '../layouts/continuousBoard.js';
import type { GameFile, RoutineStep } from '../types/vtt.js';
import { widget } from '../widgets/factory.js';

export const MAIN_VIEW_REGION_ID = 'main-view-region';
export const MAIN_VIEW_SIZE_PANEL_ID = 'main-view-size-panel';
export const MAIN_VIEW_SIZE_DOWN_ID = 'main-view-size-down';
export const MAIN_VIEW_SIZE_LABEL_ID = 'main-view-size-label';
export const MAIN_VIEW_SIZE_UP_ID = 'main-view-size-up';

const HOST_SEAT = 'seat-1';
const MAIN_VIEW_SIZE_PERCENTS = Array.from({ length: 16 }, (_, index) => 50 + index * 10);

type PlainRecord = Record<string, unknown>;
type Direction = 1 | -1;

function hostGuard(thenRoutine: RoutineStep[]): RoutineStep[] {
  return [
    {
      func: 'IF',
      operand1: `\${PROPERTY player OF ${HOST_SEAT}}`,
      relation: '==',
      operand2: '${playerName}',
      thenRoutine,
      elseRoutine: [
        {
          func: 'INPUT',
          header: '仅房主可设置主区域',
          fields: [{ type: 'text', text: '请由 seat-1 房主进入布局编辑模式后调整主区域。' }],
          block: false,
        },
      ],
    },
  ];
}

function regionScaleSteps(percent: number): RoutineStep[] {
  return [
    { func: 'SET', collection: [MAIN_VIEW_REGION_ID], property: 'mainViewRegionScalePercent', value: percent },
    { func: 'SET', collection: [MAIN_VIEW_REGION_ID], property: 'scale', value: percent / 100 },
    { func: 'SET', collection: [MAIN_VIEW_SIZE_LABEL_ID], property: 'text', value: `${percent}%` },
  ];
}

function regionScaleRoutine(direction: Direction): RoutineStep[] {
  const ordered = direction === 1 ? [...MAIN_VIEW_SIZE_PERCENTS] : [...MAIN_VIEW_SIZE_PERCENTS].reverse();

  const branch = (index: number): RoutineStep[] => {
    if (index >= ordered.length - 1) return regionScaleSteps(ordered[ordered.length - 1]);
    return [
      {
        func: 'IF',
        operand1: `\${PROPERTY mainViewRegionScalePercent OF ${MAIN_VIEW_REGION_ID}}`,
        relation: '==',
        operand2: ordered[index],
        thenRoutine: regionScaleSteps(ordered[index + 1]),
        elseRoutine: branch(index + 1),
      },
    ];
  };

  return hostGuard(branch(0));
}

function updateHelpText(root: PlainRecord): void {
  const meta = root._meta as PlainRecord | undefined;
  const info = meta?.info as PlainRecord | undefined;
  if (!info || typeof info.helpText !== 'string') return;

  const line = '主区域：房主在布局编辑模式下拖动 3:2 主区域边框并用“主区域大小”调整范围；玩家可使用屏幕右下角“🎯 主区域”按钮随时完整回到该区域，按钮可收起为小图标。进入房间时会自动对准主区域一次。';
  if (!info.helpText.includes(line)) info.helpText += `\n${line}`;
}

/**
 * Installs a host-defined 3:2 camera region. The region itself is shared room state, while the
 * camera button and camera movement are implemented locally by the VTT client through the generic
 * cameraRegion widget metadata.
 */
export function applyMainViewRegionRuntime<T extends GameFile>(game: T): T {
  const root = game as unknown as PlainRecord;

  root[MAIN_VIEW_REGION_ID] = widget(MAIN_VIEW_REGION_ID, 'basic', {
    ...MAIN_TABLE_BOUNDS,
    scale: 1,
    mainViewRegionScalePercent: 100,
    cameraRegion: true,
    cameraRegionPrimary: true,
    cameraRegionAutoFocus: true,
    cameraRegionLabel: '🎯 主区域',
    text: '主区域 3:2\n拖动边框定位',
    movable: true,
    layer: -1,
    color: '#0000',
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    css: {
      background: '#d5ad5510',
      border: '4px dashed #d7ad55',
      borderRadius: '16px',
      boxShadow: 'inset 0 0 0 2px #0005,0 0 16px #0008',
      color: '#f6df9d',
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: '38px',
      transformOrigin: 'top left',
    },
  });

  root[MAIN_VIEW_SIZE_PANEL_ID] = widget(MAIN_VIEW_SIZE_PANEL_ID, 'basic', {
    x: 1190,
    y: 14,
    width: 260,
    height: 56,
    movable: false,
    layer: 30,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    color: '#20252be8',
    css: { border: '1px solid #9b8152', borderRadius: '8px', boxShadow: '0 3px 9px #0008' },
  });

  root['main-view-size-title'] = widget('main-view-size-title', 'label', {
    parent: MAIN_VIEW_SIZE_PANEL_ID,
    x: 8,
    y: 5,
    width: 112,
    height: 46,
    text: '主区域大小\n保持 3:2',
    movable: false,
    fixedParent: true,
    css: { color: '#e9dcc0', fontSize: '11px', lineHeight: '19px', textAlign: 'center', fontWeight: '700' },
  });

  root[MAIN_VIEW_SIZE_DOWN_ID] = widget(MAIN_VIEW_SIZE_DOWN_ID, 'button', {
    parent: MAIN_VIEW_SIZE_PANEL_ID,
    x: 128,
    y: 13,
    width: 30,
    height: 30,
    text: '−',
    movable: false,
    fixedParent: true,
    clickRoutine: regionScaleRoutine(-1),
  });

  root[MAIN_VIEW_SIZE_LABEL_ID] = widget(MAIN_VIEW_SIZE_LABEL_ID, 'label', {
    parent: MAIN_VIEW_SIZE_PANEL_ID,
    x: 162,
    y: 13,
    width: 56,
    height: 30,
    text: '100%',
    movable: false,
    fixedParent: true,
    css: { color: '#f3dfa9', fontSize: '12px', lineHeight: '28px', textAlign: 'center', fontWeight: '700' },
  });

  root[MAIN_VIEW_SIZE_UP_ID] = widget(MAIN_VIEW_SIZE_UP_ID, 'button', {
    parent: MAIN_VIEW_SIZE_PANEL_ID,
    x: 222,
    y: 13,
    width: 30,
    height: 30,
    text: '+',
    movable: false,
    fixedParent: true,
    clickRoutine: regionScaleRoutine(1),
  });

  updateHelpText(root);
  return game;
}
