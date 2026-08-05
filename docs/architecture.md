# 4 人原型架构

源码分为 `data`（占位数据）、`layouts`（纯坐标）、`widgets`（组件工厂与玩家模块）、`routines`（最少交互）、`variants`（唯一变体组装）、`types` 和 `validation`。构建时由 TypeScript 生成 `0.json` 并压缩为 `.vtt`，仓库不直接维护巨型 JSON。

每个玩家区域以可移动 `basic` 为根；Seat、手牌、武将、体力、身份、装备、判定和附加牌区全部通过 `parent` 使用相对坐标。当前只预留模块化结构，不提供锁定、整理或房主按钮。

私密手牌与身份容器同时使用 `onlyVisibleForSeat`、`linkedToSeat` 和 `childrenPerOwner`。卡牌本身不携带手牌可见性，因此离开手牌容器后恢复公开。身份容器下方另有公开牌背；观察者和其他座位看不到容器中的身份正面。

Seat 的 `clickRoutine` 在调用原生点击前检查本人、占用者和重复入座。未来房主清理接口目前仅以 `futureHostClearRoutine` 源码导出存在，未绑定任何界面或权限系统。

所有卡牌、武将、身份及体力展示使用原生 `enlarge`。项目不修改 VirtualTabletop 客户端的悬停、触屏长按或屏幕边界处理。
