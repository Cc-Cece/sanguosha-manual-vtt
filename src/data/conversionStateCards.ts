import type { RoutineStep, Widget } from '../types/vtt.js';
import { cardBack, widget } from '../widgets/factory.js';

export const CONVERSION_STATE_COPIES_PER_SLOT = 12;

const toggleConversionStateRoutine: RoutineStep[] = [
  {
    func: 'GET',
    collection: 'thisButton',
    property: 'activeFace',
    variable: 'conversionStateFace',
  },
  {
    func: 'IF',
    operand1: '${conversionStateFace}',
    relation: '==',
    operand2: 1,
    thenRoutine: [
      { func: 'SET', collection: 'thisButton', property: 'activeFace', value: 2 },
    ],
    elseRoutine: [
      { func: 'SET', collection: 'thisButton', property: 'activeFace', value: 1 },
    ],
  },
];

function conversionStateFace(slot: 'A' | 'B', state: '阳' | '阴') {
  const isYang = state === '阳';
  const accent = isYang ? '#f3b43f' : '#8797d8';
  const symbol = isYang ? '☀' : '☾';
  const nextState = isYang ? '阴' : '阳';

  return {
    border: false,
    radius: 7,
    objects: [
      {
        type: 'text',
        x: 5,
        y: 8,
        width: 80,
        height: 22,
        value: `转换技 ${slot}`,
        color: '#f5ead1',
        fontSize: 12,
        textAlign: 'center',
      },
      {
        type: 'text',
        x: 5,
        y: 30,
        width: 80,
        height: 36,
        value: symbol,
        color: accent,
        fontSize: 30,
        textAlign: 'center',
      },
      {
        type: 'text',
        x: 5,
        y: 66,
        width: 80,
        height: 34,
        value: state,
        color: accent,
        fontSize: 27,
        textAlign: 'center',
      },
      {
        type: 'text',
        x: 5,
        y: 104,
        width: 80,
        height: 15,
        value: `点击切换为${nextState}`,
        color: '#d7d0bd',
        fontSize: 9,
        textAlign: 'center',
      },
    ],
    css: {
      background: isYang
        ? 'radial-gradient(circle at 50% 38%,#654817 0%,#2e2112 58%,#15100c 100%)'
        : 'radial-gradient(circle at 50% 38%,#29365c 0%,#171d35 58%,#0c1020 100%)',
      border: `3px solid ${accent}`,
      borderRadius: '7px',
      boxShadow: `inset 0 0 14px ${isYang ? '#f3b43f33' : '#8797d833'}`,
    },
  };
}

function createConversionSlotDeck(slot: 'A' | 'B', holder: string): Widget[] {
  const slotKey = slot.toLowerCase();
  const deckId = `conversion-${slotKey}-deck`;
  const cardType = `conversion-${slotKey}`;
  const deck = widget(deckId, 'deck', {
    parent: holder,
    cardDefaults: { width: 90, height: 126, enlarge: 4.6 },
    faceTemplates: [
      cardBack(`转换技 ${slot}`),
      conversionStateFace(slot, '阳'),
      conversionStateFace(slot, '阴'),
    ],
    cardTypes: {
      [cardType]: { label: `转换技 ${slot} 状态牌` },
    },
  });

  const cards = Array.from({ length: CONVERSION_STATE_COPIES_PER_SLOT }, (_, index) =>
    widget(`conversion-${slotKey}-card-${index + 1}`, 'card', {
      deck: deckId,
      cardType,
      parent: holder,
      activeFace: 0,
      clickable: false,
      conversionStateSlot: slot,
      clickRoutine: toggleConversionStateRoutine,
    }),
  );

  return [deck, ...cards];
}

export function createConversionStateDecks(): Widget[] {
  return [
    ...createConversionSlotDeck('A', 'conversion-a-reserve'),
    ...createConversionSlotDeck('B', 'conversion-b-reserve'),
  ];
}
