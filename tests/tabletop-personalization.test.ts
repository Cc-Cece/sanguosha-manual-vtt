import { describe, expect, it } from 'vitest';
import { BOARD } from '../src/layouts/continuousBoard.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

const serialized = (value: unknown): string => JSON.stringify(value);

describe('large tabletop personalization', () => {
  it('keeps the 3:2 expanded board and existing library drawer geometry', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    expect(BOARD).toMatchObject({ width: 3600, height: 2400 });
    expect(BOARD.width / BOARD.height).toBe(1.5);
    expect(game['reserve-prep-drawer']).toMatchObject({ x: 150, y: 40, width: 1500, height: 1100 });
  });

  it('uses real cards for temporary public hand backs and removes blind proxies', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const keys = Object.keys(game);

    expect(keys.some(id => id.startsWith('blind-zone-'))).toBe(false);
    expect(keys.some(id => id.startsWith('blind-proxy-'))).toBe(false);
    expect(keys.some(id => id.startsWith('show-blind-'))).toBe(false);
    expect(keys.some(id => id.startsWith('hide-blind-'))).toBe(false);

    const publicHand = game['public-hand-back-seat-1'] as Record<string, unknown>;
    expect(publicHand).toMatchObject({
      display: false,
      preventPiles: true,
      childrenPerOwner: false,
      onEnter: {
        activeFace: 0,
        clickable: false,
        owner: null,
        publicHandSourceSeat: 'seat-1',
      },
      onLeave: {
        activeFace: 0,
        clickable: true,
        owner: null,
        publicHandSourceSeat: null,
      },
    });

    const open = serialized((game['show-hand-back-seat-1'] as Record<string, unknown>).clickRoutine);
    const close = serialized((game['hide-hand-back-seat-1'] as Record<string, unknown>).clickRoutine);
    expect(open).toContain('"property":"parent","relation":"==","value":"personal-hand-seat-1"');
    expect(open).toContain('"func":"FLIP","collection":"seat1PublicHandCards","face":0');
    expect(open).toContain('"property":"parent","value":"public-hand-back-seat-1"');
    expect(open).toContain('"func":"SHUFFLE","holder":["public-hand-back-seat-1"],"mode":"true random"');
    expect(close).toContain('"property":"parent","relation":"==","value":"public-hand-back-seat-1"');
    expect(close).toContain('"property":"parent","value":"personal-hand-seat-1"');
  });

  it('exposes host-only component scaling through 400 percent', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const bar = game['component-scale-bar-player-module-1'] as Record<string, unknown>;
    const up = game['component-scale-up-player-module-1'] as Record<string, unknown>;
    const down = game['component-scale-down-player-module-1'] as Record<string, unknown>;

    expect(bar).toMatchObject({ onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'] });
    expect(game['player-module-1']).toMatchObject({ componentScalePercent: 100, scale: 1 });
    const routines = serialized(up.clickRoutine) + serialized(down.clickRoutine);
    for (const percent of [50, 75, 100, 125, 150, 200, 250, 300, 400])
      expect(routines).toContain(`"value":${percent}`);
  });

  it('changes all real card scale and hand spacing with the global card-size presets', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const panel = game['global-card-scale-panel'] as Record<string, unknown>;
    const up = game['global-card-scale-up'] as Record<string, unknown>;
    const down = game['global-card-scale-down'] as Record<string, unknown>;
    const routines = serialized(up.clickRoutine) + serialized(down.clickRoutine);

    expect(panel).toMatchObject({ globalCardScalePercent: 100, onlyVisibleForSeat: ['seat-1'] });
    for (const percent of [75, 100, 125, 150, 175, 200, 250])
      expect(routines).toContain(`"value":${percent}`);
    expect(routines).toContain('"func":"SELECT","source":"all","type":"card","collection":"globalCardScaleCards"');
    expect(routines).toContain('"property":"stackOffsetX","value":135');
  });

  it('restores hover preview readability without coupling it to camera zoom', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    expect(game['main-deck']).toHaveProperty('cardDefaults.enlarge', 9.4);
    expect(game['extra-deck']).toHaveProperty('cardDefaults.enlarge', 9.4);
    expect(game['general-deck']).toHaveProperty('cardDefaults.enlarge', 10);
    expect(game['identity-deck']).toHaveProperty('cardDefaults.enlarge', 10);
    expect(game['health-deck']).toHaveProperty('cardDefaults.enlarge', 9.2);
    expect(game['conversion-state-deck']).toHaveProperty('cardDefaults.enlarge', 9.2);
  });

  it('keeps reset and auto-arrange semantics separate from sizing preferences', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const reset = serialized((game['reset-table'] as Record<string, unknown>).clickRoutine);
    const arrange = serialized((game['arrange-layout'] as Record<string, unknown>).clickRoutine);
    const sizingReset = serialized((game['reset-tabletop-sizing'] as Record<string, unknown>).clickRoutine);

    expect(reset).not.toContain('"func":"MOVEXY"');
    expect(reset).not.toContain('componentScalePercent');
    expect(arrange).toContain('"func":"MOVEXY"');
    expect(arrange).not.toContain('componentScalePercent');
    expect(sizingReset).toContain('"property":"componentScalePercent","value":100');
    expect(sizingReset).toContain('"property":"globalCardScalePercent","value":100');
    expect(sizingReset).toContain('"property":"recycleSizePercent","value":100');
  });
});
