import { describe, expect, it } from 'vitest';
import { BOARD, LIBRARY_TRAY_BOUNDS, MAIN_TABLE_BOUNDS } from '../src/layouts/continuousBoard.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('continuous board dimensions and layout bounds', () => {
  it('defines valid 1800x1200 continuous board dimensions in gameSettings', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    expect(game._meta?.gameSettings?.boardSize).toEqual({ width: 1800, height: 1200 });
  });

  it('ensures library tray drawer bounds remain within board bounds', () => {
    expect(LIBRARY_TRAY_BOUNDS.x + LIBRARY_TRAY_BOUNDS.width).toBeLessThanOrEqual(BOARD.width);
    expect(LIBRARY_TRAY_BOUNDS.y + LIBRARY_TRAY_BOUNDS.height).toBeLessThanOrEqual(BOARD.height);
  });
});
