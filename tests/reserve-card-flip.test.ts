import { describe, expect, it } from 'vitest';
import type { Widget } from '../src/types/vtt.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

describe('reserve-card face interaction across lifecycle states', () => {
  const game = createFourPlayerPrototype(loadTestCatalog());
  const widget = (id: string) => game[id] as Widget;

  it('keeps cards face-down and non-clickable inside both reserve trays', () => {
    for (const id of ['general-reserve', 'extra-reserve']) {
      expect(widget(id).onEnter).toMatchObject({
        activeFace: 0,
        reserveState: 'reserved',
        clickable: false,
      });
    }
  });

  it('restores normal clicking as soon as a card leaves a reserve tray', () => {
    for (const id of ['general-reserve', 'extra-reserve']) {
      expect(widget(id).onLeave).toMatchObject({
        reserveState: 'in-use',
        clickable: true,
      });
    }
  });

  it('uses Allow/Ban clicks in draft state and normal FLIP clicks in in-use state', () => {
    const managedCard = Object.values(game).find(value => {
      const candidate = value as Widget;
      return candidate?.type === 'card' && candidate.reserveLibraryType === 'general';
    }) as Widget;

    expect(managedCard).toBeDefined();
    const routine = JSON.stringify(managedCard.clickRoutine);
    expect(routine).toContain('${PROPERTY reserveState}');
    expect(routine).toContain('"operand2":"draft"');
    expect(routine).toContain('reserveSelected');
    expect(routine).toContain('"operand2":"in-use"');
    expect(routine).toContain('"func":"FLIP","collection":"thisButton"');
  });
});
