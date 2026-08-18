import { seatIds } from '../config/playerCapacity.js';
import { createAssetDecks } from '../data/assetDecks.js';
import { createConversionStateDecks } from '../data/conversionStateCards.js';
import { buildReserveModel } from '../data/reserveViewRegistry.js';
import { createHealthDeck } from '../data/healthCards.js';
import { BOARD } from '../layouts/continuousBoard.js';
import {
  DEFAULT_RECYCLE_AREA_SIZE,
  QUICK_SHUFFLE_PANEL,
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_COLLECT_GROUP_DEFAULT_POSITION,
  RECYCLE_COLLECT_GROUP_ID,
  RECYCLE_PANEL_ID,
  RECYCLE_PANEL_POSITION,
  RECYCLE_SIZE_DOWN_BUTTON_ID,
  RECYCLE_SIZE_LABEL_ID,
  RECYCLE_SIZE_UP_BUTTON_ID,
  RECYCLE_ZONE_OFFSET,
} from '../layouts/shufflePanels.js';
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
import { RECYCLE_COLLECT_STACK_ID, RECYCLE_SHUFFLE_BUFFER_ID } from '../routines/recycleZoneRuntime.js';
import { clearAllSeatsRoutine } from '../routines/seatSafety.js';
import {
  arrangeLayoutRoutine,
  collectLooseTableCardsRoutine,
  decreaseRecycleAreaRoutine,
  increaseRecycleAreaRoutine,
  lockLayoutRoutine,
  quickShuffleRoutine,
  resetTableRoutine,
  shuffleRecycleZoneRoutine,
  toggleHostToolbarRoutine,
  toggleLibraryTrayRoutine,
  toggleReserveTrayRoutine,
  unlockLayoutRoutine,
  updateHandCountsRoutine,
} from '../routines/tableActions.js';
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

    widget(QUICK_SHUFFLE_PANEL_ID, 'basic', {
      ...QUICK_SHUFFLE_PANEL,
      movable: true,
      layer: 2,
      color: '#10241ee8',
      css: { border: '2px solid #789b83', borderRadius: '9px', boxShadow: '0 4px 12px #0008' },
    }),
    label('quick-shuffle-panel-title', '⠿ 拖动快捷洗牌', 5, 2, 135, QUICK_SHUFFLE_PANEL_ID, {
      height: 22,
      css: { color: '#d8eee4', fontSize: '11px', lineHeight: '20px', textAlign: 'center', fontWeight: '700', 'pointer-events': 'none' },
    }),
    pileZone('quick-shuffle-zone', '🔀 快捷洗牌区', 5, 28, 135, 182, QUICK_SHUFFLE_PANEL_ID),
    widget('quick-shuffle-btn', 'button', {
      parent: QUICK_SHUFFLE_PANEL_ID,
      x: 15,
      y: 214,
      width: 115,
      height: 28,
      text: '🔀 一键洗牌',
      color: '#2b5746',
      movable: false,
      css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' },
      clickRoutine: quickShuffleRoutine,
    }),

    pileZone('draw-pile', '🎴 摸牌堆', 735, 430, 96, 138, undefined, { movable: false }),
    widget('shuffle-draw-pile-btn', 'button', { x: 735, y: 580, width: 110, height: 32, text: '🔀 洗牌', color: '#2b5746', css: { borderRadius: '6px', fontSize: '12px', border: '1px solid #789b83' }, onlyVisibleForSeat: ['seat-1'], linkedToSeat: ['seat-1'], movable: false, clickRoutine: shuffleDrawPileRoutine }),
    widget('request-shuffle-draw-pile-btn', 'button', { x: 735, y: 580, width: 110, height: 32, text: '🔐 请求洗牌', color: '#29463d', css: { borderRadius: '6px', fontSize: '11px', border: '1px solid #6f9687' }, onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS, linkedToSeat: PUBLIC_REQUEST_SEAT_IDS, movable: false, clickRoutine: requestShuffleDrawPileRoutine }),

    widget(RECYCLE_PANEL_ID, 'basic', {
      x: RECYCLE_PANEL_POSITION.x,
      y: RECYCLE_PANEL_POSITION.y,
      width: DEFAULT_RECYCLE_AREA_SIZE.panelWidth,
      height: DEFAULT_RECYCLE_AREA_SIZE.panelHeight,
      movable: true,
      layer: 2,
      color: '#10241ee8',
      recycleSizePercent: DEFAULT_RECYCLE_AREA_SIZE.percent,
      css: { border: '2px solid #789b83', borderRadius: '9px', boxShadow: '0 4px 12px #0008' },
    }),
    label('recycle-panel-title', '⠿ 拖动待回收／待洗牌区', 8, 3, 158, RECYCLE_PANEL_ID, {
      height: 22,
      css: { color: '#d8eee4', fontSize: '10px', lineHeight: '20px', textAlign: 'left', fontWeight: '700', 'pointer-events': 'none' },
    }),
    widget(RECYCLE_SIZE_DOWN_BUTTON_ID, 'button', {
      parent: RECYCLE_PANEL_ID,
      x: 174,
      y: 3,
      width: 28,
      height: 22,
      text: '−',
      color: '#29463d',
      movable: false,
      onlyVisibleForSeat: ['seat-1'],
      linkedToSeat: ['seat-1'],
      css: { borderRadius: '5px', fontSize: '14px', border: '1px solid #6f9687' },
      clickRoutine: decreaseRecycleAreaRoutine,
    }),
    label(RECYCLE_SIZE_LABEL_ID, '100%', 206, 3, 40, RECYCLE_PANEL_ID, {
      height: 22,
      onlyVisibleForSeat: ['seat-1'],
      linkedToSeat: ['seat-1'],
      css: { color: '#e9dcc0', fontSize: '10px', lineHeight: '20px', textAlign: 'center', fontWeight: '700', 'pointer-events': 'none' },
    }),
    widget(RECYCLE_SIZE_UP_BUTTON_ID, 'button', {
      parent: RECYCLE_PANEL_ID,
      x: 250,
      y: 3,
      width: 28,
      height: 22,
      text: '+',
      color: '#29463d',
      movable: false,
      onlyVisibleForSeat: ['seat-1'],
      linkedToSeat: ['seat-1'],
      css: { borderRadius: '5px', fontSize: '14px', border: '1px solid #6f9687' },
      clickRoutine: increaseRecycleAreaRoutine,
    }),
    freeZone('recycle-zone', '↻ 自由摆放区', RECYCLE_ZONE_OFFSET.x, RECYCLE_ZONE_OFFSET.y, DEFAULT_RECYCLE_AREA_SIZE.zoneWidth, DEFAULT_RECYCLE_AREA_SIZE.zoneHeight, RECYCLE_PANEL_ID, {
      preventPiles: true,
      dropOffsetX: 0,
      dropOffsetY: 0,
      movable: false,
    }),
    widget(RECYCLE_COLLECT_GROUP_ID, 'basic', {
      parent: 'recycle-zone',
      x: RECYCLE_COLLECT_GROUP_DEFAULT_POSITION.x,
      y: RECYCLE_COLLECT_GROUP_DEFAULT_POSITION.y,
      width: 110,
      height: 166,
      movable: true,
      fixedParent: true,
      layer: 3,
      color: '#10241ef0',
      css: { border: '1px dashed #9ab5a6', borderRadius: '7px', boxShadow: '0 3px 8px #0007' },
    }),
    label('recycle-collect-group-title', '⠿ 收拢牌堆', 7, 1, 96, RECYCLE_COLLECT_GROUP_ID, {
      height: 21,
      css: { color: '#d8eee4', fontSize: '10px', lineHeight: '19px', textAlign: 'center', fontWeight: '700', 'pointer-events': 'none' },
    }),
    pileZone(RECYCLE_COLLECT_STACK_ID, '收拢牌堆', 7, 24, 96, 138, RECYCLE_COLLECT_GROUP_ID, {
      preventPiles: true,
      color: '#172a25dd',
      movable: false,
    }),
    widget(RECYCLE_SHUFFLE_BUFFER_ID, 'holder', {
      x: 970,
      y: 430,
      width: 96,
      height: 138,
      display: false,
      movable: false,
      movableInEdit: false,
      dropTarget: null,
      alignChildren: true,
      preventPiles: true,
      stackOffsetX: 0,
      stackOffsetY: 0,
      text: '',
    }),
    widget('recycle-shuffle-btn', 'button', {
      parent: RECYCLE_PANEL_ID,
      x: 8,
      y: DEFAULT_RECYCLE_AREA_SIZE.actionButtonY,
      width: 145,
      height: 28,
      text: '🔀 洗牌入摸牌堆',
      color: '#2b5746',
      layer: 3,
      css: { borderRadius: '6px', fontSize: '11px', border: '1px solid #789b83' },
      onlyVisibleForSeat: ['seat-1'],
      linkedToSeat: ['seat-1'],
      movable: false,
      clickRoutine: shuffleRecycleZoneRoutine,
    }),
    widget('request-shuffle-recycle-btn', 'button', {
      parent: RECYCLE_PANEL_ID,
      x: 8,
      y: DEFAULT_RECYCLE_AREA_SIZE.actionButtonY,
      width: 145,
      height: 28,
      text: '🔐 请求洗牌入堆',
      color: '#29463d',
      layer: 3,
      css: { borderRadius: '6px', fontSize: '10px', border: '1px solid #6f9687' },
      onlyVisibleForSeat: PUBLIC_REQUEST_SEAT_IDS,
      linkedToSeat: PUBLIC_REQUEST_SEAT_IDS,
      movable: false,
      clickRoutine: requestShuffleRecycleZoneRoutine,
    }),

    handZone('personal-hand', '🖐️ 我的手牌｜其他玩家只看到模块中的数量', PERSONAL_HAND.x, PERSONAL_HAND.y, PERSONAL_HAND.width, PERSONAL_HAND.height),
  ].map(item => item.id === 'personal-hand' ? { ...item, onlyVisibleForSeat: allSeats, linkedToSeat: allSeats,
    movable: false,
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
    label('reserve-title', '备牌托盘｜武将 · 身份 · 扩展 · 状态标记', 15, 8, 600, 'reserve-tray'),
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
    pileZone('conversion-state-reserve', '转换技', 506, 42, 100, 145, 'reserve-tray', {
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
    label('conversion-state-help', '取出为阳｜点击切换', 506, 190, 100, 'reserve-tray', {
      height: 25,
      css: {
        background: '#211d2bd9',
        color: '#d8d0e7',
        fontSize: '9px',
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
        description: '支持 4–12 人自由拓展的通用三国杀人工桌面跑团系统。内置 516 张完整高清真实卡牌（包含标准包、风/火/林/山包、一将成名、SP 及多扩展武将，基本牌、军争与扩展牌）、12 张转换技阴阳状态牌及 12 套独立玩家控制模块。具备【全套备牌面板】分类筛选与一键精准导入、【备牌托盘】盖面抽洗、独立私密展示区与手牌数实时同步。弱规则强自由度，适合标准场、军争场、国战、自定义身份与团队战。',
        ruleText: '【弱规则·强自由·强可见性】\n1. 所有角色技能、武将体力上限、攻击距离、锦囊结算、回合阶段及胜负判定，均由本桌玩家人工协商裁定；\n2. 摸牌堆洗牌与摸牌由主桌自动化 Routine 保障，手牌数量由玩家模块自动统计；\n3. 卡牌在私密展示区与个人手牌区保持原生视角隔离，防偷窥与翻牌提示。',
        helpText: '【快捷操作指南】\n1. 房主操作：顶部工具栏点击「👥 玩家管理」可按需增加/关闭席位（4–12席），或一键设置 75%/90%/100% 全局缩放；\n2. 公共操作请求：2–12 号座位可看到「🔐 请求」按钮。普通玩家提交收拢或洗牌请求后，只有 1 号座位房主勾选同意并提交，操作才会执行；同一时间只保留一个待处理请求，异常时房主可点击「🧹 请求复位」；\n3. 牌库编组：点击「📚 牌库编组」展开全套备牌面板，支持按标准/风/火/林/山/一将/SP/其他扩展逐分类预览，点击卡牌切换 [允许/Ban]，确认后仅将勾选牌盖面导入备牌托盘；\n4. 桌面清理：点击「↻ 收拢桌面牌」只把桌面顶层散落的主牌和当前启用扩展牌移入待回收区左侧的收拢牌堆。待回收区其余空间可自由摆放；点击「🔀 洗牌入摸牌堆」只提取其中的主牌和有效扩展牌，播放动画并真随机洗牌后叠放到摸牌堆，其他牌保持原位置；\n5. 自由布局：快捷洗牌面板、待回收／待洗牌面板及其中的收拢牌堆均可拖动，按钮和洗牌动画会随所属面板移动。房主可用待洗牌面板右上角的「− / +」在 100%、125%、150%、200% 间调整区域容量；卡牌、按钮和文字保持标准大小。只有摸牌堆和个人手牌区始终固定；\n6. 状态标记：备牌托盘右侧提供体力牌和一套通用转换技状态牌。转换技牌取出时默认显示“阳”，点击可在“阳/阴”之间切换，放回托盘会重新盖面；\n7. 托盘洗牌：备牌托盘下设武将/身份/扩展/体力 4 个专属洗牌按钮；普通玩家可向房主申请执行。转换技状态牌不需要洗牌；\n8. 个人手牌：将卡牌移入右下角「🖐️ 我的手牌」即自动对其他玩家隐藏具体牌面，模块仅显示手牌数。',
        attribution: '桌面与生成器源码以 GPLv3 授权。卡面为维护者自有实体牌的扫描件，美术版权归原权利人；本包不授予这些图像的再分发许可。',
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
