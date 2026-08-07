import { describe, expect, it } from 'vitest';
import { clearAllSeatsRoutine, createClearSeatRoutine, createSafeSeatClickRoutine } from '../src/routines/seatSafety.js';
import { createPlayerModule } from '../src/widgets/playerModule.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

describe('player module visual hierarchy', () => {
  const widgets = createPlayerModule(0);
  const widgetById = (id: string) => widgets.find(widget => widget.id === id)!;

  it('uses a dark styled Seat with the concise 入座 prompt', () => {
    const seat = widgetById('seat-1');
    const css = seat.css as Record<string, unknown>;

    expect(seat.displayEmpty).toBe('入座');
    expect(seat.displayEmpty).not.toContain('＋');
    expect(seat.width).toBeGreaterThanOrEqual(120);
    expect(css.background).toContain('linear-gradient');
    expect(css.backgroundColor).not.toBe('#ffffff');
    expect(css.color).toBe('#f5e4b6');
    expect(css.border).toContain('var(--color)');
  });

  it('keeps the Seat and header controls above the decorative header background', () => {
    const header = widgetById('player-header-1');
    const seat = widgetById('seat-1');
    const leaveButton = widgetById('leave-seat-1');
    const handCount = widgetById('hand-count-1');
    const headerCss = header.css as Record<string, unknown>;

    expect(Number(seat.layer)).toBeGreaterThan(Number(header.layer));
    expect(Number(leaveButton.layer)).toBeGreaterThan(Number(header.layer));
    expect(Number(handCount.layer)).toBeGreaterThan(Number(header.layer));
    expect(widgets.find(widget => widget.id === 'toggle-perspective-1')).toBeUndefined();
    expect(headerCss['pointer-events']).toBe('none');
    expect(headerCss.pointerEvents).toBeUndefined();
    expect((seat.css as Record<string, unknown>).cursor).toBe('pointer');
  });

  it('moves the Seat number to a bottom-right numeric badge', () => {
    const badge = widgetById('player-label-1');

    expect(badge.text).toBe('1');
    expect(String(badge.text)).not.toContain('玩家');
    expect(Number(badge.x)).toBeGreaterThanOrEqual(390);
    expect(Number(badge.y)).toBeGreaterThanOrEqual(230);
  });

  it('uses a dedicated header and separates public and face-down content zones', () => {
    const header = widgetById('player-header-1');
    const publicZone = widgetById('public-zone-1');
    const privateBackdrop = widgetById('private-backdrop-1');
    const faceDownLabel = widgetById('private-label-1');
    const faceDownZone = widgetById('private-zone-1');

    expect(header.height).toBe(36);
    expect(publicZone.y).toBe(50);
    expect(publicZone.width).toBe(288);
    expect(String(publicZone.text)).toContain('\n');
    expect(privateBackdrop.x).toBe(306);
    expect(faceDownLabel.text).toBe('暗置牌区');
    expect(faceDownZone.x).toBe(310);
    expect(String(faceDownZone.text)).toContain('始终盖面');
    expect(Number(faceDownZone.height)).toBeLessThan(Number(privateBackdrop.height));
  });

  it('never overwrites the numeric badge with a nickname or 玩家 N label', () => {
    const routines = [
      createSafeSeatClickRoutine('seat-4', 'player-label-4'),
      createClearSeatRoutine('seat-4'),
      clearAllSeatsRoutine,
    ];
    const labels = collectObjects(routines).filter(object => object.func === 'LABEL');

    expect(labels.some(label => String(label.value).includes('${seatNickname}'))).toBe(false);
    expect(labels.some(label => String(label.value).includes('玩家 '))).toBe(false);
    expect(labels).toContainEqual(expect.objectContaining({
      label: ['player-label-4'],
      value: '4',
    }));
  });
});
