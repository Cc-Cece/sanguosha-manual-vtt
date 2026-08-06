import type { RoutineStep, Widget } from '../types/vtt.js';
import { widget } from './factory.js';

export type ShuffleAnimationId =
  | 'quick-shuffle'
  | 'draw-pile'
  | 'recycle-zone'
  | 'general-reserve'
  | 'identity-reserve'
  | 'extra-reserve'
  | 'marker-reserve';

interface ShuffleAnimationSpec {
  id: ShuffleAnimationId;
  x: number;
  y: number;
  parent?: string;
}

const CARD_WIDTH = 90;
const CARD_HEIGHT = 126;
const VISUAL_CARD_COUNT = 6;
const SPLIT_DELAY_MS = 180;
const RIFFLE_DELAY_MS = 180;
const SETTLE_DELAY_MS = 220;
const FADE_DELAY_MS = 120;

const shuffleAnimationSpecs: Record<ShuffleAnimationId, ShuffleAnimationSpec> = {
  'quick-shuffle': { id: 'quick-shuffle', x: 597, y: 428 },
  'draw-pile': { id: 'draw-pile', x: 738, y: 436 },
  'recycle-zone': { id: 'recycle-zone', x: 970, y: 428 },
  'general-reserve': { id: 'general-reserve', x: 23, y: 48, parent: 'reserve-tray' },
  'identity-reserve': { id: 'identity-reserve', x: 145, y: 48, parent: 'reserve-tray' },
  'extra-reserve': { id: 'extra-reserve', x: 267, y: 48, parent: 'reserve-tray' },
  'marker-reserve': { id: 'marker-reserve', x: 398, y: 48, parent: 'reserve-tray' },
};

export const SHUFFLE_BUTTON_IDS = [
  'quick-shuffle-btn',
  'shuffle-draw-pile-btn',
  'recycle-shuffle-btn',
  'shuffle-general-reserve-btn',
  'shuffle-identity-reserve-btn',
  'shuffle-extra-reserve-btn',
  'shuffle-marker-reserve-btn',
] as const;

export const lockShuffleControlsRoutine: RoutineStep[] = [
  { func: 'SET', collection: [...SHUFFLE_BUTTON_IDS], property: 'clickable', value: false },
];

export const unlockShuffleControlsRoutine: RoutineStep[] = [
  { func: 'SET', collection: [...SHUFFLE_BUTTON_IDS], property: 'clickable', value: true },
];

function visualCardId(animationId: ShuffleAnimationId, index: number): string {
  return `shuffle-animation-${animationId}-${index + 1}`;
}

function visualCardIds(animationId: ShuffleAnimationId): string[] {
  return Array.from({ length: VISUAL_CARD_COUNT }, (_, index) => visualCardId(animationId, index));
}

export function createShuffleAnimationWidgets(): Widget[] {
  return Object.values(shuffleAnimationSpecs).flatMap(spec =>
    Array.from({ length: VISUAL_CARD_COUNT }, (_, index) =>
      widget(visualCardId(spec.id, index), 'basic', {
        ...(spec.parent ? { parent: spec.parent } : {}),
        x: spec.x + (index % 3),
        y: spec.y - Math.floor(index / 2),
        z: index,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        text: '杀',
        display: false,
        movable: false,
        movableInEdit: false,
        clickable: false,
        layer: 20,
        shuffleX: 0,
        shuffleY: 0,
        shuffleRotation: 0,
        shuffleOpacity: 0,
        css: {
          default: {
            background: 'radial-gradient(circle at 50% 42%,#8b332d 0%,#521712 57%,#2b0908 100%)',
            border: '3px double #d4ad63',
            borderRadius: '7px',
            boxShadow: '0 5px 12px #0008',
            color: '#efd28c',
            fontSize: '25px',
            fontWeight: '700',
            lineHeight: `${CARD_HEIGHT}px`,
            textAlign: 'center',
            textShadow: '0 2px 2px #000',
            pointerEvents: 'none',
            userSelect: 'none',
            transformOrigin: '50% 92%',
            transition: [
              `translate ${SPLIT_DELAY_MS}ms cubic-bezier(.2,.8,.2,1)`,
              `rotate ${SPLIT_DELAY_MS}ms cubic-bezier(.2,.8,.2,1)`,
              `opacity ${FADE_DELAY_MS}ms ease-out`,
            ].join(', '),
          },
          inline: {
            translate: '${PROPERTY shuffleX}px ${PROPERTY shuffleY}px',
            rotate: '${PROPERTY shuffleRotation}deg',
            opacity: '${PROPERTY shuffleOpacity}',
          },
        },
      }),
    ),
  );
}

function setVisualProperty(collection: string[], property: string, value: number | boolean): RoutineStep {
  return { func: 'SET', collection, property, value };
}

export function createShuffleAnimationRoutine(animationId: ShuffleAnimationId): RoutineStep[] {
  const allIds = visualCardIds(animationId);
  const leftIds = allIds.filter((_, index) => index % 2 === 0);
  const rightIds = allIds.filter((_, index) => index % 2 === 1);

  return [
    setVisualProperty(allIds, 'shuffleX', 0),
    setVisualProperty(allIds, 'shuffleY', 0),
    setVisualProperty(allIds, 'shuffleRotation', 0),
    setVisualProperty(allIds, 'shuffleOpacity', 1),
    setVisualProperty(allIds, 'display', true),
    { func: 'DELAY', milliseconds: 20 },

    setVisualProperty(leftIds, 'shuffleX', -34),
    setVisualProperty(leftIds, 'shuffleY', -3),
    setVisualProperty(leftIds, 'shuffleRotation', -7),
    setVisualProperty(rightIds, 'shuffleX', 34),
    setVisualProperty(rightIds, 'shuffleY', -3),
    setVisualProperty(rightIds, 'shuffleRotation', 7),
    { func: 'DELAY', milliseconds: SPLIT_DELAY_MS },

    setVisualProperty(leftIds, 'shuffleX', 8),
    setVisualProperty(leftIds, 'shuffleY', 4),
    setVisualProperty(leftIds, 'shuffleRotation', 3),
    setVisualProperty(rightIds, 'shuffleX', -8),
    setVisualProperty(rightIds, 'shuffleY', -2),
    setVisualProperty(rightIds, 'shuffleRotation', -3),
    { func: 'DELAY', milliseconds: RIFFLE_DELAY_MS },

    setVisualProperty(allIds, 'shuffleX', 0),
    setVisualProperty(allIds, 'shuffleY', 0),
    setVisualProperty(allIds, 'shuffleRotation', 0),
    { func: 'DELAY', milliseconds: SETTLE_DELAY_MS },

    setVisualProperty(allIds, 'shuffleOpacity', 0),
    { func: 'DELAY', milliseconds: FADE_DELAY_MS },
    setVisualProperty(allIds, 'display', false),
  ];
}

export function createAnimatedShuffleSteps(
  holderId: string,
  animationId: ShuffleAnimationId,
  buttonId: string,
  restingButtonText = '🔀 洗牌',
): RoutineStep[] {
  return [
    ...lockShuffleControlsRoutine,
    { func: 'SET', collection: [buttonId], property: 'text', value: '⏳ 洗牌中…' },
    { func: 'FLIP', holder: [holderId], face: 0 },
    ...createShuffleAnimationRoutine(animationId),
    { func: 'SHUFFLE', holder: [holderId], mode: 'true random' },
    { func: 'SET', collection: [buttonId], property: 'text', value: restingButtonText },
    ...unlockShuffleControlsRoutine,
  ];
}
