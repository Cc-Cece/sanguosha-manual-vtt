import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('binds private displays and the shared personal hand to native seat visibility', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  for (let n = 1; n <= 4; n++) {
    expect(game[`private-zone-${n}`]).toMatchObject({ linkedToSeat: [`seat-${n}`], layer: 2 });
    expect(game[`private-zone-${n}`]).toHaveProperty('onEnter.activeFace', 0);
    expect(game[`private-zone-${n}`]).toHaveProperty('onLeave.activeFace', 0);
  }
  expect(game['personal-hand']).toMatchObject({ childrenPerOwner: true, onlyVisibleForSeat: ['seat-1', 'seat-2', 'seat-3', 'seat-4'] });
  expect(game['card-393']).not.toHaveProperty('onlyVisibleForSeat');
});
