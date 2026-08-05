import type { Widget } from '../types/vtt.js';
import { cardBack, widget } from '../widgets/factory.js';

export function healthCardFace(hpText: string, color: string) {
  const hpNum = parseInt(hpText) || 1;
  const hearts = '❤️'.repeat(hpNum);
  const fontSize = hpNum > 6 ? 12 : (hpNum > 4 ? 13 : 15);
  return {
    border: false,
    radius: 7,
    objects: [
      { type: 'text', x: 5, y: 22, width: 80, height: 28, value: hpText, color, fontSize: 19, textAlign: 'center' },
      { type: 'text', x: 5, y: 58, width: 80, height: 50, value: hearts, color: '#e74c3c', fontSize, textAlign: 'center' },
    ],
    css: { background: 'radial-gradient(circle,#2c1b18,#120a09)', border: `3px solid ${color}`, borderRadius: '7px' },
  };
}

export function createHealthDeck(): Widget[] {
  const holder = 'extra-card-composer-zone';
  const deckId = 'health-deck';

  const cardTypes: Record<string, unknown> = {
    'health-8': { label: '8 点血量牌' },
    'health-7': { label: '7 点血量牌' },
    'health-6': { label: '6 点血量牌' },
    'health-5': { label: '5 点血量牌' },
    'health-4': { label: '4 点血量牌' },
    'health-3': { label: '3 点血量牌' },
    'health-2': { label: '2 点血量牌' },
    'health-1': { label: '1 点血量牌' },
  };

  const deck = widget(deckId, 'deck', {
    parent: holder,
    cardDefaults: { width: 90, height: 126, enlarge: 4.6 },
    faceTemplates: [
      cardBack('血量牌'),
      healthCardFace('8 体力', '#b03a2e'),
      healthCardFace('7 体力', '#c0392b'),
      healthCardFace('6 体力', '#d35400'),
      healthCardFace('5 体力', '#e74c3c'),
      healthCardFace('4 体力', '#e67e22'),
      healthCardFace('3 体力', '#f1c40f'),
      healthCardFace('2 体力', '#2ecc71'),
      healthCardFace('1 体力', '#9b59b6'),
    ],
    cardTypes,
  });

  const presetCounts: { hp: number; faceIdx: number; copies: number }[] = [
    { hp: 8, faceIdx: 1, copies: 2 },
    { hp: 7, faceIdx: 2, copies: 2 },
    { hp: 6, faceIdx: 3, copies: 3 },
    { hp: 5, faceIdx: 4, copies: 5 },
    { hp: 4, faceIdx: 5, copies: 5 },
    { hp: 3, faceIdx: 6, copies: 4 },
    { hp: 2, faceIdx: 7, copies: 3 },
    { hp: 1, faceIdx: 8, copies: 2 },
  ];

  const cards: Widget[] = [];
  let seq = 1;
  for (const group of presetCounts) {
    for (let i = 0; i < group.copies; i++) {
      cards.push(
        widget(`health-card-${seq}`, 'card', {
          deck: deckId,
          cardType: `health-${group.hp}`,
          parent: holder,
          activeFace: group.faceIdx,
        })
      );
      seq++;
    }
  }

  return [deck, ...cards];
}
