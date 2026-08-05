# 三国杀人工 VirtualTabletop（4 人原型）

这是从 VirtualTabletop 原生组件结构重新构建的弱规则联网桌面。当前版本只支持 4 人，用于验证 Seat 安全、私密可见性、模块布局和原生同步；不自动处理任何三国杀规则。

```powershell
pnpm install
pnpm check
```

构建产物为 `dist/Sanguosha-Manual-4P-Prototype.vtt`，压缩包内只含 `0.json`。将该文件导入本地 VirtualTabletop 后，建议至少开启一个观察者窗口和两个玩家窗口验证隐私与同步。

设计说明见 [架构](docs/architecture.md)、[参考映射](docs/reference-structure-map.md) 和 [阶段计划](docs/development-plan.md)。
