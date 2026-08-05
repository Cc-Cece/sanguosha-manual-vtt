import type { Bounds } from '../types/vtt.js';

export const BOARD = { width: 3600, height: 1400, safeMargin: 60 } as const;

export const MAIN_TABLE_BOUNDS: Bounds = { x: 80, y: 80, width: 1680, height: 1240 };
export const TRANSITION_BOUNDS: Bounds = { x: 1760, y: 80, width: 140, height: 1240 };
export const LIBRARY_TABLE_BOUNDS: Bounds = { x: 1900, y: 80, width: 1620, height: 1240 };

export const MODULE_SCALES = [0.75, 0.9, 1.0, 1.15] as const;
export type ModuleScale = (typeof MODULE_SCALES)[number];
