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
