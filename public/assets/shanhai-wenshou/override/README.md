# override / 覆盖包（已启用：Kenney CC0）

本目录为合成产物，不要手改 PNG。用以下命令重跑：

```bash
node scripts/apply-kenney-override.mjs
```

- 源文件：`resources/kenney-src/new-platformer/`（Kenney New Platformer Pack 1.1，CC0）＋自产 `pixel/`（5 兽＋视差山）。
- 映射：主角 27 帧（黄衣人＋木杖）／8 兽换 Kenney（虫×2／鱼×2／鼠／蜗牛／蜂／蝇）／5 兽保留自产（猿×2／马／羊／狐，无对应物种）／地块 6 种砖按山复用／水／灯火把／祠门／碑石／菇／玉／牌。
- `manifest.json` 即开关：`disabled` 缺席＝启用。改回自产只需加 `"disabled": true`。
- 协议：CC0-1.0，无需署名（THIRD_PARTY_NOTICES 仍登记来源）。
