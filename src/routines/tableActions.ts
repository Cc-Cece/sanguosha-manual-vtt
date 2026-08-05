export const shuffleRoutine = [
  { func: 'SHUFFLE', collection: ['main-deck'] },
] as const;

export const resetTableRoutine = [
  { func: 'RECALL', holder: ['main-deck-holder'] },
  { func: 'RECALL', holder: ['general-deck-holder'] },
  { func: 'FLIP', collection: ['main-deck', 'general-deck'], face: 0 },
  { func: 'SHUFFLE', collection: ['main-deck', 'general-deck'] },
] as const;
