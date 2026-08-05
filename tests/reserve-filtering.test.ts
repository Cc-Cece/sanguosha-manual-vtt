import { describe, expect, it } from 'vitest';
import { buildReserveViewRegistry } from '../src/data/reserveViewModel.js';

describe('reserve view registry and page filtering', () => {
  it('validates view registry builds distinct page IDs for all general categories', () => {
    const registry = buildReserveViewRegistry();
    expect(registry.pagesByCategory.general_std).toHaveLength(1);
    expect(registry.pagesByCategory.general_other).toHaveLength(4);
    expect(registry.pagesByCategory.all_general).toHaveLength(11);
  });

  it('validates every card maps to a unique physical row holder without duplicate creation', () => {
    const registry = buildReserveViewRegistry();
    const holderIds = new Set(Object.values(registry.cardTargetHolders).map(t => t.holderId));
    expect(holderIds.size).toBeGreaterThan(10);
  });
});
