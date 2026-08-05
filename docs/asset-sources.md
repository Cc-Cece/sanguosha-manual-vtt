# 牌面来源与处理记录

来源根目录：`../tabletop-simulator-reference/3765935052/cleaned-and-classified-cards`

该目录由用户提供，牌面许可状态未在来源包中声明；本仓库不重新声明其版权或许可证。每张生成卡牌在 `0.json` 的 Card Type 中保留 `sourceSequence` 和 `sourceCardId`，可回查来源目录的 `manifest.json`、原始 URL、SHA-256、裁切参数和文件路径。

| 分类 | 数量 | 桌面用途 |
| --- | ---: | --- |
| 标准＋军争 | 160 | 初始摸牌堆 |
| 额外游戏牌 | 31 | 备牌托盘扩展槽 |
| 武将 | 315 | 备牌托盘武将槽 |
| 身份 | 10 | 备牌托盘身份槽 |
| 标记与参考 | 36 | 备牌托盘标记槽 |

构建缓存位于 `temp/optimized-assets`，不会修改或覆盖来源文件。原始约 733 MB，网页适配缓存约 28 MB；重复牌面按哈希复用为 482 个包内文件，所有单文件均低于 VirtualTabletop 的 10 MiB 导入上限。
