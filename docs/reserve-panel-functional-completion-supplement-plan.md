# 备牌面板功能补全与重构补充计划

> 适用分支：`feature/library-and-deckbuilding-table`  
> 基线提交：`c2fb042ada446c9be1999b72c39eecc67d714b66`  
> 适用阶段：覆盖式备牌面板从“静态 UI 原型”补全为“可实际使用的备牌系统”  
> 项目原则：弱规则、弱状态、强同步、强可见性控制。  
> 本计划是 `docs/reserve-panel-refactor-plan.md` 的功能补充，不改变已经冻结的桌面、备牌托盘、固定摸牌堆和 4–12 人席位扩展方向。

---

## 1. 补充计划目的

提交 `c2fb042ada446c9be1999b72c39eecc67d714b66` 所对应代码已经建立了覆盖式备牌面板的视觉框架，但实际测试确认，核心功能尚未形成闭环：

- 打开面板时多个武将页面和附加牌页面被同时显示；
- 左侧分类按钮没有真正筛选卡牌，只是在固定页面之间切换；
- “标准包”“风包”“火包”等分类文字没有真实数据依据；
- 顶部“武将牌／附加牌”切换只隐藏另一组内容，没有复用完整主视口；
- 多行重叠牌带仍混用了自动排列和手动二维坐标；
- 单张卡牌没有允许、Ban、选择、取消选择状态；
- 批量按钮只弹出“成功”提示，没有修改任何牌；
- 摘要栏是写死的静态数字；
- 翻页按钮只固定跳转第一页或第二页；
- “确认备牌并导入托盘”无视选择状态，仍会导入全部武将和全部附加牌；
- 旧 `deckAssembly.ts` 中仍保留无效 Holder 和占位 Routine。

本计划的目标是将当前系统重构为：

```text
真实分类数据
→ 主分类与二级分类筛选
→ 单一共享浏览视口
→ 多行手牌式部分重叠牌带
→ 单张选择与批量选择
→ 实时摘要
→ 按选择结果导入现有备牌托盘
→ 可安全恢复和重新编辑
```

完成后，备牌面板必须能够真实完成以下任务：

1. 浏览全部 315 张武将，但不会一次性全部堆叠显示；
2. 按实际二级分类筛选武将；
3. 按实际二级分类筛选附加牌；
4. 单击武将切换“允许／Ban”；
5. 单击附加牌切换“选用／不选用”；
6. 对当前分类执行真实批量操作；
7. 实时显示各类数量和当前草稿结果；
8. 点击确认后，仅将允许的武将与选中的附加牌移入现有备牌托盘；
9. 未选择内容继续保留在备牌面板；
10. 重新打开面板时能够正确反映已确认状态。

---

## 2. 已冻结的产品边界

### 2.1 不修改桌面

以下内容保持现状：

- Board 仍为 `1800 × 1200`；
- 不恢复超大连续桌布；
- 不增加第二张桌面；
- 中央摸牌堆、回收区和快捷洗牌区位置不变；
- 个人手牌区位置不变；
- 4–12 人玩家模块扩展不因本计划调整。

### 2.2 备牌托盘保持现状

现有备牌托盘继续保持：

```text
尺寸：520 × 220
槽位：武将／身份／扩展／血量
```

本计划不扩大托盘、不增加页签、不拆分附加牌槽。

导入规则固定为：

```text
允许武将 → general-reserve
选中附加牌 → extra-reserve
身份牌 → 已存在 identity-reserve
血量牌 → 已存在 marker-reserve
固定游戏主牌 → 已存在 draw-pile
```

### 2.3 固定游戏主牌不进入备牌面板

固定游戏主牌继续直接位于摸牌堆，不参与本计划的分类、选择或确认流程。

### 2.4 附加牌只有一个主分类

附加牌不区分“附加一类／附加二类”。

主分类只有：

```text
武将牌
附加牌
```

附加牌可以根据真实资源进一步设置二级分类，以便筛选和一键选取。

### 2.5 使用真实实体牌，不创建牌面副本

同一张卡牌只能存在一个真实 Widget。

禁止为了“全部武将”和各扩展包筛选而复制真实牌卡。分类、筛选和分页必须通过真实牌的 Holder 组织、显示状态和导航实现。

---

## 3. 当前问题的根因

### 3.1 面板开关错误地显示所有内容

当前 `toggleLibraryTrayRoutine` 将抽屉框架、五个武将页面和附加牌区域放在同一个 `DECKBUILDING_WIDGET_IDS` 集合中，并在打开时统一设置 `display=true`。

结果是：

```text
打开抽屉
→ gen-page-1～5 全部显示
→ extra-card-composer-zone 也显示
→ 多个页面重叠在相同坐标
```

### 3.2 分类按钮没有真实分类数据

当前 `CardAsset` 仅有统一的 `generals` 类别，没有武将所属扩展包字段。

现有分类按钮只是硬编码文字，无法从资源数据中证明：

- 哪些牌属于标准包；
- 哪些牌属于风、火、林、山；
- 哪些牌属于一将成名、SP 或其他。

### 3.3 页面 Holder 结构错误

当前单个 `spreadRowZone` 高度只有约一张牌，但页面生成逻辑又尝试把 68 张牌排成四行。

同时存在：

```text
alignChildren = true
＋
每张卡牌手动设置 x / y
```

这会造成自动排列和手动排列冲突，并可能重新形成超长横排。

### 3.4 没有真实草稿状态

当前单张卡牌没有：

```text
reserveSelected
reserveDefaultSelected
reserveLibraryType
reserveCategory
reserveDraftState
```

所以批量操作、摘要和确认导入都没有状态依据。

### 3.5 占位 Routine 提供虚假成功反馈

当前多个按钮只执行 `INPUT` 提示，但没有修改任何属性、集合或 Holder。

本计划明确禁止继续保留这种“提示成功但实际未执行”的交互。

---

## 4. 总体技术架构

建议将备牌面板拆为六个明确层次：

```text
1. 资源分类层
2. 页面与 Holder 生成层
3. 面板状态控制层
4. 单张选择与批量操作层
5. 摘要与确认导入层
6. 验证与测试层
```

推荐目录结构：

```text
src/
├── data/
│   ├── assetDecks.ts
│   ├── generalLibraryMetadata.ts
│   ├── extraLibraryMetadata.ts
│   └── reserveLibraryCatalog.ts
├── types/
│   └── reserveLibrary.ts
├── widgets/
│   ├── libraryBrowser.ts
│   ├── libraryViewport.ts
│   ├── libraryCategoryNav.ts
│   ├── libraryPage.ts
│   ├── librarySpreadRow.ts
│   ├── librarySummary.ts
│   └── libraryController.ts
├── routines/
│   ├── reserveNavigation.ts
│   ├── reserveSelection.ts
│   ├── reserveSummary.ts
│   ├── reserveImport.ts
│   └── reserveReset.ts
└── validation/
    └── validateReservePanel.ts

tests/
├── reserve-data.test.ts
├── reserve-navigation.test.ts
├── reserve-selection.test.ts
├── reserve-import.test.ts
└── reserve-layout.test.ts
```

文件名可以根据现有项目风格调整，但职责必须保持分离。

---

## 5. 资源分类数据层

## 5.1 新增统一元数据类型

建议新增：

```ts
export type ReserveLibraryType = 'general' | 'extra';

export interface ReserveCategory {
  id: string;
  label: string;
  order: number;
  libraryType: ReserveLibraryType;
}

export interface ReserveCardMetadata {
  assetId: string;
  cardWidgetId: string;
  libraryType: ReserveLibraryType;
  categoryId: string;
  categoryLabel: string;
  categoryOrder: number;
  cardOrder: number;
  defaultSelected: boolean;
}
```

武将与附加牌都使用同一套基础元数据。

## 5.2 武将分类必须来自真实映射

新增武将映射文件，例如：

```text
src/data/generalLibraryMetadata.ts
```

每张武将至少记录：

```ts
{
  assetId: '...',
  cardWidgetId: 'card-...',
  categoryId: 'standard',
  categoryLabel: '标准包',
  categoryOrder: 1,
  cardOrder: 12,
  defaultSelected: true,
}
```

无法确认扩展来源的武将统一归入：

```text
other
或
unclassified
```

禁止继续使用“序号前 25 张视为标准包，其余全部视为扩展包”的临时逻辑。

## 5.3 附加牌二级分类

全部附加牌仍属于同一个主分类 `extra`，但可以按真实资源建立二级分类，例如：

```text
装备牌
锦囊牌
特殊牌
模式牌
其他／待分类
```

最终名称必须以实际资源审计结果为准，禁止继续使用 AI 占位文字。

## 5.4 分类数量必须自动计算

以下文字不得手写：

```text
标准包 (25)
风包 (8)
附加牌 (31)
```

应由构建时实际数据计算：

```ts
const count = cards.filter(card => card.categoryId === category.id).length;
```

UI 只显示实际计算结果。

## 5.5 数据完整性验证

构建阶段必须验证：

- 每张武将恰好映射到一个二级分类；
- 每张附加牌恰好映射到一个二级分类；
- 不存在重复 `assetId`；
- 不存在重复 `cardWidgetId`；
- 分类 ID 全部有效；
- 分类数量总和等于资源总数；
- 武将总数与实际目录一致；
- 附加牌总数与实际目录一致。

若存在未分类资源，可以允许构建，但必须明确进入 `unclassified`，不能静默丢失。

---

## 6. 面板状态控制器

## 6.1 新增控制器 Widget

建议创建隐藏或不可移动的控制器：

```text
reserve-library-controller
```

控制器保存：

```ts
interface ReservePanelState {
  activeTab: 'generals' | 'extras';
  activeCategory: string;
  currentPage: number;
  pageCount: number;
  draftStatus: 'editing' | 'confirmed';
}
```

默认值建议：

```text
activeTab = generals
activeCategory = all
currentPage = 1
draftStatus = editing
```

## 6.2 面板框架与内容必须分离

将 Widget ID 分为：

```ts
LIBRARY_CHROME_IDS
GENERAL_NAV_IDS
EXTRA_NAV_IDS
GENERAL_ACTION_IDS
EXTRA_ACTION_IDS
CONTENT_PAGE_IDS
```

打开面板时：

```text
显示 LIBRARY_CHROME_IDS
根据 activeTab 显示对应导航与操作组
仅显示 activeCategory + currentPage 对应的唯一内容页
```

禁止再对全部内容页统一执行 `display=true`。

## 6.3 导航操作不弹提示框

以下操作不应出现 `INPUT` 弹窗：

- 打开面板；
- 武将／附加牌切换；
- 二级分类切换；
- 上一页；
- 下一页；
- 单张选择；
- 批量允许／Ban；
- 批量选择／取消。

视觉反馈应通过：

- 活动按钮颜色；
- 页面标题；
- 页码；
- 摘要数字；
- 牌面状态。

仅确认导入、危险重置等操作允许使用确认或结果提示。

---

## 7. 统一共享浏览视口

## 7.1 主视口固定

武将和附加牌必须共用同一个内容区域：

```text
x ≈ 210
y ≈ 92
width ≈ 980
height ≈ 900
```

切换主分类时，新的内容必须从主视口顶部开始显示。

禁止继续使用：

```text
武将固定放在上半区
附加牌固定放在下半区
```

从而避免隐藏其中一类后浪费大面积空间。

## 7.2 左侧导航随主分类变化

武将 Tab：

```text
全部武将
标准包
风包
火包
林包
山包
一将成名
SP
其他／待分类
```

附加牌 Tab：

```text
全部附加牌
装备
锦囊
特殊
其他／待分类
```

实际按钮按真实数据生成。没有卡牌的分类不生成按钮。

## 7.3 底部操作随主分类变化

武将 Tab 只显示：

```text
当前类全部允许
当前类全部 Ban
当前类反选
恢复当前类默认
```

附加牌 Tab 只显示：

```text
当前类全部选取
当前类全部取消
当前类反选
恢复当前类默认
```

不能四类按钮同时显示。

---

## 8. 多行手牌式部分重叠牌带

## 8.1 页面容器和牌带 Holder 分离

每个页面使用普通父容器：

```text
general-standard-page-1
├── general-standard-page-1-row-1
├── general-standard-page-1-row-2
├── general-standard-page-1-row-3
└── general-standard-page-1-row-4
```

父页面：

```text
type = basic
movable = false
```

每条牌带：

```text
type = holder
alignChildren = true
preventPiles = true
stackOffsetX = 56～62
stackOffsetY = 0
height ≈ 136
```

## 8.2 禁止自动排列与手动二维坐标混用

卡牌进入牌带后只使用 Holder 自动横向排列。

卡牌本身初始坐标统一为：

```text
x = 0
y = 0
```

不再同时设置 `col * 56` 和 `row * 140`。

## 8.3 每条牌带容量

建议：

```text
每条最多 15～17 张
每页 4～5 条牌带
每页约 60～80 张
```

具体值由主视口宽度和点击体验决定。

必须保证每张牌至少露出约 50px 以上可点击区域。

## 8.4 页面高度

四条牌带时：

```text
每条高约 136
垂直间距约 10～16
页面总高约 580～620
```

五条牌带时不得超过共享主视口高度。

## 8.5 “全部”视图不复制卡牌

“全部武将”不是复制 315 张牌到另一套 Holder。

推荐实现：

```text
全部武将模式
→ 按分类顺序串联各分类现有页面
→ 上一页／下一页在各分类页面之间顺序导航
```

例如：

```text
标准包第1页
→ 风包第1页
→ 火包第1页
→ ……
```

选择某个具体分类后，只在该分类自己的页面范围内翻页。

附加牌“全部”模式使用同样逻辑。

---

## 9. 单张卡牌选择状态

## 9.1 武将状态

武将默认策略：

```text
selected = true  → 允许入局
selected = false → Ban
```

每张武将增加：

```ts
reserveLibraryType: 'general'
reserveCategory: '...'
reserveSelected: true
reserveDefaultSelected: true
reserveDraftState: 'library'
```

单击行为：

```text
允许 → Ban
Ban → 允许
```

## 9.2 附加牌状态

附加牌使用：

```text
selected = true  → 本局选用
selected = false → 本局不选用
```

默认值不硬编码在 UI 中，应来自 `defaultSelected` 元数据。

## 9.3 视觉状态

武将允许：

- 正常亮度；
- 绿色或金色细边框；
- 顶部露出区域显示小型“✓”。

武将 Ban：

- 降低亮度；
- 红色边框或斜纹；
- 顶部露出区域显示“BAN”或“✕”。

附加牌选中：

- 正常亮度；
- 绿色或金色选中标识。

附加牌未选中：

- 降低亮度；
- 灰色遮罩；
- 显示“未选”。

状态标识必须位于卡牌顶部露出区域，避免被右侧重叠牌遮挡。

## 9.4 不允许拖动

备牌面板中的真实卡牌继续：

```text
movable = false
```

点击只改变草稿选择状态。

实体移动只发生在点击“确认备牌并导入托盘”之后。

## 9.5 技术验证门槛

实现前先制作最小技术验证：

1. 自定义卡牌属性能否通过 Routine 稳定读写；
2. 单击能否切换 `reserveSelected`；
3. 能否同步更新卡牌 `css` 或 `classes`；
4. 多客户端是否同时看到状态变化；
5. `enlarge` 是否仍显示正确牌面；
6. 视觉遮罩是否不会覆盖原生右键／悬停放大。

若自定义 `classes` 不可靠，降级为直接设置完整 `css` 字符串；若仍不可靠，再使用卡牌子级状态标记 Widget。

---

## 10. 批量操作

## 10.1 作用范围必须明确

“当前类全部允许”只作用于：

```text
当前主分类 = 武将
当前二级分类 = 当前选中分类
```

“当前类全部选取”只作用于当前附加牌二级分类。

“全部武将”或“全部附加牌”被选中时，批量操作才作用于整个主分类。

## 10.2 实现方式

优先使用构建阶段生成的分类卡牌 ID 集合：

```ts
const generalCategoryCardIds: Record<string, string[]> = {...};
const extraCategoryCardIds: Record<string, string[]> = {...};
```

每个分类生成自己的实际 Routine：

```text
allow-general-standard
ban-general-standard
invert-general-standard
reset-general-standard
```

底部可以使用同位置的多组隐藏按钮，仅显示当前分类对应按钮；也可以使用控制器状态分派，但必须避免超长、难维护的手写 IF 链。

## 10.3 批量操作必须同步更新

每次批量操作必须同时完成：

1. 修改全部目标卡的 `reserveSelected`；
2. 更新全部目标卡的视觉状态；
3. 更新摘要；
4. 保持当前分类和当前页不变；
5. 不弹出成功提示。

## 10.4 反选

反选必须逐张切换当前作用范围：

```text
true → false
false → true
```

不得只修改摘要数字。

## 10.5 恢复默认

“恢复当前类默认”读取每张卡的 `reserveDefaultSelected`，而不是统一设为 true 或 false。

“恢复全部草稿”需要二次确认，并恢复所有武将和附加牌默认值。

---

## 11. 实时摘要

## 11.1 摘要内容

建议显示：

```text
武将
总数：315
允许：X
Ban：Y

附加牌
总数：N
已选：A
未选：B
```

同时显示当前分类：

```text
当前分类：标准包
本类允许：23 / 25
```

## 11.2 摘要不能写死

摘要必须通过真实状态计算。

推荐 Routine 流程：

```text
SELECT 全部武将
COUNT 总数
SELECT reserveSelected = true
COUNT 允许数
Ban 数 = 总数 - 允许数

SELECT 全部附加牌
COUNT 总数
SELECT reserveSelected = true
COUNT 已选数
未选数 = 总数 - 已选数
```

如果 VTT Routine 对复合筛选支持有限，可以在构建阶段生成固定 ID 集合并分别计数。

## 11.3 更新时机

以下操作后必须刷新摘要：

- 单张卡牌点击；
- 批量允许／Ban；
- 批量选取／取消；
- 反选；
- 恢复当前类默认；
- 恢复全部草稿；
- 确认导入；
- 撤销确认或整桌重置。

仅切换页面时无需重新计算全部摘要，但应更新当前分类摘要和页码。

---

## 12. 分页与导航

## 12.1 当前页必须是真实状态

控制器记录：

```text
currentPage
pageCount
```

上一页：

```text
currentPage = max(1, currentPage - 1)
```

下一页：

```text
currentPage = min(pageCount, currentPage + 1)
```

不得继续使用：

```text
上一页永远跳第1页
下一页永远跳第2页
```

## 12.2 页码显示

页码格式：

```text
2 / 5
```

切换二级分类后：

```text
currentPage = 1
pageCount = 当前分类真实页数
```

## 12.3 边界按钮

第一页时：

```text
上一页按钮禁用或无操作
```

最后一页时：

```text
下一页按钮禁用或无操作
```

不能弹出“已是第一页”等提示框。

## 12.4 活动按钮高亮

顶部主分类、左侧二级分类和当前页应有明确视觉高亮。

切换分类时必须同步恢复其他按钮的非活动样式。

---

## 13. 确认备牌与导入托盘

## 13.1 确认导入只处理选中牌

点击确认后：

```text
reserveLibraryType = general
且 reserveSelected = true
→ general-reserve

reserveLibraryType = extra
且 reserveSelected = true
→ extra-reserve
```

以下牌不得移动：

```text
Ban 武将
未选附加牌
身份牌
血量牌
固定游戏主牌
```

## 13.2 导入动作顺序

建议：

```text
1. 二次确认本局草稿摘要
2. 选择全部允许武将
3. 将允许武将统一设为背面
4. 移入 general-reserve
5. 选择全部已选附加牌
6. 将已选附加牌统一设为背面
7. 移入 extra-reserve
8. 更新卡牌 reserveDraftState = staged
9. 更新控制器 draftStatus = confirmed
10. 更新摘要
11. 收起备牌面板
```

是否立即洗牌由托盘下方专属“一键洗牌”按钮负责；确认导入本身不额外洗牌，避免职责混合。

## 13.3 SELECT → MOVE 技术验证

实现前必须验证 VTT Routine 是否支持：

```text
按自定义属性 SELECT 卡牌
→ 将结果集合 MOVE 到目标 Holder
```

若支持，使用属性筛选集合。

若不支持，采用以下降级之一：

1. 构建阶段为每张卡生成条件 MOVE Routine；
2. 使用分类级隐藏 staging Holder；
3. 通过选中状态把卡牌同步到“选中集合 Holder”，确认时从 Holder 移动。

降级方案仍必须满足：

- 浏览过程中卡牌不消失；
- 不复制真实牌；
- 未选牌不会误导入；
- 多客户端状态一致。

## 13.4 确认后的重新打开

重新打开面板时：

- 已进入托盘的牌不应重新出现在浏览视口中；
- 摘要显示本局已确认数量；
- 面板显示“已确认”状态；
- 普通点击选择默认锁定；
- 如需重新编辑，必须执行明确的“撤销确认／重新编辑”。

## 13.5 重新编辑

重新编辑前：

1. 将 staged 武将从 `general-reserve` 召回各自原分类牌带；
2. 将 staged 附加牌从 `extra-reserve` 召回各自原分类牌带；
3. 恢复正面；
4. 保留用户上次选择状态；
5. 控制器回到 `editing`；
6. 不处理身份、血量和固定摸牌堆。

每张卡必须保存：

```text
homeCategory
homePage
homeRow
homeOrder
```

用于稳定归位。

---

## 14. 面板开关行为

## 14.1 打开面板

打开时只执行：

```text
显示抽屉框架
显示当前 Tab 导航
显示当前 Tab 操作组
显示唯一当前内容页
刷新当前页标题与页码
刷新摘要
```

不得把所有页面全部显示。

## 14.2 关闭面板

关闭时：

```text
隐藏抽屉根节点及所有子 UI
不修改选择状态
不移动任何卡牌
不重置 currentPage
```

## 14.3 初次打开默认内容

建议：

```text
Tab：武将
分类：全部武将
页面：第1页
```

但“全部武将”只显示其全局序列中的当前单页，不得同时显示 315 张。

---

## 15. 旧逻辑清理

## 15.1 删除占位 Routine

以下只弹提示、不执行功能的 Routine 必须删除或替换：

```text
allowAllGeneralsRoutine
banAllGeneralsRoutine
selectAllExtrasRoutine
unselectAllExtrasRoutine
resetReserveDraftRoutine
```

在真实功能完成前，按钮不得显示“操作成功”。

## 15.2 重写 `reserveRoutines.ts`

当前文件混合：

- 主分类切换；
- 子分类切换；
- 固定翻页；
- 占位批量操作。

建议拆分为：

```text
reserveNavigation.ts
reserveSelection.ts
reserveSummary.ts
reserveReset.ts
```

## 15.3 清理 `deckAssembly.ts`

删除或重写所有引用不存在 Holder 的旧 Routine：

```text
general-candidate-zone
final-general-deck-zone
final-identity-deck-zone
final-extra-deck-zone
pkg-gen-std-pile
pkg-gen-feng-pile
pkg-extra-junzheng-pile
```

`importToReserveTrayRoutine` 必须改为按真实选择状态导入。

## 15.4 清理 AI 占位文案

以下文字全部改为数据驱动：

- “315位武将”；
- “附加牌31张”；
- 各扩展包数量；
- 页数；
- 当前分类；
- 允许／Ban／已选／未选数量。

如果数量来自资源，可以显示；如果来源不确定，不允许硬写。

---

## 16. 代码修改清单

### 必改文件

```text
src/types/assets.ts
src/data/assetDecks.ts
src/widgets/libraryBrowser.ts
src/widgets/reserveSpreadRow.ts
src/routines/reserveRoutines.ts
src/routines/deckAssembly.ts
src/routines/tableActions.ts
src/variants/createFourPlayerPrototype.ts
src/validation/validate.ts
```

### 建议新增文件

```text
src/types/reserveLibrary.ts
src/data/generalLibraryMetadata.ts
src/data/extraLibraryMetadata.ts
src/data/reserveLibraryCatalog.ts
src/widgets/libraryController.ts
src/widgets/libraryPage.ts
src/widgets/librarySummary.ts
src/routines/reserveNavigation.ts
src/routines/reserveSelection.ts
src/routines/reserveSummary.ts
src/routines/reserveImport.ts
src/routines/reserveReset.ts
src/validation/validateReservePanel.ts
```

### 测试文件

```text
tests/reserve-data.test.ts
tests/reserve-navigation.test.ts
tests/reserve-selection.test.ts
tests/reserve-import.test.ts
tests/reserve-layout.test.ts
```

---

## 17. 实施阶段

## P0：立即止损

目标：停止虚假成功反馈和全部页面重叠。

任务：

- 打开面板时只显示唯一内容页；
- 将页面 Holder 改为页面容器＋多条牌带；
- 武将与附加牌共享主视口；
- 移除导航弹窗；
- 暂时隐藏没有真实功能的批量按钮；
- 暂时隐藏没有真实数据依据的二级分类；
- 确认导入按钮在选择功能完成前标为禁用或隐藏。

验收：

- 315 张武将不再同时堆叠显示；
- 任意页面均不横向溢出抽屉；
- 附加牌切换后从主视口顶部显示；
- UI 不再声称未执行的操作已经成功。

## P1：真实数据分类

目标：完成武将和附加牌的真实二级分类。

任务：

- 审计全部武将来源；
- 创建武将扩展包映射；
- 审计附加牌类型；
- 创建附加牌二级分类；
- 分类和数量由数据自动生成；
- 未确认资源归入待分类。

验收：

- 点击不同分类显示不同真实牌集合；
- 分类数量总和等于资源总数；
- 不再根据序号猜测扩展包。

## P2：导航与分页

目标：完成真正的分类切换和完整分页。

任务：

- 新增控制器状态；
- 主分类切换；
- 二级分类切换；
- 上一页／下一页；
- 页码和高亮；
- “全部”视图顺序串联现有分类页面。

验收：

- 所有页面均可访问；
- 第3、4、5页不再不可达；
- 切换分类自动回到第一页；
- 同时只有一个内容页可见。

## P3：单张选择和批量操作

目标：完成真实草稿状态。

任务：

- 单张武将允许／Ban；
- 单张附加牌选中／取消；
- 状态视觉；
- 当前类批量操作；
- 反选；
- 恢复默认；
- 多客户端同步。

验收：

- 点击牌后状态真实改变；
- 批量按钮真实作用于当前分类；
- 翻页和切换分类后状态仍保留；
- 重新打开面板后状态仍保留。

## P4：摘要与导入闭环

目标：按选择结果导入托盘。

任务：

- 实时统计；
- 确认摘要；
- 仅导入选中牌；
- 未选牌保留；
- confirmed 状态；
- 面板自动收起。

验收：

- Ban 武将不会进入 `general-reserve`；
- 未选附加牌不会进入 `extra-reserve`；
- 导入数量与摘要完全一致；
- 身份、血量和摸牌堆不受影响。

## P5：重新编辑和归位

目标：允许安全修改已确认牌池。

任务：

- 撤销确认；
- 按 home 元数据归位；
- 保留草稿选择；
- 再次确认；
- 整桌重置兼容。

验收：

- 牌回到正确分类、页面和牌带；
- 不出现重复牌或丢牌；
- 多次确认／撤销后数量稳定。

## P6：清理与回归测试

目标：删除旧逻辑并形成稳定版本。

任务：

- 删除空组件和失效 Routine；
- 删除 AI 占位文案；
- 更新验证器；
- 完整自动测试；
- PC、触屏、多浏览器和多客户端人工验收。

---

## 18. 自动测试要求

至少覆盖：

1. 打开面板后只有一个内容页可见；
2. 关闭面板不修改草稿状态；
3. 每张武将恰好属于一个分类；
4. 每张附加牌恰好属于一个分类；
5. 分类总数等于资源总数；
6. 不同分类返回不同卡牌 ID；
7. 标准包按钮不再显示固定第一页全部 68 张；
8. 风、火、林、山按钮不再共用同一个固定页面；
9. 每页卡牌数不超过设定容量；
10. 每个页面拥有多条牌带；
11. 页面和牌带均不超出主视口；
12. 上一页和下一页可遍历全部页面；
13. 单击武将切换 `reserveSelected`；
14. 单击附加牌切换 `reserveSelected`；
15. 批量 Ban 只作用于当前分类；
16. 批量选取只作用于当前附加牌分类；
17. 恢复默认读取 `reserveDefaultSelected`；
18. 摘要数字与真实状态一致；
19. 确认只移动选中武将；
20. 确认只移动选中附加牌；
21. 未选牌仍留在面板；
22. 确认后牌全部背面；
23. 确认不自动洗牌；
24. 撤销确认后牌正确归位；
25. 多次确认和撤销不产生重复或丢失；
26. 不存在引用失效 Holder 的 Routine；
27. UI 不再存在只有提示、没有实际动作的成功按钮。

---

## 19. 人工验收矩阵

### PC 浏览

- 打开和关闭抽屉；
- 武将／附加牌切换；
- 各二级分类切换；
- 全部页面翻页；
- 悬停和右键放大；
- 部分重叠状态下单击任意卡牌。

### 选择流程

- 单张武将 Ban 和恢复；
- 单张附加牌选择和取消；
- 当前类批量操作；
- 反选；
- 恢复默认；
- 查看摘要变化。

### 导入流程

- 选择部分武将和附加牌；
- 确认导入；
- 核对托盘张数；
- 核对未选牌仍在面板；
- 使用托盘独立洗牌按钮；
- 撤销确认并重新编辑。

### 多客户端

- 客户端 A 点击单张牌；
- 客户端 B 同步看到状态变化；
- 批量操作后所有客户端数字一致；
- 确认导入后所有客户端看到相同托盘内容；
- 不发生重复 MOVE 或状态竞争。

### 性能

- 打开 315 张武将面板的响应时间；
- 快速连续翻页；
- 快速连续点击多张牌；
- 批量操作 315 张武将；
- 确认导入大量牌；
- 与 12 个玩家模块同时存在时的加载和同步性能。

---

## 20. 最终验收标准

本补充计划完成必须同时满足：

1. 面板不再同时显示全部 315 张武将；
2. 任意卡牌均不会横向溢出抽屉；
3. 武将和附加牌共用完整主视口；
4. 左侧二级分类基于真实资源数据；
5. 点击不同分类显示不同真实卡牌集合；
6. 所有分类页均可访问；
7. 每页使用多条真正的手牌式重叠牌带；
8. 单张武将可真实切换允许／Ban；
9. 单张附加牌可真实切换选用／不选用；
10. 批量按钮真实修改当前分类；
11. 摘要实时反映真实状态；
12. 确认只导入选中的牌；
13. 未选牌继续保留在面板；
14. 导入不自动执行额外洗牌；
15. 重新编辑可以安全归位；
16. 不存在虚假成功提示；
17. 不存在引用失效 Holder 的旧 Routine；
18. 不修改现有桌面和备牌托盘结构；
19. 不复制真实牌；
20. 多客户端状态一致。

---

## 21. 最终执行原则

本轮重构不应继续以“增加更多按钮和提示”代替功能实现。

必须遵守：

> **先建立真实分类和真实状态，再生成 UI；先完成单张选择闭环，再开放批量操作；先验证按选择集合移动，再开放确认导入。**

最终备牌面板应是一个真正可工作的牌池配置工具，而不是仅能隐藏、排序和弹出提示的视觉演示。