# Spec 4 · 圣杯 / 英歌外壳对齐设计系统 v2

- 日期: 2026-07-20
- 状态: 已批准（brainstorm 逐项确认）
- 作者: rex + agent（brainstorming 流程产出）
- 前置: Spec 1 设计系统 v2（`2026-07-20-design-system-v2-homepage-design.md`）tokens 与方向 C 已锁定；Spec 2/3 已交付

---

## 1. 背景与问题

站点门面（首页）与剪纸「纸上剧场」已统一到 v2「数字民艺」（深漆底 × 朱 × 金、`--g-*` token）。圣杯与英歌仍是各自一套壳层色板与顶栏：

- **圣杯**：`JiaobeiGame` 内联 `GameChrome` + `jiaobei.css` 硬编码色（`#080605` / `#f4ead6` / 游离金红），与 tokens 未接线。
- **英歌**：`yg-*` 菜单/章节/图鉴/设置/结果 + `YinggeGame.module.css` 独立语言；与 Gallery / 剧场割裂。

问题不是玩法，而是 **「进游戏像换了另一个廉价站点」**。Spec 4 只做外壳对齐，不重生概念、不改引擎。

## 2. 已锁定决策（brainstorm）

| 决策点 | 结论 |
|---|---|
| 深度 | **A · 外壳对齐**：流程 / IA / 玩法零改；intro·menu·result 等壳层视觉换皮 |
| 顶栏 | **沉浸式游戏 Chrome**；不挂 `GalleryHeader` / `GalleryFooter` |
| 页内 SEO 静态区 | **不动**（`app/games/*/page.tsx` 导读/FAQ/来源零 diff 或仅无关空白） |
| 实现路径 | **共享 `GameChrome` + `game-shell.css`**；各游戏屏内排版仍归各游戏 |
| 美术 | 不为 Spec 4 批量新做 AI 大图；现有 hero/cover/装饰几何可保留 |
| 英歌 playing HUD | **最小动**：仅对比度不足时抬字色；不重做血条/技能 UI |

## 3. 范围

### 3.1 做

1. **共享游戏壳**
   - `src/components/game/GameChrome.tsx`：返回展厅 / 标题 / 副标（edition）/ children
   - `src/styles/game-shell.css`：`.gs-*` 原语（root/head/back/title/edition/body、btn primary/ghost、eyebrow、panel）
   - 色/字/距/动效 **只用** `--g-*`（`tokens.css`）
2. **圣杯壳对齐**
   - 删除本地 `GameChrome`，改用共享组件
   - `jiaobei.css` 壳层（intro/offering UI 框/result 面板/按钮/眉标）改 token；可接 `.gs-btn*`
   - 阶段副标：intro→`展品 / 序章`，offering→`仪式进行中`，result→`落杯已定`
3. **英歌壳对齐**
   - menu / guide / chapters / settings / archive / result 顶栏与主次按钮接共享壳或 `.gs-btn*`
   - `YinggeGame.module.css` 上述视图底色/金线/按钮/eyebrow/卡片边 → token
   - playing：可选字色对比度修补，不重设计
4. **契约测试**
   - 共享壳 class / token 引用
   - 两游戏入口仍挂 chrome
   - 壳层主色不以散落硬编码为主来源（装饰 gradient 可白名单）

### 3.2 不做

- 物理 / MediaPipe / Phaser 节奏与战斗逻辑（`physics/*`、`vision/*`、`runtime/*`、`core/*`）
- 页内 SEO 静态区改版或 Spec 2 式明暗双轨
- 站点 Gallery 导航挂入游戏全屏
- 新概念隐喻、新流程、新 localStorage schema / key 迁移
- 批量 AI 场景大图生产（Spec 3 管线不强制复用）

## 4. 成功标准

- 两游戏视觉语言与首页/剧场同一漆底×朱×金阶梯，肉眼无「另一套 UI 体系」
- 流程与进度行为与改前一致（圣杯三掷；英歌章节解锁/设置持久化）
- `prefers-reduced-motion` 下壳层动效降级（时长≈0 或仅 opacity）
- `pnpm test` 绿；隔离 worktree 构建通过（主目录 dev 占 3030 时不抢 `.next`）
- `page.tsx` SEO 长文区零行为 diff

## 5. 组件与文件边界

### 5.1 共享层（新建）

| 单元 | 职责 |
|---|---|
| `src/components/game/GameChrome.tsx` | Props：`title: string`，`edition?: string`，`backHref?: string`（默认 `/`），`backLabel?: string`（默认「返回展厅」），`children`。class 前缀 **`gs-`**，避免与旧 `.chrome` 冲突。 |
| `src/styles/game-shell.css` | `.gs-root` / `.gs-head` / `.gs-back` / `.gs-title` / `.gs-edition` / `.gs-body`；`.gs-btn` `.gs-btn--primary` `.gs-btn--ghost`；`.gs-eyebrow`；`.gs-panel`。全部引用 `--g-*` + `--g-font-*` + `--g-ease` / `--g-dur-*`。 |
| 样式入口 | 在两游戏 client 根引入 `import '@/styles/game-shell.css'`（与 jianzhi `theater.css` 同模式）；**不**强制进全站 `layout`。 |

### 5.2 圣杯

| 改动 | 说明 |
|---|---|
| `src/games/shantou-jiaobei/JiaobeiGame.tsx` | 删本地 `GameChrome`；挂共享组件；`main` 可加 `gs-root` 或保留 `jiaobei` + 内部 chrome。 |
| `src/styles/jiaobei.css` | 迁走/删除旧 `.chrome*`；intro/offering/result 字色、边线、按钮、眉标对齐 token / `.gs-btn*`。 |
| **不动** | `physics/*`、`vision/*`、`audio/*`、`voice/*`；`scenes/*` 逻辑与结构（仅允许 className 接按钮类）；3D canvas 与相机。 |

### 5.3 英歌

| 改动 | 说明 |
|---|---|
| `src/games/chaoshan-yingge/YinggeGame.tsx` | 非 playing 视图顶栏/主次按钮接 `GameChrome` 或 `.gs-btn*`；`yg-*` 网格结构可保留。 |
| `YinggeGame.module.css` | 壳层色 → token；装饰 SVG 几何可留。 |
| **playing HUD** | 最小动；对比度不足才抬到 `--g-text-hi`。 |
| **不动** | `runtime/*`、`core/*`、`content/*` 数据语义；`PROGRESS_KEY` / `SETTINGS_KEY` 等。 |

### 5.4 边界一句话

> 共享层 = **顶栏 + 按钮/眉标/面板原语**；各游戏的 **屏内排版与插画** 仍归各游戏 CSS，只把「另一套色板」换成 v2 token。

## 6. 视觉规格

| 角色 | Token / 类 | 用法 |
|---|---|---|
| 页底 | `--g-abyss` / `--g-lacquer` | `.gs-root`、游戏 `main` 底 |
| 顶栏 | 半透明漆底 + 可选 `backdrop-filter` | `.gs-head`；底边 `1px` 金线低透明 |
| 标题 | `--g-font-display` + `--g-text-hi` | `.gs-title`，字距略宽 |
| 眉标 / 副标 | `--g-gold` / `--g-text-dim` | `.gs-eyebrow` / `.gs-edition` |
| 主 CTA | `--g-cinnabar` 底 | `.gs-btn--primary`（统一原金钮/红钮到朱砂） |
| 次 CTA | 透明 + 金描边 | `.gs-btn--ghost` |
| 面板 | `--g-float` / `--g-card` + 金细线 | `.gs-panel` |
| 动效 | `--g-dur-*` + `--g-ease` | hover/进场；reduced-motion 降级 |

**圣杯特有：** intro 电影区丝绸/烟雾可保留；主文色与按钮不得游离硬编码主色。  
**英歌特有：** 开场 poster 几何可留；menu/chapters/guide/settings/archive/result 必须接共享原语或 token。

### 6.1 交互与文案（不变）

- 返回默认「返回展厅」→ `/`
- 圣杯 edition 三句保持上表
- 英歌 view 切换与进度 key 不改名、不迁移
- metadata / JSON-LD / 页内 SEO 静态 HTML 不改

## 7. 测试策略

| 文件 | 断言方向 |
|---|---|
| `tests/game-shell-contract.test.ts`（新） | `GameChrome` 源码含 `gs-head` / `gs-back` / `gs-title`；`game-shell.css` 含 `--g-`；壳主色不依赖散落 `#` 色板（装饰可白名单） |
| 扩展既有 jiaobei/yingge UI 契约（若存在） | 入口仍挂 chrome；主 CTA class 可解析 |
| 行为回归 | 不强制 E2E；以契约 + 既有 runtime 测试不回归为准 |

## 8. 实施顺序（供 writing-plans 拆任务）

1. `game-shell.css` + `GameChrome` + 契约测试（红 → 绿）
2. 圣杯接线 + `jiaobei.css` token 化
3. 英歌非 playing 视图接线 + module.css token 化
4. playing 对比度抽检 + 全量测试 + 隔离 worktree 构建验收

提交风格：Conventional Commits。

## 9. 验收清单

- [ ] 两游戏顶栏同构：返回 / 标题 / 副标，class 走 `gs-*`
- [ ] 主次按钮与首页朱/金语言一致
- [ ] `game-shell.css` 与两游戏壳层选择器以 `--g-*` 为主色来源
- [ ] 圣杯 intro → 三掷 → result 流程与改前一致
- [ ] 英歌章节解锁 / 设置持久化 / 进局出局与改前一致
- [ ] reduced-motion 下无大幅位移动画
- [ ] `pnpm test` 通过；隔离构建路由不回归
- [ ] `page.tsx` SEO 长文区零 diff（或仅无关空白）

## 10. 风险与约束

| 风险 | 缓解 |
|---|---|
| CSS Modules（英歌）与全局 `.gs-*` 混用 | 按钮/顶栏用全局 `gs-*` 字符串 class；布局继续 `styles.xxx` |
| 圣杯 `jiaobei.css` 体量大，误伤 3D 叠层 | 只改字色/边/按钮/眉标；不改 canvas 容器定位契约 |
| dev 与 build 抢 `.next` | 构建验收用 git worktree；不 `rm -rf .next` 于主工作区 |
| 全角标点导致 Edit 失配 | 大块 JSX 替换优先 ASCII 锚点 + `tsc --noEmit` 兜底 |

## 11. 与总路线关系

| Spec | 状态 |
|---|---|
| 1 设计系统 + 首页 | 已交付 |
| 2 文化页双轨 + SEO 矩阵 | 已交付（内容终审 / push 另线） |
| 3 剪纸纸上剧场 | 已交付 |
| **4 圣杯/英歌外壳** | **本文档；待实现计划** |

---

**下一步：** 用户审阅本 spec 文件无误后，调用 writing-plans 产出 `docs/superpowers/plans/2026-07-20-jiaobei-yingge-shell.md`。
