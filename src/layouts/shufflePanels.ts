export const QUICK_SHUFFLE_PANEL_ID = 'quick-shuffle-panel';
export const RECYCLE_PANEL_ID = 'recycle-panel';
export const RECYCLE_COLLECT_GROUP_ID = 'recycle-collect-group';
export const RECYCLE_SIZE_LABEL_ID = 'recycle-size-label';
export const RECYCLE_SIZE_DOWN_BUTTON_ID = 'recycle-size-down-btn';
export const RECYCLE_SIZE_UP_BUTTON_ID = 'recycle-size-up-btn';

export const QUICK_SHUFFLE_PANEL = {
  x: 565,
  y: 380,
  width: 145,
  height: 244,
} as const;

export const RECYCLE_PANEL_POSITION = {
  x: 875,
  y: 380,
} as const;

export const RECYCLE_ZONE_OFFSET = {
  x: 8,
  y: 30,
} as const;

export const RECYCLE_COLLECT_GROUP_DEFAULT_POSITION = {
  x: 8,
  y: 28,
} as const;

export interface RecycleAreaSize {
  percent: 100 | 125 | 150 | 200;
  zoneWidth: number;
  zoneHeight: number;
  panelWidth: number;
  panelHeight: number;
  actionButtonY: number;
}

export const RECYCLE_AREA_SIZES: readonly RecycleAreaSize[] = [
  { percent: 100, zoneWidth: 270, zoneHeight: 182, panelWidth: 286, panelHeight: 250, actionButtonY: 216 },
  { percent: 125, zoneWidth: 338, zoneHeight: 228, panelWidth: 354, panelHeight: 296, actionButtonY: 262 },
  { percent: 150, zoneWidth: 405, zoneHeight: 273, panelWidth: 421, panelHeight: 341, actionButtonY: 307 },
  { percent: 200, zoneWidth: 540, zoneHeight: 364, panelWidth: 556, panelHeight: 432, actionButtonY: 398 },
] as const;

export const DEFAULT_RECYCLE_AREA_SIZE = RECYCLE_AREA_SIZES[0];
