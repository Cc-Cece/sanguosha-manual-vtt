import type { RoutineStep, Widget } from '../types/vtt.js';
import { cardBack, widget } from '../widgets/factory.js';

export const CONVERSION_STATE_COPIES = 12;
/** Compatibility alias retained for callers that used the former A/B slot constant. */
export const CONVERSION_STATE_COPIES_PER_SLOT = CONVERSION_STATE_COPIES;

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

function conversionStateFace(state: '阳' | '阴') {
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
        value: '转换技',
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

export function createConversionStateDecks(): Widget[] {
  const deckId = 'conversion-state-deck';
  const holderId = 'conversion-state-reserve';
  const cardType = 'conversion-state';
  const deck = widget(deckId, 'deck', {
    parent: holderId,
    cardDefaults: { width: 90, height: 126, enlarge: 4.6 },
    faceTemplates: [
      cardBack('转换技'),
      conversionStateFace('阳'),
      conversionStateFace('阴'),
    ],
    cardTypes: {
      [cardType]: { label: '转换技阴阳状态牌' },
    },
  });

  const cards = Array.from({ length: CONVERSION_STATE_COPIES }, (_, index) =>
    widget(`conversion-state-card-${index + 1}`, 'card', {
      deck: deckId,
      cardType,
      parent: holderId,
      activeFace: 0,
      clickable: false,
      conversionStateMarker: true,
      clickRoutine: toggleConversionStateRoutine,
    }),
  );

  return [deck, ...cards];
}
