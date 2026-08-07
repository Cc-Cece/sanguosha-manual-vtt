import { describe, expect, it } from 'vitest';
import { BOARD, LIBRARY_TRAY_BOUNDS, MAIN_TABLE_BOUNDS } from '../src/layouts/continuousBoard.js';
import type { Widget } from '../src/types/vtt.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('continuous board dimensions and layout bounds', () => {
  it('uses a large 3600x2400 board while preserving the tested 3:2 shape', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game._meta?.gameSettings?.boardSize).toEqual({ width: 3600, height: 2400 });
    expect(BOARD.width / BOARD.height).toBe(1.5);
  });

  it('keeps the established main table and library bounds unchanged inside the larger board', () => {
    expect(MAIN_TABLE_BOUNDS).toEqual({ x: 0, y: 0, width: 1800, height: 1200 });
    expect(LIBRARY_TRAY_BOUNDS).toEqual({ x: 350, y: 80, width: 1100, height: 950 });

    expect(MAIN_TABLE_BOUNDS.x + MAIN_TABLE_BOUNDS.width).toBeLessThanOrEqual(BOARD.width);
    expect(MAIN_TABLE_BOUNDS.y + MAIN_TABLE_BOUNDS.height).toBeLessThanOrEqual(BOARD.height);
    expect(LIBRARY_TRAY_BOUNDS.x + LIBRARY_TRAY_BOUNDS.width).toBeLessThanOrEqual(BOARD.width);
    expect(LIBRARY_TRAY_BOUNDS.y + LIBRARY_TRAY_BOUNDS.height).toBeLessThanOrEqual(BOARD.height);
  });

  it('expands only the tablecloth while leaving the library panel geometry unchanged', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const background = game['table-background'] as Widget;
    const library = game['reserve-prep-drawer'] as Widget;

    expect(background).toMatchObject({ x: 0, y: 0, width: 3600, height: 2400 });
    expect(library).toMatchObject({ x: 150, y: 40, width: 1500, height: 1100 });
  });
});
