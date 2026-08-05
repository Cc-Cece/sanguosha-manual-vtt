import type { Widget } from '../types/vtt.js';

export interface ScaledBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  visualWidth: number;
  visualHeight: number;
  right: number;
  bottom: number;
}

export function getScaledBounds(widget: Widget): ScaledBounds {
  const x = widget.x ?? 0;
  const y = widget.y ?? 0;
  const width = widget.width ?? 0;
  const height = widget.height ?? 0;
  const scale = (widget as any).scale ?? 1.0;
  const visualWidth = width * scale;
  const visualHeight = height * scale;
  return {
    x,
    y,
    width,
    height,
    scale,
    visualWidth,
    visualHeight,
    right: x + visualWidth,
    bottom: y + visualHeight,
  };
}

export function isOverlappingScaled(a: ScaledBounds, b: ScaledBounds): boolean {
  return !(a.right <= b.x || a.x >= b.right || a.bottom <= b.y || a.y >= b.bottom);
}
