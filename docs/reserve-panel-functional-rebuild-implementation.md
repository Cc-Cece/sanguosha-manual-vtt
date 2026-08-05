# 备牌面板功能重构实现说明

> 基线：`chore/organize-card-assets`  
> 目标分支：`feature/reserve-panel-functional-rebuild`

## 实现范围

本轮将覆盖式备牌面板从静态原型重构为可使用的备牌草稿与运行时牌组更新系统，继续遵守“弱规则、人工裁定”的项目原则，不实现技能、距离、伤害、回合或胜负判定。

面板只管理：

- 武将牌 315 张；
- 扩展牌 31 张。

固定主牌、身份牌和血量牌继续由现有桌面及备牌托盘管理，不进入本面板。

## 真实分类

武将分类直接来自已审计的 `CardAsset.subCategory`：

| 分类 | 数量 | 页面数 |
| --- | ---: | ---: |
| 全部武将 | 315 | 10（复用下列真实页面） |
| 风包 | 8 | 1 |
| 火包 | 8 | 1 |
| 林包 | 8 | 1 |
| 山包 | 8 | 1 |
| 一将成名 | 33 | 1 |
| SP 武将 | 121 | 2 |
| 其他扩展 | 129 | 3 |
| 全部扩展牌 | 31 | 1 |

当前标准包数量为 0，因此数据类型仍保留，但界面不生成空按钮和空页面。扩展牌尚无可靠牌型元数据，本轮只提供“全部扩展牌”，不再伪造装备、锦囊或模式牌分类。

## 页面模型

- 每行最多 16 张；
- 每页最多 4 行；
- 每页最多 64 张；
- 每行采用 56 px 水平步进的部分重叠排列；
- “全部武将”不复制实体牌，而是按分类顺序复用 10 个真实页面；
- 同时只显示一个页面。

每张受管卡牌保存：

- `reserveLibraryType`；
- `reserveCategoryId`；
- `reserveSelected`；
- `reserveDefaultSelected`；
- `reserveHomeHolder`；
- `reservePageId`；
- `reserveHomeIndex`；
- `reserveState`；
- `reservePendingRemoval`。

## 卡牌生命周期

`reserveState` 使用三个互斥状态：

| 状态 | 含义 |
| --- | --- |
| `draft` | 位于牌库编组面板，可编辑且不可拖动 |
| `reserved` | 位于对应备牌托盘，已盖回且可从托盘取用 |
| `in-use` | 已离开备牌托盘，可能位于玩家区、手牌、牌堆、弃牌区或桌面其他位置 |

状态转换：

```text
draft --确认同步--> reserved --离开托盘--> in-use
                                  ^          |
                                  |----------|
                                      归还托盘
```

`reserveSelected` 表示新配置是否继续包含该牌，与卡牌当前物理位置分离。`reservePendingRemoval=true` 表示该牌已经在游戏中，但新配置不再包含它；系统不会强制移动该牌，而会等待其自然归还托盘。

## 安全的游戏中更新

1. 玩家 1 打开备牌面板；
2. 系统只召回仍位于 `general-reserve` / `extra-reserve` 且状态为 `reserved` 的牌；
3. 状态为 `in-use` 的牌保持原位置，不翻面、不改父级、不强制召回；
4. 房主修改允许、Ban 或扩展牌选择；
5. 确认更新时，只将“已选择且状态为 `draft`”的牌差量加入托盘；
6. 已选择的 `in-use` 牌继续使用，并清除待移除标记；
7. 未选择的 `in-use` 牌保留原位，并标记 `reservePendingRemoval=true`；
8. 待移除牌自然归还对应托盘后，由托盘 `enterRoutine` 自动移回原分类行，恢复为 `draft` 且保持未选择；
9. 只有“整桌重置”会无条件强制召回全部受管牌并恢复默认选择。

这样可以在游戏进行中更新后续可用牌组，同时避免把玩家正在使用的武将牌或扩展牌突然抽走。

## 交互闭环

1. 玩家 1 按真实分类浏览武将或扩展牌；
2. 单击牌面切换允许/Ban 或选中/取消；
3. 对当前分类执行全选、全取消或反选；
4. 摘要通过 `SELECT + COUNT + LABEL` 实时显示配置数、托盘待用数、游戏中数量和待移除数量；
5. 至少保留 1 张允许武将；
6. “确认更新并同步托盘”执行差量更新，不自动洗牌；
7. 浏览阶段牌面不可拖动，导入托盘后恢复可移动；
8. 选择状态与 `display` 完全分离。

## 权限

- 玩家 1：可导航、选择、批量操作、重置和确认更新；
- 其他玩家：共享查看面板和摘要，操作会收到只读提示。

该权限仅控制备牌工作流，不承担任何游戏规则裁定。

## 主要文件

- `src/data/reserveLibraryCatalog.ts`
- `src/data/reserveViewRegistry.ts`
- `src/data/assetDecks.ts`
- `src/widgets/libraryBrowser.ts`
- `src/widgets/reservePanelController.ts`
- `src/routines/reserveCardRoutines.ts`
- `src/routines/reserveNavigation.ts`
- `src/routines/reserveImportRoutines.ts`
- `src/routines/tableActions.ts`

## 验证要求

自动验证覆盖：

- 分类数量和空标准包隐藏；
- 346 张受管牌无遗漏、无重复；
- 16 × 4 页面容量和部分堆叠宽度；
- 真实分类导航和多页边界；
- 单牌与批量选择不使用 `display`；
- `draft` / `reserved` / `in-use` 生命周期；
- 托盘进入与离开状态转换；
- 游戏中牌不被普通打开或更新流程移动；
- 待移除牌归还托盘后的自动退出；
- 所有集合移动使用 `MOVE collection`，不把集合名误作 Holder；
- 实时摘要；
- 差量导入；
- 整桌重置强制恢复；
- 玩家 1 权限；
- Widget ID 唯一和项目结构验证。

GitHub Actions 会同时检出固定版本的 VirtualTabletop 上游校验器，并执行完整 `pnpm check`。
