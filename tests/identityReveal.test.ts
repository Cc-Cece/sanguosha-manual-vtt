import { describe, expect, it } from 'vitest';
import { createAssetDecks } from '../src/data/assetDecks.js';
import { createIdentityCardClickRoutine } from '../src/routines/identityReveal.js';
import { handZoneFlipFaceUpRoutine } from '../src/routines/playerHand.js';
import {
  createPrivatePeekClickRoutine,
  createPrivatePeekEnterRoutine,
} from '../src/routines/privateZone.js';
import type { AssetCatalog } from '../src/types/assets.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

const identityCatalog: AssetCatalog = {
  sourceRoot: 'test',
  generatedAt: '2026-08-06T00:00:00.000Z',
  assets: [
    {
      id: 'asset-1',
      sequence: 1,
      cardId: 1,
      category: 'identities',
      source: 'identity.png',
      optimizedFile: 'identities/0001.webp',
      asset: '/assets/identity-face',
      bytes: 1,
      width: 90,
      height: 126,
      label: '主公',
    },
  ],
  backs: {
    generals: '/assets/general-back',
    identities: '/assets/identity-back',
    main: '/assets/main-back',
  },
  backAssets: [],
};

describe('identity reveal confirmation', () => {
  it('creates every identity card covered and attaches the guarded click routine', () => {
    const widgets = createAssetDecks(identityCatalog);
    const identity = widgets.find(widget => widget.id === 'card-1');

    expect(identity?.activeFace).toBe(0);
    expect(identity?.identityCard).toBe(true);
    expect(Array.isArray(identity?.clickRoutine)).toBe(true);
  });

  it('requires confirmation before a public back-to-front flip and covers directly', () => {
    const objects = collectObjects(createIdentityCardClickRoutine('card-identity'));

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'IF',
      operand1: '${PROPERTY activeFace OF card-identity}',
      operand2: 0,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'INPUT',
      header: '公开身份牌？',
      block: true,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'FLIP',
      collection: ['card-identity'],
      face: 1,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'FLIP',
      collection: ['card-identity'],
      face: 0,
    }));
  });

  it('uses Seat-local private viewing instead of changing the shared face in a private zone', () => {
    const routine = createIdentityCardClickRoutine('card-private');
    const privateBranch = collectObjects(routine).find(object =>
      object.func === 'IF' && object.operand2 === 'private-zone-3'
    );
    const branchObjects = collectObjects(privateBranch?.thenRoutine);

    expect(branchObjects).toContainEqual(expect.objectContaining({
      func: 'INPUT',
      header: '查看身份牌？',
      block: true,
    }));
    expect(branchObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['private-zone-3'],
      property: 'showInactiveFaceToSeat',
      value: ['seat-3'],
    }));
    expect(branchObjects.some(object =>
      object.func === 'FLIP' && object.face === 1
    )).toBe(false);
  });

  it('does not let desktop hover bypass confirmation when an identity is present', () => {
    const enterObjects = collectObjects(createPrivatePeekEnterRoutine(4));
    const clickObjects = collectObjects(createPrivatePeekClickRoutine(4));

    expect(enterObjects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      property: 'deck',
      value: 'identity-deck',
      mode: 'intersect',
    }));
    expect(enterObjects.some(object => object.func === 'INPUT')).toBe(false);
    expect(clickObjects).toContainEqual(expect.objectContaining({
      func: 'INPUT',
      header: '查看身份牌？',
      block: true,
    }));
    expect(clickObjects).toContainEqual(expect.objectContaining({
      func: 'SET',
      collection: ['private-zone-4'],
      property: 'showInactiveFaceToSeat',
      value: ['seat-4'],
    }));
  });

  it('excludes identity cards from automatic personal-hand face-up behavior', () => {
    const objects = collectObjects(handZoneFlipFaceUpRoutine);

    expect(objects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      source: 'ordinaryHandCards',
      property: 'deck',
      relation: '!=',
      value: 'identity-deck',
      mode: 'intersect',
    }));
    expect(objects.some(object =>
      object.func === 'FLIP' && object.holder === 'personal-hand'
    )).toBe(false);
  });
});
