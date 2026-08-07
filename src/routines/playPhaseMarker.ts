import type { GameFile, RoutineStep } from '../types/vtt.js';

export const MAX_PLAY_PHASE_SEATS = 12;

export const PLAY_PHASE_BADGE_IDS = Array.from(
  { length: MAX_PLAY_PHASE_SEATS },
  (_, index) => `play-phase-badge-${index + 1}`,
);

export const PLAY_PHASE_FRAME_IDS = Array.from(
  { length: MAX_PLAY_PHASE_SEATS },
  (_, index) => `play-phase-frame-${index + 1}`,
);

const hideAllMarkersRoutine: RoutineStep[] = [
  { func: 'SET', collection: PLAY_PHASE_BADGE_IDS, property: 'display', value: false },
  { func: 'SET', collection: PLAY_PHASE_FRAME_IDS, property: 'display', value: false },
];

/** Clears the global play-phase marker for every module. */
export const clearPlayPhaseRoutine: RoutineStep[] = [
  ...hideAllMarkersRoutine,
  { func: 'SET', collection: ['table-controller'], property: 'activePlaySeat', value: '' },
];

function activateSeatRoutine(seatNumber: number): RoutineStep[] {
  return [
    ...hideAllMarkersRoutine,
    { func: 'SET', collection: [`play-phase-badge-${seatNumber}`], property: 'display', value: true },
    { func: 'SET', collection: [`play-phase-frame-${seatNumber}`], property: 'display', value: true },
    {
      func: 'SET',
      collection: ['table-controller'],
      property: 'activePlaySeat',
      value: `seat-${seatNumber}`,
    },
  ];
}

/** Marks module `seatNumber` as the only 出牌中 player. */
export function createSetPlayPhaseRoutine(seatNumber: number): RoutineStep[] {
  if (!Number.isInteger(seatNumber) || seatNumber < 1 || seatNumber > MAX_PLAY_PHASE_SEATS) {
    throw new Error(`Invalid play-phase seat number: ${seatNumber}`);
  }
  return activateSeatRoutine(seatNumber);
}

function tryActivateVisibleSeat(seatNumber: number, elseRoutine: RoutineStep[]): RoutineStep {
  return {
    func: 'IF',
    operand1: `\${PROPERTY display OF player-module-${seatNumber}}`,
    relation: '==',
    operand2: true,
    thenRoutine: activateSeatRoutine(seatNumber),
    elseRoutine,
  };
}

/** Builds a chain that activates the first display:true module in `order`, or clears. */
function createScanRoutine(order: number[]): RoutineStep[] {
  let chain: RoutineStep[] = [...clearPlayPhaseRoutine];
  for (let index = order.length - 1; index >= 0; index -= 1) {
    chain = [tryActivateVisibleSeat(order[index]!, chain)];
  }
  return chain;
}

function seatOrderFrom(startExclusive: number): number[] {
  const order: number[] = [];
  for (let step = 1; step <= MAX_PLAY_PHASE_SEATS; step += 1) {
    const seatNumber = ((startExclusive - 1 + step) % MAX_PLAY_PHASE_SEATS) + 1;
    order.push(seatNumber);
  }
  return order;
}

/**
 * Advances the marker to the next visible player module (display == true).
 * If nobody is active, starts scanning from seat 1.
 */
export const advancePlayPhaseRoutine: RoutineStep[] = [
  {
    func: 'IF',
    operand1: '${PROPERTY activePlaySeat OF table-controller}',
    relation: '==',
    operand2: '',
    thenRoutine: createScanRoutine(seatOrderFrom(0)),
    elseRoutine: [
      {
        func: 'IF',
        operand1: '${PROPERTY activePlaySeat OF table-controller}',
        relation: '==',
        operand2: 'seat-1',
        thenRoutine: createScanRoutine(seatOrderFrom(1)),
        elseRoutine: [
          {
            func: 'IF',
            operand1: '${PROPERTY activePlaySeat OF table-controller}',
            relation: '==',
            operand2: 'seat-2',
            thenRoutine: createScanRoutine(seatOrderFrom(2)),
            elseRoutine: [
              {
                func: 'IF',
                operand1: '${PROPERTY activePlaySeat OF table-controller}',
                relation: '==',
                operand2: 'seat-3',
                thenRoutine: createScanRoutine(seatOrderFrom(3)),
                elseRoutine: [
                  {
                    func: 'IF',
                    operand1: '${PROPERTY activePlaySeat OF table-controller}',
                    relation: '==',
                    operand2: 'seat-4',
                    thenRoutine: createScanRoutine(seatOrderFrom(4)),
                    elseRoutine: [
                      {
                        func: 'IF',
                        operand1: '${PROPERTY activePlaySeat OF table-controller}',
                        relation: '==',
                        operand2: 'seat-5',
                        thenRoutine: createScanRoutine(seatOrderFrom(5)),
                        elseRoutine: [
                          {
                            func: 'IF',
                            operand1: '${PROPERTY activePlaySeat OF table-controller}',
                            relation: '==',
                            operand2: 'seat-6',
                            thenRoutine: createScanRoutine(seatOrderFrom(6)),
                            elseRoutine: [
                              {
                                func: 'IF',
                                operand1: '${PROPERTY activePlaySeat OF table-controller}',
                                relation: '==',
                                operand2: 'seat-7',
                                thenRoutine: createScanRoutine(seatOrderFrom(7)),
                                elseRoutine: [
                                  {
                                    func: 'IF',
                                    operand1: '${PROPERTY activePlaySeat OF table-controller}',
                                    relation: '==',
                                    operand2: 'seat-8',
                                    thenRoutine: createScanRoutine(seatOrderFrom(8)),
                                    elseRoutine: [
                                      {
                                        func: 'IF',
                                        operand1: '${PROPERTY activePlaySeat OF table-controller}',
                                        relation: '==',
                                        operand2: 'seat-9',
                                        thenRoutine: createScanRoutine(seatOrderFrom(9)),
                                        elseRoutine: [
                                          {
                                            func: 'IF',
                                            operand1: '${PROPERTY activePlaySeat OF table-controller}',
                                            relation: '==',
                                            operand2: 'seat-10',
                                            thenRoutine: createScanRoutine(seatOrderFrom(10)),
                                            elseRoutine: [
                                              {
                                                func: 'IF',
                                                operand1: '${PROPERTY activePlaySeat OF table-controller}',
                                                relation: '==',
                                                operand2: 'seat-11',
                                                thenRoutine: createScanRoutine(seatOrderFrom(11)),
                                                elseRoutine: createScanRoutine(seatOrderFrom(12)),
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

type PlainRecord = Record<string, unknown>;

function isRecord(value: unknown): value is PlainRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Finalizes controller state and appends play-phase help after other runtime metadata patches. */
export function applyPlayPhaseMarkerRuntime<T extends GameFile>(game: T): T {
  const root = game as unknown as PlainRecord;
  const controller = root['table-controller'];
  if (isRecord(controller) && typeof controller.activePlaySeat !== 'string') {
    controller.activePlaySeat = '';
  }

  const meta = isRecord(root._meta) ? root._meta : null;
  const info = meta && isRecord(meta.info) ? meta.info : null;
  if (info && typeof info.helpText === 'string' && !info.helpText.includes('出牌标识：')) {
    info.helpText += '\n10. 出牌标识：每个玩家模块标题栏有「出牌」「下一位」。点「出牌」将该模块标为「出牌中」（全员可见高亮）；点「下一位」按席位顺序自动切到下一个已开启的模块。仅为同步用的人工标识，不自动结算回合。';
  }

  return game;
}
