import { describe, expect, it } from 'vitest';
import type { Widget } from '../src/types/vtt.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve-card face interaction across lifecycle states', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  const widget = (id: string) => game[id] as Widget;
  const managedCard = (libraryType: 'general' | 'extra') => Object.values(game).find(value => {
    const candidate = value as Widget;
    return candidate?.type === 'card' && candidate.reserveLibraryType === libraryType;
  }) as Widget;

  it('keeps cards face-down and non-clickable inside both reserve trays', () => {
    for (const id of ['general-reserve', 'extra-reserve']) {
      expect(widget(id).onEnter).toMatchObject({
        activeFace: 0,
        reserveState: 'reserved',
        clickable: false,
      });
    }
    expect(widget('general-reserve').onEnter).toMatchObject({
      generalDisplayState: 0,
      rotation: 0,
    });
  });

  it('takes generals out face-up in their normal display state', () => {
    expect(widget('general-reserve').onLeave).toMatchObject({
      activeFace: 1,
      reserveState: 'in-use',
      clickable: true,
      generalDisplayState: 0,
      rotation: 0,
    });
    expect(widget('extra-reserve').onLeave).toMatchObject({
      reserveState: 'in-use',
      clickable: true,
    });
  });

  it('keeps Allow/Ban draft clicks but gives in-use generals a four-state display cycle', () => {
    const general = managedCard('general');
    expect(general).toBeDefined();
    expect(general).toMatchObject({ generalDisplayState: 0, rotation: 0 });

    const routine = JSON.stringify(general.clickRoutine);
    expect(routine).toContain('${PROPERTY reserveState}');
    expect(routine).toContain('"operand2":"draft"');
    expect(routine).toContain('reserveSelected');
    expect(routine).toContain('"operand2":"in-use"');
    expect(routine).toContain('${PROPERTY generalDisplayState}');
    for (const state of [0, 1, 2, 3]) expect(routine).toContain(`"generalDisplayState","value":${state}`);
    expect(routine).toContain('"rotation","value":90');
    expect(routine).toContain('"rotation","value":0');
    expect(routine).toContain('"activeFace","value":1');
    expect(routine).toContain('"activeFace","value":0');
    expect(routine).not.toContain('"func":"FLIP","collection":"thisButton"');
  });

  it('leaves in-use extra cards on the normal two-face FLIP interaction', () => {
    const extra = managedCard('extra');
    expect(extra).toBeDefined();
    const routine = JSON.stringify(extra.clickRoutine);
    expect(routine).toContain('"func":"FLIP","collection":"thisButton"');
    expect(routine).not.toContain('generalDisplayState');
  });

  it('resets every general rotation on full table and reserve resets', () => {
    const resetTable = JSON.stringify(widget('reset-table').clickRoutine);
    const reserveReset = JSON.stringify(widget('reserve-panel-controller').fullTableResetRoutine);

    for (const routine of [resetTable, reserveReset]) {
      expect(routine).toContain('"property":"reserveLibraryType","relation":"==","value":"general"');
      expect(routine).toContain('"property":"generalDisplayState","value":0');
      expect(routine).toContain('"property":"rotation","value":0');
    }
  });

  it('documents the exact click sequence in the generated help text', () => {
    expect(game._meta.info.helpText).toContain('竖置正面 → 横置正面 → 横置背面 → 竖置背面 → 竖置正面');
  });
});
