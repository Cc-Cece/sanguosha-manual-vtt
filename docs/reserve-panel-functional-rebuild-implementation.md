# 备牌面板功能重构实现说明

> 基线：`chore/organize-card-assets`  
> 目标分支：`feature/reserve-panel-functional-rebuild`

## 实现范围

本轮将覆盖式备牌面板从静态原型重构为可使用的备牌草稿系统，继续遵守“弱规则、人工裁定”的项目原则，不实现技能、距离、伤害、回合或胜负判定。

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
- `reserveState`。

## 交互闭环

1. 玩家 1 打开备牌面板；
2. 按武将真实分类或全部扩展牌浏览；
3. 单击牌面切换允许/Ban 或选中/取消；
4. 对当前分类执行全选、全取消或反选；
5. 摘要通过 `SELECT + COUNT + LABEL` 实时计算；
6. 确认时只移动 `reserveSelected=true` 的命名集合；
7. 至少保留 1 张允许武将；
8. 选中牌盖回并进入现有 `general-reserve` / `extra-reserve`；
9. 再次打开面板时，已确认牌按 `reserveHomeHolder` 召回原行继续编辑；
10. 整桌重置时，所有受管牌无论当前位于何处，均强制恢复原分类页面并恢复默认选择。

浏览阶段牌面不可拖动，避免破坏重叠牌带；导入托盘后恢复可移动。选择状态与 `display` 完全分离。

## 权限

- 玩家 1：可导航、选择、批量操作、重置和确认导入；
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
- 16 × 4 页面容量；
- 真实分类导航和多页边界；
- 单牌与批量选择不使用 `display`；
- 实时摘要；
- 选择性导入；
- 原位恢复与整桌强制恢复；
- 玩家 1 权限；
- Widget ID 唯一和项目结构验证。

GitHub Actions 会同时检出固定版本的 VirtualTabletop 上游校验器，并执行完整 `pnpm check`。
