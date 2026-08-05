import { createAssetDecks } from '../data/assetDecks.js';
import { createHealthDeck } from '../data/healthCards.js';
import { BOARD } from '../layouts/continuousBoard.js';
import { PERSONAL_HAND, RESERVE_TRAY } from '../layouts/table.js';
import { clearAllSeatsRoutine } from '../routines/seatSafety.js';
import { arrangeLayoutRoutine, collectAndShuffleRoutine, lockLayoutRoutine, quickShuffleRoutine, resetTableRoutine, toggleHostToolbarRoutine, toggleLibraryTrayRoutine, toggleReserveTrayRoutine, unlockLayoutRoutine, updateHandCountsRoutine } from '../routines/tableActions.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { createCandidateWidgets } from '../widgets/candidateZone.js';
import { freeZone, handZone, label, pileZone, widget } from '../widgets/factory.js';
import { createIdentityComposerWidgets } from '../widgets/identityComposer.js';
import { createLibraryTableWidgets } from '../widgets/libraryBrowser.js';
import { createPlayerModule } from '../widgets/playerModule.js';

function tableWidgets(): Widget[] {
  const allSeats = ['seat-1', 'seat-2', 'seat-3', 'seat-4'];
  return [
    widget('table-background', 'basic', { x: 0, y: 0, width: 1800, height: 1200, movable: false, layer: -10, color: '#173c31',
      css: { background: 'radial-gradient(circle,#285746,#102c25)', border: '18px solid #4b2d1c' } }),
    widget('table-controller', 'basic', { x: 0, y: 0, width: 1, height: 1, display: false, movable: false, updateHandCountsRoutine }),
    widget('host-toolbar', 'basic', { x: 350, y: 14, width: 1100, height: 56, movable: false, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'],
      color: '#20252be8', css: { border: '2px double #b5965b', borderRadius: '10px', boxShadow: '0 4px 14px #000a' } }),
    widget('toggle-toolbar-btn', 'button', { parent: 'host-toolbar', x: 8, y: 9, width: 90, height: 36, text: '🔽 收起', color: '#382c1e',
      css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleHostToolbarRoutine }),
    widget('host-toolbar-panel', 'basic', { parent: 'host-toolbar', x: 104, y: 0, width: 980, height: 56, display: true, movable: false, color: '#0000' }),
    widget('lock-layout', 'button', { parent: 'host-toolbar-panel', x: 4, y: 9, width: 116, height: 36, text: '🔒 锁定布局', clickRoutine: lockLayoutRoutine }),
    widget('unlock-layout', 'button', { parent: 'host-toolbar-panel', x: 126, y: 9, width: 116, height: 36, text: '🔓 解锁布局', clickRoutine: unlockLayoutRoutine }),
    widget('arrange-layout', 'button', { parent: 'host-toolbar-panel', x: 248, y: 9, width: 116, height: 36, text: '🧹 自动整理', clickRoutine: arrangeLayoutRoutine }),
    widget('toggle-tray', 'button', { parent: 'host-toolbar-panel', x: 370, y: 9, width: 116, height: 36, text: '📦 备牌托盘', clickRoutine: toggleReserveTrayRoutine }),
    widget('toggle-library-table', 'button', { parent: 'host-toolbar-panel', x: 492, y: 9, width: 116, height: 36, text: '📚 牌库编组', color: '#254448', clickRoutine: toggleLibraryTrayRoutine }),
    widget('collect-shuffle', 'button', { parent: 'host-toolbar-panel', x: 614, y: 9, width: 116, height: 36, text: '🔀 收拢洗牌', clickRoutine: collectAndShuffleRoutine }),
    widget('clear-seats', 'button', { parent: 'host-toolbar-panel', x: 736, y: 9, width: 116, height: 36, text: '👤 重置座位', clickRoutine: clearAllSeatsRoutine }),
    widget('reset-table', 'button', { parent: 'host-toolbar-panel', x: 858, y: 9, width: 116, height: 36, text: '🔄 整桌重置', color: '#74322b', clickRoutine: resetTableRoutine }),
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
  const widgets = [
    ...tableWidgets(),
    ...reserveWidgets(),
    ...Array.from({ length: 4 }, (_, i) => createPlayerModule(i)).flat(),
    ...createAssetDecks(catalog),
    ...createHealthDeck(),
    ...createLibraryTableWidgets(),
    ...createCandidateWidgets(),
    ...createIdentityComposerWidgets(),
  ];

  const game: GameFile = {
    _meta: {
      version: 21,
      gameSettings: {
        boardSize: { width: BOARD.width, height: BOARD.height },
        legacyModes: {},
      },
      info: {
        name: '三国杀人工桌面',
        description: '4 人真实牌面适配版 + 双桌连续超大牌库编组系统：支持弱规则、独立视角、受控缩放与全流程编组。',
        players: '4',
        mode: 'vs',
        language: 'zh-CN',
        attribution: '牌面来自用户提供的 Tabletop Simulator 参考包 3765935052；构建时保留来源序号、Card ID 与分类。',
        ruleText: '所有技能、距离、伤害、回合和胜负均由玩家人工裁定。',
        helpText: '左侧为主游戏桌，右侧为牌库编组桌。玩家 1 管理布局；拖动或选择卡牌完成编组后合成送入主桌。',
        variant: '4 人 Phase L1',
        bgg: 'https://boardgamegeek.com/boardgame/25053/legends-of-the-three-kingdoms',
        image: '/i/game-icons.net/delapouite/round-table.svg',
      },
    },
  };

  for (const item of widgets) game[item.id] = item;
  return game;
}
