const MAX_PLAYER_COUNT = 12;

export const privateZoneIds = Array.from(
  { length: MAX_PLAYER_COUNT },
  (_, index) => `private-zone-${index + 1}`,
);

export const privatePeekButtonIds = Array.from(
  { length: MAX_PLAYER_COUNT },
  (_, index) => `toggle-perspective-${index + 1}`,
);

const seatIdFor = (number: number) => `seat-${number}`;
const privateZoneIdFor = (number: number) => `private-zone-${number}`;
const privatePeekButtonIdFor = (number: number) => `toggle-perspective-${number}`;

/**
 * Default privacy state: every client sees only the active face (face 0 / card back).
 * The holder's showInactiveFaceToSeat property is enabled only while the owning Seat peeks.
 */
export const createResetPrivatePeekRoutine = (number: number) => [
  {
    func: 'SET',
    collection: [privateZoneIdFor(number)],
    property: 'showInactiveFaceToSeat',
    value: null,
  },
  {
    func: 'SET',
    collection: [privatePeekButtonIdFor(number)],
    property: 'mobilePeekOpen',
    value: false,
  },
] as const;

export const resetAllPrivatePeeksRoutine = [
  {
    func: 'SET',
    collection: privateZoneIds,
    property: 'showInactiveFaceToSeat',
    value: null,
  },
  {
    func: 'SET',
    collection: privatePeekButtonIds,
    property: 'mobilePeekOpen',
    value: false,
  },
] as const;

const createOwnedSeatGuard = (number: number, allowedRoutine: readonly Record<string, unknown>[]) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY player OF ${seatIdFor(number)}}`,
    relation: '==',
    operand2: '${playerName}',
    thenRoutine: allowedRoutine,
    elseRoutine: createResetPrivatePeekRoutine(number),
  },
] as const;

/** Desktop: entering the eye button reveals the inactive face only to this Seat. */
export const createPrivatePeekEnterRoutine = (number: number) =>
  createOwnedSeatGuard(number, [
    {
      func: 'SET',
      collection: [privateZoneIdFor(number)],
      property: 'showInactiveFaceToSeat',
      value: [seatIdFor(number)],
    },
  ]);

/** Desktop: leaving the eye button immediately returns everyone, including the owner, to backs. */
export const createPrivatePeekLeaveRoutine = (number: number) =>
  createResetPrivatePeekRoutine(number);

/**
 * Touch devices: one tap opens the local Seat view and the next tap covers it again.
 * On desktop, a click may set the mobile latch, but mouseleave always clears it, so the
 * face cannot remain exposed after the pointer leaves the eye button.
 */
export const createPrivatePeekClickRoutine = (number: number) =>
  createOwnedSeatGuard(number, [
    {
      func: 'IF',
      operand1: `\${PROPERTY mobilePeekOpen OF ${privatePeekButtonIdFor(number)}}`,
      relation: '==',
      operand2: true,
      thenRoutine: createResetPrivatePeekRoutine(number),
      elseRoutine: [
        {
          func: 'SET',
          collection: [privateZoneIdFor(number)],
          property: 'showInactiveFaceToSeat',
          value: [seatIdFor(number)],
        },
        {
          func: 'SET',
          collection: [privatePeekButtonIdFor(number)],
          property: 'mobilePeekOpen',
          value: true,
        },
      ],
    },
  ]);
