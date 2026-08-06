import { CENTRAL_SAFE_ZONE, PERSONAL_HAND, PLAYER_MODULES, RESERVE_TRAY, TABLE } from '../layouts/table.js';
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
  const seatCount = widgets.filter(w => w.type === 'seat').length;
  if (seatCount !== 12) errors.push(`prototype must contain exactly 12 seats (found ${seatCount})`);

  for (let i = 1; i <= 12; i++) {
    const moduleId = `player-module-${i}`;
    const moduleWidget = game[moduleId] as Widget | undefined;
    if (!moduleWidget) errors.push(`missing player module ${moduleId}`);
  }

  return errors;
}
