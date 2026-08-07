import { PERSONAL_HAND } from '../layouts/table.js';
import {
  DEFAULT_RECYCLE_AREA_SIZE,
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_PANEL_ID,
} from '../layouts/shufflePanels.js';
import type { GameFile, RoutineStep } from '../types/vtt.js';
import { widget } from '../widgets/factory.js';
import { DRAW_PILE_PANEL_ID } from '../widgets/drawPilePanel.js';
import {
  COMPONENT_SCALE_PERCENTS,
  GLOBAL_CARD_SCALE_PERCENTS,
} from './componentScaling.js';
import { recycleAreaSizeSteps } from './layoutControls.js';
import {
  createHandZoneFlipFaceUpRoutine,
  handZoneCoverLeavingIdentityRoutine,
} from './playerHand.js';

const MAX_PLAYER_COUNT = 12;
const HOST_SEAT = 'seat-1';
const HAND_CARD_BASE_SPACING = 54;
const GLOBAL_CARD_SCALE_PANEL_ID = 'global-card-scale-panel';
const GLOBAL_CARD_SCALE_LABEL_ID = 'global-card-scale-label';
const GLOBAL_CARD_SCALE_DOWN_ID = 'global-card-scale-down';
const GLOBAL_CARD_SCALE_UP_ID = 'global-card-scale-up';
const RESET_SIZING_ID = 'reset-tabletop-sizing';

type PlainRecord = Record<string, unknown>;

type Direction = 1 | -1;

const privateHandIdFor = (number: number) => `personal-hand-seat-${number}`;
const publicHandBackIdFor = (number: number) => `public-hand-back-seat-${number}`;
const showHandBackButtonIdFor = (number: number) => `show-hand-back-seat-${number}`;
const hideHandBackButtonIdFor = (number: number) => `hide-hand-back-seat-${number}`;
const componentScaleBarIdFor = (targetId: string) => `component-scale-bar-${targetId}`;
const componentScaleLabelIdFor = (targetId: string) => `component-scale-label-${targetId}`;
const componentScaleDownIdFor = (targetId: string) => `component-scale-down-${targetId}`;
const componentScaleUpIdFor = (targetId: string) => `component-scale-up-${targetId}`;

const privateHandIds = Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => privateHandIdFor(index + 1));
const publicHandBackIds = Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => publicHandBackIdFor(index + 1));
const allHandHolderIds = [...privateHandIds, ...publicHandBackIds];

const componentRootIds = [
  ...Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => `player-module-${index + 1}`),
  'reserve-tray',
  QUICK_SHUFFLE_PANEL_ID,
  RECYCLE_PANEL_ID,
  DRAW_PILE_PANEL_ID,
];

function asRecord(value: unknown): PlainRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as PlainRecord
    : null;
}

function asRoutine(value: unknown): RoutineStep[] {
  return Array.isArray(value) ? value as RoutineStep[] : [];
}

function hostGuard(thenRoutine: RoutineStep[]): RoutineStep[] {
  return [
    {
      func: 'IF',
      operand1: `\${PROPERTY player OF ${HOST_SEAT}}`,
      relation: '==',
      operand2: '${playerName}',
      thenRoutine,
      elseRoutine: [
        {
          func: 'INPUT',
          header: '仅房主可调整桌面尺寸',
          fields: [{ type: 'text', text: '请由 seat-1 房主解锁并调整组件或全局牌大小。' }],
          block: false,
        },
      ],
    },
  ];
}

function presetChangeRoutine(
  currentExpression: string,
  presets: readonly number[],
  direction: Direction,
  applyPreset: (percent: number) => RoutineStep[],
): RoutineStep[] {
  const ordered = direction === 1 ? [...presets] : [...presets].reverse();

  const branch = (index: number): RoutineStep[] => {
    if (index >= ordered.length - 1) return applyPreset(ordered[ordered.length - 1]);
    return [
      {
        func: 'IF',
        operand1: currentExpression,
        relation: '==',
        operand2: ordered[index],
        thenRoutine: applyPreset(ordered[index + 1]),
        elseRoutine: branch(index + 1),
      },
    ];
  };

  return branch(0);
}

function componentScaleSteps(targetId: string, percent: number): RoutineStep[] {
  return [
    { func: 'SET', collection: [targetId], property: 'componentScalePercent', value: percent },
    { func: 'SET', collection: [targetId], property: 'scale', value: percent / 100 },
    { func: 'SET', collection: [componentScaleLabelIdFor(targetId)], property: 'text', value: `${percent}%` },
  ];
}

function componentScaleRoutine(targetId: string, direction: Direction): RoutineStep[] {
  return hostGuard(presetChangeRoutine(
    `\${PROPERTY componentScalePercent OF ${targetId}}`,
    COMPONENT_SCALE_PERCENTS,
    direction,
    percent => componentScaleSteps(targetId, percent),
  ));
}

function globalCardScaleSteps(percent: number): RoutineStep[] {
  const spacing = Math.round(HAND_CARD_BASE_SPACING * percent / 100);
  return [
    { func: 'SELECT', source: 'all', type: 'card', collection: 'globalCardScaleCards' },
    { func: 'SET', collection: 'globalCardScaleCards', property: 'scale', value: percent / 100 },
    { func: 'SET', collection: [GLOBAL_CARD_SCALE_PANEL_ID], property: 'globalCardScalePercent', value: percent },
    { func: 'SET', collection: [GLOBAL_CARD_SCALE_LABEL_ID], property: 'text', value: `${percent}%` },
    { func: 'SET', collection: allHandHolderIds, property: 'stackOffsetX', value: spacing },
  ];
}

function globalCardScaleRoutine(direction: Direction): RoutineStep[] {
  return hostGuard(presetChangeRoutine(
    `\${PROPERTY globalCardScalePercent OF ${GLOBAL_CARD_SCALE_PANEL_ID}}`,
    GLOBAL_CARD_SCALE_PERCENTS,
    direction,
    globalCardScaleSteps,
  ));
}

function openPublicHandBackRoutine(number: number): RoutineStep[] {
  const privateId = privateHandIdFor(number);
  const publicId = publicHandBackIdFor(number);
  const collection = `seat${number}PublicHandCards`;

  return [
    {
      func: 'SELECT',
      source: 'all',
      type: 'card',
      property: 'parent',
      relation: '==',
      value: privateId,
      collection,
    },
    { func: 'FLIP', collection, face: 0 },
    { func: 'SET', collection: [publicId], property: 'display', value: true },
    { func: 'SET', collection: [showHandBackButtonIdFor(number)], property: 'display', value: false },
    { func: 'SET', collection, property: 'parent', value: publicId },
    { func: 'SHUFFLE', holder: [publicId], mode: 'true random' },
    { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
  ];
}

function closePublicHandBackRoutine(number: number): RoutineStep[] {
  const privateId = privateHandIdFor(number);
  const publicId = publicHandBackIdFor(number);
  const collection = `seat${number}RemainingPublicHandCards`;

  return [
    {
      func: 'SELECT',
      source: 'all',
      type: 'card',
      property: 'parent',
      relation: '==',
      value: publicId,
      collection,
    },
    { func: 'SET', collection, property: 'parent', value: privateId },
    { func: 'SET', collection: [publicId], property: 'display', value: false },
    { func: 'SET', collection: [showHandBackButtonIdFor(number)], property: 'display', value: true },
    { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
  ];
}

function installSeatHands(root: PlainRecord): void {
  delete root['personal-hand'];

  for (let number = 1; number <= MAX_PLAYER_COUNT; number += 1) {
    const seatId = `seat-${number}`;
    const privateId = privateHandIdFor(number);
    const publicId = publicHandBackIdFor(number);
    const ordinaryCollection = `ordinaryHandCardsSeat${number}`;

    delete root[`show-blind-${number}`];
    delete root[`hide-blind-${number}`];
    delete root[`blind-zone-${number}`];
    for (let proxy = 1; proxy <= 10; proxy += 1) delete root[`blind-proxy-${number}-${proxy}`];

    root[privateId] = widget(privateId, 'holder', {
      ...PERSONAL_HAND,
      text: '🖐️ 我的手牌｜仅本人可见，可拖动手牌区',
      movable: true,
      layer: 4,
      scale: 1,
      dropTarget: { type: 'card' },
      alignChildren: true,
      preventPiles: true,
      childrenPerOwner: true,
      stackOffsetX: HAND_CARD_BASE_SPACING,
      stackOffsetY: 0,
      color: '#16251fe8',
      onlyVisibleForSeat: [seatId],
      linkedToSeat: [seatId],
      enterRoutine: [
        ...createHandZoneFlipFaceUpRoutine(privateId, ordinaryCollection),
        { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
      ],
      leaveRoutine: [
        ...handZoneCoverLeavingIdentityRoutine,
        { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
      ],
      css: { border: '3px solid #d2ae64', borderRadius: '12px', boxShadow: '0 -4px 18px #0009' },
    });

    root[showHandBackButtonIdFor(number)] = widget(showHandBackButtonIdFor(number), 'button', {
      parent: privateId,
      x: 0,
      y: -30,
      width: 118,
      height: 26,
      text: '👁 展示牌背',
      movable: false,
      fixedParent: true,
      layer: 12,
      onlyVisibleForSeat: [seatId],
      linkedToSeat: [seatId],
      color: '#29463d',
      css: { fontSize: '11px', color: '#d9eee5', borderRadius: '6px', border: '1px solid #6f9687' },
      clickRoutine: openPublicHandBackRoutine(number),
    });

    root[publicId] = widget(publicId, 'holder', {
      display: false,
      text: `玩家 ${number} 的手牌 · 牌背`,
      movable: false,
      layer: 8,
      inheritFrom: { [privateId]: ['x', 'y', 'width', 'height', 'scale'] },
      dropTarget: { type: 'card' },
      alignChildren: true,
      preventPiles: true,
      childrenPerOwner: false,
      stackOffsetX: HAND_CARD_BASE_SPACING,
      stackOffsetY: 0,
      color: '#202b31ee',
      textColor: '#dce4e8',
      onEnter: {
        activeFace: 0,
        clickable: false,
        owner: null,
        publicHandSourceSeat: seatId,
      },
      onLeave: {
        activeFace: 0,
        clickable: true,
        owner: null,
        publicHandSourceSeat: null,
      },
      enterRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }],
      leaveRoutine: [{ func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' }],
      css: { border: '3px solid #9bb0bd', borderRadius: '12px', boxShadow: '0 -4px 18px #0009' },
    });

    root[hideHandBackButtonIdFor(number)] = widget(hideHandBackButtonIdFor(number), 'button', {
      parent: publicId,
      x: 0,
      y: -30,
      width: 118,
      height: 26,
      text: '🔒 收起牌背',
      movable: false,
      fixedParent: true,
      layer: 12,
      onlyVisibleForSeat: [seatId],
      linkedToSeat: [seatId],
      color: '#493d2a',
      css: { fontSize: '11px', color: '#f2dba7', borderRadius: '6px', border: '1px solid #937b4c' },
      clickRoutine: closePublicHandBackRoutine(number),
    });
  }
}

function installComponentScaleControls(root: PlainRecord): string[] {
  const controlIds: string[] = [];

  for (const targetId of componentRootIds) {
    const target = asRecord(root[targetId]);
    if (!target) continue;

    target.componentScalePercent = 100;
    if (typeof target.scale !== 'number') target.scale = 1;

    const barId = componentScaleBarIdFor(targetId);
    const downId = componentScaleDownIdFor(targetId);
    const labelId = componentScaleLabelIdFor(targetId);
    const upId = componentScaleUpIdFor(targetId);

    root[barId] = widget(barId, 'basic', {
      parent: targetId,
      x: 0,
      y: -27,
      width: 108,
      height: 24,
      movable: false,
      fixedParent: true,
      layer: 20,
      onlyVisibleForSeat: [HOST_SEAT],
      linkedToSeat: [HOST_SEAT],
      color: '#20252be8',
      css: { border: '1px solid #8f7a55', borderRadius: '6px', boxShadow: '0 2px 6px #0008' },
    });
    root[downId] = widget(downId, 'button', {
      parent: barId,
      x: 2,
      y: 2,
      width: 24,
      height: 20,
      text: '−',
      movable: false,
      fixedParent: true,
      onlyVisibleForSeat: [HOST_SEAT],
      linkedToSeat: [HOST_SEAT],
      clickRoutine: componentScaleRoutine(targetId, -1),
    });
    root[labelId] = widget(labelId, 'label', {
      parent: barId,
      x: 29,
      y: 2,
      width: 50,
      height: 20,
      text: '100%',
      movable: false,
      fixedParent: true,
      onlyVisibleForSeat: [HOST_SEAT],
      linkedToSeat: [HOST_SEAT],
      css: { color: '#e9dcc0', fontSize: '10px', lineHeight: '18px', textAlign: 'center', fontWeight: '700' },
    });
    root[upId] = widget(upId, 'button', {
      parent: barId,
      x: 82,
      y: 2,
      width: 24,
      height: 20,
      text: '+',
      movable: false,
      fixedParent: true,
      onlyVisibleForSeat: [HOST_SEAT],
      linkedToSeat: [HOST_SEAT],
      clickRoutine: componentScaleRoutine(targetId, 1),
    });

    controlIds.push(downId, upId);
  }

  return controlIds;
}

function installGlobalCardScaleControls(root: PlainRecord): string[] {
  root[GLOBAL_CARD_SCALE_PANEL_ID] = widget(GLOBAL_CARD_SCALE_PANEL_ID, 'basic', {
    x: 1550,
    y: 14,
    width: 395,
    height: 56,
    movable: false,
    layer: 15,
    globalCardScalePercent: 100,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    color: '#20252be8',
    css: { border: '2px double #b5965b', borderRadius: '10px', boxShadow: '0 4px 14px #000a' },
  });

  root['global-card-scale-title'] = widget('global-card-scale-title', 'label', {
    parent: GLOBAL_CARD_SCALE_PANEL_ID,
    x: 8,
    y: 9,
    width: 92,
    height: 36,
    text: '🃏 全局牌大小',
    movable: false,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    css: { color: '#f2dba7', fontSize: '11px', lineHeight: '34px', textAlign: 'center', fontWeight: '700' },
  });
  root[GLOBAL_CARD_SCALE_DOWN_ID] = widget(GLOBAL_CARD_SCALE_DOWN_ID, 'button', {
    parent: GLOBAL_CARD_SCALE_PANEL_ID,
    x: 104,
    y: 9,
    width: 34,
    height: 36,
    text: '−',
    movable: false,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    clickRoutine: globalCardScaleRoutine(-1),
  });
  root[GLOBAL_CARD_SCALE_LABEL_ID] = widget(GLOBAL_CARD_SCALE_LABEL_ID, 'label', {
    parent: GLOBAL_CARD_SCALE_PANEL_ID,
    x: 142,
    y: 9,
    width: 56,
    height: 36,
    text: '100%',
    movable: false,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    css: { color: '#f5dda3', fontSize: '12px', lineHeight: '34px', textAlign: 'center', fontWeight: '700' },
  });
  root[GLOBAL_CARD_SCALE_UP_ID] = widget(GLOBAL_CARD_SCALE_UP_ID, 'button', {
    parent: GLOBAL_CARD_SCALE_PANEL_ID,
    x: 202,
    y: 9,
    width: 34,
    height: 36,
    text: '+',
    movable: false,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    clickRoutine: globalCardScaleRoutine(1),
  });

  const resetSteps = [
    ...componentRootIds.flatMap(targetId => asRecord(root[targetId]) ? componentScaleSteps(targetId, 100) : []),
    ...globalCardScaleSteps(100),
    ...recycleAreaSizeSteps(DEFAULT_RECYCLE_AREA_SIZE),
  ];
  root[RESET_SIZING_ID] = widget(RESET_SIZING_ID, 'button', {
    parent: GLOBAL_CARD_SCALE_PANEL_ID,
    x: 246,
    y: 9,
    width: 140,
    height: 36,
    text: '↺ 全部尺寸 100%',
    movable: false,
    onlyVisibleForSeat: [HOST_SEAT],
    linkedToSeat: [HOST_SEAT],
    color: '#493d2a',
    css: { fontSize: '11px', color: '#f2dba7', borderRadius: '6px', border: '1px solid #937b4c' },
    clickRoutine: hostGuard(resetSteps),
  });

  return [GLOBAL_CARD_SCALE_DOWN_ID, GLOBAL_CARD_SCALE_UP_ID, RESET_SIZING_ID];
}

function appendLayoutLockForSizingControls(root: PlainRecord, controlIds: string[]): void {
  for (const [buttonId, clickable] of [['lock-layout', false], ['unlock-layout', true]] as const) {
    const button = asRecord(root[buttonId]);
    if (!button) continue;
    button.clickRoutine = [
      ...asRoutine(button.clickRoutine),
      { func: 'SET', collection: controlIds, property: 'clickable', value: clickable },
    ];
  }
}

function stripLayoutMovesFromTableReset(root: PlainRecord): void {
  const reset = asRecord(root['reset-table']);
  if (!reset) return;
  reset.clickRoutine = asRoutine(reset.clickRoutine).filter(step => step.func !== 'MOVEXY');
}

function updateMetadata(root: PlainRecord): void {
  const meta = asRecord(root._meta);
  const info = meta ? asRecord(meta.info) : null;
  if (!info) return;

  if (typeof info.helpText === 'string') {
    const additions = [
      '个人手牌：每个座位拥有只对本人可见的独立可移动手牌区；公共布局锁定不会固定你的私人手牌区。',
      '展示牌背：点击手牌区上方“展示牌背”会将真实手牌先强制盖面并随机排列，再临时公开给所有玩家拖取；再次点击“收起牌背”只收回仍留在公开区的牌。',
      '房主尺寸：seat-1 可用组件上方的 − / 百分比 / + 在 50%–400% 间调整主要组件；全局牌大小独立在 75%–250% 间调整。',
      '整桌重置保留布局和尺寸偏好；自动整理只恢复公共组件位置；“全部尺寸 100%”用于显式恢复尺寸。',
    ];
    for (const line of additions) {
      if (!info.helpText.includes(line)) info.helpText += `\n${line}`;
    }
  }
}

/**
 * Final build-time personalization pass for the large tabletop. It deliberately stays at the VTT
 * presentation/interaction layer and adds no Sanguosha rules automation.
 */
export function applyTabletopPersonalizationRuntime<T extends GameFile>(game: T): T {
  const root = game as unknown as PlainRecord;

  installSeatHands(root);
  const componentControls = installComponentScaleControls(root);
  const globalControls = installGlobalCardScaleControls(root);
  appendLayoutLockForSizingControls(root, [...componentControls, ...globalControls]);
  stripLayoutMovesFromTableReset(root);
  updateMetadata(root);

  return game;
}
