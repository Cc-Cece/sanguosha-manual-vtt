import { applyRecycleZoneRuntimeFixes } from './recycleZoneRuntime.js';

type PlainRecord = Record<string, unknown>;

const LEGACY_WIDGET_ID_ALIASES: Record<string, string> = {
  'player-management-panel': 'player-mgmt-panel',
};

function isRecord(value: unknown): value is PlainRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function dialogTitle(text: string): PlainRecord {
  return { type: 'title', text };
}

export function dialogText(text: string): PlainRecord {
  return { type: 'subtitle', text };
}

function normalizeLegacyTextField(field: unknown): unknown {
  if (!isRecord(field) || field.type !== 'text') return field;

  const label = typeof field.label === 'string' ? field.label.trim() : '';
  const rawText = field.text ?? field.value ?? '';
  const body = rawText === null || rawText === undefined ? '' : String(rawText);
  const text = label && body ? `${label}：${body}` : label || body;

  const {
    type: _type,
    label: _label,
    value: _value,
    text: _text,
    variable: _variable,
    ...rest
  } = field;

  return {
    ...rest,
    type: 'subtitle',
    text,
  };
}

function normalizeWidgetId(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return LEGACY_WIDGET_ID_ALIASES[value] ?? value;
}

function normalizeRoutineStep(step: PlainRecord): void {
  if (typeof step.func !== 'string') return;

  if (Array.isArray(step.collection)) {
    step.collection = step.collection.map(normalizeWidgetId);
  } else if (typeof step.collection === 'string') {
    step.collection = normalizeWidgetId(step.collection);
  }

  // VirtualTabletop's current MOVEXY schema uses `from`; older project routines used
  // `collection`. Convert generated routines without changing the compatibility exports.
  if (step.func === 'MOVEXY' && step.from === undefined && step.collection !== undefined) {
    step.from = step.collection;
    delete step.collection;
  }
}

function normalizeInputStep(step: PlainRecord): void {
  if (step.func !== 'INPUT') return;

  if (Array.isArray(step.fields)) {
    step.fields = step.fields.map(normalizeLegacyTextField);
  }

  const isBlocking = step.block !== false;
  if (step.confirmButtonText === undefined) {
    step.confirmButtonText = isBlocking ? '确认' : '知道了';
  }

  if (step.cancelButtonText === undefined) {
    step.cancelButtonText = isBlocking ? '取消' : null;
    if (!isBlocking && step.cancelButtonIcon === undefined) {
      step.cancelButtonIcon = null;
    }
  }
}

/**
 * Finalizes every generated game object before packaging:
 * - installs the safe recycle-zone runtime routines;
 * - upgrades legacy routine references to the current VirtualTabletop schema;
 * - normalizes every INPUT dialog, including deeply nested IF branches and controller routines.
 *
 * Only fields inside INPUT.fields are converted from legacy text fields, so legitimate card-face
 * objects such as { type: 'text', value: '牌背' } remain unchanged.
 */
export function normalizeInputDialogs<T>(value: T): T {
  applyRecycleZoneRuntimeFixes(value);

  const visited = new WeakSet<object>();

  const visit = (current: unknown): void => {
    if (typeof current !== 'object' || current === null) return;
    if (visited.has(current)) return;
    visited.add(current);

    if (Array.isArray(current)) {
      for (const item of current) visit(item);
      return;
    }

    const record = current as PlainRecord;
    normalizeRoutineStep(record);
    normalizeInputStep(record);
    for (const nested of Object.values(record)) visit(nested);
  };

  visit(value);
  return value;
}
