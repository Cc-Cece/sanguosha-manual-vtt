import { expect, it } from 'vitest';
import { PLAYER_MODULES, TABLE } from '../src/layouts/table.js';

it('keeps all complete player modules inside the table safe margin', () => {
  for (const box of PLAYER_MODULES) {
    expect(box.x).toBeGreaterThanOrEqual(TABLE.safeMargin);
    expect(box.y).toBeGreaterThanOrEqual(TABLE.safeMargin);
    expect(box.x + box.width).toBeLessThanOrEqual(TABLE.width - TABLE.safeMargin);
    expect(box.y + box.height).toBeLessThanOrEqual(TABLE.height - TABLE.safeMargin);
  }
});
