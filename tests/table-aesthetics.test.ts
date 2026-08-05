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

  it('verifies icon enhancement on toolbar and zones', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const widgets = widgetsOf(game);

    const hostTitle = widgets.find(w => w.id === 'host-toolbar-title');
    expect(hostTitle?.text).toContain('👑');

    const drawPile = widgets.find(w => w.id === 'draw-pile');
    expect(drawPile?.text).toContain('🎴');

    const handZone = widgets.find(w => w.id === 'personal-hand');
    expect(handZone?.text).toContain('🖐️');
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
    expect(shuffleBtn?.clickRoutine).toEqual([{ func: 'SHUFFLE', holder: ['quick-shuffle-zone'], mode: 'true random' }]);

    const markerReserve = widgets.find(w => w.id === 'marker-reserve');
    expect(markerReserve?.text).toBe('血量');

    const healthDeck = widgets.find(w => w.id === 'health-deck');
    expect(healthDeck).toBeDefined();
    const serialized = JSON.stringify(healthDeck);
    expect(serialized).toContain('血量牌');
    expect(serialized).toContain('5 体力');
    expect(serialized).toContain('4 体力');

    const healthCards = widgets.filter(w => w.deck === 'health-deck');
    expect(healthCards.length).toBeGreaterThanOrEqual(16);
  });
});

