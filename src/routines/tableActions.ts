const moduleIds = ['player-module-1', 'player-module-2', 'player-module-3', 'player-module-4', 'reserve-tray'];

export const collectAndShuffleRoutine = [
  { func: 'MOVE', from: ['recycle-zone'], to: ['draw-pile'], count: 'all', face: 0 },
  { func: 'SHUFFLE', holder: ['draw-pile'], mode: 'true random' },
] as const;

export const quickShuffleRoutine = [
  { func: 'FLIP', holder: ['quick-shuffle-zone'], face: 0 },
  { func: 'SHUFFLE', holder: ['quick-shuffle-zone'], mode: 'true random' },
  { func: 'INPUT', header: '洗牌完成', fields: [{ type: 'text', label: '提示', value: '快捷洗牌区已完成随机洗牌，牌叠已自动背置。' }], block: false },
] as const;


export const lockLayoutRoutine = [{ func: 'SET', collection: moduleIds, property: 'movable', value: false }] as const;
export const unlockLayoutRoutine = [{ func: 'SET', collection: moduleIds, property: 'movable', value: true }] as const;

export const arrangeLayoutRoutine = [
  { func: 'SET', collection: ['player-module-1'], property: 'x', value: 685 }, { func: 'SET', collection: ['player-module-1'], property: 'y', value: 90 },
  { func: 'SET', collection: ['player-module-2'], property: 'x', value: 1340 }, { func: 'SET', collection: ['player-module-2'], property: 'y', value: 390 },
  { func: 'SET', collection: ['player-module-3'], property: 'x', value: 685 }, { func: 'SET', collection: ['player-module-3'], property: 'y', value: 790 },
  { func: 'SET', collection: ['player-module-4'], property: 'x', value: 30 }, { func: 'SET', collection: ['player-module-4'], property: 'y', value: 390 },
  { func: 'SET', collection: ['reserve-tray'], property: 'x', value: 30 }, { func: 'SET', collection: ['reserve-tray'], property: 'y', value: 760 },
] as const;

export const resetTableRoutine = [
  { func: 'INPUT', header: '完整恢复初始桌面？', fields: [{ type: 'text', text: '将收回所有牌；不会清空 Seat。取消可中止。' }], block: true },
  { func: 'RECALL', holder: ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'], owned: true, inHolder: true },
  { func: 'FLIP', holder: ['draw-pile', 'general-reserve', 'identity-reserve', 'extra-reserve', 'marker-reserve'], face: 0 },
  { func: 'SHUFFLE', holder: ['draw-pile', 'general-reserve', 'identity-reserve'], mode: 'true random' },
  ...arrangeLayoutRoutine,
] as const;

export const showReserveTrayRoutine = [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: true }] as const;
export const hideReserveTrayRoutine = [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: false }] as const;

export const toggleReserveTrayRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF reserve-tray}',
    relation: '==',
    operand2: true,
    thenRoutine: [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: false }],
    elseRoutine: [{ func: 'SET', collection: ['reserve-tray'], property: 'display', value: true }],
  },
] as const;

export const toggleHostToolbarRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF host-toolbar-panel}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      { func: 'SET', collection: ['host-toolbar-panel'], property: 'display', value: false },
      { func: 'SET', collection: ['toggle-toolbar-btn'], property: 'text', value: '👑 房主工具' },
    ],
    elseRoutine: [
      { func: 'SET', collection: ['host-toolbar-panel'], property: 'display', value: true },
      { func: 'SET', collection: ['toggle-toolbar-btn'], property: 'text', value: '🔽 收起' },
    ],
  },
] as const;

const DECKBUILDING_WIDGET_IDS = [
  'reserve-prep-drawer',
  'library-toolbar',
  'library-toolbar-title',
  'close-library-tray-btn',
  'general-library-title',
  'gen-row-std',
  'general-exp-title',
  'gen-row-exp',
  'identity-composer-title',
  'identity-composer-zone',
  'extra-composer-title',
  'extra-card-composer-zone',
];

export const toggleLibraryTrayRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY display OF reserve-prep-drawer}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      { func: 'SET', collection: DECKBUILDING_WIDGET_IDS, property: 'display', value: false },
      { func: 'SET', collection: ['toggle-library-table'], property: 'text', value: '📦 全套备牌' },
    ],
    elseRoutine: [
      { func: 'SET', collection: DECKBUILDING_WIDGET_IDS, property: 'display', value: true },
      { func: 'SET', collection: ['toggle-library-table'], property: 'text', value: '🙈 收起备牌' },
    ],
  },
] as const;

export const updateHandCountsRoutine = [1, 2, 3, 4].flatMap(number => [
  { func: 'SELECT', source: 'all', type: 'card', property: 'owner', relation: '==', value: `\${PROPERTY player OF seat-${number}}`, collection: `seat${number}HandCards` },
  { func: 'COUNT', collection: `seat${number}HandCards`, variable: `seat${number}HandCount` },
  { func: 'LABEL', label: [`hand-count-${number}`], value: `\${seat${number}HandCount}` },
]);

export const createTogglePerspectiveRoutine = (number: number) => [
  {
    func: 'IF',
    operand1: `\${PROPERTY player OF seat-${number}}`,
    relation: '==',
    operand2: '\${playerName}',
    thenRoutine: [
      {
        func: 'IF',
        operand1: `\${PROPERTY display OF private-backdrop-${number}}`,
        relation: '==',
        operand2: true,
        thenRoutine: [
          { func: 'SET', collection: [`private-backdrop-${number}`, `private-zone-${number}`], property: 'display', value: false },
          { func: 'INPUT', header: '视角切换', fields: [{ type: 'text', label: '当前视角', value: `玩家 ${number}：已切换为【非己方视角】预览（私密区已隐藏）` }], block: false },
        ],
        elseRoutine: [
          { func: 'SET', collection: [`private-backdrop-${number}`, `private-zone-${number}`], property: 'display', value: true },
          { func: 'INPUT', header: '视角切换', fields: [{ type: 'text', label: '当前视角', value: `玩家 ${number}：已切换为【己方视角】（完整显示私密展示区）` }], block: false },
        ],
      },
    ],
    elseRoutine: [
      {
        func: 'IF',
        operand1: '${PROPERTY player OF seat-1}',
        relation: '==',
        operand2: '\${playerName}',
        thenRoutine: [
          {
            func: 'IF',
            operand1: `\${PROPERTY display OF private-backdrop-${number}}`,
            relation: '==',
            operand2: true,
            thenRoutine: [
              { func: 'SET', collection: [`private-backdrop-${number}`, `private-zone-${number}`], property: 'display', value: false },
              { func: 'INPUT', header: '视角切换', fields: [{ type: 'text', label: '当前视角', value: `玩家 ${number}：房主已切换为【非己方视角】预览` }], block: false },
            ],
            elseRoutine: [
              { func: 'SET', collection: [`private-backdrop-${number}`, `private-zone-${number}`], property: 'display', value: true },
              { func: 'INPUT', header: '视角切换', fields: [{ type: 'text', label: '当前视角', value: `玩家 ${number}：房主已切换为【己方视角】` }], block: false },
            ],
          },
        ],
        elseRoutine: [
          { func: 'INPUT', header: '无法切换视角', fields: [{ type: 'text', label: '提示', value: `只有本座玩家或玩家 1 (房主) 可以切换玩家 ${number} 的视角` }], block: false },
        ],
      },
    ],
  },
] as const;

export const togglePerspective1Routine = createTogglePerspectiveRoutine(1);
export const togglePerspective2Routine = createTogglePerspectiveRoutine(2);
export const togglePerspective3Routine = createTogglePerspectiveRoutine(3);
export const togglePerspective4Routine = createTogglePerspectiveRoutine(4);

