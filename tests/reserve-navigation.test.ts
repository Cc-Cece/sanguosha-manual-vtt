import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createPageNavigationRoutine, createSwitchViewRoutine } from '../src/routines/reserveNavigation.js';
import { toggleLibraryTrayRoutine } from '../src/routines/tableActions.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve panel navigation', () => {
  const model = buildReserveModel(loadTestCatalog());

  it('opens and closes through the reserve controller rather than hard-coded pages', () => {
    const serialized = JSON.stringify(toggleLibraryTrayRoutine);
    expect(serialized).toContain('openPanelRoutine');
    expect(serialized).toContain('closePanelRoutine');
    expect(serialized).not.toContain('gen-page-1');
  });

  it('gives each real category a distinct page mapping', () => {
    const wind = JSON.stringify(createSwitchViewRoutine(model, 'general:gen-feng'));
    const fire = JSON.stringify(createSwitchViewRoutine(model, 'general:gen-huo'));
    expect(wind).toContain('gen-feng-page-1');
    expect(fire).toContain('gen-huo-page-1');
    expect(wind).not.toEqual(fire);
    expect(wind).not.toContain('"func":"INPUT","header":"方案');
  });

  it('generates boundary-aware navigation for every real page', () => {
    const next = JSON.stringify(createPageNavigationRoutine(model, 'next'));
    const prev = JSON.stringify(createPageNavigationRoutine(model, 'prev'));
    const multiPageIds = model.views
      .filter(view => view.pageIds.length > 1)
      .flatMap(view => view.pageIds);
    for (const pageId of multiPageIds) {
      expect(next + prev).toContain(pageId);
    }
    expect(next).toContain('currentPage');
    expect(next).toContain('activeViewKey');
  });
});
