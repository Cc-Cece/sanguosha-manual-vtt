import type { GameFile, RoutineStep, Widget } from '../types/vtt.js';

export const GENERAL_DISPLAY_STATE = {
  uprightFaceUp: 0,
  sidewaysFaceUp: 1,
  sidewaysFaceDown: 2,
  uprightFaceDown: 3,
} as const;

const setGeneralState = (
  state: number,
  rotation: number,
  activeFace: number,
): RoutineStep[] => [
  { func: 'SET', collection: 'thisButton', property: 'generalDisplayState', value: state },
  { func: 'SET', collection: 'thisButton', property: 'rotation', value: rotation },
  { func: 'SET', collection: 'thisButton', property: 'activeFace', value: activeFace },
];

/**
 * Four-state clockwise cycle for an in-use general card:
 * upright face-up -> sideways face-up -> sideways face-down -> upright face-down -> upright face-up.
 * Each click changes only one visual dimension, matching a physical tabletop card.
 */
export const generalDisplayCycleRoutine: RoutineStep[] = [
  {
    func: 'IF',
    operand1: '${PROPERTY generalDisplayState}',
    relation: '==',
    operand2: GENERAL_DISPLAY_STATE.uprightFaceUp,
    thenRoutine: setGeneralState(GENERAL_DISPLAY_STATE.sidewaysFaceUp, 90, 1),
    elseRoutine: [
      {
        func: 'IF',
        operand1: '${PROPERTY generalDisplayState}',
        relation: '==',
        operand2: GENERAL_DISPLAY_STATE.sidewaysFaceUp,
        thenRoutine: setGeneralState(GENERAL_DISPLAY_STATE.sidewaysFaceDown, 90, 0),
        elseRoutine: [
          {
            func: 'IF',
            operand1: '${PROPERTY generalDisplayState}',
            relation: '==',
            operand2: GENERAL_DISPLAY_STATE.sidewaysFaceDown,
            thenRoutine: setGeneralState(GENERAL_DISPLAY_STATE.uprightFaceDown, 0, 0),
            elseRoutine: setGeneralState(GENERAL_DISPLAY_STATE.uprightFaceUp, 0, 1),
          },
        ],
      },
    ],
  },
];

const resetGeneralCollectionSteps = (collection: string): RoutineStep[] => [
  { func: 'SET', collection, property: 'generalDisplayState', value: GENERAL_DISPLAY_STATE.uprightFaceUp },
  { func: 'SET', collection, property: 'rotation', value: 0 },
];

function appendResetToRoutine(routine: unknown, prefix: string): void {
  if (!Array.isArray(routine)) return;
  const collection = `${prefix}GeneralDisplayCards`;
  const alreadyInstalled = routine.some(step =>
    typeof step === 'object'
    && step !== null
    && (step as RoutineStep).func === 'SELECT'
    && (step as RoutineStep).collection === collection);
  if (alreadyInstalled) return;

  routine.push(
    {
      func: 'SELECT',
      source: 'all',
      type: 'card',
      property: 'reserveLibraryType',
      relation: '==',
      value: 'general',
      collection,
    },
    ...resetGeneralCollectionSteps(collection),
  );
}

function addRotationAnimation(widget: Widget): void {
  const current = Array.isArray(widget.animatePropertyChange)
    ? [...widget.animatePropertyChange]
    : [];
  const hasRotation = current.some(entry =>
    entry === 'rotation'
    || (typeof entry === 'object' && entry !== null && (entry as Record<string, unknown>).property === 'rotation'));
  if (!hasRotation) current.push({ property: 'rotation', duration: 220 });
  widget.animatePropertyChange = current;
}

/**
 * Installs the persistent visual state fields and lifecycle resets after all reserve cards and
 * controllers have been generated. This keeps draft Allow/Ban behavior separate from in-use
 * display cycling and guarantees that returning or resetting a general clears stale rotation.
 */
export function applyGeneralDisplayStateRuntime<T extends GameFile>(game: T): T {
  for (const value of Object.values(game)) {
    const widget = value as Widget;
    if (widget?.type !== 'card' || widget.reserveLibraryType !== 'general') continue;
    widget.generalDisplayState = GENERAL_DISPLAY_STATE.uprightFaceUp;
    widget.rotation = 0;
    addRotationAnimation(widget);
  }

  const generalReserve = game['general-reserve'] as Widget | undefined;
  if (generalReserve) {
    generalReserve.onEnter = {
      ...(generalReserve.onEnter as Record<string, unknown> | undefined),
      activeFace: 0,
      reserveState: 'reserved',
      clickable: false,
      generalDisplayState: GENERAL_DISPLAY_STATE.uprightFaceUp,
      rotation: 0,
    };
    generalReserve.onLeave = {
      ...(generalReserve.onLeave as Record<string, unknown> | undefined),
      activeFace: 1,
      reserveState: 'in-use',
      clickable: true,
      generalDisplayState: GENERAL_DISPLAY_STATE.uprightFaceUp,
      rotation: 0,
    };
  }

  const resetTable = game['reset-table'] as Widget | undefined;
  appendResetToRoutine(resetTable?.clickRoutine, 'resetTable');

  const reserveController = game['reserve-panel-controller'] as Widget | undefined;
  appendResetToRoutine(reserveController?.fullTableResetRoutine, 'fullReserveReset');

  const info = game._meta.info;
  const guide = '使用中的武将牌可连续点击循环：竖置正面 → 横置正面 → 横置背面 → 竖置背面 → 竖置正面；放回武将托盘或整桌重置时自动恢复。';
  if (!info.helpText.includes(guide)) info.helpText += `\n9. 武将展示：${guide}`;

  return game;
}
