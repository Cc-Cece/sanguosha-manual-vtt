import { describe, expect, it } from 'vitest';
import { ADMIN_PANELS } from '../src/config/adminPanels.js';
import type { Widget } from '../src/types/vtt.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('VTT admin console configuration', () => {
  it('declares a read-only draw-pile holder inspector in a hidden state widget', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const config = game['admin-console-config'] as Widget;

    expect(config).toBeDefined();
    expect(config.display).toBe(false);
    expect(config.movable).toBe(false);
    expect(config.clickable).toBe(false);
    expect(config.adminPanels).toEqual(ADMIN_PANELS);
    expect(config.adminPanels).toEqual([
      {
        id: 'draw-pile-audit',
        type: 'holderInspector',
        title: '摸牌堆审计',
        holder: 'draw-pile',
      },
    ]);
  });
});
