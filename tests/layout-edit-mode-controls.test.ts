import { describe, expect, it } from 'vitest';
import {
  RECYCLE_SIZE_DOWN_BUTTON_ID,
  RECYCLE_SIZE_LABEL_ID,
  RECYCLE_SIZE_UP_BUTTON_ID,
} from '../src/layouts/shufflePanels.js';
import { LAYOUT_EDIT_CONTROL_IDS } from '../src/routines/layoutEditModeRuntime.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

function routineObjects(game: Record<string, unknown>, id: string): Record<string, unknown>[] {
  const widget = game[id] as Record<string, unknown>;
  return collectObjects(widget.clickRoutine);
}

describe('host layout edit mode', () => {
  it('starts in edit mode with one unambiguous completion button', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game['lock-layout']).toMatchObject({ text: '🔒 完成布局', display: true });
    expect(game['unlock-layout']).toMatchObject({ text: '🔓 编辑布局', display: false });

    expect(game['component-scale-bar-player-module-1']).toBeDefined();
    expect(game['global-card-scale-panel']).toBeDefined();
    expect(game[RECYCLE_SIZE_DOWN_BUTTON_ID]).toBeDefined();
  });

  it('hides every B-class edit control after completing the layout', () => {
    const game = createFourPlayerPrototype(loadTestCatalog()) as Record<string, unknown>;
    const objects = routineObjects(game, 'lock-layout');

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: [...LAYOUT_EDIT_CONTROL_IDS],
      property: 'display',
      value: false,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET', collection: ['lock-layout'], property: 'display', value: false,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET', collection: ['unlock-layout'], property: 'display', value: true,
    }));
  });

  it('restores B-class edit controls when the host re-enters edit mode', () => {
    const game = createFourPlayerPrototype(loadTestCatalog()) as Record<string, unknown>;
    const objects = routineObjects(game, 'unlock-layout');

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: [...LAYOUT_EDIT_CONTROL_IDS],
      property: 'display',
      value: true,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET', collection: ['lock-layout'], property: 'display', value: true,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SET', collection: ['unlock-layout'], property: 'display', value: false,
    }));
  });

  it('classifies sizing and drag cues as B-class without hiding gameplay or private controls', () => {
    const editIds: readonly string[] = LAYOUT_EDIT_CONTROL_IDS;

    for (const id of [
      'component-scale-bar-player-module-1',
      'component-scale-bar-draw-pile-panel',
      'global-card-scale-panel',
      RECYCLE_SIZE_DOWN_BUTTON_ID,
      RECYCLE_SIZE_LABEL_ID,
      RECYCLE_SIZE_UP_BUTTON_ID,
      'draw-pile-panel-title',
      'quick-shuffle-panel-title',
      'recycle-panel-title',
      'recycle-collect-group-title',
    ]) expect(editIds).toContain(id);

    for (const id of [
      'arrange-layout',
      'reset-table',
      'toggle-player-mgmt-btn',
      'quick-shuffle-btn',
      'show-hand-back-seat-1',
      'hide-hand-back-seat-1',
    ]) expect(editIds).not.toContain(id);
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
