import { describe, expect, it } from 'vitest';
import { BOARD, LIBRARY_TABLE_BOUNDS, MAIN_TABLE_BOUNDS, TRANSITION_BOUNDS } from '../src/layouts/continuousBoard.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('continuous board dimensions and layout bounds', () => {
  it('defines valid 2500x1200 continuous board dimensions in gameSettings', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    expect(game._meta?.gameSettings?.boardSize).toEqual({ width: 2500, height: 1200 });
  });

  it('ensures main table, transition corridor, and library table bounds do not overlap', () => {
    expect(MAIN_TABLE_BOUNDS.x + MAIN_TABLE_BOUNDS.width).toBeLessThanOrEqual(TRANSITION_BOUNDS.x);
    expect(TRANSITION_BOUNDS.x + TRANSITION_BOUNDS.width).toBeLessThanOrEqual(LIBRARY_TABLE_BOUNDS.x);
    expect(LIBRARY_TABLE_BOUNDS.x + LIBRARY_TABLE_BOUNDS.width).toBeLessThanOrEqual(BOARD.width);
  });
});
