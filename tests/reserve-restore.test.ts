import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createFullTableReserveResetRoutine, createRestoreReservedCardsRoutine } from '../src/routines/reserveImportRoutines.js';
import { loadTestCatalog } from './helpers.js';

describe('safe reserve-card restoration', () => {
  const model = buildReserveModel(loadTestCatalog());
  const serialized = JSON.stringify(createRestoreReservedCardsRoutine(model));

  it('restores only tray-resident reserved cards to their real home row', () => {
    for (const page of model.pages) {
      for (const row of page.rows) expect(serialized).toContain(row.id);
    }
    expect(serialized).toContain('reserveHomeHolder');
    expect(serialized).toContain('"property":"reserveState","relation":"==","value":"reserved"');
    expect(serialized).toContain('"property":"parent","relation":"==","value":"general-reserve"');
    expect(serialized).toContain('"property":"parent","relation":"==","value":"extra-reserve"');
    expect(serialized).toContain('"property":"reserveState","value":"draft"');
    expect(serialized).toContain('"property":"reservePendingRemoval","value":false');
    expect(serialized).toContain('"property":"movable","value":false');
    expect(serialized).toContain('"property":"clickable","value":true');
    expect(serialized).not.toContain('"value":"in-use","collection":"restore_');
  });

  it('uses collection MOVE syntax for every restore operation', () => {
    expect(serialized).toContain('"func":"MOVE","collection":"restore_');
    expect(serialized).not.toContain('"func":"MOVE","from":"restore_');
  });

  it('force-restores every managed card only during a complete table reset', () => {
    const reset = JSON.stringify(createFullTableReserveResetRoutine(model));
    for (const page of model.pages) {
      for (const row of page.rows) {
        expect(reset).toContain(row.id);
        expect(reset).toContain(`force_restore_${row.id.replace(/[^a-zA-Z0-9]/g, '_')}`);
      }
    }
    expect(reset).toContain('reserveHomeHolder');
    expect(reset).toContain('"func":"MOVE","collection":"force_restore_');
    expect(reset).not.toContain('"func":"MOVE","from":"force_restore_');
    expect(reset).toContain('"property":"reserveSelected","value":true');
    expect(reset).toContain('"property":"reservePendingRemoval","value":false');
  });
});
