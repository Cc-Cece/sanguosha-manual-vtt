import type { Widget } from '../types/vtt.js';
import { cardBack, widget } from '../widgets/factory.js';

export function healthCardFace(hpText: string, color: string, subText: string) {
  const hpNum = parseInt(hpText) || 1;
  const hearts = '❤️'.repeat(Math.min(hpNum, 5));
  return {
    border: false,
    radius: 7,
    objects: [
      { type: 'text', x: 5, y: 15, width: 80, height: 28, value: hpText, color, fontSize: 20, textAlign: 'center' },
      { type: 'text', x: 5, y: 48, width: 80, height: 35, value: hearts, color: '#e74c3c', fontSize: 15, textAlign: 'center' },
      { type: 'text', x: 5, y: 92, width: 80, height: 22, value: subText, color: '#edd394', fontSize: 12, textAlign: 'center' },
    ],
    css: { background: 'radial-gradient(circle,#2c1b18,#120a09)', border: `3px solid ${color}`, borderRadius: '7px' },
  };
}

export function createHealthDeck(): Widget[] {
  const holder = 'marker-reserve';
  const deckId = 'health-deck';

  const cardTypes: Record<string, unknown> = {
    'health-5': { label: '5 点血量牌' },
    'health-4': { label: '4 点血量牌' },
    'health-3': { label: '3 点血量牌' },
    'health-2': { label: '2 点血量牌' },
  };

  const deck = widget(deckId, 'deck', {
    parent: holder,
    cardDefaults: { width: 90, height: 126, enlarge: 2.3 },
    faceTemplates: [
      cardBack('血量牌'),
      healthCardFace('5 体力', '#e74c3c', '上限 5 / 4'),
      healthCardFace('4 体力', '#e67e22', '上限 4 / 3'),
      healthCardFace('3 体力', '#f1c40f', '上限 3 / 2'),
      healthCardFace('2 体力', '#2ecc71', '上限 2 / 1'),
      healthCardFace('1 体力', '#9b59b6', '濒危 1'),
    ],
    cardTypes,
  });

  const cards: Widget[] = [];
  let seq = 1;
  // Generate 16 genuine Sanguosha health cards
  for (let copy = 0; copy < 4; copy++) {
    for (let faceIdx = 1; faceIdx <= 4; faceIdx++) {
      cards.push(
        widget(`health-card-${seq}`, 'card', {
          deck: deckId,
          cardType: `health-${6 - faceIdx}`,
          parent: holder,
          activeFace: faceIdx,
        })
      );
      seq++;
    }
  }

  return [deck, ...cards];
}
