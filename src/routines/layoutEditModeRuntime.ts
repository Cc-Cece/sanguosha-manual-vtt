import {
  RECYCLE_SIZE_DOWN_BUTTON_ID,
  RECYCLE_SIZE_LABEL_ID,
  RECYCLE_SIZE_UP_BUTTON_ID,
} from '../layouts/shufflePanels.js';
import type { GameFile, RoutineStep } from '../types/vtt.js';
import { DRAW_PILE_PANEL_TITLE_ID } from '../widgets/drawPilePanel.js';

const MAX_PLAYER_COUNT = 12;

const componentScaleTargetIds = [
  ...Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => `player-module-${index + 1}`),
  'reserve-tray',
  'quick-shuffle-panel',
  'recycle-panel',
  'draw-pile-panel',
];

export const LAYOUT_EDIT_CONTROL_IDS = [
  ...componentScaleTargetIds.map(id => `component-scale-bar-${id}`),
  'global-card-scale-panel',
  RECYCLE_SIZE_DOWN_BUTTON_ID,
  RECYCLE_SIZE_LABEL_ID,
  RECYCLE_SIZE_UP_BUTTON_ID,
  DRAW_PILE_PANEL_TITLE_ID,
  'quick-shuffle-panel-title',
  'recycle-panel-title',
  'recycle-collect-group-title',
] as const;

const LOCK_LAYOUT_BUTTON_ID = 'lock-layout';
const UNLOCK_LAYOUT_BUTTON_ID = 'unlock-layout';

type PlainRecord = Record<string, unknown>;

function asRecord(value: unknown): PlainRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as PlainRecord
    : null;
}

function asRoutine(value: unknown): RoutineStep[] {
  return Array.isArray(value) ? value as RoutineStep[] : [];
}

function appendEditModeState(root: PlainRecord, buttonId: string, editMode: boolean): void {
  const button = asRecord(root[buttonId]);
  if (!button) return;

  button.clickRoutine = [
    ...asRoutine(button.clickRoutine),
    {
      func: 'SET',
      collection: [...LAYOUT_EDIT_CONTROL_IDS],
      property: 'display',
      value: editMode,
    },
    {
      func: 'SET',
      collection: [LOCK_LAYOUT_BUTTON_ID],
      property: 'display',
      value: editMode,
    },
    {
      func: 'SET',
      collection: [UNLOCK_LAYOUT_BUTTON_ID],
      property: 'display',
      value: !editMode,
    },
  ];
}

function updateHelpText(root: PlainRecord): void {
  const meta = asRecord(root._meta);
  const info = meta ? asRecord(meta.info) : null;
  if (!info || typeof info.helpText !== 'string') return;

  const line = '布局模式：房主点击“完成布局”后会隐藏组件缩放、全局牌大小、回收区尺寸和拖动提示等 B 类编辑控件；点击“编辑布局”可恢复。游戏操作与玩家私人手牌控件不会被隐藏。';
  if (!info.helpText.includes(line)) info.helpText += `\n${line}`;
}

/**
 * Turns layout locking into a visible edit-mode boundary for the host. Layout-only controls are
 * hidden after locking instead of merely becoming inert, while gameplay controls and private hand
 * controls remain untouched.
 */
export function applyLayoutEditModeRuntime<T extends GameFile>(game: T): T {
  const root = game as unknown as PlainRecord;
  const lockButton = asRecord(root[LOCK_LAYOUT_BUTTON_ID]);
  const unlockButton = asRecord(root[UNLOCK_LAYOUT_BUTTON_ID]);

  if (lockButton) {
    lockButton.text = '🔒 完成布局';
    lockButton.display = true;
  }
  if (unlockButton) {
    unlockButton.text = '🔓 编辑布局';
    unlockButton.display = false;
  }

  appendEditModeState(root, LOCK_LAYOUT_BUTTON_ID, false);
  appendEditModeState(root, UNLOCK_LAYOUT_BUTTON_ID, true);
  updateHelpText(root);

  return game;
}
