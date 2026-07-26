# Changelog

## Unreleased

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
