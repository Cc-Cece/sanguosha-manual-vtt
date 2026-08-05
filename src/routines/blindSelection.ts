const MAX_PLAYER_COUNT = 12;

export const BLIND_SELECTION_CONTROLLER_ID = 'blind-selection-controller';
export const BLIND_SELECTION_PANEL_ID = 'blind-selection-panel';
export const BLIND_SELECTION_SELECTED_ID = 'blind-selection-selected';
export const BLIND_SELECTION_ROW_IDS = [
  'blind-selection-row-1',
  'blind-selection-row-2',
  'blind-selection-row-3',
] as const;

const sourceSeatProperty = '${PROPERTY sourceSeat OF blind-selection-controller}';
const sourcePlayerProperty = '${PROPERTY sourcePlayer OF blind-selection-controller}';
const phaseProperty = '${PROPERTY phase OF blind-selection-controller}';

const seatIdFor = (number: number) => `seat-${number}`;
const seatPlayerProperty = (number: number) => '${PROPERTY player OF seat-' + number + '}';

const resetBlindSelectionUiRoutine = [
  { func: 'SET', collection: [BLIND_SELECTION_PANEL_ID], property: 'display', value: false },
  { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'active', value: false },
  { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'sourceSeat', value: '' },
  { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'sourcePlayer', value: '' },
  { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'phase', value: 'idle' },
  { func: 'LABEL', label: ['blind-selection-title'], value: '暗牌选择台' },
  { func: 'LABEL', label: ['blind-selection-status'], value: '等待目标玩家展开手牌' },
] as const;

const collectRowCardsRoutine = (collection: string) => [
  { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: BLIND_SELECTION_ROW_IDS[0], collection },
  { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: BLIND_SELECTION_ROW_IDS[1], collection, mode: 'add' },
  { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: BLIND_SELECTION_ROW_IDS[2], collection, mode: 'add' },
] as const;

const collectAllTableCardsRoutine = (collection: string) => [
  ...collectRowCardsRoutine(collection),
  { func: 'SELECT', source: 'all', type: 'card', property: 'parent', relation: '==', value: BLIND_SELECTION_SELECTED_ID, collection, mode: 'add' },
] as const;

const clearBlindMetadataRoutine = (collection: string) => [
  { func: 'SET', collection, property: 'blindSourceSeat', value: null },
  { func: 'SET', collection, property: 'blindSourcePlayer', value: null },
  { func: 'SET', collection, property: 'blindSelected', value: false },
  { func: 'SET', collection, property: 'activeFace', value: 0 },
  { func: 'SET', collection, property: 'clickable', value: true },
  { func: 'SET', collection, property: 'movable', value: true },
] as const;

const moveCollectionToStoredSourceSeatRoutine = (collection: string) =>
  Array.from({ length: MAX_PLAYER_COUNT }, (_, index) => {
    const number = index + 1;
    return {
      func: 'IF',
      operand1: sourceSeatProperty,
      relation: '==',
      operand2: seatIdFor(number),
      thenRoutine: [
        { func: 'MOVE', collection, to: seatIdFor(number), count: 'all', face: 0 },
      ],
    };
  });

const cancelForSeatBody = (number: number) => [
  { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'phase', value: 'cancelling' },
  ...collectAllTableCardsRoutine('blindCancelCards'),
  ...clearBlindMetadataRoutine('blindCancelCards'),
  { func: 'MOVE', collection: 'blindCancelCards', to: seatIdFor(number), count: 'all', face: 0 },
  ...resetBlindSelectionUiRoutine,
  { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
] as const;

/**
 * Cancels the shared table only when it currently belongs to the supplied Seat.
 * This is intentionally safe to embed before Seat clearing: cards are returned while the
 * Seat still contains its real player and can therefore assign the correct hand owner.
 */
export const createCancelBlindSelectionForSeatRoutine = (number: number) => [
  {
    func: 'IF',
    operand1: sourceSeatProperty,
    relation: '==',
    operand2: seatIdFor(number),
    thenRoutine: cancelForSeatBody(number),
  },
] as const;

export const cancelAllBlindSelectionsRoutine = Array.from(
  { length: MAX_PLAYER_COUNT },
  (_, index) => createCancelBlindSelectionForSeatRoutine(index + 1),
).flat();

const splitRandomHandIntoRowsRoutine = [
  {
    func: 'SELECT',
    source: 'blindSourceCards',
    type: 'card',
    property: 'id',
    relation: '!=',
    value: '',
    max: 12,
    collection: 'blindRow1Cards',
  },
  {
    func: 'SELECT',
    source: 'blindSourceCards',
    type: 'card',
    property: 'id',
    relation: '!=',
    value: '',
    collection: 'blindAfterRow1',
  },
  {
    func: 'SELECT',
    source: 'blindRow1Cards',
    type: 'card',
    property: 'id',
    relation: '!=',
    value: '',
    collection: 'blindAfterRow1',
    mode: 'remove',
  },
  {
    func: 'SELECT',
    source: 'blindAfterRow1',
    type: 'card',
    property: 'id',
    relation: '!=',
    value: '',
    max: 12,
    collection: 'blindRow2Cards',
  },
  {
    func: 'SELECT',
    source: 'blindAfterRow1',
    type: 'card',
    property: 'id',
    relation: '!=',
    value: '',
    collection: 'blindRow3Cards',
  },
  {
    func: 'SELECT',
    source: 'blindRow2Cards',
    type: 'card',
    property: 'id',
    relation: '!=',
    value: '',
    collection: 'blindRow3Cards',
    mode: 'remove',
  },
] as const;

export const createOpenBlindSelectionRoutine = (number: number) => {
  const seatId = seatIdFor(number);
  const playerProperty = seatPlayerProperty(number);

  return [
    {
      func: 'IF',
      operand1: playerProperty,
      relation: '==',
      operand2: '${playerName}',
      thenRoutine: [
        {
          func: 'IF',
          operand1: '${PROPERTY active OF blind-selection-controller}',
          relation: '==',
          operand2: true,
          thenRoutine: [
            {
              func: 'INPUT',
              header: '暗牌选择台正在使用',
              fields: [{ type: 'text', label: '提示', value: '请先完成或取消当前暗牌选择。' }],
              block: false,
            },
          ],
          elseRoutine: [
            {
              func: 'SELECT',
              source: 'all',
              type: 'card',
              property: 'owner',
              relation: '==',
              value: playerProperty,
              random: true,
              collection: 'blindSourceCards',
            },
            {
              func: 'SELECT',
              source: 'blindSourceCards',
              type: 'card',
              property: 'parent',
              relation: '==',
              value: 'personal-hand',
              collection: 'blindSourceCards',
              mode: 'intersect',
            },
            {
              func: 'SELECT',
              source: 'blindSourceCards',
              type: 'card',
              property: 'deck',
              relation: 'in',
              value: ['main-deck', 'extra-deck'],
              collection: 'blindSourceCards',
              mode: 'intersect',
            },
            { func: 'COUNT', collection: 'blindSourceCards', variable: 'blindHandCount' },
            {
              func: 'IF',
              operand1: '${blindHandCount}',
              relation: '>',
              operand2: 0,
              thenRoutine: [
                ...splitRandomHandIntoRowsRoutine,
                { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'active', value: true },
                { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'sourceSeat', value: seatId },
                { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'sourcePlayer', value: playerProperty },
                { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'phase', value: 'selecting' },
                { func: 'SET', collection: 'blindSourceCards', property: 'blindSourceSeat', value: seatId },
                { func: 'SET', collection: 'blindSourceCards', property: 'blindSourcePlayer', value: playerProperty },
                { func: 'SET', collection: 'blindSourceCards', property: 'blindSelected', value: false },
                { func: 'SET', collection: 'blindSourceCards', property: 'activeFace', value: 0 },
                { func: 'SET', collection: 'blindSourceCards', property: 'clickable', value: false },
                { func: 'SET', collection: 'blindSourceCards', property: 'movable', value: true },
                { func: 'SET', collection: 'blindSourceCards', property: 'owner', value: null },
                { func: 'MOVE', collection: 'blindRow1Cards', to: BLIND_SELECTION_ROW_IDS[0], count: 'all', face: 0 },
                { func: 'MOVE', collection: 'blindRow2Cards', to: BLIND_SELECTION_ROW_IDS[1], count: 'all', face: 0 },
                { func: 'MOVE', collection: 'blindRow3Cards', to: BLIND_SELECTION_ROW_IDS[2], count: 'all', face: 0 },
                { func: 'SHUFFLE', holder: BLIND_SELECTION_ROW_IDS[0], mode: 'true random' },
                { func: 'SHUFFLE', holder: BLIND_SELECTION_ROW_IDS[1], mode: 'true random' },
                { func: 'SHUFFLE', holder: BLIND_SELECTION_ROW_IDS[2], mode: 'true random' },
                { func: 'SET', collection: [BLIND_SELECTION_PANEL_ID], property: 'display', value: true },
                {
                  func: 'LABEL',
                  label: ['blind-selection-title'],
                  value: '暗牌选择台｜${PROPERTY display OF seat-' + number + '}｜${blindHandCount} 张',
                },
                {
                  func: 'LABEL',
                  label: ['blind-selection-status'],
                  value: '将一张牌背拖入右侧选择槽；目标玩家再点击“收回其余”',
                },
                { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
              ],
              elseRoutine: [
                {
                  func: 'INPUT',
                  header: '没有可展开的手牌',
                  fields: [{ type: 'text', label: '提示', value: '你的手牌区中没有主牌或附加牌。' }],
                  block: false,
                },
              ],
            },
          ],
        },
      ],
      elseRoutine: [
        {
          func: 'INPUT',
          header: '无法展开手牌',
          fields: [{ type: 'text', label: '提示', value: '只有本座玩家可以展开自己的暗置手牌。' }],
          block: false,
        },
      ],
    },
  ] as const;
};

export const confirmBlindSelectionRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY active OF blind-selection-controller}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      {
        func: 'IF',
        operand1: sourcePlayerProperty,
        relation: '==',
        operand2: '${playerName}',
        thenRoutine: [
          {
            func: 'SELECT',
            source: 'all',
            type: 'card',
            property: 'parent',
            relation: '==',
            value: BLIND_SELECTION_SELECTED_ID,
            collection: 'blindChosenCard',
          },
          { func: 'COUNT', collection: 'blindChosenCard', variable: 'blindChosenCount' },
          {
            func: 'IF',
            operand1: '${blindChosenCount}',
            relation: '==',
            operand2: 1,
            thenRoutine: [
              ...collectRowCardsRoutine('blindRemainingCards'),
              ...clearBlindMetadataRoutine('blindRemainingCards'),
              ...moveCollectionToStoredSourceSeatRoutine('blindRemainingCards'),
              { func: 'SET', collection: 'blindChosenCard', property: 'activeFace', value: 0 },
              { func: 'SET', collection: 'blindChosenCard', property: 'clickable', value: false },
              { func: 'SET', collection: 'blindChosenCard', property: 'movable', value: true },
              { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'phase', value: 'ready' },
              {
                func: 'LABEL',
                label: ['blind-selection-status'],
                value: '已选定：将牌背移入获得者手牌，或移到弃牌区后再点击翻面',
              },
              { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
            ],
            elseRoutine: [
              {
                func: 'INPUT',
                header: '尚未选牌',
                fields: [{ type: 'text', label: '提示', value: '请先将一张牌背拖入右侧选择槽。' }],
                block: false,
              },
            ],
          },
        ],
        elseRoutine: [
          {
            func: 'INPUT',
            header: '无法收回其余手牌',
            fields: [{ type: 'text', label: '提示', value: '只有被展开手牌的目标玩家可以确认并收回其余手牌。' }],
            block: false,
          },
        ],
      },
    ],
  },
] as const;

const cancelCurrentBlindSelectionRoutine = [
  { func: 'SET', collection: [BLIND_SELECTION_CONTROLLER_ID], property: 'phase', value: 'cancelling' },
  ...collectAllTableCardsRoutine('blindCancelCards'),
  ...clearBlindMetadataRoutine('blindCancelCards'),
  ...moveCollectionToStoredSourceSeatRoutine('blindCancelCards'),
  ...resetBlindSelectionUiRoutine,
  { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
] as const;

export const cancelBlindSelectionRoutine = [
  {
    func: 'IF',
    operand1: '${PROPERTY active OF blind-selection-controller}',
    relation: '==',
    operand2: true,
    thenRoutine: [
      {
        func: 'IF',
        operand1: sourcePlayerProperty,
        relation: '==',
        operand2: '${playerName}',
        thenRoutine: cancelCurrentBlindSelectionRoutine,
        elseRoutine: [
          {
            func: 'IF',
            operand1: '${PROPERTY player OF seat-1}',
            relation: '==',
            operand2: '${playerName}',
            thenRoutine: cancelCurrentBlindSelectionRoutine,
            elseRoutine: [
              {
                func: 'INPUT',
                header: '无法取消暗牌选择',
                fields: [{ type: 'text', label: '提示', value: '只有目标玩家或玩家1（房主）可以取消并恢复手牌。' }],
                block: false,
              },
            ],
          },
        ],
      },
    ],
  },
] as const;

/**
 * The chosen holder locks the card until the target player has returned all unselected cards.
 * Once phase=ready, moving the chosen card closes the shared table. Its onLeave properties keep
 * the card face down and restore normal clicking, so a discard still needs a deliberate flip.
 */
export const blindSelectedCardLeaveRoutine = [
  {
    func: 'IF',
    operand1: phaseProperty,
    relation: '==',
    operand2: 'ready',
    thenRoutine: [
      ...resetBlindSelectionUiRoutine,
      { func: 'CALL', widget: 'table-controller', routine: 'updateHandCountsRoutine' },
    ],
  },
] as const;
