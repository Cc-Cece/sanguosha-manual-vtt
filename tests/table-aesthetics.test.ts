import { describe, expect, it } from 'vitest';
import { leaveSeat1Routine, leaveSeat2Routine, leaveSeat3Routine, leaveSeat4Routine } from '../src/routines/seatSafety.js';
import { widgetsOf } from '../src/validation/validate.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('table aesthetics and player module leave-seat buttons', () => {
  it('contains leave-seat buttons for each player module bound to secure routines', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const leaveRoutines = [leaveSeat1Routine, leaveSeat2Routine, leaveSeat3Routine, leaveSeat4Routine];

    for (let i = 1; i <= 4; i++) {
      const btn = widgets.find(w => w.id === `leave-seat-${i}`);
      expect(btn).toBeDefined();
      expect(btn?.parent).toBe(`player-module-${i}`);
      expect(btn?.text).toBe('离座');
      expect(btn?.clickRoutine).toEqual(leaveRoutines[i - 1]);
    }
  });

  it('validates leaveSeatRoutine security structure', () => {
    const serialized = JSON.stringify(leaveSeat1Routine);
    expect(serialized).toContain('${PROPERTY player OF seat-1}');
    expect(serialized).toContain('${playerName}');
    expect(serialized).toContain('无法释放座位');
  });

  it('verifies icon enhancement on toolbar and removes redundant desktop labels', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const hostTitle = widgets.find(w => w.id === 'host-toolbar-title');
    expect(hostTitle?.text).toContain('👑');

    const drawPile = widgets.find(w => w.id === 'draw-pile');
    expect(drawPile?.text).toContain('🎴');

    const handZone = widgets.find(w => w.id === 'personal-hand');
    expect(handZone?.text).toContain('🖐️');

    expect(widgets.find(w => w.id === 'table-title')).toBeUndefined();
    expect(widgets.find(w => w.id === 'public-table-hint')).toBeUndefined();
  });

  it('contains quick-shuffle-zone as a pileZone and generates real health cards', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const shuffleZone = widgets.find(w => w.id === 'quick-shuffle-zone');
    expect(shuffleZone).toBeDefined();
    expect(shuffleZone?.text).toContain('快捷洗牌区');
    expect(shuffleZone?.alignChildren).toBe(true);
    expect(shuffleZone?.preventPiles).toBe(false);
    expect(shuffleZone?.stackOffsetX).toBe(0);
    expect(shuffleZone?.stackOffsetY).toBe(0);

    const shuffleBtn = widgets.find(w => w.id === 'quick-shuffle-btn');
    expect(shuffleBtn).toBeDefined();
    expect(shuffleBtn?.clickRoutine).toEqual([
      { func: 'FLIP', holder: ['quick-shuffle-zone'], face: 0 },
      { func: 'SHUFFLE', holder: ['quick-shuffle-zone'], mode: 'true random' },
      { func: 'INPUT', header: '洗牌完成', fields: [{ type: 'text', label: '提示', value: '快捷洗牌区已完成随机洗牌，牌叠已自动背置。' }], block: false },
    ]);

    const markerReserve = widgets.find(w => w.id === 'marker-reserve');
    expect(markerReserve?.text).toBe('血量');

    const healthDeck = widgets.find(w => w.id === 'health-deck');
    expect(healthDeck).toBeDefined();
    const serialized = JSON.stringify(healthDeck);
    expect(serialized).toContain('血量牌');
    expect(serialized).toContain('8 体力');
    expect(serialized).toContain('7 体力');
    expect(serialized).toContain('6 体力');
    expect(serialized).not.toContain('上限');

    const healthCards = widgets.filter(w => w.deck === 'health-deck');
    expect(healthCards.length).toBeGreaterThanOrEqual(16);
  });

  it('provides toggle-perspective buttons with seat & host permission checks', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    for (let i = 1; i <= 4; i++) {
      const btn = widgets.find(w => w.id === `toggle-perspective-${i}`);
      expect(btn).toBeDefined();
      expect(btn?.parent).toBe(`player-module-${i}`);
      expect(btn?.text).toContain('视角');

      const serialized = JSON.stringify(btn?.clickRoutine);
      expect(serialized).toContain(`\${PROPERTY player OF seat-${i}}`);
      expect(serialized).toContain('无法切换视角');
    }
  });
});

