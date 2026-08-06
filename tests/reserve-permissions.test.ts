import { describe, expect, it } from 'vitest';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve panel permissions', () => {
  const widgets = widgetsOf(createFourPlayerPrototype(loadTestCatalog()));

  it('guards card edits with the player-1 host check', () => {
    const sample = widgets.find(widget => widget.type === 'card' && widget.reserveLibraryType === 'general')!;
    const serialized = JSON.stringify(sample.clickRoutine);
    expect(serialized).toContain('PROPERTY player OF seat-1');
    expect(serialized).toContain('${playerName}');
    expect(serialized).toContain('备牌面板为只读');
  });

  it('guards navigation, bulk, reset and import buttons while keeping the shared view readable', () => {
    for (const id of ['nav-gen-all', 'main-tab-extras', 'bulk-ban-current-btn', 'reset-draft-btn', 'import-to-reserve-tray-btn']) {
      const button = widgets.find(widget => widget.id === id)!;
      expect(JSON.stringify(button.clickRoutine)).toContain('PROPERTY player OF seat-1');
    }
    expect(widgets.find(widget => widget.id === 'reserve-prep-drawer')?.onlyVisibleForSeat).toBeUndefined();
  });
});
