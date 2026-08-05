import { describe, expect, it } from 'vitest';
import { normalizeInputDialogs } from '../src/routines/inputDialog.js';
import { createUniversalPrototype } from '../src/variants/createUniversalPrototype.js';
import { loadTestCatalog } from './helpers.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectInputSteps(value: unknown): Record<string, unknown>[] {
  const results: Record<string, unknown>[] = [];
  const visited = new WeakSet<object>();

  const visit = (current: unknown): void => {
    if (typeof current !== 'object' || current === null) return;
    if (visited.has(current)) return;
    visited.add(current);

    if (Array.isArray(current)) {
      current.forEach(visit);
      return;
    }

    const record = current as Record<string, unknown>;
    if (record.func === 'INPUT') results.push(record);
    Object.values(record).forEach(visit);
  };

  visit(value);
  return results;
}

describe('global INPUT dialog normalization', () => {
  it('converts legacy information rows and localizes default buttons', () => {
    const sample = {
      face: {
        objects: [{ type: 'text', value: '牌背' }],
      },
      routine: [
        {
          func: 'INPUT',
          header: '普通提示',
          fields: [{ type: 'text', label: '提示', value: '正文应当显示' }],
          block: false,
        },
        {
          func: 'IF',
          thenRoutine: [
            {
              func: 'INPUT',
              header: '危险操作',
              fields: [{ type: 'text', text: '确认后继续。' }],
              block: true,
            },
          ],
        },
      ],
    };

    normalizeInputDialogs(sample);

    const inputs = collectInputSteps(sample);
    expect(inputs[0].fields).toEqual([
      { type: 'subtitle', text: '提示：正文应当显示' },
    ]);
    expect(inputs[0].confirmButtonText).toBe('知道了');
    expect(inputs[0].cancelButtonText).toBeNull();
    expect(inputs[0].cancelButtonIcon).toBeNull();

    expect(inputs[1].fields).toEqual([
      { type: 'subtitle', text: '确认后继续。' },
    ]);
    expect(inputs[1].confirmButtonText).toBe('确认');
    expect(inputs[1].cancelButtonText).toBe('取消');

    expect(sample.face.objects[0]).toEqual({ type: 'text', value: '牌背' });
  });

  it('removes every legacy text field from the generated game file', () => {
    const game = createUniversalPrototype(loadTestCatalog());
    const inputs = collectInputSteps(game);

    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) {
      const fields = Array.isArray(input.fields) ? input.fields : [];
      expect(fields.some(field => isRecord(field) && field.type === 'text')).toBe(false);
      expect(typeof input.confirmButtonText).toBe('string');
      if (input.block === false) {
        expect(input.cancelButtonText).toBeNull();
        expect(input.cancelButtonIcon).toBeNull();
      } else {
        expect(typeof input.cancelButtonText).toBe('string');
      }
    }
  });
});
