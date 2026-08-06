import type { AssetCatalog } from '../types/assets.js';
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

type ShuffleBackKey = keyof AssetCatalog['backs'];

interface ShuffleAnimationSpec {
  id: ShuffleAnimationId;
  x: number;
  y: number;
  parent?: string;
  backKey: ShuffleBackKey;
}

const CARD_WIDTH = 90;
const CARD_HEIGHT = 126;
const VISUAL_CARD_COUNT = 6;
const SPLIT_DELAY_MS = 180;
const RIFFLE_DELAY_MS = 180;
const SETTLE_DELAY_MS = 220;
const FADE_DELAY_MS = 120;

const shuffleAnimationSpecs: Record<ShuffleAnimationId, ShuffleAnimationSpec> = {
  'quick-shuffle': { id: 'quick-shuffle', x: 597, y: 428, backKey: 'main' },
  'draw-pile': { id: 'draw-pile', x: 738, y: 436, backKey: 'main' },
  'recycle-zone': { id: 'recycle-zone', x: 970, y: 428, backKey: 'main' },
  'general-reserve': { id: 'general-reserve', x: 23, y: 48, parent: 'reserve-tray', backKey: 'generals' },
  'identity-reserve': { id: 'identity-reserve', x: 145, y: 48, parent: 'reserve-tray', backKey: 'identities' },
  'extra-reserve': { id: 'extra-reserve', x: 267, y: 48, parent: 'reserve-tray', backKey: 'main' },
  'marker-reserve': { id: 'marker-reserve', x: 398, y: 48, parent: 'reserve-tray', backKey: 'main' },
};

/**
 * Controls that can mutate a pile or enqueue a host-approved mutation. Locking both the host
 * buttons and the ordinary-player request buttons prevents a second operation from being queued
 * while the synchronized animation is still running.
 */
export const SHUFFLE_BUTTON_IDS = [
  'quick-shuffle-btn',
  'shuffle-draw-pile-btn',
  'recycle-shuffle-btn',
  'shuffle-general-reserve-btn',
  'shuffle-identity-reserve-btn',
  'shuffle-extra-reserve-btn',
  'shuffle-marker-reserve-btn',
  'collect-shuffle',
  'request-collect-table-cards',
  'request-shuffle-draw-pile-btn',
  'request-shuffle-recycle-btn',
  'request-shuffle-general-reserve-btn',
  'request-shuffle-identity-reserve-btn',
  'request-shuffle-extra-reserve-btn',
  'request-shuffle-marker-reserve-btn',
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

export function createShuffleAnimationWidgets(backs: AssetCatalog['backs']): Widget[] {
  return Object.values(shuffleAnimationSpecs).flatMap(spec =>
    Array.from({ length: VISUAL_CARD_COUNT }, (_, index) =>
      widget(visualCardId(spec.id, index), 'basic', {
        ...(spec.parent ? { parent: spec.parent } : {}),
        x: spec.x + (index % 3),
        y: spec.y - Math.floor(index / 2),
        z: index,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        display: false,
        movable: false,
        movableInEdit: false,
        clickable: false,
        layer: 20,
        shuffleBackKey: spec.backKey,
        shuffleX: 0,
        shuffleY: 0,
        shuffleRotation: 0,
        shuffleOpacity: 0,
        css: {
          default: {
            backgroundColor: 'transparent',
            backgroundImage: `url("${backs[spec.backKey]}")`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            border: 'none',
            borderRadius: '6px',
            boxShadow: '0 5px 12px #0008',
            overflow: 'hidden',
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
