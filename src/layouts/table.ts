import type { Bounds } from '../types/vtt.js';

export const TABLE = { width: 1800, height: 1200, safeMargin: 20 } as const;
export const MODULE_SIZE = { width: 520, height: 300 } as const;

export const PLAYER_MODULES: readonly Bounds[] = [
  { x: 640, y: 20, ...MODULE_SIZE },
  { x: 1260, y: 440, ...MODULE_SIZE },
  { x: 640, y: 880, ...MODULE_SIZE },
  { x: 20, y: 440, ...MODULE_SIZE },
];

export const CENTRAL_SAFE_ZONE: Bounds = { x: 590, y: 350, width: 620, height: 500 };
