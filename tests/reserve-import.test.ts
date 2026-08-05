import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createImportToReserveTrayRoutine } from '../src/routines/reserveImportRoutines.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve panel selective and in-game-safe import', () => {
  const model = buildReserveModel(loadTestCatalog());
  const routine = createImportToReserveTrayRoutine(model);
  const serialized = JSON.stringify(routine);

  it('selects the configured cards and tracks in-use deferred removals', () => {
    expect(serialized).toContain('reserveSelected');
    expect(serialized).toContain('reserveState');
    expect(serialized).toContain('in-use');
    expect(serialized).toContain('reservePendingRemoval');
    expect(serialized).toContain('reserveImportGeneralCount');
    expect(serialized).toContain('reserveImportExtraCount');
    expect(serialized).toContain('reserveImportGeneralPendingCount');
    expect(serialized).toContain('reserveImportExtraPendingCount');
  });

  it('moves filtered collections rather than treating collection names as holders', () => {
    for (const pageId of model.allPageIds) expect(serialized).not.toContain(`\"from\":\"${pageId}`);
    expect(serialized).toContain('"collection":"reserveImportGeneralSelectedDraft","to":"general-reserve"');
    expect(serialized).toContain('"collection":"reserveImportExtraSelectedDraft","to":"extra-reserve"');
    expect(serialized).not.toContain('"from":"reserveImportGeneral');
    expect(serialized).not.toContain('"from":"reserveImportExtra');
    expect(serialized).not.toContain('"func":"SHUFFLE"');
    expect(serialized).toContain('至少需要允许 1 张武将牌');
  });

  it('never moves in-use cards while applying a mid-game update', () => {
    expect(serialized).toContain('"property":"reserveState","relation":"==","value":"draft"');
    expect(serialized).toContain('"property":"reserveState","relation":"==","value":"in-use"');
    expect(serialized).toContain('游戏中保持原位');
    expect(serialized).not.toContain('"collection":"reserveImportGeneralInUse","to"');
    expect(serialized).not.toContain('"collection":"reserveImportExtraInUse","to"');
  });
});
