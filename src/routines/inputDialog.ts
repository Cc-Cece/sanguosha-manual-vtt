import { applyRecycleZoneRuntimeFixes } from './recycleZoneRuntime.js';

type PlainRecord = Record<string, unknown>;

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
 * Normalizes every INPUT routine in a generated game file, including deeply nested IF branches
 * and routines stored on controller widgets. Only fields inside INPUT.fields are touched, so
 * legitimate card-face objects such as { type: 'text', value: '牌背' } remain unchanged.
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
    normalizeInputStep(record);
    for (const nested of Object.values(record)) visit(nested);
  };

  visit(value);
  return value;
}
