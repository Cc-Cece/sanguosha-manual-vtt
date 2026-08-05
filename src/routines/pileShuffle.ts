export const createPileShuffleRoutine = (holderId: string) => [
  {
    func: 'FLIP',
    holder: [holderId],
    face: 0,
  },
  {
    func: 'SHUFFLE',
    holder: [holderId],
    mode: 'true random',
  },
] as const;

export const shuffleDrawPileRoutine = createPileShuffleRoutine('draw-pile');
export const shuffleGeneralReserveRoutine = createPileShuffleRoutine('general-reserve');
export const shuffleIdentityReserveRoutine = createPileShuffleRoutine('identity-reserve');
export const shuffleExtraReserveRoutine = createPileShuffleRoutine('extra-reserve');
export const shuffleMarkerReserveRoutine = createPileShuffleRoutine('marker-reserve');
