import { createAssetDecks } from '../data/assetDecks.js';
import { createHealthDeck } from '../data/healthCards.js';
import { PERSONAL_HAND, RESERVE_TRAY } from '../layouts/table.js';
import { clearAllSeatsRoutine } from '../routines/seatSafety.js';
import { arrangeLayoutRoutine, collectAndShuffleRoutine, lockLayoutRoutine, quickShuffleRoutine, resetTableRoutine, toggleReserveTrayRoutine, unlockLayoutRoutine, updateHandCountsRoutine } from '../routines/tableActions.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { freeZone, handZone, label, pileZone, widget } from '../widgets/factory.js';
import { createPlayerModule } from '../widgets/playerModule.js';

function tableWidgets(): Widget[] {
  const allSeats = ['seat-1', 'seat-2', 'seat-3', 'seat-4'];
  return [
    widget('table-background', 'basic', { x: 0, y: 0, width: 1800, height: 1200, movable: false, layer: -10, color: '#173c31',
      css: { background: 'radial-gradient(circle,#285746,#102c25)', border: '18px solid #4b2d1c' } }),
    label('table-title', '三国杀 · 4 人人工桌面', 650, 326, 500),
    label('public-table-hint', '公共桌面｜自由放置・重叠・翻面・旋转', 665, 720, 470),
    widget('table-controller', 'basic', { x: 0, y: 0, width: 1, height: 1, display: false, movable: false, updateHandCountsRoutine }),
    widget('host-toolbar', 'basic', { x: 450, y: 18, width: 900, height: 54, movable: false, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'],
      color: '#20252be8', css: { border: '2px double #b5965b', borderRadius: '10px', boxShadow: '0 4px 14px #000a' } }),
    label('host-toolbar-title', '👑 玩家 1 布局工具', 10, 15, 130, 'host-toolbar'),
    widget('lock-layout', 'button', { parent: 'host-toolbar', x: 145, y: 9, width: 95, height: 36, text: '🔒 锁定布局', clickRoutine: lockLayoutRoutine }),
    widget('unlock-layout', 'button', { parent: 'host-toolbar', x: 246, y: 9, width: 95, height: 36, text: '🔓 解锁布局', clickRoutine: unlockLayoutRoutine }),
    widget('arrange-layout', 'button', { parent: 'host-toolbar', x: 347, y: 9, width: 95, height: 36, text: '🧹 自动整理', clickRoutine: arrangeLayoutRoutine }),
    widget('toggle-tray', 'button', { parent: 'host-toolbar', x: 448, y: 9, width: 105, height: 36, text: '📦 备牌托盘', clickRoutine: toggleReserveTrayRoutine }),
    widget('collect-shuffle', 'button', { parent: 'host-toolbar', x: 559, y: 9, width: 110, height: 36, text: '🔀 收拢洗牌', clickRoutine: collectAndShuffleRoutine }),
    widget('clear-seats', 'button', { parent: 'host-toolbar', x: 675, y: 9, width: 100, height: 36, text: '👤 重置座位', clickRoutine: clearAllSeatsRoutine }),
    widget('reset-table', 'button', { parent: 'host-toolbar', x: 781, y: 9, width: 105, height: 36, text: '🔄 整桌重置', color: '#74322b', clickRoutine: resetTableRoutine }),
    pileZone('quick-shuffle-zone', '🔀 快捷洗牌区', 575, 408, 135, 182),
    widget('quick-shuffle-btn', 'button', { x: 585, y: 550, width: 115, height: 32, text: '🔀 一键洗牌', color: '#2b5746', css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, clickRoutine: quickShuffleRoutine }),
    pileZone('draw-pile', '🎴 摸牌堆', 735, 430),
    freeZone('recycle-zone', '↻ 待回收／待洗牌区', 880, 408, 270, 182),
    handZone('personal-hand', '🖐️ 我的手牌｜其他玩家只看到模块中的数量', PERSONAL_HAND.x, PERSONAL_HAND.y, PERSONAL_HAND.width, PERSONAL_HAND.height),
  ].map(item => item.id === 'personal-hand' ? { ...item, onlyVisibleForSeat: allSeats, linkedToSeat: allSeats,
    enterRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }],
    leaveRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }] } : item);
}

function reserveWidgets(): Widget[] {
  return [
    widget('reserve-tray', 'basic', { ...RESERVE_TRAY, movable: true, color: '#3a1d18e8',
      css: { border: '4px double #b68c50', borderRadius: '12px', boxShadow: '0 5px 14px #0009' } }),
    label('reserve-title', '备牌托盘｜不参与常规洗牌', 15, 8, 490, 'reserve-tray'),
    pileZone('general-reserve', '武将', 18, 42, 100, 145, 'reserve-tray'),
    pileZone('identity-reserve', '身份', 140, 42, 100, 145, 'reserve-tray'),
    pileZone('extra-reserve', '扩展', 262, 42, 100, 145, 'reserve-tray'),
    pileZone('marker-reserve', '血量', 384, 42, 118, 145, 'reserve-tray'),
  ];
}

export function createFourPlayerPrototype(catalog: AssetCatalog): GameFile {
  const widgets = [...tableWidgets(), ...reserveWidgets(), ...Array.from({ length: 4 }, (_, i) => createPlayerModule(i)).flat(), ...createAssetDecks(catalog), ...createHealthDeck()];
  const game: GameFile = { _meta: { version: 17, info: {
    name: '三国杀人工桌面', description: '4 人真实牌面适配版：弱规则、私密手牌、安全 Seat 与自由公共区。', players: '4', mode: 'vs', language: 'zh-CN',
    attribution: '牌面来自用户提供的 Tabletop Simulator 参考包 3765935052；构建时保留来源序号、Card ID 与分类。',
    ruleText: '所有技能、距离、伤害、回合和胜负均由玩家人工裁定。',
    helpText: '玩家 1 管理布局；牌只在待回收区点击收拢并洗牌。PC 悬停、触屏长按使用原生放大。', variant: '4 人 Phase 1.1',
    bgg: 'https://boardgamegeek.com/boardgame/25053/legends-of-the-three-kingdoms', image: '/i/game-icons.net/delapouite/round-table.svg',
  } } };
  for (const item of widgets) game[item.id] = item;
  return game;
}
