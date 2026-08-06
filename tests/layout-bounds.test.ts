import { expect, it } from 'vitest';
import { PERSONAL_HAND, PLAYER_MODULES, RESERVE_TRAY, TABLE } from '../src/layouts/table.js';

it('keeps all complete player modules inside the table safe margin', () => {
  for (const box of [...PLAYER_MODULES, RESERVE_TRAY, PERSONAL_HAND]) {
    expect(box.x).toBeGreaterThanOrEqual(TABLE.safeMargin);
    expect(box.y).toBeGreaterThanOrEqual(TABLE.safeMargin);
    expect(box.x + box.width).toBeLessThanOrEqual(TABLE.width - TABLE.safeMargin);
    expect(box.y + box.height).toBeLessThanOrEqual(TABLE.height - TABLE.safeMargin);
  }
});
