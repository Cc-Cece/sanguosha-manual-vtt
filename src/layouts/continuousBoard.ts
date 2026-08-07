import type { Bounds } from '../types/vtt.js';

// Keep the tested 3:2 board shape, but double both logical dimensions. VirtualTabletop fits the
// complete board at 1x, so existing widgets become relatively smaller in the overview while a
// player can zoom back into the original working scale. The established 1800x1200 main layout
// and library bounds intentionally stay unchanged inside this larger world.
export const BOARD = { width: 3600, height: 2400, safeMargin: 20 } as const;

export const MAIN_TABLE_BOUNDS: Bounds = { x: 0, y: 0, width: 1800, height: 1200 };
export const LIBRARY_TRAY_BOUNDS: Bounds = { x: 350, y: 80, width: 1100, height: 950 };

export const MODULE_SCALES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0] as const;
export type ModuleScale = (typeof MODULE_SCALES)[number];
