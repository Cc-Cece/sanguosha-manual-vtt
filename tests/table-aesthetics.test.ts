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
    expect(leaveRoutines).toHaveLength(4);

    for (let i = 1; i <= 4; i++) {
      const btn = widgets.find(w => w.id === `leave-seat-${i}`);
      expect(btn).toBeDefined();
      expect(btn?.parent).toBe(`player-module-${i}`);
      expect(btn?.text).toBe('离座');
    }
  });

  it('validates leaveSeatRoutine security structure', () => {
    const serialized = JSON.stringify(leaveSeat1Routine);
    expect(serialized).toContain('${PROPERTY player OF seat-1}');
    expect(serialized).toContain('${playerName}');
    expect(serialized).toContain('无法释放座位');
  });

  it('verifies icon enhancement on toolbar and seat chinese text', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const toggleBtn = widgets.find(w => w.id === 'toggle-toolbar-btn');
    expect(toggleBtn?.text).toContain('收起');

    const seat1 = widgets.find(w => w.id === 'seat-1');
    expect(seat1).toBeDefined();

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
    const shuffleRoutineStr = JSON.stringify(shuffleBtn?.clickRoutine);
    expect(shuffleRoutineStr).toContain('quick-shuffle-zone');
    expect(shuffleRoutineStr).toContain('⏳ 洗牌中…');
    expect(shuffleRoutineStr).toContain('"func":"SHUFFLE"');
    expect(shuffleRoutineStr).toContain('"mode":"true random"');
    expect(shuffleRoutineStr).toContain('🔀 一键洗牌');

    const markerReserve = widgets.find(w => w.id === 'marker-reserve');
    expect(markerReserve?.text).toBe('体力');

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
      expect(btn?.text).toBe('👁️');

      const serialized = JSON.stringify(btn?.clickRoutine);
      expect(serialized).toContain(`\${PROPERTY player OF seat-${i}}`);
    }
  });
});
