# 山海问兽素材替换（已落地：Kenney CC0 覆盖包启用中）

合成：`node scripts/apply-kenney-override.mjs`（源 `resources/kenney-src/` → `public/assets/shanhai-wenshou/override/`，68 文件，manifest 已启用）。

## 1. 用的包（只用 CC0，已验）

- Kenney New Platformer Pack 1.1（https://kenney.nl/assets/new-platformer-pack，CC0-1.0）：人物／兽／地块／水／道具。
- itch quirky 史莱姆包全是“免费≠CC0”或物种不对，弃用；Quaternius 动物是 3D，弃用；Kenney Animal Pack 只有正方形头像，弃用。

## 2. 映射表（已识别 cornerstone 结论）

| 槽位 | 来源 | 说明 |
|---|---|---|
| 主角 27 帧 | 黄衣人 9 素材＋木杖覆盖＋姿态变换 | 真实行走/跳/攀爬帧，攻击为 hit/walk 摆杖 |
| 蝮虫／怪蛇／鯥／赤鱬／类／旋龟／𪁺𩿧／灌灌 | worm×2／黄鱼／黄鱼转赤／鼠／蜗牛／蜂／蝇 | 8 兽有真实两帧 |
| 狌狌／白猿／鹿蜀／猼訑／九尾 | 自产保留 | Kenney 无猿马羊狐侧视图，硬套更伤辨识度 |
| 地块/平台（每山） | 6 种砖 grass/dirt/purple/sand/snow/stone 按山复用 | 招摇草／堂庭沙／猿翼紫／杻阳土／柢山石／亶爰雪／基山石／青丘草／箕尾沙／无名雪 |
| 水 | Kenney 水顶＋水体叠放，十山同款 | 体积换质量，十山水同源可接受 |
| 三层视差山 | 自产保留 | 十山调色板即辨识度，Kenney 背景是顺滑矢量会跳风 |
| 祠灯/山祠/界碑/拾取 | 火把／门楣＋门扇／岩石／红菇／黄玉／木牌 | 全部有实物对应 |

## 3. 回退与重跑

`assets.ts` 整包切换：manifest 不可用（disabled／空／非 CC0）即回 pixel，永不断线。
改源图后重跑合成器即可；`tests/shanhai-assets.test.ts` 锁 68 文件完整性。
