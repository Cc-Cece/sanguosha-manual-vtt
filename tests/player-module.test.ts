import { expect, it } from 'vitest';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';

it('parents every player component to a movable module or its private holder', () => {
  const game = createFourPlayerPrototype();
  for (let n = 1; n <= 4; n++) {
    expect(game[`player-module-${n}`]).toMatchObject({ movable: true });
    for (const prefix of ['seat', 'general-zone', 'health', 'identity-cover', 'identity-private', 'hand', 'equipment', 'judgment', 'attachment'])
      expect(game[`${prefix}-${n}`]).toMatchObject({ parent: `player-module-${n}` });
    expect(game[`identity-${n}`]).toMatchObject({ parent: `identity-private-${n}` });
  }
});

it('enables native enlarge on cards, generals, identities and health', () => {
  const game = createFourPlayerPrototype();
  expect(game['main-deck']).toHaveProperty('cardDefaults.enlarge', 2.3);
  expect(game['general-deck']).toHaveProperty('cardDefaults.enlarge', 2.5);
  expect(game['identity-deck']).toHaveProperty('cardDefaults.enlarge', 2.5);
  expect(game['health-1']).toHaveProperty('enlarge', 1.8);
});
