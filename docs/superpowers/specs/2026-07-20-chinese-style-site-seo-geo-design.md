# rex-game 中国风全站 + 文化 SEO/GEO 设计规格

**状态**：已实现（静态导出通过）；计划见 `docs/superpowers/plans/2026-07-20-chinese-style-site-seo-geo.md`  
**日期**：2026-07-20  
**路径**：B（分层流水线）  
**产品定义**：可玩的民俗文化馆 —— Notion 式章节叙事 × 中国文人器物气质 × 可索引的文化知识网  

---

## 1. 目标与非目标

### 1.1 目标

1. **全站重设计（交付 1）**：首页与站级壳（nav/footer）采用 Notion 式纵向章节叙事，视觉统一为中国风系统。
2. **营销叙事站（交付 2）**：不另起域名；首页即「产品营销站」，文化页为分馆，共用一套品牌与组件。
3. **设计系统（交付 3）**：以根目录 `DESIGN.md` 为 UI 真源（宣纸明色默认 + 漆金暗场游戏壳）。
4. **视觉方向（交付 4）**：先出 6 张分 section 横向参考图，再按图实现关键壳与文化页。
5. **SEO + GEO**：为三游戏建立文化枢纽与长尾主题页；Quick Answer / FAQ / HowTo / 来源 / JSON-LD / sitemap / 内链网齐备。

### 1.2 非目标（本规格范围外）

- 修改 3D 物理、英歌节奏核心、剪纸 canvas 玩法逻辑（仅壳与文化内容层）。
- 多语言 i18n。
- 用户账号、UGC、付费转化。
- 独立第二品牌站或第二域名。

### 1.3 成功标准

| 标准 | 可验证方式 |
|------|------------|
| 首页一眼是「文化馆 + 可玩」 | Hero 有主张句、主 CTA 进推荐游戏、次 CTA 进文化馆 |
| 三游戏均有文化枢纽 | `/culture/jiaobei|yingge|jianzhi` 存在且可索引 |
| 每枢纽 ≥1 个长尾主题页 | 首批共 ≥6 个主题页上线 |
| GEO 可抽取 | 每文化页首屏 3–5 句定义 + FAQ JSON-LD |
| 设计一致 | 营销/文化页默认宣纸；游戏沉浸区可继续暗场 |
| 静态导出兼容 | `next` static export 下路由与 sitemap 完整 |

---

## 2. 设计原则

### 2.1 从 Notion 迁移的 5 条结构原则

1. **画布安静，内容说话** —— chrome 克制，游戏封面与文化图承担视觉。
2. **标题像海报，正文像说明书** —— 大 display + 短副文。
3. **每章一个 claim** —— 章节 H2 即利益/命题，不堆形容词。
4. **证明靠实体与来源** —— 杯象图解、非遗来源、FAQ，而非空洞插画墙。
5. **单一主行动色** —— 全站朱砂 CTA，对应 Notion 的单一蓝。

### 2.2 中国风气质（要 / 不要）

**要**

- 宣纸米白、缃色、墨分灰阶、朱砂一点、石青辅色、淡金线。
- 宋体展示 + 黑体正文；章节编号「〇一 / 01」并用。
- 印章角标、细栏线、极淡纸纹；留白如章法。
- 文案区分：常见说法 / 地区差异 / 本游戏设计。

**不要**

- 大红大绿满版、龙凤模板、霓虹紫渐变、Inter 英文 SaaS 默认脸。
- 把地方民俗写成唯一标准答案。
- 用在线结果替代真实仪式或人生决策建议。

### 2.3 双表面策略

| 表面 | 用途 | 底色 |
|------|------|------|
| **馆（Museum Light）** | 首页、文化页、关于、footer 默认 | 宣纸米 / 缃色 |
| **席（Altar Dark）** | 游戏运行区、部分 hero 夜场 | 漆黑褐 + 金箔点缀 |

首页可采用「上段夜场 Hero + 下文宣纸章节」，呼应 Notion hero 反转，但色相用墨金而非 indigo。

---

## 3. 信息架构

```text
/                              馆首页（Notion 章节流）
/games/shantou-jiaobei/        圣杯游玩页
/games/chaoshan-yingge/        英歌游玩页
/games/jianzhi/                剪纸游玩页
/culture/                      文化馆索引
/culture/jiaobei/              掷筊文化枢纽
/culture/jiaobei/<topic>/      掷筊长尾主题
/culture/yingge/               英歌文化枢纽
/culture/yingge/<topic>/       英歌长尾主题
/culture/jianzhi/              剪纸文化枢纽
/culture/jianzhi/<topic>/      剪纸长尾主题
/about/                        关于、娱乐声明、隐私要点
```

### 3.1 路由与 slug 约定

- 文化路径用 **语义英文 slug**（稳定、短、可 sitemap）：`jiaobei` / `yingge` / `jianzhi`。
- 中文关键词放在 `title` / `h1` / 正文 / keywords，不依赖 URL 中文。
- 静态导出：目录尾斜杠与现有 `alternates.canonical` 风格一致。

### 3.2 导航

**顶栏（全站壳）**

- Wordmark：主标 `REX GAME`，副标「趣玩民俗」（与现站一致，避免更名带来的品牌断裂）。
- 链接：展品（锚到首页三展品）· 文化馆 · 关于。
- 主 CTA：当前推荐游戏「开始游玩」。

**页脚**

- 三游戏、文化索引、三枢纽、关于、娱乐声明摘要、canonical 域名。

### 3.3 内链规则

| 从 | 到 |
|----|-----|
| 首页展品卡 | `/games/<id>/` + `/culture/<slug>/` |
| 游戏页导读 / FAQ | 对应文化枢纽与主题页 |
| 文化页 Action | 对应游戏页「现在就玩」 |
| 主题页 | 兄弟主题 + 枢纽 + 游戏 |
| 文化索引 | 全部枢纽 |

禁止：文化页无外链到不可信占卜/商业算命站。

---

## 4. 页面模板

### 4.1 T1 馆首页

顺序固定：

1. **Hero（可夜场）**：主张句 + 副文 + 主 CTA（推荐游戏）+ 次 CTA（文化馆）。
2. **三展品 bento**：封面、名称、一句话 tagline、badge、进游 / 读文化。
3. **为何在浏览器里学民俗**：3 个短 claim（在地、可玩、可查来源）。
4. **怎么玩**：摄像头可选 / 纯点击；隐私一句。
5. **文化可信**：娱乐声明 + 来源类型说明。
6. **信任条**：展品数、免费、静态可玩、本地处理等可核实事实。
7. **Footer**。

结构化数据：`WebSite` + `ItemList`（沿用并扩展现有首页 graph）。

### 4.2 T2 游戏页

- **首屏**：进游（体验优先，不把长文压在 fold 上）。
- **页内导读**（现有圣杯 `jiaobei-guide` 为范本）：
  - Quick Answer
  - 核心概念卡（杯象 / 章节 / 纹样）
  - 步骤 HowTo
  - FAQ
  - 来源
  - 链到文化枢纽「阅读完整文化页」
- 英歌、剪纸必须补齐与圣杯同级的 **可见文字 SEO 块**（不可仅游戏内解锁档案）。

### 4.3 T3 文化 SEO 页

严格顺序（SEO + GEO skill）：

1. Breadcrumb  
2. **Problem / 意图**（可选一句）  
3. **Quick Answer**（3–5 句，可被答案引擎摘录）  
4. **Action**：现在就玩（游戏 CTA）+ 本页目录锚点  
5. **展开**：定义、形制、地区差异、与游戏的关系  
6. **Examples**：术语表 / 图解列表  
7. **FAQ**  
8. **Sources**  
9. 相关阅读（内链）  

JSON-LD 最低集：

- `WebPage` + `BreadcrumbList` + `FAQPage`
- 步骤类加 `HowTo`
- 长文可加 `Article`（`dateModified`、`inLanguage: zh-CN`）

### 4.4 T4 文化馆索引 `/culture/`

- 本站定位 Quick Answer  
- 三枢纽入口卡  
- 热门主题列表  
- 如何引用本站说明（娱乐向、有来源标注）

### 4.5 T5 关于 `/about/`

- 站点目的、作者/项目归属  
- 娱乐与非决策声明（全站统一文案片段）  
- 摄像头：可选、本地处理、不上传（与圣杯页一致）  
- 联系或仓库（若公开）

---

## 5. SEO / GEO 内容规格

### 5.1 内容纪律

1. **三声部标注**：常见说法 · 地区/庙宇差异 · 本游戏互动设计。  
2. **证据等级**（沿用游戏内 culture entry 思路）：`recorded` / `oral-tradition` / `game-design`。  
3. **免责声明**：重要决定不依赖在线结果；不构成宗教/医疗/法律/财务建议。  
4. **来源**：优先博物馆、非遗网、文旅厅、教育百科等；每枢纽 ≥2 条可点击外链。  
5. **一页一主意图**：`title` / `h1` / `meta description` 对齐同一检索意图。

### 5.2 元数据模板

```text
title:       {主意图短语}（{地域或品类}）｜rex-game
description: {价值一句}。{动作一句：在线体验/了解含义}。
canonical:   /culture/.../
og:image:    专用或游戏 cover（1200×630 优先）
```

### 5.3 首批页面清单（P3–P4）

#### 枢纽（3）

| 路径 | 主意图 H1 方向 |
|------|----------------|
| `/culture/jiaobei/` | 潮汕掷筊（跋杯）是什么 |
| `/culture/yingge/` | 潮汕英歌是什么 |
| `/culture/jianzhi/` | 中国剪纸入门与在线体验 |

#### 掷筊长尾（首批 3）

| slug | 主意图 |
|------|--------|
| `sheng-yin-xiao` | 圣杯、阴杯、笑杯分别是什么意思 |
| `how-to-read` | 掷筊怎么看正反面与杯象 |
| `online-vs-ritual` | 在线掷筊与真实仪式的区别 |

#### 英歌长尾（首批 2）

| slug | 主意图 |
|------|--------|
| `rhythm-and-formation` | 英歌的鼓点节奏与队形 |
| `faces-and-roles` | 英歌脸谱与角色表达（标注流传说法） |

#### 剪纸长尾（首批 2）

| slug | 主意图 |
|------|--------|
| `fold-and-cut` | 对称折剪基本法 |
| `auspicious-motifs` | 吉祥纹样与吉语 |

**首批合计**：索引 1 + 枢纽 3 + 长尾 7 + 关于 1 = **12 个新内容路由**（另含首页与 3 游戏页改造）。

后续迭代可再加：跋杯礼序、三次投掷设计说明、南北剪纸差异专页等。

### 5.4 内容来源映射（实现时复用）

| 主题 | 优先复用 |
|------|----------|
| 圣杯 | `src/games/shantou-jiaobei/content/culture.ts`、`faq.tsx` |
| 英歌 | `src/games/chaoshan-yingge/content/chapters.ts` 中 `YINGGE_CULTURE_ENTRIES` |
| 剪纸 | `src/games/jianzhi/content/culture.ts`、`motifs.ts`、`lessons.ts` 公开可述部分 |

游戏内解锁档案可继续存在；**公网 SEO 页必须有独立可爬取 HTML 正文**，不得依赖客户端解锁。

### 5.5 Sitemap 与 robots

- `app/sitemap.ts` 枚举：首页、about、culture 索引、全部枢纽与主题、全部游戏。
- `changeFrequency`：文化页 `monthly`，游戏/首页 `weekly`。
- `priority`：首页 1.0，游戏 0.9，枢纽 0.8，主题 0.7，about 0.5。
- `lastModified`：内容更新时同步改日期。
- robots 保持允许抓取 + sitemap URL。

### 5.6 GEO 固定块（每文化页必有）

1. Quick Answer 段落（纯文本，非仅图）  
2. 术语定义列表（dt/dd 或表格）  
3. FAQ ≥4 条  
4. 来源列表  
5. 对应 JSON-LD  

---

## 6. 设计系统要点

完整 token 与组件见根目录 **`DESIGN.md`**（本规格的视觉真源）。实现时：

- CSS 变量与 `DESIGN.md` 对齐；营销页默认 Museum Light。  
- 现有 `globals.css` 漆金 token **保留给席（游戏暗场）**，不删，可 namespaced 或双主题 class（如 `data-theme="museum" | "altar"`）。  
- 字体维持：Noto Serif SC + Noto Sans SC（可后续本地化托管）。

### 6.1 组件清单（实现最小集）

- `SiteHeader` / `SiteFooter`  
- `HeroBand`（明/暗变体）  
- `ExhibitCard`（三展品）  
- `SectionHeader`（编号 + claim）  
- `QuickAnswer`  
- `CultureTermGrid`  
- `FaqList`（含 JSON-LD 生成 helper）  
- `SourceList`  
- `PlayCta` / `SecondaryCta`  
- `Breadcrumb`  
- `TrustStrip`  

### 6.2 动效

- 克制：入场 stagger fade/rise、hover 金线/阴影，无炫技粒子墙。  
- 尊重 `prefers-reduced-motion`。

---

## 7. 视觉生产（交付 4）

### 7.1 首批 6 张横向 section 参考图

1. 首页 Hero（夜场墨金）  
2. 三展品 bento（宣纸）  
3. 文化枢纽页首屏（Quick Answer + CTA）  
4. 主题 SEO 文页中段版式  
5. 游戏页与下方导读衔接  
6. 移动端首页折叠  

### 7.2 使用方式

- 图为方向锚，非像素级强制。  
- 实现以 `DESIGN.md` token 为准；冲突时 **token 优先**，更新 spec 备注。

---

## 8. 技术约束

- **框架**：Next.js App Router，现有 static export 流程不变。  
- **内容组织建议**：
  - `src/content/culture/`：枢纽与主题的结构化 MD/TS 数据（title、slug、quickAnswer、sections、faq、sources、related、gameHref）。  
  - `app/culture/.../page.tsx`：薄路由，渲染共享 `CulturePage` 模板。  
- **SEO helpers**：共享 `buildFaqJsonLd`、`buildBreadcrumbJsonLd`、`buildWebPageJsonLd`。  
- **测试**：
  - 单元：内容字段完整性（每页必有 quickAnswer、faq≥4、sources≥1、canonical）。  
  - 构建：sitemap URL 列表与注册表一致。  
  - 不强制 e2e 爬虫；手动抽查 title/h1 一致。

---

## 9. 分阶段交付

| 阶段 | 交付物 | 验收 |
|------|--------|------|
| **P0** | 本 spec + `DESIGN.md` 中国风系统 | 用户确认 |
| **P1** | 6 张 section 视觉参考（存 `docs/` 或 `aios/temp/`） | 用户确认方向 |
| **P2** | 全站壳 + 首页 T1 重设计 | 视觉与 IA |
| **P3** | `/culture`、三枢纽、`/about`；游戏页 SEO 块对齐 | 内容与 JSON-LD |
| **P4** | 7 个长尾主题 + sitemap/内链 | 收录覆盖 |
| **P5** | 游戏壳与导读皮肤统一；reduced-motion 与移动端 | 全站一致 |

阶段依赖：P0 → P1 → P2 →（P3 ∥ 部分 P5 导读）→ P4 → P5 收尾。

---

## 10. 风险与缓解

| 风险 | 缓解 |
|------|------|
| 文化表述不当或过度绝对 | 三声部 + 证据等级 + 免责声明 |
| 暗场游戏与宣纸站割裂 | 双表面策略写进 DESIGN.md；共用字族与朱砂 CTA |
| 内容页变成关键词堆砌 | 一页一意图；FAQ 自然语言；禁用隐藏关键词 |
| 静态导出路由遗漏 | 内容注册表单一来源驱动 pages + sitemap |
| 范围膨胀 | 首批 12 内容路由封顶；其余列 backlog |

---

## 11. 明确决策记录

| 议题 | 决策 |
|------|------|
| 路径 | B 分层流水线 |
| 营销站 | 首页即营销站，不拆第二站 |
| 默认主题 | 馆 = 宣纸明色；席 = 漆金暗场 |
| CTA 色 | 朱砂唯一主色 |
| 文化 URL | 英文语义 slug |
| 首批长尾 | 掷筊 3 + 英歌 2 + 剪纸 2 |
| 视觉 | P1 先图后大面积实现 |
| 游戏玩法 | 本规格不改核心逻辑 |

---

## 12. 开放 backlog（不在首批）

- 更多长尾（跋杯礼序、南北剪纸专论、英歌地域谱系）。  
- 字体本地化自托管。  
- OG 图按页自动生成。  
- 中英双语。  
- 搜索页 / 站内全文检索。

---

## 13. 参考

- Notion 结构参考：`docs/notion-design-reference.md`  
- 视觉与组件真源：`DESIGN.md`  
- 现有圣杯 SEO 范本：`app/games/shantou-jiaobei/page.tsx`  
- SEO/GEO 流程：项目 skill `seo-geo-page-optimization`  
