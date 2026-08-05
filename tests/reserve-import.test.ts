import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createImportToReserveTrayRoutine } from '../src/routines/reserveImportRoutines.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve panel selective import', () => {
  const model = buildReserveModel(loadTestCatalog());
  const routine = createImportToReserveTrayRoutine(model);
  const serialized = JSON.stringify(routine);

  it('selects by reserveSelected before moving named collections', () => {
    expect(serialized).toContain('reserveSelected');
    expect(serialized).toContain('reserveImportGenerals');
    expect(serialized).toContain('reserveImportExtras');
    expect(serialized).toContain('general-reserve');
    expect(serialized).toContain('extra-reserve');
    expect(serialized).toContain('reserveImportGeneralCount');
    expect(serialized).toContain('reserveImportExtraCount');
  });

  it('moves only the filtered collections, never the page holders, and does not shuffle', () => {
    for (const pageId of model.allPageIds) expect(serialized).not.toContain(`\"from\":\"${pageId}`);
    expect(serialized).toContain('"from":"reserveImportGenerals"');
    expect(serialized).toContain('"from":"reserveImportExtras"');
    expect(serialized).not.toContain('"func":"SHUFFLE"');
    expect(serialized).toContain('至少需要允许 1 张武将牌');
  });
});
