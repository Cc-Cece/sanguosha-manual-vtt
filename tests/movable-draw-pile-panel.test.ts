import { describe, expect, it } from 'vitest';
import {
  DRAW_PILE_PANEL,
  DRAW_PILE_PANEL_ID,
  DRAW_PILE_PANEL_TITLE_ID,
} from '../src/widgets/drawPilePanel.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

const serialized = (value: unknown): string => JSON.stringify(value);

describe('movable draw pile panel', () => {
  it('groups the pile, controls and animation under one movable panel', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game[DRAW_PILE_PANEL_ID]).toMatchObject({
      ...DRAW_PILE_PANEL,
      movable: true,
    });
    expect(game[DRAW_PILE_PANEL_TITLE_ID]).toMatchObject({ parent: DRAW_PILE_PANEL_ID });
    expect(game['draw-pile']).toMatchObject({
      parent: DRAW_PILE_PANEL_ID,
      movable: false,
      fixedParent: true,
    });
    expect(game['shuffle-draw-pile-btn']).toMatchObject({
      parent: DRAW_PILE_PANEL_ID,
      movable: false,
      fixedParent: true,
    });
    expect(game['request-shuffle-draw-pile-btn']).toMatchObject({
      parent: DRAW_PILE_PANEL_ID,
      movable: false,
      fixedParent: true,
    });

    for (let index = 1; index <= 6; index += 1) {
      expect(game[`shuffle-animation-draw-pile-${index}`]).toMatchObject({
        parent: DRAW_PILE_PANEL_ID,
        movable: false,
        clickable: false,
      });
    }
  });

  it('locks and unlocks only the outer panel while the draw holder stays fixed', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const lock = serialized((game['lock-layout'] as Record<string, unknown>).clickRoutine);
    const unlock = serialized((game['unlock-layout'] as Record<string, unknown>).clickRoutine);

    expect(lock).toContain(`"collection":["${DRAW_PILE_PANEL_ID}"],"property":"movable","value":false`);
    expect(unlock).toContain(`"collection":["${DRAW_PILE_PANEL_ID}"],"property":"movable","value":true`);
    expect(unlock).toContain('"collection":["draw-pile","personal-hand"],"property":"movable","value":false');
    expect(unlock).not.toContain('"collection":["draw-pile"],"property":"movable","value":true');
  });

  it('restores the draw pile panel in both automatic layout and full table reset', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const arrange = serialized((game['arrange-layout'] as Record<string, unknown>).clickRoutine);
    const reset = serialized((game['reset-table'] as Record<string, unknown>).clickRoutine);
    const expectedMove = `"func":"MOVEXY","from":["${DRAW_PILE_PANEL_ID}"],"x":${DRAW_PILE_PANEL.x},"y":${DRAW_PILE_PANEL.y}`;

    expect(arrange).toContain(expectedMove);
    expect(reset).toContain(expectedMove);
  });

  it('documents that only the personal hand remains a permanently fixed gameplay area', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const info = (game._meta as Record<string, unknown>).info as Record<string, unknown>;
    const helpText = String(info.helpText);

    expect(helpText).toContain('摸牌堆面板也可在解锁布局后拖动');
    expect(helpText).toContain('只有个人手牌区始终固定');
    expect(helpText).not.toContain('只有摸牌堆和个人手牌区始终固定');
  });
});
