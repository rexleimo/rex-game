### Changed (山海问兽 · 遭遇战加料：告别整山同种)
- **发牌保种类**：野生池加权洗牌＋首轮各一张，一山之内物种轮着出（堂庭再无整山白猿）；数量 2/3/4→3/4/5，每山末位固定一只「异种」（高 2 级）。
- **结群仇恨**：惊一只，340px 内同伴齐上，野外打群架；配野兽小血条（开打露头）＋伤害飘字，打多疼一眼见。
- `tests/shanhai-action.test.ts`：密度底线/种类全覆盖/压轴异种共 26 项。

### Changed (山海问兽 · Kenney CC0 覆盖包上线)
- **美术换人类手绘**：`scripts/apply-kenney-override.mjs` 把 Kenney New Platformer Pack 1.1（CC0）合成为 `override/` 68 文件并启用——主角 27 帧（黄衣人真行走/跳/攀爬帧＋木杖）、8 兽真两帧（虫×2/鱼×2/鼠/蜗牛/蜂/蝇，赤鱬由黄鱼转赤）、6 种地形砖按山复用、Kenney 水/火把/门祠/碑石/菇/玉/牌；代码零改动（同名同切片）。
- **有依据的保留**：猿×2/马/羊/狐（Kenney 无对应侧视物种）与三层视差山（十山调色板即辨识度）沿用自产，`tests/shanhai-assets.test.ts` 锁 68 文件完整性；源文件 vendor 于 `resources/kenney-src/`（73KB＋LICENSE）。
- 修 `resolveAssetBase` 无视 `disabled`/license 的劫持 bug（示例清单即切空包），加 `manifestUsable` 门控与 4 项单测。

### Changed (山海问兽 · 界面美化与关卡重构)
- **像素素材整体替换**：新增 `scripts/gen-wenshou-pixels.mjs`（SVG 低分辨率渲染 → 调色板量化 → 最近邻放大），产出 68 张 PNG 入库 `public/assets/shanhai-wenshou/pixel/`——主角 27 帧精灵表（12 态动画）、13 兽 ×2 帧、每山地块/平台/水面/三层阶梯视差山、界碑/山祠/祠灯/拾取物；Phaser 改走 spritesheet 帧动画，彻底替换运行时矢量画布。
- **跳跃与操作修复**：满跳高度 90→145px（vy -660），W/↑/空格均可跳跃，新增 7 帧土狼时间；采集径平台改为 ≤110px 步距 + 补踏板，消除"跳不上去卡住"。
- **知识机关门（知识点入关）**：每山一道原文锚机关——招摇「食之不饥」（持祝余过荒径）、堂庭「多水玉黄金」（拾玉开金）、杻阳「其音如判木」（弹反判木锣两响）、亶爰「以静制动」（收杖静立五息）、基山「佩之不迷」（需迷榖枝，跨山知识联动）、箕尾潮门（观潮得其隙）、无名「名缚」（收服满三）等 7 类机制；另有荆棘带 6 山、野生兽密度按山序 2→3→4 爬坡。
- `scripts/gen-wenshou-pixels.mjs` 与关卡机关测试入 `tests/shanhai-action.test.ts`（总 313 项全绿）。

### Added (山海问兽 · 终局内容与二周目)
- **委托板**（藏馆「闻」拍）：每山 3 条确定性村民委托（寻物交货 / 清巢计数 / 界碑拓印），交割得金玉·材料·山望·经验，进度入存档。
- **引文拓印**：图志新增「引文」页——13 兽句 + 10 山段 + 10 祠礼 + 1 卷首共 34 条原文逐条点亮（收服/祭成），收集完成度入图鉴。
- **佩饰三槽**（GDD §3.3 Build 深度）：`charms[]` 存档字段，旧档 `charm` 自动迁移；派生属性三槽叠算。
- **隐藏 boss ×2**：杻阳祭后重访见「谣音之主 · 狂化鹿蜀」；通卷（或二周目）后无名崖底高台见「初齿」——皆可问名。
- **二周目（NG+）**：通关后卷首出现「二周目 · 重问十山」——保留等级/图鉴/兽伴/佩饰，山、瘴、委托、拓印重置，全兽等级 +5/周目强化；开场与终笔差分节拍。
- **差分结局**：终章按驯向指数与山望总和选「万兽同行 / 问名者 / 无名之刃」三款终笔，二周目固定 NG 终笔。
- `tests/shanhai-endgame.test.ts`：委托/拓印/结局/三槽/隐藏 boss 共 12 项单测（总 311 项全绿）。

## Unreleased

### Changed
- **《山海问兽》重构为 2.5D 横版动作 RPG**（按 `docs/gdd/山海问兽_GDD_v1.0_动作RPG.md`）：
  - 新增 Phaser 3 实时动作层 `src/games/shanhai-wenshou/action/*`：玩家 12 态状态机（轻攻三连/蓄力重击/翻滚无敌帧/识破弹反/攀爬）、60fps 固定步长模拟、8 帧输入缓冲、顿帧/震屏/墨粒打击感、前瞻跟随摄像机。
  - 13 兽各 3 招的招式表（预备可读 20–44 帧 + 部位红闪 + 声兆音色），识破三印（形/声/性）→ 问名收服 或 了断取材（材料×2、山望−1），山望入存档。
  - 十山五拍关卡（山脚村→采集径→变奏段→精英门→山祠）：瘴雾（猿翼）、水域（柢山/箕尾）、夜战（基山/青丘）、攀爬崖径（猿翼/亶爰）等地形变奏，布局确定性生成。
  - 程序化水墨美术（视差山脊/剪纸兽/笔触人物，零外部素材，见 `docs/CREDITS-shanhai.md`）与 WebAudio 程序化音效（每兽一声兆签名）。
  - 键鼠 + 触屏双操作（左摇杆 + 攻/重/滚/挡/跳），简明/标准/辅助三档难度（弹反窗口、问名血线、识破层数要求分档）。
  - 主线去答题化：祠祭小考与十问大祭退役（GDD「三不做」第一条），改为 boss 杀/驯抉择 + 三献礼祭山仪式；十山卷轴地图承当进度与快速旅行。
  - 存档 v1 兼容新增 `favor`（山望）字段；`questions.ts` 退役为图鉴彩蛋数据（题库锚测试保留）。
- 首页展品与游戏注册表的《山海问兽》标签由「回合制」更新为「动作 RPG」。

### Added
- `tests/shanhai-action.test.ts`：帧数据/招式表/识破规则/关卡完整性 21 项单测。
- `scripts/shot-wenshou-action.mjs`、`probe-*.mjs`：动作版视觉验收与玩法端到端探针（本地）。

# Changelog

## Unreleased

### Added
- 新展品 **山海问兽**（`/games/shanhai-wenshou/`）：回合制问兽 RPG。沿《山海经·南山经》鹊山首脉走完十座山（招摇→箕尾 + 失载的第十山），探索采集、回合制战斗、「问兽」答题识破、驯化收服、佩饰炼制、祠祭升级与终章祭山大典。全部引文逐字取自《南山经》原文并由测试锚定；「狂化」「瘴化」标注为游戏化演绎。
- 全站日课基建 `src/core/daily/`：本地日期播种的确定性随机（xmur3+mulberry32）、连击账本（`rex-game:daily:v1`）、节气日期表（香港天文台 2024–2030，`scripts/generate-solar-terms.mjs` 生成）。山海问兽「巡山 · 今日一遇」为首个接入展品（`?mode=daily` 深链可达）。
- 文化护照收录第七件展品：山海问兽 5 张卡（初契 / 招摇问道 / 青丘识狐 / 鹊山图志 / 十山大祭）。
- 甲骨问契的「今日三契」存档口径不变；护照游戏序与展品序重排，山海问兽列首。

### Changed
- 首页护照条「五件展品」改为动态展品数；展品列表新增 No.07 馆藏号与山海问兽glyph；信任条展品数更新为 7。
- tests/passport.test.ts 的 localStorage stub 补齐 Storage 接口，消除既有 @ts-expect-error 噪音。

### Added
- Privacy-first analytics core (`src/core/analytics/`): provider-agnostic adapter for GA4/umami/plausible, six funnel events (`game_open` / `game_start` / `step_complete` / `game_finish` / `share_click` / `culture_click`), pre-load event queue, DNT + GPC opt-out, no-op when unconfigured.
- `scripts/assets-audit.mjs` — classifies every file in `public/` as runtime-referenced, build-only, or orphaned; `pnpm assets:check` fails CI on the latter two.
- CI now runs the test suite and the asset audit before building.

### Changed
- Moved 25 AI image-generation source PNGs (44.9 MB) out of `public/` into `resources/yingge-src/`; they were shipped to Pages despite never being requested by the browser. Deploy payload dropped from 80 MB to 35 MB.
- Homepage jiaobei cover now uses a 17 KB WebP instead of the 628 KB PNG (the PNG stays for OG cards).
- Extracted jiaobei `verdict()` into `core/verdict.ts` so the result screen and the finish event share one judgement.
- README rewritten: it documented one game and Gitee Pages; the site has five games and deploys to GitHub Pages.

### Removed
- Four orphaned assets unreferenced since the initial deploy (`cover.png`, `cup_sheng/xiao/yin.png`).

## 0.5.0 - 2026-07-25

### Added
- New game **二十四节气 · 农时拼图** (`/games/ershisi-jieqi/`): season/year sort, phenology memory match, quiz, and 24-term codex with local progress.
- Culture hub `/culture/jieqi/` and homepage exhibit registration.

## 0.3.0 - 2026-07-20

### Added
- Museum Light site shell (header/footer) and Notion-style homepage with three-exhibit bento.
- Culture SEO/GEO cluster: `/culture/`, three hubs, seven long-tail topics, `/about/`.
- Shared culture content registry, JSON-LD helpers, and game-page FAQ links into culture hubs.
- Design system `DESIGN.md` (museum/altar dual surface) and section reference boards under `docs/design-refs/`.

### Changed
- Sitemap enumerates culture and about routes; site-wide metadata covers all three games.

## 0.2.0 - 2026-07-17

### Added
- Added distinct lacquered and wooden jiaobei face renders with visible face legends.
- Added local Chinese incense burner and lotus candle stand GLB assets with resilient fallback loading.
- Added shared Chaoshan jiaobei culture definitions for the interactive intro, guide, FAQ, and structured content.
- Added asset, camera, material, physics, and UI regression coverage.

### Changed
- Stabilized the cinematic altar camera around a wide establishing composition.
- Improved the wooden underside, silk material, landing-area lighting, and contact shadows.
- Expanded page SEO/GEO content, metadata, sitemap, robots, and cultural quick answers.
