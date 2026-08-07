import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

it('binds private displays and one movable private hand to each seat', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  expect(game['personal-hand']).toBeUndefined();

  for (let n = 1; n <= 12; n++) {
    const seatId = `seat-${n}`;
    expect(game[`private-zone-${n}`]).toMatchObject({ layer: 2 });
    expect(game[`private-zone-${n}`]).toHaveProperty('onEnter.activeFace', 0);
    expect(game[`private-zone-${n}`]).toHaveProperty('onLeave.activeFace', 0);

    expect(game[`personal-hand-seat-${n}`]).toMatchObject({
      childrenPerOwner: true,
      movable: true,
      onlyVisibleForSeat: [seatId],
      linkedToSeat: [seatId],
    });
    expect(game[`public-hand-back-seat-${n}`]).toMatchObject({
      display: false,
      childrenPerOwner: false,
      movable: false,
      inheritFrom: {
        [`personal-hand-seat-${n}`]: ['x', 'y', 'width', 'height', 'scale'],
      },
    });
  }

  expect(game['card-393']).not.toHaveProperty('onlyVisibleForSeat');
});
