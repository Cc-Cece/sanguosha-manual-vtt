import { seatIds } from '../config/playerCapacity.js';
import { createAssetDecks } from '../data/assetDecks.js';
import { createConversionStateDecks } from '../data/conversionStateCards.js';
import { buildReserveModel } from '../data/reserveViewRegistry.js';
import { createHealthDeck } from '../data/healthCards.js';
import { BOARD } from '../layouts/continuousBoard.js';
import { PERSONAL_HAND, RESERVE_TRAY } from '../layouts/table.js';
import {
  HOST_ACTION_REQUEST_CONTROLLER_ID,
  PUBLIC_REQUEST_SEAT_IDS,
  requestCollectLooseTableCardsRoutine,
  requestShuffleDrawPileRoutine,
  requestShuffleExtraReserveRoutine,
  requestShuffleGeneralReserveRoutine,
  requestShuffleIdentityReserveRoutine,
  requestShuffleMarkerReserveRoutine,
  requestShuffleRecycleZoneRoutine,
  resetHostActionRequestRoutine,
} from '../routines/hostActionRequests.js';
import { normalizeInputDialogs } from '../routines/inputDialog.js';
import { shuffleDrawPileRoutine, shuffleExtraReserveRoutine, shuffleGeneralReserveRoutine, shuffleIdentityReserveRoutine, shuffleMarkerReserveRoutine } from '../routines/pileShuffle.js';
import { handZoneFlipFaceUpRoutine } from '../routines/playerHand.js';
import { clearAllSeatsRoutine } from '../routines/seatSafety.js';
import { arrangeLayoutRoutine, collectLooseTableCardsRoutine, lockLayoutRoutine, quickShuffleRoutine, resetTableRoutine, shuffleRecycleZoneRoutine, toggleHostToolbarRoutine, toggleLibraryTrayRoutine, toggleReserveTrayRoutine, unlockLayoutRoutine, updateHandCountsRoutine } from '../routines/tableActions.js';
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
    widget(HOST_ACTION_REQUEST_CONTROLLER_ID, 'basic', {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      display: false,
      movable: false,
      requestState: 'idle',
      requestRevision: 0,
      requestAction: '',
      requestTarget: '',
      requesterName: '',
      requesterSeat: '',
    }),
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
    widget('collect-shuffle', 'button', { parent: 'host-toolbar-panel', x: 680, y: 9, width: 105, height: 36, text: '↻ 收拢桌面牌', clickRoutine: collectLooseTableCardsRoutine }),
    widget('clear-seats', 'button', { parent: 'host-toolbar-panel', x: 791, y: 9, width: 105, height: 36, text: '👤 重置座位', clickRoutine: clearAllSeatsRoutine }),
    widget('reset-table', 'button', { parent: 'host-toolbar-panel', x: 902, y: 9, width: 105, height: 36, text: '🔄 整桌重置', color: '#74322b', clickRoutine: resetTableRoutine }),
    widget('host-action-request-reset', 'button', { parent: 'host-toolbar-panel', x: 1013, y: 9, width: 140, height: 36, text: '🧹 请求复位', color: '#493d2a',
      css: { fontSize: '11px', color: '#f2dba7', borderRadius: '6px', border: '1px solid #937b4c' }, clickRoutine: resetHostActionRequestRoutine }),

    widget('player-action-request-toolbar', 'basic', {
      x: 260,
      y: 14,
      width: 430,
      height: 56,
      movable: false,
      onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS,
      linkedToSeat: PUBLIC_REQUEST_SEAT_IDS,
      color: '#20252be8',
      css: { border: '2px double #7c8f88', borderRadius: '10px', boxShadow: '0 4px 14px #000a' },
    }),
    widget('request-collect-table-cards', 'button', {
      parent: 'player-action-request-toolbar',
      x: 10,
      y: 9,
      width: 175,
      height: 36,
      text: '🔐 请求收拢桌面牌',
      color: '#29463d',
      css: { fontSize: '12px', color: '#d9eee5', borderRadius: '6px', border: '1px solid #6f9687' },
      onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS,
      linkedToSeat: PUBLIC_REQUEST_SEAT_IDS,
      movable: false,
      clickRoutine: requestCollectLooseTableCardsRoutine,
    }),
    label('player-action-request-hint', '普通玩家公共操作需房主批准', 195, 16, 225, 'player-action-request-toolbar', {
      height: 24,
      onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS,
      linkedToSeat: PUBLIC_REQUEST_SEAT_IDS,
      css: { color: '#c2d6ce', fontSize: '12px', textAlign: 'center', fontWeight: '600' },
    }),

    pileZone('quick-shuffle-zone', '🔀 快捷洗牌区', 575, 408, 135, 182),
    widget('quick-shuffle-btn', 'button', { x: 585, y: 550, width: 115, height: 32, text: '🔀 一键洗牌', color: '#2b5746', css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, clickRoutine: quickShuffleRoutine }),
    pileZone('draw-pile', '🎴 摸牌堆', 735, 430),
    widget('shuffle-draw-pile-btn', 'button', { x: 735, y: 580, width: 110, height: 32, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleDrawPileRoutine }),
    widget('request-shuffle-draw-pile-btn', 'button', { x: 735, y: 580, width: 110, height: 32, text: '🔐 请求洗牌', color: '#29463d', css: { borderRadius: '6px', fontSize: '11px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleDrawPileRoutine }),
    freeZone('recycle-zone', '↻ 待回收／待洗牌区', 880, 408, 270, 182),
    widget('recycle-shuffle-btn', 'button', { x: 957, y: 550, width: 115, height: 32, text: '🔀 洗牌', color: '#2b5746', layer: 3,
      css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleRecycleZoneRoutine }),
    widget('request-shuffle-recycle-btn', 'button', { x: 957, y: 550, width: 115, height: 32, text: '🔐 请求洗牌', color: '#29463d', layer: 3,
      css: { borderRadius: '6px', fontSize: '11px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleRecycleZoneRoutine }),
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
    label('reserve-title', '备牌托盘｜武将 · 身份 · 扩展 · 状态标记', 15, 8, 720, 'reserve-tray'),
    pileZone('general-reserve', '武将', 18, 42, 100, 145, 'reserve-tray', {
      onEnter: { activeFace: 0, reserveState: 'reserved', clickable: false },
      onLeave: { reserveState: 'in-use', clickable: true },
      enterRoutine: cleanupReturnedPendingCardsRoutine,
    }),
    pileZone('identity-reserve', '身份', 140, 42, 100, 145, 'reserve-tray', { onEnter: { activeFace: 0 } }),
    pileZone('extra-reserve', '扩展', 262, 42, 100, 145, 'reserve-tray', {
      onEnter: { activeFace: 0, reserveState: 'reserved', clickable: false },
      onLeave: { reserveState: 'in-use', clickable: true },
      enterRoutine: cleanupReturnedPendingCardsRoutine,
    }),
    pileZone('marker-reserve', '体力', 384, 42, 100, 145, 'reserve-tray', { onEnter: { activeFace: 0 } }),
    pileZone('conversion-a-reserve', '转换 A', 506, 42, 100, 145, 'reserve-tray', {
      onEnter: { activeFace: 0, clickable: false },
      onLeave: { activeFace: 1, clickable: true },
    }),
    pileZone('conversion-b-reserve', '转换 B', 628, 42, 100, 145, 'reserve-tray', {
      onEnter: { activeFace: 0, clickable: false },
      onLeave: { activeFace: 1, clickable: true },
    }),

    widget('shuffle-general-reserve-btn', 'button', { parent: 'reserve-tray', x: 18, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleGeneralReserveRoutine }),
    widget('request-shuffle-general-reserve-btn', 'button', { parent: 'reserve-tray', x: 18, y: 190, width: 100, height: 25, text: '🔐 请求洗牌', color: '#29463d', css: { borderRadius: '5px', fontSize: '10px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleGeneralReserveRoutine }),
    widget('shuffle-identity-reserve-btn', 'button', { parent: 'reserve-tray', x: 140, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleIdentityReserveRoutine }),
    widget('request-shuffle-identity-reserve-btn', 'button', { parent: 'reserve-tray', x: 140, y: 190, width: 100, height: 25, text: '🔐 请求洗牌', color: '#29463d', css: { borderRadius: '5px', fontSize: '10px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleIdentityReserveRoutine }),
    widget('shuffle-extra-reserve-btn', 'button', { parent: 'reserve-tray', x: 262, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleExtraReserveRoutine }),
    widget('request-shuffle-extra-reserve-btn', 'button', { parent: 'reserve-tray', x: 262, y: 190, width: 100, height: 25, text: '🔐 请求洗牌', color: '#29463d', css: { borderRadius: '5px', fontSize: '10px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleExtraReserveRoutine }),
    widget('shuffle-marker-reserve-btn', 'button', { parent: 'reserve-tray', x: 384, y: 190, width: 100, height: 25, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '5px', fontSize: '11px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleMarkerReserveRoutine }),
    widget('request-shuffle-marker-reserve-btn', 'button', { parent: 'reserve-tray', x: 384, y: 190, width: 100, height: 25, text: '🔐 请求洗牌', color: '#29463d', css: { borderRadius: '5px', fontSize: '10px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleMarkerReserveRoutine }),
    label('conversion-state-help', '取出默认“阳”｜点击状态牌切换阴阳', 506, 190, 222, 'reserve-tray', {
      height: 25,
      css: {
        background: '#211d2bd9',
        color: '#d8d0e7',
        fontSize: '10px',
        lineHeight: '23px',
        textAlign: 'center',
        fontWeight: '600',
        border: '1px solid #716788',
        borderRadius: '5px',
      },
    }),
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
    ...createConversionStateDecks(),
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
        description: '支持 4–12 人自由拓展的通用三国杀人工桌面跑团系统。内置 538 张完整高清真实卡牌（包含标准包、风/火/林/山包、一将成名、SP 及多扩展武将，基本牌、军争与扩展牌）、24 张转换技阴阳状态牌及 12 套独立玩家控制模块。具备【全套备牌面板】分类筛选与一键精准导入、【备牌托盘】盖面抽洗、独立私密展示区与手牌数实时同步。弱规则强自由度，完美契合标准场、军争场、国战、自定义身份与团队战。',
        ruleText: '【弱规则·强自由·强可见性】\n1. 所有角色技能、武将体力上限、攻击距离、锦囊结算、回合阶段及胜负判定，均由本桌玩家人工协商裁定；\n2. 摸牌堆洗牌与摸牌由主桌自动化 Routine 保障，手牌数量由玩家模块自动统计；\n3. 卡牌在私密展示区与个人手牌区保持原生视角隔离，防偷窥与翻牌提示，保证跑团体验绝对公正。',
        helpText: '【快捷操作指南】\n1. 房主操作：顶部工具栏点击「👥 玩家管理」可按需增加/关闭席位（4–12席），或一键设置 75%/90%/100% 全局缩放；\n2. 公共操作请求：2–12 号座位可看到「🔐 请求」按钮。普通玩家提交收拢或洗牌请求后，只有 1 号座位房主勾选同意并提交，操作才会执行；同一时间只保留一个待处理请求，异常时房主可点击「🧹 请求复位」；\n3. 牌库编组：点击「📚 牌库编组」展开全套备牌面板，支持按标准/风/火/林/山/一将/SP/其他扩展逐分类预览，点击卡牌切换 [允许/Ban]，确认后仅将勾选牌盖面导入备牌托盘；\n4. 桌面清理：点击「↻ 收拢桌面牌」只会把桌面顶层散落的主牌和当前启用扩展牌移入待回收区，不碰玩家模块、手牌和任何 Holder；检查无误后点击回收区「🔀 洗牌」，只将该区卡牌盖面并随机，且不会自动并入摸牌堆；\n5. 状态标记：备牌托盘右侧提供体力牌和转换技 A/B 状态牌。转换技牌从托盘取出时默认显示“阳”，放到玩家公开区后点击可在“阳/阴”之间切换，放回对应托盘会重新盖面；\n6. 托盘洗牌：备牌托盘下设武将/身份/扩展/体力 4 个专属洗牌按钮；普通玩家可向房主申请执行。转换技状态牌不需要洗牌；\n7. 个人手牌：将卡牌移入右下角「🖐️ 我的手牌」即自动对其他玩家隐藏具体牌面，模块仅显示手牌数。',
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
