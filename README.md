# rex-game

静态娱乐游戏站，部署在 Gitee Pages。浏览器即开即玩，无后端。

当前游戏：

- 🪷 **潮汕圣杯占卜**（跋杯 / 掷筊）—— 摄像头双手合十请愿 + Babylon.js 物理掷杯 + 圣杯/笑杯/阴杯解答。

## 技术栈

- **Next.js**（App Router，`output: 'export'` 静态导出）—— 为后续转型动态站预留
- **TypeScript** + React 19
- **Babylon.js** —— 物理掷杯 3D（进行中）
- **MediaPipe tasks-vision** —— 摄像头双手合十识别（进行中）
- **Web Speech API** —— 心愿语音输入（含文本兜底）

## 开发

```bash
pnpm install
pnpm dev          # 本地开发 http://localhost:3000
```

> 若 pnpm 因 `sharp` 构建脚本被拦截而报错，运行 `pnpm approve-builds` 选择允许，或直接 `node ./node_modules/next/dist/bin/next dev`。

## 构建与部署

```bash
pnpm build        # 产出静态文件到 out/
```

将 `out/` 目录内容发布到 Gitee Pages（部署阶段再配 `next.config.mjs` 的 `basePath` / `assetPrefix` 子路径）。

## 多游戏扩展

每个游戏自包含于 `src/games/<id>/`，并在 `src/core/gamesRegistry.ts` 登记；新增游戏 = 加一条注册 + 创建 `app/games/<id>/page.tsx`。

## 规划文档

详见 `docs/plans/2026-07-10-shantou-jiaobei-game.md`。

---

⚠️ 仅供娱乐。游戏不承诺灵验，所有摄像头 / 语音数据仅在本地浏览器处理，不上传。
