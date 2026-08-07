const MAX_PLAYER_COUNT = 12;

export const privateZoneIds = Array.from(
  { length: MAX_PLAYER_COUNT },
  (_, index) => `private-zone-${index + 1}`,
);

/**
 * Compatibility exports retained for older imports and saved routines.
 * Private zones are now permanent face-down zones, so no routine can enable
 * showInactiveFaceToSeat or expose an inactive face.
 */
export const privatePeekButtonIds: string[] = [];

export const createResetPrivatePeekRoutine = (_number: number) => [] as const;
export const resetAllPrivatePeeksRoutine = [] as const;
export const createPrivatePeekEnterRoutine = (_number: number) => [] as const;
export const createPrivatePeekLeaveRoutine = (_number: number) => [] as const;
export const createPrivatePeekClickRoutine = (_number: number) => [] as const;
