# Spec 2 · 文化页明暗双轨 + SEO/GEO 内容矩阵

- 日期:2026-07-20
- 状态:已批准(brainstorm 逐项确认),直接实施
- 前置:Spec 1(设计系统 v2 + 首页)已交付,决策总表见其 §2

---

## 1. 背景

文化页现状:10 页(3 hub + 7 topic),`CulturePage` 数据驱动 + `CultureDocument` 统一渲染,museum 浅色外壳。问题:① 样式仍是旧浅色主题,与 v2 暗场首页割裂;② 内容每页仅 ~300 字,深度/数量不足;③ GEO/AI 搜索无专项抓手;④ 社交分享无页面级 OG 卡。

## 2. 决策记录(本轮 brainstorm 确认)

| 决策点 | 结论 |
|---|---|
| 内容矩阵规模 | **深度+广度 ~20 页**:现有 10 页加厚 + 新增 ~10 篇长尾/速查专题 |
| 内容生产方式 | Claude 直接写全文,用户最后统一终审;遵守站点「常见说法/地区差异/游戏设计」三分表述原则 |
| topic 页形态 | **明暗双轨**(暗场展厅头 + 快速回答条 + 宣纸阅读面 + 朱砂 CTA 横幅) |
| hub 页形态 | **独立展厅设计**(更大展厅头 + 专题卡片 grid + 主题符号装置),与 topic 拉开层级 |
| GEO/社交技术项 | llms.txt + 每文化页独立 OG 卡 + 速查表/对照表专题(计入矩阵) |
| 实施顺序 | 模板 → OG 批量 → 加厚 → 新专题 → llms.txt/验收 |

## 3. 范围

**做:**
1. CultureDocument 双轨重构(topic)+ CultureHubGallery(hub 独立展厅);文化页外壳换 GalleryHeader/GalleryFooter
2. 内容加厚:10 页 → 每页 800–1200 字、小节 ≥4、FAQ 6–8 条、来源 ≥3
3. 新增 10 篇专题(见 §5)
4. OG 模板参数化,每文化页渲一张 → `public/assets/og/`
5. `public/llms.txt` + sitemap 同步

**不做:** 游戏页内部、剪纸剧场(spec 3)、首页(已交付)、外链建设。

**成功标准:** 文化页全部双轨/hub 展厅且无破版;~20 页内容上线、FAQ schema 随 `buildCulturePageGraph` 自动完整;llms.txt 可访问;~10 张 OG 卡生成并注入;144+ 测试保持全绿。

## 4. 模板设计

### 4.1 topic 页(明暗双轨)

`CultureDocument` 按 `page.kind === 'topic'` 渲染:

1. **CultureHero**(暗场):面包屑(文化馆/hub/专题)+ H1(核心关键词 `<em>` 高光朱)+ 元信息行(阅读时长 · 修订日期 · 常见说法整理)+ 主题符号 SVG(按 `page.symbol`)
2. **QuickAnswerBar**:暗底金边条,`page.quickAnswer` 首句直答(≤80 字写作规范)
3. **宣纸阅读面** `.culture-paper`:sections(朱砂红菱小节标)/ 金色引文 / terms 网格(纸面描边卡)/ FAQ(虚线分隔手风琴)/ sources;纸色用 museum 既有 `--c-canvas: #f7f1e6` 系
4. **CTA 横幅**:朱砂渐变,「读完,不如亲手掷一次/玩一局」+ `page.gameHref`

### 4.2 hub 页(独立展厅)

`CultureDocument` 按 `page.kind === 'hub'` 渲染 `CultureHubGallery`:

- 大展厅头(主题符号装置:筊杯金月/英歌双槌鼓/剪纸红菱,复用首页 ExhibitGlyph 思路)
- hub 概述正文(宣纸面,篇幅同 topic 加厚标准)
- 专题卡片 grid:该 hub 全部 topic,暗金卡(标题/快速回答首句/阅读时长)
- gameHref CTA

### 4.3 数据层

`CulturePage` types 增补可选字段:`readingMinutes?: number`、`ogImage?: string`、`symbol?: 'jiaobei' | 'yingge' | 'jianzhi'`。registry 结构、路由、`generateStaticParams`、JSON-LD 构造器全部不变。

### 4.4 外壳切换

文化页 `SiteHeader`/`SiteFooter` → `GalleryHeader`/`GalleryFooter`;museum.css 保留(纸面 token 复用),旧 SiteHeader/SiteFooter 组件确认全站无引用后删除(about/首页已迁走)。

## 5. 内容矩阵

### 5.1 加厚(现有 10 页)

每页:800–1200 字、小节 ≥4、FAQ 6–8 条、来源 ≥3、补 `readingMinutes`。FAQ 面向真实搜索问句。

### 5.2 新增 10 篇(slug / 标题 / 关键词方向)

**掷筊 hub ×4:**
- `jiaobei-vs-qiuqian` — 掷筊和求签有什么区别?(对比辨析)
- `how-to-throw` — 掷筊的姿势与步骤(实操 how-to)
- `cheatsheet` — 掷筊判读速查表(可引用资产:杯象×含义×常见问法对照)
- `when-not-to-throw` — 什么时候不适合掷筊?(边界与心态,呼应娱乐声明)

**英歌 hub ×3:**
- `why-war-dance` — 英歌为什么叫「中华战舞」?(概念源流)
- `faces-cheatsheet` — 英歌脸谱角色速查(对照表:角色×脸谱×槌法特点)
- `yingge-vs-others` — 英歌与傩舞、秧歌的区别(辨析)

**剪纸 hub ×3:**
- `getting-started` — 剪纸入门:工具与第一次动剪(how-to 长尾)
- `motifs-cheatsheet` — 剪纸纹样吉语速查表(可引用资产:纹样×吉语×场合)
- `south-vs-north` — 南派剪纸与北派剪纸的区别(流派辨析)

每篇同样满足:800–1200 字、小节 ≥4、FAQ ≥5、来源 ≥3、quickAnswer ≤80 字、hub/slug 入 registry、专题卡自动出现在 hub 展厅 grid。

## 6. GEO/社交

- **llms.txt**(`public/llms.txt`):站点一句话简介 + 核心页面分组清单(3 游戏 / 3 hub / 全部 topic)+ 引用建议(「引用时请注明 rex-game · 可玩的民俗文化馆」);sitemap.ts 同步加入。
- **OG 模板化**:`scripts/generate-og.mjs` 重构为参数化(标题/副题/符号/输出名),保留首页卡渲染;新增 `scripts/generate-culture-og.mjs` 遍历 registry 为每文化页渲 `public/assets/og/culture-<hub>[-<topic>].png`;CultureDocument metadata 按页注入 `ogImage`(无则回落首页卡)。
- **QuickAnswer 规范**:≤80 字、首句直答、可独立成段引用。

## 7. 实施任务划分(供实现计划)

- T1 模板改造:types 增字段 + CultureDocument 双轨 + CultureHubGallery + 换壳 + gallery.css 文化页段 + 契约测试
- T2 OG 批量:generate-og 重构 + generate-culture-og + metadata 注入 + 测试
- T3 现有 10 页加厚(纯内容,registry 数据文件)
- T4 新增 10 篇专题(纯内容 + sitemap 自动拾取)
- T5 llms.txt + 全量验收(测试/build/无破版检查)

## 8. 验收清单

- [ ] 全部 topic 页双轨渲染、hub 页展厅渲染,移动端正常
- [ ] 旧 SiteHeader/SiteFooter 无引用并删除;文化页无 museum 外壳残留
- [ ] ~20 页全部满足字数/FAQ/来源标准;registry 类型检查通过
- [ ] 每文化页 OG 卡生成并在 `<head>` 可见;首页 OG 不受影响
- [ ] llms.txt 上线;sitemap 含全部新路由
- [ ] 全部测试通过;worktree 隔离构建通过
