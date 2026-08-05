import type { Widget } from '../types/vtt.js';

export function spreadRowZone(
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  parent: string,
  extraProperties?: Partial<Widget>,
  cardStep = 56,
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
    stackOffsetX: cardStep,
    stackOffsetY: 0,
    movable: false,
    dropTarget: false,
    color: '#162822d9',
    textColor: '#c8dbd3',
    css: { border: '1px solid #4a685b', borderRadius: '6px' },
    ...extraProperties,
  };
}
