import { describe, expect, it } from 'vitest';
import { MAIN_TABLE_BOUNDS } from '../src/layouts/continuousBoard.js';
import {
  MAIN_VIEW_REGION_ID,
  MAIN_VIEW_SIZE_PANEL_ID,
} from '../src/routines/mainViewRegionRuntime.js';
import { LAYOUT_EDIT_CONTROL_IDS } from '../src/routines/layoutEditModeRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

const serialized = (value: unknown): string => JSON.stringify(value);

describe('host-defined main camera region', () => {
  it('starts on the established 3:2 main table and exposes generic camera metadata', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const region = game[MAIN_VIEW_REGION_ID] as Record<string, unknown>;

    expect(region).toMatchObject({
      ...MAIN_TABLE_BOUNDS,
      scale: 1,
      mainViewRegionScalePercent: 100,
      cameraRegion: true,
      cameraRegionPrimary: true,
      cameraRegionAutoFocus: true,
      cameraRegionLabel: '🎯 主区域',
      movable: true,
      onlyVisibleForSeat: ['seat-1'],
      linkedToSeat: ['seat-1'],
    });
    expect((region.width as number) / (region.height as number)).toBe(1.5);
  });

  it('keeps host sizing on a fixed 3:2 scale ladder from 50 to 200 percent', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const down = serialized((game['main-view-size-down'] as Record<string, unknown>).clickRoutine);
    const up = serialized((game['main-view-size-up'] as Record<string, unknown>).clickRoutine);
    const routines = down + up;

    expect(game[MAIN_VIEW_SIZE_PANEL_ID]).toMatchObject({
      onlyVisibleForSeat: ['seat-1'],
      linkedToSeat: ['seat-1'],
    });
    for (let percent = 50; percent <= 200; percent += 10) {
      expect(routines).toContain(`"value":${percent}`);
      expect(routines).toContain(`"value":${percent / 100}`);
    }
  });

  it('treats the region outline and host size panel as layout-only controls', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const lock = serialized((game['lock-layout'] as Record<string, unknown>).clickRoutine);
    const unlock = serialized((game['unlock-layout'] as Record<string, unknown>).clickRoutine);

    expect(LAYOUT_EDIT_CONTROL_IDS).toContain(MAIN_VIEW_REGION_ID);
    expect(LAYOUT_EDIT_CONTROL_IDS).toContain(MAIN_VIEW_SIZE_PANEL_ID);
    expect(lock).toContain(`"${MAIN_VIEW_REGION_ID}"`);
    expect(lock).toContain(`"${MAIN_VIEW_SIZE_PANEL_ID}"`);
    expect(lock).toContain('"property":"display","value":false');
    expect(unlock).toContain('"property":"display","value":true');
  });
});
