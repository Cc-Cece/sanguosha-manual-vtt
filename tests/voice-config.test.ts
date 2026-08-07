import { describe, expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('voice package configuration', () => {
  it('opts the Sanguosha package into adaptive voice with seat 1 as host', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game._meta.gameSettings?.voice).toEqual({
      enabled: true,
      defaultMode: 'auto',
      p2pMaxParticipants: 4,
      hostSeat: 'seat-1',
    });
  });
});
