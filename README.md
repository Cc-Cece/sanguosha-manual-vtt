# 三国杀人工 VirtualTabletop（4 人 Phase 1.1）

这是弱规则、强同步和强私密可见性的 4 人联网桌面。它不自动处理技能、距离、伤害、回合或胜负。

```powershell
pnpm install
pnpm check
```

构建环境需要可从 `PATH` 调用的 FFmpeg，用于生成 WebP 牌面缓存。

构建会只读加载相邻参考目录中的 552 张牌面，生成：

`dist/Sanguosha-Manual-4P-Prototype.vtt`

包内包含一个 `0.json` 和经过网页压缩的牌面资产。设计与来源见 [架构](docs/architecture.md)、[牌面来源](docs/asset-sources.md)、[参考映射](docs/reference-structure-map.md) 和 [阶段计划](docs/development-plan.md)。

当前游戏包会通过 `gameSettings.voice` 声明启用实时语音：默认自动模式、4 人以内优先 P2P，并把 `seat-1` 作为优先语音房主。语音的麦克风 UI、WebRTC 信令、P2P/SFU 自动切换和 LiveKit token 全部由支持该能力的 VirtualTabletop 服务端提供；如果服务端未启用语音，本游戏包仍可照常运行牌桌功能。

当前只生成 4 人版本。导入本地 VirtualTabletop 后，应使用两个玩家会话和一个观察者会话完成计划书中保留的人工隐私／同步验收。