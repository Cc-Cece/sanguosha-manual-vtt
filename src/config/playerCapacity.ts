export const PLAYER_CAPACITY = {
  minOpenSeats: 4,
  defaultOpenSeats: 4,
  maxSeats: 12,
  defaultScale: 1.0,
  allowedScales: [0.75, 0.9, 1.0, 1.15] as const,
} as const;

export const seatIds = (count = PLAYER_CAPACITY.maxSeats): string[] =>
  Array.from({ length: count }, (_, i) => `seat-${i + 1}`);

export const playerModuleIds = (count = PLAYER_CAPACITY.maxSeats): string[] =>
  Array.from({ length: count }, (_, i) => `player-module-${i + 1}`);
