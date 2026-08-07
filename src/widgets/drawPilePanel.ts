import type { GameFile, RoutineStep } from '../types/vtt.js';
import { label, widget } from './factory.js';

export const DRAW_PILE_PANEL_ID = 'draw-pile-panel';
export const DRAW_PILE_PANEL_TITLE_ID = 'draw-pile-panel-title';

export const DRAW_PILE_PANEL = {
  x: 718,
  y: 400,
  width: 130,
  height: 208,
} as const;

const DRAW_PILE_POSITION = { x: 17, y: 28 } as const;
const DRAW_PILE_BUTTON_POSITION = { x: 10, y: 174 } as const;
const DRAW_PILE_ANIMATION_POSITION = { x: 20, y: 34 } as const;
const DRAW_PILE_ANIMATION_COUNT = 6;

type PlainRecord = Record<string, unknown>;

function asRecord(value: unknown): PlainRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as PlainRecord
    : null;
}

function routineOf(root: PlainRecord, widgetId: string): RoutineStep[] | null {
  const target = asRecord(root[widgetId]);
  return target && Array.isArray(target.clickRoutine)
    ? target.clickRoutine as RoutineStep[]
    : null;
}

function appendSetMovable(root: PlainRecord, widgetId: string, movable: boolean): void {
  const routine = routineOf(root, widgetId);
  if (!routine) return;

  const alreadyPresent = routine.some(step =>
    step.func === 'SET'
    && step.property === 'movable'
    && step.value === movable
    && Array.isArray(step.collection)
    && step.collection.includes(DRAW_PILE_PANEL_ID));

  if (!alreadyPresent) {
    routine.push({
      func: 'SET',
      collection: [DRAW_PILE_PANEL_ID],
      property: 'movable',
      value: movable,
    });
  }
}

function appendPanelMove(root: PlainRecord, widgetId: string): void {
  const routine = routineOf(root, widgetId);
  if (!routine) return;

  const alreadyPresent = routine.some(step =>
    step.func === 'MOVEXY'
    && Array.isArray(step.from)
    && step.from.includes(DRAW_PILE_PANEL_ID));

  if (!alreadyPresent) {
    routine.push({
      func: 'MOVEXY',
      from: [DRAW_PILE_PANEL_ID],
      x: DRAW_PILE_PANEL.x,
      y: DRAW_PILE_PANEL.y,
    });
  }
}

function updateHelpText(root: PlainRecord): void {
  const meta = asRecord(root._meta);
  const info = meta ? asRecord(meta.info) : null;
  if (!info || typeof info.helpText !== 'string') return;

  const previous = '只有摸牌堆和个人手牌区始终固定；';
  const replacement = '摸牌堆面板也可在解锁布局后拖动，牌堆、洗牌按钮和动画会一起移动；只有个人手牌区始终固定；';

  if (info.helpText.includes(previous)) {
    info.helpText = info.helpText.replace(previous, replacement);
  } else if (!info.helpText.includes('摸牌堆面板也可在解锁布局后拖动')) {
    info.helpText += `\n${replacement}`;
  }
}

/**
 * Reparents the draw pile, its controls and animation proxies under one shared movable panel.
 * The holder itself remains immovable so dragging a card continues to mean drawing a card rather
 * than moving the whole pile. Layout locking only toggles the outer panel.
 */
export function applyMovableDrawPilePanel<T extends GameFile>(game: T): T {
  const root = game as unknown as PlainRecord;

  root[DRAW_PILE_PANEL_ID] = widget(DRAW_PILE_PANEL_ID, 'basic', {
    ...DRAW_PILE_PANEL,
    movable: true,
    layer: 2,
    color: '#10241ee8',
    css: {
      border: '2px solid #789b83',
      borderRadius: '9px',
      boxShadow: '0 4px 12px #0008',
    },
  });

  root[DRAW_PILE_PANEL_TITLE_ID] = label(
    DRAW_PILE_PANEL_TITLE_ID,
    '⠿ 拖动摸牌堆',
    5,
    2,
    120,
    DRAW_PILE_PANEL_ID,
    {
      height: 22,
      css: {
        color: '#d8eee4',
        fontSize: '11px',
        lineHeight: '20px',
        textAlign: 'center',
        fontWeight: '700',
        'pointer-events': 'none',
      },
    },
  );

  const drawPile = asRecord(root['draw-pile']);
  if (drawPile) {
    drawPile.parent = DRAW_PILE_PANEL_ID;
    drawPile.x = DRAW_PILE_POSITION.x;
    drawPile.y = DRAW_PILE_POSITION.y;
    drawPile.movable = false;
    drawPile.fixedParent = true;
  }

  for (const buttonId of ['shuffle-draw-pile-btn', 'request-shuffle-draw-pile-btn']) {
    const button = asRecord(root[buttonId]);
    if (!button) continue;
    button.parent = DRAW_PILE_PANEL_ID;
    button.x = DRAW_PILE_BUTTON_POSITION.x;
    button.y = DRAW_PILE_BUTTON_POSITION.y;
    button.width = 110;
    button.height = 28;
    button.movable = false;
    button.fixedParent = true;
  }

  for (let index = 0; index < DRAW_PILE_ANIMATION_COUNT; index += 1) {
    const animation = asRecord(root[`shuffle-animation-draw-pile-${index + 1}`]);
    if (!animation) continue;
    animation.parent = DRAW_PILE_PANEL_ID;
    animation.x = DRAW_PILE_ANIMATION_POSITION.x + (index % 3);
    animation.y = DRAW_PILE_ANIMATION_POSITION.y - Math.floor(index / 2);
  }

  appendSetMovable(root, 'lock-layout', false);
  appendSetMovable(root, 'unlock-layout', true);
  appendPanelMove(root, 'arrange-layout');
  appendPanelMove(root, 'reset-table');
  updateHelpText(root);

  return game;
}
