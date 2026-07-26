# rex-game

可玩的民俗文化馆。浏览器即开即玩，无后端，静态部署在 GitHub Pages（<https://game.rexai.top>）。

## 展品

| 展品 | 路由 | 玩法 |
| --- | --- | --- |
| 🌾 二十四节气 · 农时拼图 | `/games/ershisi-jieqi/` | 时序排序、物候配对、节气问答，附 24 节气图鉴 |
| 🏺 山海拾遗 | `/games/shanhai-shiyi/` | 修复中原礼器，解锁文化卡片与多区域图志 |
| 🪷 潮汕圣杯占卜 | `/games/shantou-jiaobei/` | 摄像头双手合十请愿 + Babylon.js 物理掷杯 + 杯象解读 |
| 🥁 合槌成阵：潮汕英歌 | `/games/chaoshan-yingge/` | 跟鼓点落槌、随队形推进的横版节奏战斗 |
| ✂️ 纸上生花：中国剪纸 | `/games/jianzhi/` | 读帖、折剪、展开，四幕纸上剧场与作品墙 |

另有文化导读集群 `/culture/`（4 个枢纽 + 长尾专题）与 `/about/`。

## 技术栈

- **Next.js**（App Router，`output: 'export'` 静态导出）
- **TypeScript** + React 19
- **Babylon.js** + Havok —— 圣杯物理掷杯
- **Phaser** —— 英歌横版战斗
- **MediaPipe tasks-vision** —— 摄像头双手合十识别
- **Web Speech API** —— 心愿语音输入（含文本兜底）

## 开发

```bash
pnpm install
pnpm dev          # http://localhost:3030
pnpm test         # node --test，全量契约测试
pnpm assets:audit # public/ 资源引用审计
pnpm build        # 产出静态文件到 out/
pnpm preview      # 构建后本地起 http://localhost:3040 预览
```

> 若 pnpm 因 `sharp` 构建脚本被拦截而报错，运行 `pnpm approve-builds` 选择允许，或直接 `node ./node_modules/next/dist/bin/next dev`。

## 目录约定

```
app/                 路由（App Router）
src/games/<id>/      每个游戏自包含
src/core/            跨游戏共享：注册表、SEO、埋点、主题
src/content/culture/ 文化导读内容注册表
public/              运行时静态资源（会被发到 Pages）
resources/           构建期素材（生图原图、字体原文件），不发到 Pages
scripts/             生图 / 转码 / OG 卡 / 审计等构建期脚本
```

**`public/` 与 `resources/` 的分界**：只有浏览器会请求的文件才放 `public/`。AI 生图原始 PNG、字体原文件这类「管线输入」放 `resources/`，否则会被一起打进 `out/` 发到线上（曾因此多发 45 MB）。`pnpm assets:check` 在 CI 里守这条线。

## 埋点

不采集个人信息，只统计六个漏斗事件：`game_open` / `game_start` / `step_complete` / `game_finish` / `share_click` / `culture_click`。

通过环境变量启用（缺 `SITE_ID` 则全站埋点自动降级为 no-op）：

```bash
# GA4（当前方案）
NEXT_PUBLIC_ANALYTICS_PROVIDER=ga4
NEXT_PUBLIC_ANALYTICS_SITE_ID=G-XXXXXXXXXX   # measurement id，脚本地址自动推导

# 备选：umami / plausible，需额外给出脚本地址
NEXT_PUBLIC_ANALYTICS_PROVIDER=umami
NEXT_PUBLIC_ANALYTICS_SRC=https://<统计域名>/script.js
NEXT_PUBLIC_ANALYTICS_SITE_ID=<umami website id 或 plausible data-domain>
```

已知限制：

- **GA4 在中国大陆无法直连**（`googletagmanager.com` / `google-analytics.com` 被墙），大陆访客基本采不到。若发现数据量远低于实际流量，换 umami 自托管即可 —— 只改环境变量，不动代码。
- **GA4 会写 first-party cookie（`_ga`）**，并已开启 `anonymize_ip`。umami / plausible 分支则完全无 cookie。

本地开发默认不加载任何三方脚本，事件打到 `console.debug`。玩家开启 Do Not Track 或 Global Privacy Control 时彻底静默。

## 多游戏扩展

每个游戏自包含于 `src/games/<id>/`，并在 `src/core/gamesRegistry.ts` 登记；新增游戏 = 加一条注册 + 创建 `app/games/<id>/page.tsx`。

## 部署

推送到 `main` 触发 `.github/workflows/deploy.yml`：跑测试 → 资源审计 → 静态构建 → 发布 GitHub Pages。

## 规划文档

- `docs/plans/` —— 各展品实现计划
- `docs/gdd/` —— 游戏设计文档
- `DESIGN.md` —— 设计系统（博物馆 / 神坛双表面）

---

⚠️ 仅供娱乐。游戏不承诺灵验，所有摄像头 / 语音数据仅在本地浏览器处理，不上传。
