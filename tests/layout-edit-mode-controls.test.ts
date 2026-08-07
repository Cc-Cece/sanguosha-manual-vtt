import { describe, expect, it } from 'vitest';
import { LAYOUT_EDIT_CONTROL_IDS } from '../src/routines/layoutEditModeRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

function serializedRoutine(game: Record<string, unknown>, id: string): string {
  const widget = game[id] as Record<string, unknown>;
  return JSON.stringify(widget.clickRoutine);
}

describe('host layout edit mode', () => {
  it('starts in edit mode with one unambiguous completion button', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game['lock-layout']).toMatchObject({ text: '🔒 完成布局', display: true });
    expect(game['unlock-layout']).toMatchObject({ text: '🔓 编辑布局', display: false });

    expect(game['component-scale-bar-player-module-1']).toBeDefined();
    expect(game['global-card-scale-panel']).toBeDefined();
    expect(game['recycle-size-down']).toBeDefined();
  });

  it('hides every B-class edit control after completing the layout', () => {
    const game = createFourPlayerPrototype(loadTestCatalog()) as Record<string, unknown>;
    const lock = serializedRoutine(game, 'lock-layout');

    expect(lock).toContain(`\"collection\":${JSON.stringify(LAYOUT_EDIT_CONTROL_IDS)}`);
    expect(lock).toContain('\"property\":\"display\",\"value\":false');
    expect(lock).toContain('\"collection\":[\"lock-layout\"],\"property\":\"display\",\"value\":false');
    expect(lock).toContain('\"collection\":[\"unlock-layout\"],\"property\":\"display\",\"value\":true');
  });

  it('restores B-class edit controls when the host re-enters edit mode', () => {
    const game = createFourPlayerPrototype(loadTestCatalog()) as Record<string, unknown>;
    const unlock = serializedRoutine(game, 'unlock-layout');

    expect(unlock).toContain(`\"collection\":${JSON.stringify(LAYOUT_EDIT_CONTROL_IDS)}`);
    expect(unlock).toContain('\"property\":\"display\",\"value\":true');
    expect(unlock).toContain('\"collection\":[\"lock-layout\"],\"property\":\"display\",\"value\":true');
    expect(unlock).toContain('\"collection\":[\"unlock-layout\"],\"property\":\"display\",\"value\":false');
  });

  it('classifies sizing and drag cues as B-class without hiding gameplay or private controls', () => {
    for (const id of [
      'component-scale-bar-player-module-1',
      'component-scale-bar-draw-pile-panel',
      'global-card-scale-panel',
      'recycle-size-down',
      'recycle-size-label',
      'recycle-size-up',
      'draw-pile-panel-title',
      'quick-shuffle-panel-title',
      'recycle-panel-title',
      'recycle-collect-group-title',
    ]) expect(LAYOUT_EDIT_CONTROL_IDS).toContain(id as never);

    for (const id of [
      'arrange-layout',
      'reset-table',
      'toggle-player-mgmt-btn',
      'quick-shuffle-btn',
      'show-hand-back-seat-1',
      'hide-hand-back-seat-1',
    ]) expect(LAYOUT_EDIT_CONTROL_IDS).not.toContain(id as never);
  });

  it('documents the edit-mode boundary for the host', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const info = (game._meta as Record<string, unknown>).info as Record<string, unknown>;
    const helpText = String(info.helpText);

    expect(helpText).toContain('完成布局');
    expect(helpText).toContain('B 类编辑控件');
    expect(helpText).toContain('游戏操作与玩家私人手牌控件不会被隐藏');
  });
});
