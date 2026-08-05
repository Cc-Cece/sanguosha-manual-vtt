import { CENTRAL_SAFE_ZONE, PLAYER_MODULES, TABLE } from '../layouts/table.js';
import type { Bounds, GameFile, Widget } from '../types/vtt.js';

export function widgetsOf(game: GameFile): Widget[] {
  return Object.values(game).filter((value): value is Widget => typeof value === 'object' && value !== null && 'id' in value && 'type' in value);
}

export function overlaps(a: Bounds, b: Bounds): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function validatePrototype(game: GameFile): string[] {
  const errors: string[] = [];
  const widgets = widgetsOf(game);
  const ids = new Set<string>();
  for (const item of widgets) {
    if (ids.has(item.id)) errors.push(`duplicate id: ${item.id}`);
    ids.add(item.id);
    if (item.parent && !game[item.parent]) errors.push(`missing parent ${item.parent} for ${item.id}`);
    if (item.deck && !game[item.deck]) errors.push(`missing deck ${item.deck} for ${item.id}`);
  }
  PLAYER_MODULES.forEach((box, i) => {
    if (box.x < TABLE.safeMargin || box.y < TABLE.safeMargin || box.x + box.width > TABLE.width - TABLE.safeMargin || box.y + box.height > TABLE.height - TABLE.safeMargin)
      errors.push(`player module ${i + 1} outside safe bounds`);
    if (overlaps(box, CENTRAL_SAFE_ZONE)) errors.push(`player module ${i + 1} overlaps central zone`);
    PLAYER_MODULES.slice(i + 1).forEach((other, j) => { if (overlaps(box, other)) errors.push(`player modules ${i + 1} and ${i + j + 2} overlap`); });
  });
  if (widgets.filter(w => w.type === 'seat').length !== 4) errors.push('prototype must contain exactly four seats');
  return errors;
}
