import { GENERALS, PLAYING_CARDS } from '../data/placeholders.js';
import { resetTableRoutine, shuffleRoutine } from '../routines/tableActions.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { cardBack, dynamicTextCardFace, label, widget, zone } from '../widgets/factory.js';
import { createPlayerModule } from '../widgets/playerModule.js';

function centralWidgets(): Widget[] {
  return [
    widget('table-background', 'basic', { x: 0, y: 0, width: 1800, height: 1200, movable: false, layer: -10,
      color: '#173c31', css: { background: 'radial-gradient(circle,#285746,#102c25)', border: '18px solid #4b2d1c' } }),
    label('table-title', '三国杀 · 4人弱规则测试桌', 650, 362, 500),
    zone('general-deck-holder', '武将牌堆', 650, 430, 100, 140),
    zone('main-deck-holder', '主牌堆', 820, 430, 100, 140),
    zone('discard-holder', '弃牌区', 990, 430, 120, 140),
    zone('resolution-holder', '出牌／结算区', 690, 620, 420, 150),
    widget('shuffle-button', 'button', { x: 760, y: 790, width: 130, height: 44, text: '洗牌测试', color: '#6b2a23', clickRoutine: shuffleRoutine }),
    widget('reset-button', 'button', { x: 920, y: 790, width: 160, height: 44, text: '整桌重置测试', color: '#6b2a23', clickRoutine: resetTableRoutine }),
    widget('main-deck', 'deck', { x: 820, y: 430, cardDefaults: { width: 90, height: 126, enlarge: 2.3 },
      faceTemplates: [cardBack('三国杀'), dynamicTextCardFace('name', 'category')],
      cardTypes: Object.fromEntries(PLAYING_CARDS.map(([name, category], index) => [`playing-${index + 1}`, { name, category }])) }),
    widget('general-deck', 'deck', { x: 650, y: 430, cardDefaults: { width: 90, height: 126, enlarge: 2.5 },
      faceTemplates: [cardBack('武将'), dynamicTextCardFace('name', 'detail', '#d9c89d')],
      cardTypes: Object.fromEntries(GENERALS.map(([name, kingdom, health], index) => [`general-${index + 1}`, { name, detail: `${kingdom} · ${health}体力` }])) }),
    widget('identity-deck', 'deck', { x: 0, y: 0, cardDefaults: { width: 80, height: 112, enlarge: 2.5 },
      faceTemplates: [cardBack('身份牌'), dynamicTextCardFace('name', 'detail', '#e8d5b0')],
      cardTypes: Object.fromEntries(['主公', '忠臣', '反贼', '内奸'].map((name, index) => [`identity-${index + 1}`, { name, detail: '仅本座位可见' }])) }),
  ];
}

function cards(): Widget[] {
  const playing = PLAYING_CARDS.map(([name, category], index) => widget(`playing-card-${index + 1}`, 'card', {
    deck: 'main-deck', cardType: `playing-${index + 1}`, parent: 'main-deck-holder', activeFace: 0,
  }));
  const generals = GENERALS.map(([name, kingdom, health], index) => widget(`general-card-${index + 1}`, 'card', {
    deck: 'general-deck', cardType: `general-${index + 1}`, parent: 'general-deck-holder', activeFace: 0,
  }));
  return [...playing, ...generals];
}

export function createFourPlayerPrototype(): GameFile {
  const widgets = [
    ...centralWidgets(),
    ...Array.from({ length: 4 }, (_, index) => createPlayerModule(index)).flat(),
    ...cards(),
  ];
  const game: GameFile = {
    _meta: { version: 17, info: {
      name: '三国杀人工桌面', description: '4人原生结构测试版：弱规则、私密手牌、安全座位。', players: '4', mode: 'vs',
      language: 'zh-CN', attribution: '占位素材；仅使用 VirtualTabletop 通用结构。',
      ruleText: '所有规则、体力、技能、距离、伤害、回合与胜负均由玩家人工裁定。',
      helpText: '先入座；拖动牌完成发牌与出牌。PC 悬停、触屏长按使用原生放大。', variant: '4人原型',
      bgg: 'https://boardgamegeek.com/boardgame/25053/legends-of-the-three-kingdoms', image: '/i/game-icons.net/delapouite/round-table.svg',
    } },
  };
  for (const item of widgets) game[item.id] = item;
  return game;
}
