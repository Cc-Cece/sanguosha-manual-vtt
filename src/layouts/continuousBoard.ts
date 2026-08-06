import type { Bounds } from '../types/vtt.js';

export const BOARD = { width: 1800, height: 1200, safeMargin: 20 } as const;

export const MAIN_TABLE_BOUNDS: Bounds = { x: 0, y: 0, width: 1800, height: 1200 };
export const LIBRARY_TRAY_BOUNDS: Bounds = { x: 350, y: 80, width: 1100, height: 950 };

export const MODULE_SCALES = [0.75, 0.9, 1.0, 1.15] as const;
export type ModuleScale = (typeof MODULE_SCALES)[number];
