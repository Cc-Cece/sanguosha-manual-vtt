import { describe, expect, it } from 'vitest';
import { assembleGeneralDeckRoutine, assembleIdentityDeckRoutine, sendGeneralsToMainTableRoutine, sendIdentitiesToMainTableRoutine } from '../src/routines/deckAssembly.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('deckbuilding assembly and cross-table routines', () => {
  it('contains candidate zone, final deck zone, and assembly buttons in prototype', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    expect(widgets.find(w => w.id === 'general-candidate-zone')).toBeDefined();
    expect(widgets.find(w => w.id === 'final-general-deck-zone')).toBeDefined();
    expect(widgets.find(w => w.id === 'assemble-generals-btn')).toBeDefined();
    expect(widgets.find(w => w.id === 'send-generals-btn')).toBeDefined();

    expect(widgets.find(w => w.id === 'identity-composer-zone')).toBeDefined();
    expect(widgets.find(w => w.id === 'final-identity-deck-zone')).toBeDefined();
    expect(widgets.find(w => w.id === 'assemble-identities-btn')).toBeDefined();
    expect(widgets.find(w => w.id === 'send-identities-btn')).toBeDefined();
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
});
