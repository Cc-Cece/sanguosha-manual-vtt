import { expect, it } from 'vitest';
import { CENTRAL_SAFE_ZONE, PLAYER_MODULES } from '../src/layouts/table.js';
import { overlaps } from '../src/validation/validate.js';

it('keeps player modules separate and clear of the central play area', () => {
  PLAYER_MODULES.forEach((box, i) => {
    expect(overlaps(box, CENTRAL_SAFE_ZONE)).toBe(false);
    for (const other of PLAYER_MODULES.slice(i + 1)) expect(overlaps(box, other)).toBe(false);
  });
});
