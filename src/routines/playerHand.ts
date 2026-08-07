export const handZoneFlipFaceUpRoutine = [
  {
    func: 'SELECT',
    source: 'all',
    type: 'card',
    property: 'parent',
    relation: '==',
    value: 'personal-hand',
    collection: 'ordinaryHandCards',
  },
  {
    func: 'SELECT',
    source: 'ordinaryHandCards',
    type: 'card',
    property: 'deck',
    relation: '!=',
    value: 'identity-deck',
    collection: 'ordinaryHandCards',
    mode: 'intersect',
  },
  { func: 'FLIP', collection: 'ordinaryHandCards', face: 1 },
] as const;

/**
 * A holder leaveRoutine receives the departing widget in the built-in `child` collection.
 * Only identity cards are covered here; ordinary cards remain face up when played from hand.
 */
export const handZoneCoverLeavingIdentityRoutine = [
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
] as const;
