# Antigravity：备牌面板完整修复执行指南

> 适用分支：`feature/library-and-deckbuilding-table`  
> 审查基线：`0ba3f75ba9b2980a1a8fa28272162ce7e36a7225`  
> 关联计划：`docs/reserve-panel-refactor-plan.md`、`docs/reserve-panel-functional-completion-supplement-plan.md`  
> 目标：把当前“排版得到部分修复，但筛选、选择和导入仍是假功能”的覆盖式备牌面板，修复为可真实使用、可测试、可回退的备牌系统。

---

## 0. 给 Antigravity 的强制要求

本任务不是继续调整面板外观，也不是再增加提示框。必须完成从资源分类到选择性导入的完整业务闭环。

完成前不得使用以下表述：

- “筛选已经完成”，但实际只是切换页码或显示顺序；
- “全部允许／全部 Ban 已完成”，但实际只是显示或隐藏页面；
- “已选牌已导入”，但实际移动了全部牌；
- “分类已经完成”，但分类仍根据数组序号猜测；
- “测试通过”，但没有执行完整的 `pnpm check` 和人工交互测试。

禁止通过以下方式蒙混过关：

1. 不得把 `display` 当作卡牌选择状态；
2. 不得通过隐藏页面模拟 Ban 或取消选择；
3. 不得把第 1 页称为“标准包”，把第 2 页称为所有扩展包；
4. 不得让风、火、林、山、一将、SP 共用同一个筛选 Routine；
5. 不得根据卡牌在数组中的顺序伪造真实扩展包分类；
6. 不得复制第二套实体卡牌用于“全部”视图；
7. 不得继续使用 `MOVE ... count: all` 导入全部页面；
8. 不得用成功提示代替真实状态修改；
9. 不得修改现有桌面、备牌托盘尺寸、固定主牌流程或 VirtualTabletop 上游源码；
10. 不得在备牌浏览阶段允许卡牌被拖走。

---

## 1. 对 `0ba3f75...` 的准确结论

该提交确实修复了一部分布局问题：

- 将单个 `gen-page-N` 自动排列 Holder 改为普通页面容器；
- 每页增加 4 个独立的重叠牌带 Holder；
- 将 68 张武将按 17 张一行放入 4 条牌带；
- 将 31 张附加牌拆入 3 条牌带；
- 武将和附加牌开始共用相同的主视口坐标。

这些修改只解决了“单页内部不能同时使用自动排列与手动二维坐标”的问题。

该提交没有完成核心功能，并且仍存在以下阻断问题。

### 1.1 左侧分类仍不是真筛选

当前逻辑依然是：

```text
全部武将 → 显示 gen-page-1
标准包 → 显示 gen-page-1
风／火／林／山／一将／SP／其他 → 全部显示 gen-page-2
```

因此：

- “全部武将”只显示前 68 张；
- “标准包 25 张”实际显示前 68 张；
- 所有扩展分类看到的是同一组第 69–136 张；
- 第 3–5 页不属于任何真实分类；
- 点击左侧按钮只是在切换数组分页，不是在过滤扩展包。

### 1.2 批量按钮错误地修改 `display`

当前 `reserveRoutines.ts` 中：

```text
全部允许 → 把五个页面全部 display=true
全部 Ban → 把五个页面全部 display=false
附加牌全选 → 把附加牌页面 display=true
附加牌全取消 → 把附加牌页面 display=false
```

这是严重的语义错误。

结果是：

- “全部允许”会把 5 页叠在同一坐标，再次出现 315 张牌重叠；
- “全部 Ban”只是把浏览内容隐藏，卡牌状态没有变化；
- “附加牌全取消”只是让页面看不见，31 张牌仍会在确认时被全部导入；
- 用户看到的界面状态和本局实际备牌完全不一致。

### 1.3 单张卡牌没有选择状态

当前卡牌没有：

```text
reserveLibraryType
reserveCategoryId
reserveSelected
reserveDefaultSelected
reserveHomeHolder
reserveHomeIndex
clickRoutine
```

因此点击卡牌不会发生：

```text
武将：允许 ↔ Ban
附加牌：选中 ↔ 未选
```

标题中的“点击切换允许／Ban”仍是虚假说明。

### 1.4 卡牌重新变成可拖动

`assetDecks.ts` 当前生成备牌面板中的卡牌时，没有显式设置：

```ts
movable: false
```

Widget 默认值为可移动，因此浏览阶段可能再次出现误拖、抽出中间牌、破坏排列和归位困难。

必须恢复：

```text
movable=false
clickable=true
enlarge 保留
```

### 1.5 分类名称和数量仍然是硬编码假数据

当前资源类型 `CardAsset` 只有：

```text
id、sequence、cardId、category、source、label 等
```

所有武将都只有：

```text
category = generals
```

没有“标准／风／火／林／山／一将／SP”等真实字段。

当前附加牌的：

```text
装备 12
锦囊 12
特殊 7
```

也只是按数组顺序每 12 张切一行后写上的标题，不是经过资源审计的分类。

### 1.6 摘要仍然是静态文字

右侧摘要仍写死：

```text
允许 315 / Ban 0
附加牌已选 31 / 未选 0
```

没有任何 `SELECT → COUNT → LABEL` 更新逻辑。

### 1.7 翻页仍只有“固定跳 1 / 固定跳 2”

当前：

```text
上一页 → 永远显示第 1 页
下一页 → 永远显示第 2 页
```

没有当前页状态，也不能访问第 3、4、5 页。

### 1.8 导入仍然移动全部实体牌

当前确认操作从 20 条武将行和 3 条附加牌行执行：

```text
MOVE count=all
```

所以无论用户如何点击，最终仍然会把：

```text
315 张武将 + 31 张附加牌
```

全部移入托盘。

把提示文字从“允许的武将”改成“选中的武将”，并不能改变上述事实。

### 1.9 没有恢复、撤销和原位归还闭环

确认后实体牌离开面板进入托盘，但当前没有可靠记录：

- 原分类；
- 原页面；
- 原行；
- 原顺序；
- 原选择默认值。

重新编辑或完整重置时无法稳定归位。

---

## 2. 冻结的产品行为

必须严格实现以下最终行为。

### 2.1 武将牌

```text
总数：315
默认：全部允许
单击：允许 → Ban
再次单击：Ban → 允许
确认：只把允许武将移入 general-reserve
Ban 武将继续留在备牌面板
```

### 2.2 附加牌

```text
总数：当前实际资源 31
默认：全部不选
单击：未选 → 选中
再次单击：选中 → 未选
确认：只把选中附加牌移入 extra-reserve
未选附加牌继续留在备牌面板
```

### 2.3 固定内容

以下内容不通过备牌面板选择：

- 固定游戏主牌继续直接位于 `draw-pile`；
- 身份牌继续位于 `identity-reserve`；
- 血量牌继续位于 `marker-reserve`；
- 现有备牌托盘外观和四槽结构不变。

### 2.4 浏览方式

```text
顶部主分类：武将牌 / 附加牌
左侧二级分类：来自真实资源审计
中央：共享主视口
页面：每页最多 4 条牌带
每条：最多 17 张武将；附加牌可按实际容量生成
底部：只显示当前主分类适用的批量按钮
```

---

## 3. 正确的整体架构

必须把实现拆成六层，不能继续把所有逻辑堆进 `libraryBrowser.ts` 和几个手写 Routine。

```text
真实资源审计
→ 备牌分类元数据
→ 视图注册表（分类 / 页面 / 行）
→ 实体卡牌运行时状态
→ 面板控制与批量 Routine
→ 选择性导入 / 原位恢复
```

建议新增或重构以下文件：

```text
src/data/reserveTaxonomy.ts
src/data/reserveViewModel.ts
src/routines/reserveCardRoutines.ts
src/routines/reservePanelRoutines.ts
src/widgets/reservePanelController.ts
src/widgets/libraryBrowser.ts
src/data/assetDecks.ts
src/routines/deckAssembly.ts
src/routines/tableActions.ts
```

测试至少拆分为：

```text
tests/reserve-taxonomy.test.ts
tests/reserve-layout.test.ts
tests/reserve-filtering.test.ts
tests/reserve-selection.test.ts
tests/reserve-import.test.ts
```

---

## 4. 第一步：完成真实资源审计

### 4.1 不得根据序号猜分类

先检查本地来源：

```text
../tabletop-simulator-reference/3765935052/cleaned-and-classified-cards/manifest.json
```

结合以下信息确认每张卡的真实归属：

- `sequence`；
- `cardId`；
- 原始文件路径；
- 清理后的文件名；
- 原始 URL 或清单元数据；
- 卡面名称；
- 必要时人工核对卡面。

### 4.2 建立独立分类表

不要把分类散落在 UI 代码中。建议建立：

```ts
export type ReserveLibraryType = 'general' | 'extra';

export interface ReserveTaxonomyEntry {
  sourceSequence: number;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  categoryOrder: number;
  itemOrder: number;
  defaultSelected: boolean;
}
```

建议文件：

```text
src/data/reserveTaxonomy.ts
```

默认值：

```text
武将 defaultSelected = true
附加牌 defaultSelected = false
```

### 4.3 无法确认时进入“待分类”

禁止猜测。无法确认的牌必须使用：

```text
categoryId = unclassified
categoryLabel = 待分类
```

### 4.4 构建时强校验

必须验证：

```text
武将元数据总数 = 315
附加牌元数据总数 = 31
每个 sourceSequence 唯一
每张 generals 资源恰好匹配一条 general 元数据
每张 gameplay-extra 资源恰好匹配一条 extra 元数据
不存在丢失、重复或跨类型映射
```

如果不满足，构建直接失败，不得默默把牌放到错误分类。

可以输出审计文件：

```text
temp/reserve-taxonomy-audit.json
```

其中列出：

- 各分类实际数量；
- 未分类牌；
- 重复序号；
- 缺失映射；
- 总数核对。

### 4.5 UI 文案必须数据驱动

左侧按钮文字必须来自审计后的数据：

```text
标准 (实际数量)
风 (实际数量)
待分类 (实际数量)
```

在真实数据完成前，不得继续显示未经核对的“标准 25、风 8、火 8”等文字。

---

## 5. 第二步：生成唯一实体牌的视图模型

同一张实体牌只能有一个父 Holder，不允许为了“全部”分类复制实体牌。

### 5.1 建立页面注册表

建议：

```ts
export interface ReservePageDefinition {
  id: string;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  categoryPage: number;
  cardSequences: number[];
  rowIds: string[];
}

export interface ReserveViewRegistry {
  pages: ReservePageDefinition[];
  pageIds: string[];
  pagesByLibrary: Record<ReserveLibraryType, string[]>;
  pagesByCategory: Record<string, string[]>;
}
```

### 5.2 物理归属原则

卡牌按真实二级分类分配到唯一页面和唯一牌带：

```text
general-standard-page-1-row-1
general-feng-page-1-row-1
general-yijiang-page-2-row-3
extra-equipment-page-1-row-1
extra-unclassified-page-1-row-1
```

不得再使用：

```text
gen-page-1 = 数组第 1–68 张
gen-page-2 = 数组第 69–136 张
```

作为分类依据。

### 5.3 “全部”视图不是第二套牌

“全部武将”只是一种页面序列：

```text
全部武将页面列表 = 所有武将分类页面按 categoryOrder + page 排序后的扁平列表
```

选择“全部武将”时，分页器依次显示这些已有的真实分类页面。

选择单一分类时，分页器只遍历该分类自己的页面。

同一张牌始终只存在于一个实体 Holder 中。

### 5.4 页面与行结构

每个页面必须是普通 `basic` 容器，每条牌带才是自动排列 Holder：

```text
page basic
├── row-1 holder
├── row-2 holder
├── row-3 holder
└── row-4 holder
```

每条武将牌带最多 17 张：

```text
卡宽 90
步进 56
90 + 16 × 56 = 986
```

主视口约 980 px 时，最终可以根据实测使用 16 或 17 张，但必须确保最后一张可访问。

页面高度必须容纳全部行；主视口加：

```css
overflow: hidden;
```

作为异常保护，而不是用裁切代替分页。

### 5.5 行标题不能写死错误数量

不得对所有行都写“17张”。必须根据实际 `cardSequences.length` 生成，例如：

```text
第 4 行（9 张）
```

空行不创建。

---

## 6. 第三步：给每张实体牌添加运行时状态

在 `assetDecks.ts` 生成备牌卡牌时添加：

```ts
{
  movable: false,
  clickable: true,
  reserveLibraryType: meta.libraryType,
  reserveCategoryId: meta.categoryId,
  reserveSelected: meta.defaultSelected,
  reserveDefaultSelected: meta.defaultSelected,
  reserveHomeHolder: targetHolder,
  reserveHomeIndex: indexWithinRow,
  reserveState: 'draft',
  clickRoutine: createToggleReserveCardRoutine(meta.libraryType),
}
```

属性命名可以微调，但语义必须完整保留。

### 6.1 不使用 `display` 表示选择

选择只修改：

```text
reserveSelected
视觉状态属性
摘要
```

卡牌所在页面是否显示，只由当前筛选与分页控制。

### 6.2 单卡点击 Routine

参考结构：

```ts
export function createToggleReserveCardRoutine(
  libraryType: ReserveLibraryType,
): RoutineStep[] {
  return [
    {
      func: 'IF',
      operand1: '${PROPERTY reserveSelected}',
      relation: '==',
      operand2: true,
      thenRoutine: [
        { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: false },
        { func: 'SET', collection: 'thisButton', property: 'css', value: unselectedCss(libraryType) },
      ],
      elseRoutine: [
        { func: 'SET', collection: 'thisButton', property: 'reserveSelected', value: true },
        { func: 'SET', collection: 'thisButton', property: 'css', value: selectedCss(libraryType) },
      ],
    },
    { func: 'CALL', widget: 'reserve-panel-controller', routine: 'updateSummaryRoutine' },
  ];
}
```

必须根据项目 `RoutineStep` 类型和 VirtualTabletop 实际语法调整，但行为必须一致。

### 6.3 视觉状态

建议最低可用方案：

```text
允许武将：正常亮度 + 绿色/金色边框
Ban 武将：灰度、降低亮度 + 红色边框
选中附加牌：正常亮度 + 蓝绿/金色边框
未选附加牌：轻度降亮 + 灰色边框
```

可使用卡牌根 Widget 的 `css`，但不要破坏 `enlarge`、位置或牌面渲染。

状态标记应位于重叠后仍露出的顶部或左侧区域。核心逻辑完成后再增加独立标记子 Widget；不得先花时间美化而不完成状态闭环。

---

## 7. 第四步：建立面板控制器

创建隐藏控制 Widget：

```text
reserve-panel-controller
```

建议属性：

```ts
{
  display: false,
  movable: false,
  activeTab: 'general',
  activeCategoryId: 'all',
  currentPage: 1,
  pageCount: 1,
  draftState: 'editing',
  globalGeneralSelected: 315,
  globalExtraSelected: 0,
}
```

控制器负责：

- 当前主分类；
- 当前二级分类；
- 当前页；
- 页面总数；
- 摘要更新；
- 页面切换；
- 批量操作；
- 草稿恢复。

UI Widget 不应各自维护互相冲突的隐式状态。

---

## 8. 第五步：完成真正的主分类、筛选与分页

### 8.1 打开面板

打开时：

```text
显示框架 Widget
设置 activeTab=general
设置 activeCategoryId=all
设置 currentPage=1
隐藏全部内容页面
只显示“全部武将”页面序列中的第 1 个页面
显示武将批量按钮
隐藏附加牌批量按钮
刷新标题、分类高亮、页码和摘要
```

不得通过一个大 ID 数组把所有页面全部设置为 `display=true`。

### 8.2 主分类切换

切换“武将牌”：

```text
隐藏所有附加牌页面
显示武将导航
显示武将批量按钮
隐藏附加牌批量按钮
恢复上次武将分类和页码，或统一回到 all / page 1
```

切换“附加牌”：

```text
隐藏所有武将页面
显示附加牌导航
隐藏武将批量按钮
显示附加牌批量按钮
附加牌页面从共享主视口顶部开始显示
```

### 8.3 二级分类按钮

每个分类必须拥有独立的真实 Routine 或由数据生成的 Routine：

```ts
createSwitchCategoryRoutine({
  libraryType: 'general',
  categoryId: 'feng',
  pageIds: ['general-feng-page-1', ...],
});
```

不能再让多个分类共用 `switchGenExpRoutine`。

### 8.4 分页

必须支持全部页：

```text
1 ↔ 2 ↔ 3 ↔ … ↔ pageCount
```

推荐在 TypeScript 构建时，根据 `ReserveViewRegistry` 生成完整 IF 链，或者为每个视图生成明确的上一页／下一页 Routine。

行为：

```text
上一页：currentPage > 1 时减 1，否则无变化
下一页：currentPage < pageCount 时加 1，否则无变化
每次只显示一个页面容器
页码标签显示 currentPage / pageCount
```

导航和翻页不得弹出 `INPUT` 提示。

### 8.5 分类高亮

当前主分类和二级分类必须有清晰高亮，但高亮只修改按钮外观，不改变卡牌状态。

---

## 9. 第六步：完成真实批量操作

批量操作必须通过 `SELECT` 建立卡牌集合，再修改 `reserveSelected`。

VirtualTabletop 的 `SELECT` 可以多次链式过滤，第二次使用第一次集合为 `source`。

### 9.1 当前分类全部允许 / 全部 Ban

逻辑：

```text
先选择所有 reserveLibraryType=general 的卡牌
若 activeCategoryId != all：再按 reserveCategoryId 过滤
SET reserveSelected=true 或 false
SET 对应视觉状态
CALL updateSummaryRoutine
```

参考：

```ts
[
  {
    func: 'SELECT',
    source: 'all',
    type: 'card',
    property: 'reserveLibraryType',
    relation: '==',
    value: 'general',
    collection: 'reserveBatch',
  },
  // activeCategoryId 不是 all 时继续过滤 reserveBatch
  {
    func: 'SET',
    collection: 'reserveBatch',
    property: 'reserveSelected',
    value: true,
  },
]
```

### 9.2 附加牌全选 / 全取消

同样只修改符合当前附加牌分类的卡牌状态。

### 9.3 反选

反选不能对整个集合统一 SET。可采用：

```text
选择当前范围中 selected=true 的集合 A
选择当前范围中 selected=false 的集合 B
先 A → false
再 B → true
同步修改视觉
```

必须避免第一步修改后影响第二次 SELECT；先建立两个命名集合，再执行 SET。

### 9.4 恢复默认

恢复默认必须按卡牌自身的：

```text
reserveDefaultSelected
```

恢复：

```text
全部武将 → true
全部附加牌 → false
视觉状态同步
摘要刷新
筛选和页码可保持，或明确回到武将 / all / page 1
```

不能再只把第一页显示出来就声称草稿已恢复。

### 9.5 操作范围文案

按钮必须明确写：

```text
当前分类全部允许
当前分类全部 Ban
当前分类全选
当前分类全取消
当前分类反选
```

当 `activeCategoryId=all` 时，标题可以动态显示“全部武将”或“全部附加牌”。

---

## 10. 第七步：实时摘要

在 `reserve-panel-controller` 上实现：

```text
updateSummaryRoutine
```

每次单卡点击、批量操作、恢复默认、确认或撤销后调用。

建议步骤：

```text
SELECT 所有 general
COUNT 总数
继续筛选 reserveSelected=true
COUNT 允许数
计算或再次筛选 false 得到 Ban 数

SELECT 所有 extra
COUNT 总数
筛选 reserveSelected=true
COUNT 已选数
筛选 false
COUNT 未选数

LABEL 更新右侧两个摘要框
```

不得使用固定文本：

```text
315 / 315 / 0
31 / 31 / 0
```

默认正确值应为：

```text
武将：总数 315，允许 315，Ban 0
附加牌：总数 31，已选 0，未选 31
```

右侧还应显示当前分类名称和当前分类选择数量，便于验证批量按钮作用范围。

---

## 11. 第八步：只导入真实选中牌

### 11.1 禁止从全部 Holder 执行 `count: all`

确认 Routine 必须先通过 `SELECT` 建立两个集合：

```text
selectedGenerals
selectedExtras
```

筛选条件：

```text
reserveLibraryType == general AND reserveSelected == true
reserveLibraryType == extra AND reserveSelected == true
```

VirtualTabletop 的 MOVE 支持对集合执行移动。实现时必须查照上游 `Functions - MOVE` 教程和本项目实际 Routine 类型，使用正确的集合参数；不得退回“遍历所有 Holder 全部移动”。

目标行为：

```text
selectedGenerals → general-reserve，face=0
selectedExtras → extra-reserve，face=0
reserveState → staged
未选卡牌保持原 Holder、原正面和原筛选状态
```

确认后：

- 不自动洗牌；
- 不移动身份牌；
- 不移动血量牌；
- 不移动固定主牌；
- 收起备牌面板；
- 摘要或控制器状态改为 `confirmed` / `staged`。

### 11.2 空选择处理

若附加牌 0 张被选中：

- 不报错；
- 不移动任何附加牌；
- 武将仍正常导入。

若武将被全部 Ban：

- 建议阻止确认并提示至少保留 1 张武将；
- 或明确允许空武将堆，但不能静默产生异常。

首选：阻止并给出清晰提示。

### 11.3 导入提示必须使用实际计数

提示应包含真实数量：

```text
已导入武将 302 张、附加牌 18 张。
```

不得使用无法验证的固定成功文字。

---

## 12. 第九步：撤销确认与原位恢复

实体牌必须保留：

```text
reserveHomeHolder
reserveHomeIndex
reserveCategoryId
reserveSelected
reserveDefaultSelected
```

提供房主操作：

```text
重新编辑备牌
```

行为：

```text
从 general-reserve 选择 reserveLibraryType=general 且 reserveState=staged 的牌
按 reserveHomeHolder 分组 MOVE 回原牌带
从 extra-reserve 选择 reserveLibraryType=extra 且 reserveState=staged 的牌
MOVE 回原牌带
activeFace=1
reserveState=draft
保持之前的 reserveSelected 状态
重新打开面板并刷新摘要
```

由于 MOVE 到自动排列 Holder 后会按 Holder 子项顺序排列，若必须严格恢复原顺序，应在构建时为每张牌保留稳定排序字段，并在恢复后执行可验证的排序或按顺序逐张归位。

完整桌面重置也必须能够把这些牌送回它们的真实 home Holder，而不是旧的 `gen-page-1...5` 临时结构。

---

## 13. 清理旧逻辑

完成新实现后删除或重写以下内容：

- `switchGenExpRoutine` 这种所有扩展分类共用的 Routine；
- 把 `display` 用作允许／Ban或选中／取消的批量 Routine；
- 固定跳第 1 / 第 2 页的分页 Routine；
- 静态摘要文字；
- 未经审计的硬编码分类数量；
- `importToReserveTrayRoutine` 中对所有行 `count: all` 的逻辑；
- 旧 `deckAssembly.ts` 中仍引用不存在 Holder 的历史 Routine；
- 所有只弹成功提示但不修改状态的占位按钮；
- 旧的 `general-candidate-zone`、`final-general-deck-zone`、`pkg-gen-*` 等无效引用。

搜索仓库，确保不存在：

```text
general-candidate-zone
final-general-deck-zone
final-identity-deck-zone
final-extra-deck-zone
pkg-gen-std-pile
pkg-extra-junzheng-pile
```

除非它们已被重新实现且确实存在。

---

## 14. 自动测试要求

### 14.1 分类审计

必须验证：

1. 315 张武将全部有唯一分类；
2. 31 张附加牌全部有唯一分类；
3. 无重复 `sourceSequence`；
4. 无遗漏；
5. 分类按钮数量与真实分类表一致；
6. 左侧显示数量来自数据，而非硬编码。

### 14.2 页面与布局

必须验证：

1. 打开面板时只有一个内容页面 `display=true`；
2. 任意时刻不会同时显示五个武将页；
3. 每个页面最多 4–5 条牌带；
4. 每条牌带卡牌数不超过容量；
5. 页面和附加牌共用相同主视口起点；
6. 空行不创建；
7. 最后一行标题显示真实数量；
8. 浏览卡牌全部 `movable=false`；
9. 卡牌仍保留原生 `enlarge`。

### 14.3 真筛选

必须验证：

1. 点击两个不同分类显示不同页面 ID；
2. 两个不同分类的 `sourceSequence` 集合不同；
3. 标准分类不再等于数组前 68 张；
4. 风、火、林、山等不再共用同一个 Routine；
5. “全部”页序列覆盖 315 张且无重复；
6. 切换分类不改变 `reserveSelected`。

### 14.4 单卡选择

必须验证：

1. 武将默认 `reserveSelected=true`；
2. 点击后变 false；
3. 再点后变 true；
4. 附加牌默认 false；
5. 点击后变 true；
6. 视觉状态与属性同步；
7. 页面切换后选择状态保留。

### 14.5 批量操作

必须验证：

1. 当前分类全部 Ban 只修改当前分类；
2. 其他分类不受影响；
3. “全部武将全部 Ban”修改全部武将；
4. 附加牌当前分类全选只修改当前分类；
5. 反选正确；
6. 恢复默认后武将全 true、附加牌全 false；
7. 批量操作不修改任何页面的 `display`。

### 14.6 摘要

必须验证：

1. 初始值为武将 315/315/0，附加牌 31/0/31；
2. 单点一张武将后为 315/314/1；
3. 单点一张附加牌后为 31/1/30；
4. 批量操作后计数正确；
5. 恢复默认后计数恢复；
6. 摘要不是静态写死文本。

### 14.7 分页

必须验证：

1. 可从第 1 页进入第 2、3、4、5 页或任意实际页；
2. 最后一页点击下一页无越界；
3. 第一页点击上一页无越界；
4. 页码正确；
5. 任意时刻只有当前页显示。

### 14.8 选择性导入

构造测试状态：

```text
武将：Ban 13，允许 302
附加牌：选中 18，未选 13
```

确认后必须验证：

```text
general-reserve 中恰好新增 302 张
extra-reserve 中恰好新增 18 张
13 张 Ban 武将仍在原页面
13 张未选附加牌仍在原页面
导入卡牌 activeFace=0
未导入卡牌 activeFace=1
导入操作没有自动洗牌
```

### 14.9 恢复测试

必须验证：

1. 重新编辑后已导入牌回到正确 `reserveHomeHolder`；
2. 分类归属不变；
3. 选择状态保留；
4. 再次确认不会重复创建或丢失卡牌；
5. 全流程实体牌总数始终不变；
6. 不存在克隆牌。

---

## 15. 人工验收脚本

Antigravity 完成代码后，必须在 VirtualTabletop 中执行以下人工测试，并记录结果。

### 场景 A：打开与浏览

1. 打开备牌面板；
2. 确认只显示一页；
3. 点击多个武将分类；
4. 核对各分类卡牌确实不同；
5. 依次翻到最后一页；
6. 切换附加牌；
7. 确认附加牌从共享视口顶部显示，没有浪费上方空间。

### 场景 B：单张与批量

1. Ban 一张武将；
2. 确认视觉变暗并出现明确 Ban 状态；
3. 翻页再返回，状态仍在；
4. 对当前分类执行全部 Ban；
5. 切换其他分类，确认不受影响；
6. 恢复当前分类全部允许；
7. 选择若干附加牌；
8. 执行当前分类全选、取消和反选。

### 场景 C：摘要

每一步后确认摘要数字立即变化，并与实际牌数一致。

### 场景 D：确认导入

1. 保留部分 Ban 武将；
2. 只选择部分附加牌；
3. 点击确认；
4. 检查托盘中只有允许／选中的牌；
5. 检查未选牌仍留在面板；
6. 确认未自动洗牌。

### 场景 E：重新编辑

1. 点击重新编辑；
2. 检查托盘牌回到原分类页面；
3. 检查原选择状态仍在；
4. 再次调整并确认；
5. 检查没有重复、丢牌或错类。

---

## 16. 执行顺序

必须按以下顺序实施，避免再次只修外观。

### P0：删除错误语义

- 立即停止用 `display` 表示选择；
- 暂时隐藏尚未接通的批量按钮和虚假分类按钮；
- 恢复卡牌 `movable=false`；
- 保留 `0ba3f75...` 已完成的多行 Holder 结构。

### P1：资源审计与分类表

- 建立真实 taxonomy；
- 完成 315 + 31 强校验；
- 删除未经证实的分类文案。

### P2：视图注册表与真筛选

- 按真实分类生成页面；
- 实现“全部”虚拟页面序列；
- 完成主分类、二级分类和完整分页。

### P3：单卡状态与摘要

- 添加运行时属性；
- 实现单卡点击；
- 完成视觉状态；
- 完成实时摘要。

### P4：批量操作

- 当前分类允许、Ban、全选、取消、反选；
- 恢复默认；
- 所有操作真正修改卡牌状态。

### P5：选择性导入与恢复

- 只移动 `reserveSelected=true`；
- 实现重新编辑和原位归还；
- 更新完整重置逻辑。

### P6：清理与测试

- 删除旧 Routine 和失效 Holder 引用；
- 补齐自动测试；
- 执行全部命令和人工验收。

---

## 17. 必须执行的命令

完成后依次执行：

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm validate
pnpm check
```

若 `pnpm check` 已包含前述命令，仍需在报告中明确列出每一步结果。

不得只运行 TypeScript 编译就声称备牌功能正常。自动测试无法完全覆盖 VirtualTabletop 交互，因此还必须完成第 15 节人工验收。

---

## 18. 最终交付报告格式

Antigravity 的最终报告必须包含：

1. 修改文件清单；
2. 真实武将分类和附加牌分类清单及数量；
3. 未分类卡牌清单；
4. 面板状态模型说明；
5. 单卡选择实现说明；
6. 批量操作实现说明；
7. 摘要更新实现说明；
8. 选择性导入和恢复说明；
9. 删除的旧占位 Routine；
10. 新增自动测试及通过数量；
11. `pnpm check` 完整输出摘要；
12. VirtualTabletop 人工验收结果；
13. 仍存在的限制，不得隐瞒。

---

## 19. 完成定义

只有同时满足以下条件，才可以判定“完美完成修复”：

- 分类来自真实审计，不再按序号冒充扩展包；
- 点击不同二级分类显示不同的真实卡牌集合；
- “全部”覆盖 315 张且不复制实体牌；
- 武将和附加牌共享完整主视口；
- 每页多行重叠牌带无溢出；
- 卡牌不可拖、可点击、可放大；
- 单卡选择状态真实可切换并持久保留；
- 批量按钮修改状态而不是 `display`；
- 摘要实时准确；
- 分页可以访问全部实际页面；
- 确认只导入允许武将和选中附加牌；
- 未选牌继续留在面板；
- 导入不自动洗牌；
- 可以重新编辑并恢复原位；
- 没有克隆、丢牌、重复牌和错分类；
- 旧占位逻辑和失效引用已清除；
- `pnpm check` 通过；
- VirtualTabletop 人工验收通过。

`0ba3f75...` 可以保留其多行 Holder 布局成果，但不能被视为功能修复完成。后续工作必须以本指南的状态闭环和验收标准为准。