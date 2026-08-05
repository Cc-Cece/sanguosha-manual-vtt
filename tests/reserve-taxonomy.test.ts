import { describe, expect, it } from 'vitest';
import { auditReserveTaxonomy, buildExtraTaxonomy, buildGeneralTaxonomy } from '../src/data/reserveTaxonomy.js';

describe('reserve card taxonomy audit and data integrity', () => {
  it('validates 315 generals and 31 extra cards pass taxonomy audit without duplicates or missing items', () => {
    const audit = auditReserveTaxonomy();
    expect(audit.valid).toBe(true);
    expect(audit.errors).toHaveLength(0);
  });

  it('validates default selection state (generals = true, extra = false)', () => {
    const generals = buildGeneralTaxonomy(315);
    for (const g of generals) expect(g.defaultSelected).toBe(true);

    const extras = buildExtraTaxonomy(31);
    for (const e of extras) expect(e.defaultSelected).toBe(false);
  });
});
