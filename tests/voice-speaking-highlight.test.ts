import { describe, expect, it } from 'vitest';
import { createPlayerModule } from '../src/widgets/playerModule.js';

const MAX_SEATS = 12;

describe('voice speaking highlight', () => {
  it('declares one client-only speaking frame for every player module', () => {
    for (let index = 0; index < MAX_SEATS; index += 1) {
      const n = index + 1;
      const widgets = createPlayerModule(index);
      const byId = Object.fromEntries(widgets.map(widget => [widget.id, widget]));
      const frame = byId[`voice-speaking-frame-${n}`];
      const css = frame?.css as Record<string, unknown>;

      expect(frame).toMatchObject({
        parent: `player-module-${n}`,
        x: 4,
        y: 4,
        width: 422,
        height: 252,
        display: false,
        movable: false,
        movableInEdit: false,
        clickable: false,
        layer: 2,
        clientActivityIndicator: {
          source: 'voice.speaking',
          playerWidget: `seat-${n}`,
        },
      });
      expect(css['pointer-events']).toBe('none');
      expect(css.border).toContain('#55dacb');
      expect(css.boxShadow).toContain('#55dacb');
    }
  });

  it('keeps speaking presentation distinct from the synchronized play-phase marker', () => {
    const widgets = createPlayerModule(0);
    const byId = Object.fromEntries(widgets.map(widget => [widget.id, widget]));
    const speakingFrame = byId['voice-speaking-frame-1'];
    const playPhaseFrame = byId['play-phase-frame-1'];
    const speakingCss = speakingFrame?.css as Record<string, unknown>;
    const playPhaseCss = playPhaseFrame?.css as Record<string, unknown>;

    expect(speakingFrame?.clientActivityIndicator).toEqual({
      source: 'voice.speaking',
      playerWidget: 'seat-1',
    });
    expect(playPhaseFrame?.clientActivityIndicator).toBeUndefined();
    expect(speakingCss.border).not.toEqual(playPhaseCss.border);
    expect(String(speakingCss.border)).toContain('#55dacb');
    expect(String(playPhaseCss.border)).toContain('#e8b84a');
  });

  it('uses visual-only overlays that cannot intercept card interaction', () => {
    const frame = createPlayerModule(0).find(widget => widget.id === 'voice-speaking-frame-1');
    const css = frame?.css as Record<string, unknown>;

    expect(frame?.clickable).toBe(false);
    expect(frame?.movable).toBe(false);
    expect(frame?.movableInEdit).toBe(false);
    expect(css['pointer-events']).toBe('none');
    expect(css.pointerEvents).toBeUndefined();
  });
});
