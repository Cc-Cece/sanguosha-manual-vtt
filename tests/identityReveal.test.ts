import { describe, expect, it } from 'vitest';
import { createAssetDecks } from '../src/data/assetDecks.js';
import { createIdentityCardClickRoutine } from '../src/routines/identityReveal.js';
import {
  createHandZoneFlipFaceUpRoutine,
  handZoneCoverLeavingIdentityRoutine,
} from '../src/routines/playerHand.js';
import type { AssetCatalog } from '../src/types/assets.js';
import type { ReserveModel } from '../src/types/reserveLibrary.js';

function collectObjects(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.flatMap(collectObjects);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return [record, ...Object.values(record).flatMap(collectObjects)];
  }
  return [];
}

const emptyReserveModel: ReserveModel = {
  categories: [],
  cards: [],
  pages: [],
  views: [],
  allPageIds: [],
  generalCardIds: [],
  extraCardIds: [],
};

const identityCatalog: AssetCatalog = {
  sourceRoot: 'test',
  generatedAt: '2026-08-06T00:00:00.000Z',
  assets: [{
    id: 'asset-1',
    sequence: 1,
    cardId: 1,
    category: 'identities',
    subCategory: 'identity',
    source: 'identity.png',
    optimizedFile: 'identity-cards/role_lord.webp',
    asset: '/assets/identity-face',
    bytes: 1,
    width: 90,
    height: 126,
    label: '主公',
  }],
  backs: {
    generals: '/assets/general-back',
    identities: '/assets/identity-back',
    main: '/assets/main-back',
  },
  backAssets: [],
};

describe('identity reveal contexts', () => {
  it('creates every identity card covered and attaches the guarded click routine', () => {
    const widgets = createAssetDecks(identityCatalog, emptyReserveModel);
    const identity = widgets.find(widget => widget.id === 'card-1');
    expect(identity?.activeFace).toBe(0);
    expect(identity?.identityCard).toBe(true);
    expect(Array.isArray(identity?.clickRoutine)).toBe(true);
  });

  it('requires only a local non-blocking confirmation before public reveal', () => {
    const objects = collectObjects(createIdentityCardClickRoutine('card-identity'));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'IF',
      operand1: '${PROPERTY activeFace OF card-identity}',
      operand2: 0,
    }));
    expect(objects).toContainEqual(expect.objectContaining({
      func: 'INPUT',
      header: '公开身份牌？',
      block: false,
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

  it('keeps identity reserve, face-down zones and temporary public hand backs inert', () => {
    const objects = collectObjects(createIdentityCardClickRoutine('card-private'));
    const reserveBranch = objects.find(object => object.func === 'IF' && object.operand2 === 'identity-reserve');
    const privateBranch = objects.find(object => object.func === 'IF' && object.operand2 === 'private-zone-3');
    const publicHandBranch = objects.find(object => object.func === 'IF' && object.operand2 === 'public-hand-back-seat-3');

    expect(reserveBranch?.thenRoutine).toEqual([]);
    expect(privateBranch?.thenRoutine).toEqual([]);
    expect(publicHandBranch?.thenRoutine).toEqual([]);
  });

  it('reveals directly and without a dialog inside any seat-scoped personal hand', () => {
    const routine = createIdentityCardClickRoutine('card-hand');
    const handBranch = collectObjects(routine).find(object =>
      object.func === 'IF' && object.operand2 === 'personal-hand-seat-7');
    const handObjects = collectObjects(handBranch?.thenRoutine);

    expect(handObjects).toContainEqual(expect.objectContaining({
      func: 'FLIP',
      collection: ['card-hand'],
      face: 1,
    }));
    expect(handObjects.some(object => object.func === 'INPUT')).toBe(false);
  });

  it('keeps identities covered on hand entry and covers only identities on hand exit', () => {
    const enterObjects = collectObjects(createHandZoneFlipFaceUpRoutine('personal-hand-seat-1', 'ordinaryHandCardsSeat1'));
    const leaveObjects = collectObjects(handZoneCoverLeavingIdentityRoutine);

    expect(enterObjects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      source: 'ordinaryHandCardsSeat1',
      property: 'deck',
      relation: '!=',
      value: 'identity-deck',
      mode: 'intersect',
    }));
    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'SELECT',
      source: 'child',
      property: 'deck',
      relation: '==',
      value: 'identity-deck',
      collection: 'leavingIdentityCards',
    }));
    expect(leaveObjects).toContainEqual(expect.objectContaining({
      func: 'FLIP',
      collection: 'leavingIdentityCards',
      face: 0,
    }));
  });
});
