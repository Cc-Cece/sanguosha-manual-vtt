import { describe, expect, it } from 'vitest';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve card selection state and properties', () => {
  it('validates cards in reserve drawer have movable: false, clickable: true and reserve properties', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const card1 = game['card-1'];
    expect(card1).toMatchObject({
      movable: false,
      clickable: true,
      reserveLibraryType: 'general',
      reserveSelected: true,
    });
  });
});
