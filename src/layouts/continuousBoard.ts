import type { Bounds } from '../types/vtt.js';

export const BOARD = { width: 2500, height: 1200, safeMargin: 40 } as const;

export const MAIN_TABLE_BOUNDS: Bounds = { x: 40, y: 30, width: 1420, height: 1140 };
export const TRANSITION_BOUNDS: Bounds = { x: 1470, y: 30, width: 60, height: 1140 };
export const LIBRARY_TABLE_BOUNDS: Bounds = { x: 1540, y: 30, width: 920, height: 1140 };

export const MODULE_SCALES = [0.75, 0.9, 1.0, 1.15] as const;
export type ModuleScale = (typeof MODULE_SCALES)[number];
