import type { Widget } from '../types/vtt.js';

export const RESERVE_ROW_CARD_STEP = 56;
export const RESERVE_ROW_DROP_OFFSET_X = 4;
export const RESERVE_ROW_DROP_OFFSET_Y = 5;

export function spreadRowZone(
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  parent: string,
  extraProperties?: Partial<Widget>,
  cardStep = RESERVE_ROW_CARD_STEP,
): Widget {
  return {
    id,
    type: 'holder',
    parent,
    x,
    y,
    width,
    height: 136,
    text,
    alignChildren: true,
    preventPiles: true,
    dropTarget: { type: 'card', reserveHomeHolder: id },
    dropOffsetX: RESERVE_ROW_DROP_OFFSET_X,
    dropOffsetY: RESERVE_ROW_DROP_OFFSET_Y,
    stackOffsetX: cardStep,
    stackOffsetY: 0,
    movable: false,
    color: '#162822d9',
    textColor: '#c8dbd3',
    css: { border: '1px solid #4a685b', borderRadius: '6px' },
    ...extraProperties,
  };
}
