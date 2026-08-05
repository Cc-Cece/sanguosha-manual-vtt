import { describe, expect, it } from 'vitest';
import { assembleGeneralDeckRoutine, assembleIdentityDeckRoutine, importToReserveTrayRoutine, sendGeneralsToMainTableRoutine, sendIdentitiesToMainTableRoutine } from '../src/routines/deckAssembly.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('deckbuilding assembly and cross-table routines', () => {
  it('contains reserve prep drawer and flat card view zones in prototype', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const drawer = widgets.find(w => w.id === 'reserve-prep-drawer');
    expect(drawer).toBeDefined();
    expect(drawer?.display).toBe(false);

    expect(widgets.find(w => w.id === 'gen-page-std-1')).toBeDefined();
    expect(widgets.find(w => w.id === 'gen-page-feng-1')).toBeDefined();
    expect(widgets.find(w => w.id === 'extra-page-equipment-1')).toBeDefined();
  });

  it('validates assembleGeneralDeckRoutine sequence: flip, move, shuffle', () => {
    expect(assembleGeneralDeckRoutine).toEqual([
      { func: 'FLIP', holder: ['general-candidate-zone'], face: 0 },
      { func: 'MOVE', from: ['general-candidate-zone'], to: ['final-general-deck-zone'], count: 'all', face: 0 },
      { func: 'SHUFFLE', holder: ['final-general-deck-zone'], mode: 'true random' },
      { func: 'INPUT', header: '武将牌堆合成完成', fields: [{ type: 'text', label: '提示', value: '已将候选区武将盖回、合拢为专属武将牌堆并完成随机洗牌！' }], block: false },
    ]);
  });

  it('validates sendGeneralsToMainTableRoutine target is main table general-reserve', () => {
    expect(sendGeneralsToMainTableRoutine[0]).toEqual({
      func: 'MOVE',
      from: ['final-general-deck-zone'],
      to: ['general-reserve'],
      count: 'all',
    });
  });

  it('validates sendIdentitiesToMainTableRoutine target is main table identity-reserve', () => {
    expect(sendIdentitiesToMainTableRoutine[0]).toEqual({
      func: 'MOVE',
      from: ['final-identity-deck-zone'],
      to: ['identity-reserve'],
      count: 'all',
    });
  });

  it('validates importToReserveTrayRoutine moves allowed generals and selected extra cards into reserve-tray', () => {
    const importRoutine = JSON.stringify(importToReserveTrayRoutine);
    expect(importRoutine).toContain('general-reserve');
    expect(importRoutine).toContain('extra-reserve');
  });
});
