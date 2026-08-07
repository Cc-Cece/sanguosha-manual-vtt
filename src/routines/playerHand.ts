import type { RoutineStep } from '../types/vtt.js';

export function createHandZoneFlipFaceUpRoutine(holderId: string, collection = 'ordinaryHandCards'): RoutineStep[] {
  return [
    {
      func: 'SELECT',
      source: 'all',
      type: 'card',
      property: 'parent',
      relation: '==',
      value: holderId,
      collection,
    },
    {
      func: 'SELECT',
      source: collection,
      type: 'card',
      property: 'deck',
      relation: '!=',
      value: 'identity-deck',
      collection,
      mode: 'intersect',
    },
    { func: 'FLIP', collection, face: 1 },
  ];
}

/** Compatibility export for older generated prototypes. */
export const handZoneFlipFaceUpRoutine = createHandZoneFlipFaceUpRoutine('personal-hand');

/**
 * A holder leaveRoutine receives the departing widget in the built-in `child` collection.
 * Only identity cards are covered here; ordinary cards remain face up when played from hand.
 */
export const handZoneCoverLeavingIdentityRoutine: RoutineStep[] = [
  {
    func: 'SELECT',
    source: 'child',
    type: 'card',
    property: 'deck',
    relation: '==',
    value: 'identity-deck',
    collection: 'leavingIdentityCards',
  },
  { func: 'FLIP', collection: 'leavingIdentityCards', face: 0 },
];
