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

当前只生成 4 人版本。导入本地 VirtualTabletop 后，应使用两个玩家会话和一个观察者会话完成计划书中保留的人工隐私／同步验收。

## 实时语音

游戏包通过 `_meta.gameSettings.voice` 声明启用 VTT 的独立实时语音模块：默认最多 4 名语音参与者优先使用浏览器 WebRTC P2P，质量不足或人数更多时由兼容的 VTT 服务端切换到 LiveKit SFU。`seat-1` 是语音线路模式的房主控制位。

语音媒体不写入游戏状态，也不打包进 `.vtt`。实际语音能力需要部署包含 Voice MVP 的 `Cc-Cece/virtualtabletop` 服务端，并按其 `docs/voice.md` 配置 HTTPS、STUN 和 LiveKit。

在支持 `clientActivityIndicator` 的 VTT 版本中，每个玩家模块还声明了一个独立的 `voice.speaking` 视觉层：VTT 只提供“哪个玩家正在说话”的通用客户端活动，游戏包再把该玩家映射到对应 `seat-N`，显示青绿色模块光圈。该效果不进入房间状态、不影响“出牌中”的金色高亮，也不会拦截模块内卡牌交互；旧版 VTT 不识别该能力时，这些视觉层保持默认隐藏。
