import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';

it('binds each hand and private identity holder exclusively to its matching seat', () => {
  const game = createFourPlayerPrototype();
  for (let n = 1; n <= 4; n++) {
    for (const id of [`hand-${n}`, `identity-private-${n}`]) {
      expect(game[id]).toMatchObject({ onlyVisibleForSeat: [`seat-${n}`], linkedToSeat: [`seat-${n}`], childrenPerOwner: true });
    }
    expect(game[`playing-card-${n}`]).not.toHaveProperty('onlyVisibleForSeat');
  }
});
