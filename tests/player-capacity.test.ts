import { describe, expect, it } from 'vitest';
import { PLAYER_CAPACITY, playerModuleIds, seatIds } from '../src/config/playerCapacity.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('universal 4-12 player capacity structure', () => {
  it('validates 12 pre-created player modules with correct default visibility', () => {
    const game = createUniversalPrototype(loadTestCatalog());

    expect(seatIds(12)).toHaveLength(12);
    expect(playerModuleIds(12)).toHaveLength(12);

    for (let i = 1; i <= 12; i++) {
      const moduleWidget = game[`player-module-${i}`];
      expect(moduleWidget).toBeDefined();

      if (i <= PLAYER_CAPACITY.defaultOpenSeats) {
        expect(moduleWidget).toHaveProperty('display', true);
      } else {
        expect(moduleWidget).toHaveProperty('display', false);
      }
    }
  });

  it('validates game metadata reflects 4-12 universal player room', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    expect(game._meta.info.players).toBe('4-12');
  });
});
