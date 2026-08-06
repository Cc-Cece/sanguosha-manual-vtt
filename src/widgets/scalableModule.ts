import type { Widget } from '../types/vtt.js';
import { widget } from './factory.js';

export function scalableModule(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  initialScale = 1.0,
  extraProperties: Omit<Widget, 'id' | 'type' | 'x' | 'y' | 'width' | 'height'> = {}
): Widget {
  return widget(id, 'basic', {
    x,
    y,
    width,
    height,
    movable: true,
    scale: initialScale,
    css: {
      transformOrigin: 'top left',
      ...(extraProperties.css ?? {}),
    },
    ...extraProperties,
  });
}
