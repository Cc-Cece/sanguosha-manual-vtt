# cards-webp

三国杀牌面 WebP 资源（语义化文件名）及权威索引。

## 索引（唯一真相源）

| 文件 | 用途 |
| --- | --- |
| `index.json` | 路径 → 元数据（中文名、花色、`source_id` 等） |
| `rename_map.txt` | 旧数字路径 → 语义路径 |
| `catalog.json` | VTT 构建用 catalog（含 `asset` hash；路径由组织逻辑按索引重写） |

构建时由 `src/data/cardAssetIndex.ts` 读取上述索引，生成 `optimizedFile` 与中文 `label`，**不再**用 `prefix_${cardId}` 模板硬编码文件名。

## 命名规范

- 手牌：`[Type]_[Suit]_[Rank]_[EnglishName](_NN).webp`
- 武将：`General_[Pack]_[EnglishName](_NN).webp`
- 身份：`Role_[RoleName](_NN).webp`
- 体力：`Health_HP{n}(_NN).webp`
- 其他：`Back_*` / `Treasure_*` / `Stratagem_*` / `Reference_*` / `Cover.webp`

本目录保留完整牌面套装（含体力、标记与参考等当前桌面未打包的牌）。`.vtt` 构建仍只收录实际使用的牌。

## 来源

由 `cards-webp-named` 重命名包落地；像素内容与历史数字命名包一致，本阶段不重压图像、不重算 VTT hash。
