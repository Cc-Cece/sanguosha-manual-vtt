import { describe, expect, it } from 'vitest';
import { ADMIN_PANELS } from '../src/config/adminPanels.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('VTT admin console metadata', () => {
  it('declares a read-only draw-pile holder inspector in game metadata', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game._meta.info.adminPanels).toEqual(ADMIN_PANELS);
    expect(game._meta.info.adminPanels).toEqual([
      {
        id: 'draw-pile-audit',
        type: 'holderInspector',
        title: '摸牌堆审计',
        holder: 'draw-pile',
      },
    ]);
  });
});
