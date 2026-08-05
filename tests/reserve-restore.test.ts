import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createFullTableReserveResetRoutine, createRestoreStagedCardsRoutine } from '../src/routines/reserveImportRoutines.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve staged-card restoration', () => {
  const model = buildReserveModel(loadTestCatalog());
  const serialized = JSON.stringify(createRestoreStagedCardsRoutine(model));

  it('groups staged cards by their real home row and restores draft interaction', () => {
    for (const page of model.pages) {
      for (const row of page.rows) expect(serialized).toContain(row.id);
    }
    expect(serialized).toContain('reserveHomeHolder');
    expect(serialized).toContain('reserveState');
    expect(serialized).toContain('staged');
    expect(serialized).toContain('draft');
    expect(serialized).toContain('"property":"movable","value":false');
    expect(serialized).toContain('"property":"clickable","value":true');
  });

  it('force-restores every managed card to its home row during a complete table reset', () => {
    const reset = JSON.stringify(createFullTableReserveResetRoutine(model));
    for (const page of model.pages) {
      for (const row of page.rows) {
        expect(reset).toContain(row.id);
        expect(reset).toContain(`force_restore_${row.id.replace(/[^a-zA-Z0-9]/g, '_')}`);
      }
    }
    expect(reset).toContain('reserveHomeHolder');
    expect(reset).toContain('"func":"MOVE"');
    expect(reset).toContain('"property":"reserveSelected","value":true');
  });
});
