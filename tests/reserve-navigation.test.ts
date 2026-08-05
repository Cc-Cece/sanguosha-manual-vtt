import { describe, expect, it } from 'vitest';
import { buildReserveModel } from '../src/data/reserveViewRegistry.js';
import { createPageNavigationRoutine, createSwitchViewRoutine } from '../src/routines/reserveNavigation.js';
import { toggleLibraryTrayRoutine } from '../src/routines/tableActions.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve panel navigation', () => {
  const catalog = loadTestCatalog();
  const model = buildReserveModel(catalog);

  it('opens through the controller and uses a safe close path rather than hard-coded pages', () => {
    const serialized = JSON.stringify(toggleLibraryTrayRoutine);
    expect(serialized).toContain('openPanelRoutine');
    expect(serialized).toContain('safeClosePanelRoutine');
    expect(serialized).not.toContain('gen-page-1');
  });

  it('synchronizes confirmed edits when closing but allows an unconfirmed first draft to hide', () => {
    const widgets = widgetsOf(createFourPlayerPrototype(catalog));
    const controller = widgets.find(widget => widget.id === 'reserve-panel-controller')!;
    const close = JSON.stringify(controller.closePanelRoutine);
    expect(close).toContain('draftState');
    expect(close).toContain('confirmed');
    expect(close).toContain('syncAndCloseRoutine');
    expect(close).toContain('reserve-prep-drawer');
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
