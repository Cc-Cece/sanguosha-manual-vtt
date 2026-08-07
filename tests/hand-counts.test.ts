import { describe, expect, it } from 'vitest';
import { updateHandCountsRoutine } from '../src/routines/tableActions.js';
import { createFourPlayerPrototype } from '../src/variants/createFourPlayerPrototype.js';
import { loadTestCatalog } from './helpers.js';

const serialized = (value: unknown): string => JSON.stringify(value);

describe('physical hand counts', () => {
  it('counts only cards physically inside each private or public hand holder', () => {
    expect(updateHandCountsRoutine).toHaveLength(12 * 4);

    for (let number = 1; number <= 12; number += 1) {
      const offset = (number - 1) * 4;
      expect(updateHandCountsRoutine[offset]).toEqual({
        func: 'SELECT',
        source: 'all',
        type: 'card',
        property: 'parent',
        relation: '==',
        value: `personal-hand-seat-${number}`,
        collection: `seat${number}HandCards`,
      });
      expect(updateHandCountsRoutine[offset + 1]).toEqual({
        func: 'SELECT',
        source: 'all',
        type: 'card',
        property: 'parent',
        relation: '==',
        value: `public-hand-back-seat-${number}`,
        collection: `seat${number}HandCards`,
        mode: 'add',
      });
      expect(updateHandCountsRoutine[offset + 2]).toEqual({
        func: 'COUNT',
        collection: `seat${number}HandCards`,
        variable: `seat${number}HandCount`,
      });
      expect(updateHandCountsRoutine[offset + 3]).toEqual({
        func: 'LABEL',
        label: [`hand-count-${number}`],
        value: `\${seat${number}HandCount}`,
      });
    }

    const routine = serialized(updateHandCountsRoutine);
    expect(routine).not.toContain('"property":"owner"');
    expect(routine).not.toContain('"property":"publicHandSourceSeat"');
  });

  it('keeps ownership/source metadata separate from the count definition', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());

    expect(game['personal-hand-seat-1']).toMatchObject({ childrenPerOwner: true });
    expect(game['public-hand-back-seat-1']).toMatchObject({
      onEnter: { owner: null, publicHandSourceSeat: 'seat-1' },
      onLeave: { owner: null, publicHandSourceSeat: null },
    });
  });

  it('refreshes counts on private/public hand transitions and exposure actions', () => {
    const game = createFourPlayerPrototype(loadTestCatalog());
    const updateCall = '"func":"CALL","widget":"table-controller","routine":"updateHandCountsRoutine"';

    for (const id of ['personal-hand-seat-1', 'public-hand-back-seat-1']) {
      const holder = game[id] as Record<string, unknown>;
      expect(serialized(holder.enterRoutine)).toContain(updateCall);
      expect(serialized(holder.leaveRoutine)).toContain(updateCall);
    }

    for (const id of ['show-hand-back-seat-1', 'hide-hand-back-seat-1']) {
      const button = game[id] as Record<string, unknown>;
      expect(serialized(button.clickRoutine)).toContain(updateCall);
    }
  });
});
