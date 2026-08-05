import { seatIds } from '../config/playerCapacity.js';
import { createAssetDecks } from '../data/assetDecks.js';
import { buildReserveModel } from '../data/reserveViewRegistry.js';
import { createHealthDeck } from '../data/healthCards.js';
import { BOARD } from '../layouts/continuousBoard.js';
import { PERSONAL_HAND, RESERVE_TRAY } from '../layouts/table.js';
import { normalizeInputDialogs } from '../routines/inputDialog.js';
import { shuffleDrawPileRoutine, shuffleExtraReserveRoutine, shuffleGeneralReserveRoutine, shuffleIdentityReserveRoutine, shuffleMarkerReserveRoutine } from '../routines/pileShuffle.js';
import { handZoneFlipFaceUpRoutine } from '../routines/playerHand.js';
import { clearAllSeatsRoutine } from '../routines/seatSafety.js';
import { arrangeLayoutRoutine, collectAndShuffleRoutine, lockLayoutRoutine, quickShuffleRoutine, resetTableRoutine, toggleHostToolbarRoutine, toggleLibraryTrayRoutine, toggleReserveTrayRoutine, unlockLayoutRoutine, updateHandCountsRoutine } from '../routines/tableActions.js';
import type { AssetCatalog } from '../types/assets.js';
import type { GameFile, Widget } from '../types/vtt.js';
import { createCandidateWidgets } from '../widgets/candidateZone.js';
import { freeZone, handZone, label, pileZone, widget } from '../widgets/factory.js';
import { createIdentityComposerWidgets } from '../widgets/identityComposer.js';
import { createLibraryTableWidgets } from '../widgets/libraryBrowser.js';
import { createPlayerManagementWidgets, togglePlayerMgmtPanelRoutine } from '../widgets/playerManagementPanel.js';
import { createPlayerModule } from '../widgets/playerModule.js';

function tableWidgets(): Widget[] {
  const allSeats = seatIds(12);
  return [
    widget('table-background', 'basic', { x: 0, y: 0, width: 1800, height: 1200, movable: false, layer: -10, color: '#173c31',
      css: { background: 'radial-gradient(circle,#285746,#102c25)', border: '18px solid #4b2d1c' } }),
    widget('table-controller', 'basic', { x: 0, y: 0, width: 1, height: 1, display: false, movable: false, updateHandCountsRoutine }),
    widget('host-toolbar', 'basic', { x: 260, y: 14, width: 1280, height: 56, movable: false, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'],
      color: '#20252be8', css: { border: '2px double #b5965b', borderRadius: '10px', boxShadow: '0 4px 14px #000a' } }),
    widget('toggle-toolbar-btn', 'button', { parent: 'host-toolbar', x: 8, y: 9, width: 90, height: 36, text: '🔽 收起', color: '#382c1e',
      css: { fontSize: '12px', color: '#ffe0a0', borderRadius: '6px', border: '1px solid #a88448' }, clickRoutine: toggleHostToolbarRoutine }),
    widget('host-toolbar-panel', 'basic', { parent: 'host-toolbar', x: 104, y: 0, width: 1160, height: 56, display: true, movable: false, color: '#0000' }),
    widget('lock-layout', 'button', { parent: 'host-toolbar-panel', x: 4, y: 9, width: 105, height: 36, text: '🔒 锁定布局', clickRoutine: lockLayoutRoutine }),
    widget('unlock-layout', 'button', { parent: 'host-toolbar-panel', x: 115, y: 9, width: 105, height: 36, text: '🔓 解锁布局', clickRoutine: unlockLayoutRoutine }),
    widget('arrange-layout', 'button', { parent: 'host-toolbar-panel', x: 226, y: 9, width: 105, height: 36, text: '🧹 自动整理', clickRoutine: arrangeLayoutRoutine }),
    widget('toggle-player-mgmt-btn', 'button', { parent: 'host-toolbar-panel', x: 337, y: 9, width: 115, height: 36, text: '👥 玩家管理', color: '#254448', clickRoutine: togglePlayerMgmtPanelRoutine }),
    widget('toggle-tray', 'button', { parent: 'host-toolbar-panel', x: 458, y: 9, width: 105, height: 36, text: '📦 备牌托盘', clickRoutine: toggleReserveTrayRoutine }),
    widget('toggle-library-table', 'button', { parent: 'host-toolbar-panel', x: 569, y: 9, width: 105, height: 36, text: '📚 牌库编组', color: '#254448', clickRoutine: toggleLibraryTrayRoutine }),
    widget('collect-shuffle', 'button', { parent: 'host-toolbar-panel', x: 680, y: 9, width: 105, height: 36, text: '🔀 收拢洗牌', clickRoutine: collectAndShuffleRoutine }),
    widget('clear-seats', 'button', { parent: 'host-toolbar-panel', x: 791, y: 9, width: 105, height: 36, text: '👤 重置座位', clickRoutine: clearAllSeatsRoutine }),
    widget('reset-table', 'button', { parent: 'host-toolbar-panel', x: 902, y: 9, width: 105, height: 36, text: '🔄 整桌重置', color: '#74322b', clickRoutine: resetTableRoutine }),

    pileZone('quick-shuffle-zone', '🔀 快捷洗牌区', 575, 408, 135, 182),
    widget('quick-shuffle-btn', 'button', { x: 585, y: 550, width: 115, height: 32, text: '🔀 一键洗牌', color: '#2b5746', css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, clickRoutine: quickShuffleRoutine }),
    pileZone('draw-pile', '🎴 摸牌堆', 735, 430),
    widget('shuffle-draw-pile-btn', 'button', { x: 735, y: 580, width: 110, height: 32, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleDrawPileRoutine }),
    freeZone('recycle-zone', '↻ 待回收／待洗牌区', 880, 408, 270, 182),
    handZone('personal-hand', '🖐️ 我的手牌｜其他玩家只看到模块中的数量', PERSONAL_HAND.x, PERSONAL_HAND.y, PERSONAL_HAND.width, PERSONAL_HAND.height),
  ].map(item => item.id === 'personal-hand' ? { ...item, onlyVisibleForSeat: allSeats, linkedToSeat: allSeats,
    enterRoutine: [
      ...handZoneFlipFaceUpRoutine,
      { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }
    ],
    leaveRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }] } : item);
}

function reserveWidgets(): Widget[] {
  const cleanupReturnedPendingCardsRoutine = [
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'cleanupReturnedPendingCardsRoutine' },
  ];
  return [
    widget('reserve-tray', 'basic', { ...RESERVE_TRAY, movable: true, color: '#3a1d18e8',
      css: { border: '4px double #b68c50', borderRadius: '12px', boxShadow: '0 5px 14px #0009' } }),
    label('reserve-title', '备牌托盘｜不参与常规洗牌', 15, 8, 490, 'reserve-tray'),
    pileZone('general-reserve', '武将', 18, 42, 100, 145, 'reserve-tray', {
      onEnter: { activeFace: 0, reserveState: 'reserved' },
      onLeave: { reserveState: 'in-use' },
      enterRoutine: cleanupReturnedPendingCardsRoutine,
    }),
    pileZone('identity-reserve', '身份', 140, 42, 100, 145, 'reserve-tray', { onEnter: { activeFace: 0 } }),
    pileZone('extra-reserve', '扩展', 262, 42, 100, 145, 'reserve-tray', {
      onEnter: { activeFace: 0, reserveState: 'reserved' },
      onLeave: { reserveState: 'in-use' },
      enterRoutine: cleanupReturnedPendingCardsRoutine,
    }),
    pileZone('marker-reserve', '血量', 384, 42, 118, 145, 'reserve-tray', { onEnter: { activeFace: 0 } }),

    widget('shuffle-general-reserve-btn', 'button', { parent: 'reserve-tray', x: 18, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleGeneralReserveRoutine }),
    widget('shuffle-identity-reserve-btn', 'button', { parent: 'reserve-tray', x: 140, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleIdentityReserveRoutine }),
    widget('shuffle-extra-reserve-btn', 'button', { parent: 'reserve-tray', x: 262, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleExtraReserveRoutine }),
    widget('shuffle-marker-reserve-btn', 'button', { parent: 'reserve-tray', x: 384, y: 190, width: 118, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleMarkerReserveRoutine }),
  ];
}

export function createUniversalPrototype(catalog: AssetCatalog): GameFile {
  const reserveModel = buildReserveModel(catalog);
  const widgets = [
    ...tableWidgets(),
    ...createPlayerManagementWidgets(),
    ...reserveWidgets(),
    ...Array.from({ length: 12 }, (_, i) => createPlayerModule(i)).flat(),
    ...createLibraryTableWidgets(reserveModel),
    ...createAssetDecks(catalog, reserveModel),
    ...createHealthDeck(),
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
        name: '三国杀人工桌面 ｜ 4-12人通用版',
        players: '4-12',
        mode: 'vs',
        language: 'zh-CN',
        variant: '4-12人通用人工桌面 ｜ 全套卡牌库与备牌托盘系统',
        description: '支持 4–12 人自由拓展的通用三国杀人工桌面跑团系统。内置 538 张完整高清真实卡牌（包含标准包、风/火/林/山包、一将成名、SP 及多扩展武将，基本牌、军争与扩展牌）及 12 套独立玩家控制模块。具备【全套备牌面板】分类筛选与一键精准导入、【备牌托盘】盖面抽洗、独立私密展示区与手牌数实时同步。弱规则强自由度，完美契合标准场、军争场、国战、自定义身份与团队战。',
        ruleText: '【弱规则·强自由·强可见性】\n1. 所有角色技能、武将体力上限、攻击距离、锦囊结算、回合阶段及胜负判定，均由本桌玩家人工协商裁定；\n2. 摸牌堆洗牌与摸牌由主桌自动化 Routine 保障，手牌数量由玩家模块自动统计；\n3. 卡牌在私密展示区与个人手牌区保持原生视角隔离，防偷窥与翻牌提示，保证跑团体验绝对公正。',
        helpText: '【快捷操作指南】\n1. 房主操作：顶部工具栏点击「👥 玩家管理」可按需增加/关闭席位（4–12席），或一键设置 75%/90%/100% 全局缩放；\n2. 牌库编组：点击「📚 牌库编组」展开全套备牌面板，支持按标准/风/火/林/山/一将/SP/其他扩展逐分类预览，点击卡牌切换 [允许/Ban]，确认后仅将勾选牌盖面导入备牌托盘；\n3. 托盘洗牌：备牌托盘下设有武将/身份/扩展/血量 4 个专属洗牌按钮，洗牌静默无弹窗；\n4. 个人手牌：将卡牌移入右下角「🖐️ 我的手牌」即自动对其他玩家隐藏具体牌面，模块仅显示手牌数。',
        attribution: '卡牌图源基于 Tabletop Simulator 3765935052 参考包深度清洗与二次加工；构建时按分类重构目录树并嵌入高性能 WebP 贴图。',
        bgg: 'https://zh.wikipedia.org/wiki/%E4%B8%89%E5%9B%BD%E6%9D%80',
        image: '/assets/other/cover.webp',
      },
    },
  };

  for (const item of widgets) game[item.id] = item;
  return normalizeInputDialogs(game);
}

export function createFourPlayerPrototype(catalog: AssetCatalog): GameFile {
  return createUniversalPrototype(catalog);
}
