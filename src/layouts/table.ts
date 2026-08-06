import type { Bounds } from '../types/vtt.js';

export const TABLE = { width: 1800, height: 1200, safeMargin: 20 } as const;
export const MODULE_SIZE = { width: 430, height: 260 } as const;
export const PLAYER_MODULES: readonly Bounds[] = [
  { x: 685, y: 90, ...MODULE_SIZE },
  { x: 1340, y: 390, ...MODULE_SIZE },
  // Keep the lower active module between the central play area, reserve tray and personal hand.
  { x: 800, y: 770, ...MODULE_SIZE },
  { x: 30, y: 390, ...MODULE_SIZE },
];
export const CENTRAL_SAFE_ZONE: Bounds = { x: 590, y: 350, width: 620, height: 410 };
export const RESERVE_TRAY: Bounds = { x: 30, y: 760, width: 630, height: 220 };
export const PERSONAL_HAND: Bounds = { x: 350, y: 1040, width: 1100, height: 135 };
