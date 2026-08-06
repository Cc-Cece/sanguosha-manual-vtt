import { expect, it } from 'vitest';
import { CENTRAL_SAFE_ZONE, PERSONAL_HAND, PLAYER_MODULES, RESERVE_TRAY } from '../src/layouts/table.js';
import { overlaps } from '../src/validation/validate.js';

it('keeps player modules separate and clear of the central play area', () => {
  PLAYER_MODULES.forEach((box, i) => {
    expect(overlaps(box, CENTRAL_SAFE_ZONE)).toBe(false);
    for (const other of PLAYER_MODULES.slice(i + 1)) expect(overlaps(box, other)).toBe(false);
  });
  for (const box of PLAYER_MODULES) {
    expect(overlaps(box, RESERVE_TRAY)).toBe(false);
    expect(overlaps(box, PERSONAL_HAND)).toBe(false);
  }
  expect(overlaps(CENTRAL_SAFE_ZONE, RESERVE_TRAY)).toBe(false);
  expect(overlaps(CENTRAL_SAFE_ZONE, PERSONAL_HAND)).toBe(false);
});
