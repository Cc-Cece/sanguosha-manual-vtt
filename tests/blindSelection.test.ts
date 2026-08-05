import { describe, expect, it } from 'vitest';
import {
  BLIND_SELECTION_PANEL_ID,
  BLIND_SELECTION_ROW_IDS,
  BLIND_SELECTION_SELECTED_ID,
  cancelAllBlindSelectionsRoutine,
  confirmBlindSelectionRoutine,
  createOpenBlindSelectionRoutine,
} from '../src/routines/blindSelection.js';
import { createLeaveSeatRoutine } from '../src/routines/seatSafety.js';
import { updateHandCountsRoutine } from '../src/routines/tableActions.js';
import type { AssetCatalog } from '../src/types/assets.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { createBlindSelectionWidgets } from '../src/widgets/blindSelectionTable.js';
import { createPlayerModule } from '../src/widgets/playerModule.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

const mainBack = '/assets/164666862_54760';

const emptyCatalog: AssetCatalog = {
  sourceRoot: 'test',
  generatedAt: '2026-08-05T00:00:00.000Z',
  assets: [],
  backs: {
    generals: '/assets/general-back',
    identities: '/assets/identity-back',
    main: mainBack,
  },
  backAssets: [],
};

describe('shared blind-selection table', () => {
  it('replaces every per-player proxy area with one real-hand entry button', () => {
    const moduleWidgets = createPlayerModule(0);
    const ids = moduleWidgets.map(widget => widget.id);
    const seat = moduleWidgets.find(widget => widget.id === 'seat-1');
    const openButton = moduleWidgets.find(widget => widget.id === 'open-blind-selection-1');

    expect(seat?.hand).toBe('personal-hand');
    expect(openButton?.onlyVisibleForSeat).toEqual(['seat-1']);
    expect(openButton?.linkedToSeat).toEqual(['seat-1']);
    expect(ids).not.toContain('blind-zone-1');
    expect(ids).not.toContain('show-blind-1');
    expect(ids).not.toContain('hide-blind-1');
    expect(ids.some(id => id.startsWith('blind-proxy-'))).toBe(false);
  });

  it('creates one movable shared panel using the agreed main hand-card back', () => {
    const widgets = createBlindSelectionWidgets(mainBack);
    const panel = widgets.find(widget => widget.id === BLIND_SELECTION_PANEL_ID);
    const selected = widgets.find(widget => widget.id === BLIND_SELECTION_SELECTED_ID);

    expect(panel?.display).toBe(false);
    expect(panel?.movable).toBe(true);
    expect(selected?.image).toBe(mainBack);
    expect(selected?.dropLimit).toBe(1);
    expect(BLIND_SELECTION_ROW_IDS.every(id => widgets.some(widget => widget.id === id))).toBe(true);
  });

  it('selects real owned cards from personal-hand and only from main/extra decks', () => {
    const objects = collectObjects(createOpenBlindSelectionRoutine(3));

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      type: 'card',
      property: 'owner',
      value: '${PROPERTY player OF seat-3}',
      random: true,
      collection: 'blindSourceCards',
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      source: 'blindSourceCards',
      property: 'parent',
      value: 'personal-hand',
      mode: 'intersect',
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      source: 'blindSourceCards',
      property: 'deck',
      relation: 'in',
      value: ['main-deck', 'extra-deck'],
      mode: 'intersect',
    }));
    expect(objects.some(object => object.func === 'CLONE')).toBe(false);
  });

  it('forces all temporarily exposed real cards to remain on face 0 and public by back only', () => {
    const objects = collectObjects(createOpenBlindSelectionRoutine(2));

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: 'blindSourceCards',
      property: 'activeFace',
      value: 0,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: 'blindSourceCards',
      property: 'clickable',
      value: false,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: 'blindSourceCards',
      property: 'owner',
      value: null,
    }));
    for (const rowId of BLIND_SELECTION_ROW_IDS) {
      expect(objects).toContainEqual(expect.objectContaining({
        func: 'MOVE',
        to: rowId,
        face: 0,
      }));
    }
  });

  it('locks the chosen card until the target returns all unselected cards', () => {
    const selected = createBlindSelectionWidgets(mainBack).find(widget => widget.id === BLIND_SELECTION_SELECTED_ID);
    const confirmObjects = collectObjects(confirmBlindSelectionRoutine);

    expect(selected?.onEnter).toEqual(expect.objectContaining({
      activeFace: 0,
      clickable: false,
      movable: false,
    }));
    expect(selected?.onLeave).toEqual(expect.objectContaining({
      activeFace: 0,
      clickable: true,
      movable: true,
    }));
    expect(confirmObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: 'blindChosenCard',
      property: 'movable',
      value: true,
    }));
    expect(confirmObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['blind-selection-controller'],
      property: 'phase',
      value: 'ready',
    }));
  });

  it('preserves the displayed hand count while cards are temporarily on the table', () => {
    const objects = collectObjects(updateHandCountsRoutine);

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      type: 'card',
      property: 'blindSourceSeat',
      value: 'seat-1',
      collection: 'seat1HandCards',
      mode: 'add',
    }));
  });

  it('restores an active table before a source Seat is released', () => {
    const objects = collectObjects(createLeaveSeatRoutine('seat-5'));

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'IF',
      operand1: '${PROPERTY sourceSeat OF blind-selection-controller}',
      operand2: 'seat-5',
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'MOVE',
      collection: 'blindCancelCards',
      to: 'seat-5',
      face: 0,
    }));
    expect(cancelAllBlindSelectionsRoutine.length).toBe(12);
  });

  it('integrates exactly one shared table into the universal game', () => {
    const game = createUniversalPrototype(emptyCatalog);
    const ids = Object.keys(game);

    expect(ids.filter(id => id === BLIND_SELECTION_PANEL_ID)).toHaveLength(1);
    expect(ids.some(id => id.startsWith('blind-proxy-'))).toBe(false);
    expect(ids.some(id => id.startsWith('blind-zone-'))).toBe(false);
  });
});
