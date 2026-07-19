---
version: alpha
name: rex-game-chinese-museum
description: >
  Playable folk-culture museum. Notion-like quiet product narrative meets
  Chinese scholar-object aesthetics — xuan-paper canvas, cinnabar single CTA,
  Song display + Hei body, restrained seal marks and hairline gold. Dual
  surfaces: Museum Light (marketing/culture) and Altar Dark (game immersion).
---

# rex-game DESIGN.md

**Source of truth for UI.** Structure inspired by Notion marketing IA; material language is Chinese paper & lacquer, not Western SaaS chrome.

Related: `docs/superpowers/specs/2026-07-20-chinese-style-site-seo-geo-design.md`, `docs/notion-design-reference.md`.

---

## Overview

rex-game should feel like a **well-lit side hall in a cultural museum** that happens to contain playable exhibits — not a carnival temple skin, and not a purple-gradient AI template.

- **Museum Light** is the default for home, culture SEO pages, about, and chrome: warm off-white paper, ink-brown type, one cinnabar action color.
- **Altar Dark** is reserved for game runtimes and optional hero night bands: lacquer brown-black, foil gold hairlines, paper-cream type on dark.
- Personality comes from **typography scale, paper texture, and exhibit photography** — decoration (seals, faint wave grain) stays sparse.
- Follow Notion’s discipline: **one primary action color**, large poster headlines, short claims per section, real content (covers, term grids, sources) over ornament.

---

## Colors

### Museum Light (default site chrome)

```yaml
colors:
  # Action — single confident primary (Notion blue → 朱砂)
  primary: "#B22C25"           # cinnabar / 印泥
  primary-hover: "#96241E"
  primary-pressed: "#7A1D18"
  on-primary: "#FFF8F0"

  # Canvas
  canvas: "#F7F1E6"            # 宣纸米
  canvas-soft: "#EFE6D4"       # 缃 / 略旧纸
  surface: "#FFFCF6"           # 卡片亮面
  surface-elevated: "#FFFFFF"

  # Ink scale (墨分)
  ink: "#1A120B"               # 近墨
  ink-secondary: "#2A1B12"
  ink-muted: "#6E5A46"
  ink-faint: "#8A7358"
  hairline: "rgba(42, 27, 18, 0.12)"
  hairline-strong: "rgba(42, 27, 18, 0.22)"

  # Accents (decorate only — never replace primary CTA)
  accent-gold: "#C9A24B"       # 古铜金
  accent-gold-bright: "#E4C479"
  accent-cyan: "#3D6B73"       # 石青（链接次级 / 标签）
  accent-bamboo: "#5F8A64"     # 竹青（圣杯等语义）
  accent-ochre: "#B8863A"      # 赭（笑杯等）
  accent-indigo: "#455F79"     # 黛（阴杯等）

  # Semantic
  focus-ring: "#B22C25"
  success: "#5F8A64"
  warning: "#B8863A"
  danger: "#96241E"
```

### Altar Dark (games + optional hero)

```yaml
colors_altar:
  bg: "#17100B"
  bg-soft: "#23160F"
  surface-paper: "#F4ECD8"
  text-invert: "#F4ECD8"
  text-invert-muted: "rgba(244, 236, 216, 0.68)"
  gold: "#C9A24B"
  gold-bright: "#E4C479"
  cinnabar: "#A6332B"
  line-gold: "rgba(201, 162, 75, 0.55)"
  line-gold-strong: "rgba(201, 162, 75, 0.92)"
```

Map Altar tokens to existing `globals.css` lacquer variables; do not delete them.

### CSS variable mapping (implement)

```css
/* data-theme="museum" | default on html for culture/home */
--c-primary: #b22c25;
--c-canvas: #f7f1e6;
--c-canvas-soft: #efe6d4;
--c-surface: #fffcf6;
--c-ink: #1a120b;
--c-ink-muted: #6e5a46;
--c-hairline: rgba(42, 27, 18, 0.12);
--c-gold: #c9a24b;
--c-cyan: #3d6b73;

/* data-theme="altar" body/game roots keep current --c-bg etc. */
```

---

## Typography

```yaml
typography:
  font-display: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
  font-body: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"

  display-hero:
    fontFamily: display
    fontSize: clamp(2.75rem, 6vw, 4.75rem)
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: -0.03em
    color: ink

  display-section:
    fontFamily: display
    fontSize: clamp(1.75rem, 3.5vw, 2.5rem)
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.02em

  heading-card:
    fontFamily: display
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.3

  body-lg:
    fontFamily: body
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.75
    color: ink-muted

  body-md:
    fontFamily: body
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7

  body-sm:
    fontFamily: body
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
    color: ink-muted

  eyebrow:
    fontFamily: body
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.16em
    textTransform: none  # 中文不用 uppercase 硬套
    color: primary or gold

  button:
    fontFamily: body
    fontSize: 0.9375rem
    fontWeight: 600
    letterSpacing: 0.04em
```

**Rules**

- Hero/section titles use **display Song**; UI chrome and long FAQ use **body Hei**.
- Avoid Inter / Roboto / generic English SaaS stacks as primary.
- Max measure for reading columns: ~36–40rem; Quick Answer ≤ ~42rem.

---

## Spacing & radius

```yaml
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  section-y: clamp(4rem, 10vw, 7.5rem)
  page-x: clamp(1rem, 4vw, 4.5rem)
  max-width: 1120px
  max-width-wide: 1280px

rounded:
  sm: 6px      # inputs, small chips
  md: 10px     # cards (slightly squarer than Notion — 器物感)
  lg: 14px     # feature panels
  full: 9999px # primary CTA pills only

shadow:
  card: "0 12px 40px -20px rgba(26, 18, 11, 0.18)"
  soft: "0 4px 16px -8px rgba(26, 18, 11, 0.12)"
```

---

## Layout patterns

### Notion-like section rhythm

Each marketing section:

1. Optional **eyebrow** (〇一 / 文化馆)
2. **Claim H2** (one sentence)
3. Short lead (1–2 lines)
4. Content block (grid, terms, quotes, covers)
5. Optional text link or secondary CTA

Vertical padding: `section-y`. Horizontal: centered `max-width` + `page-x`.

### Home chapter order (fixed)

1. Hero  
2. Three exhibits bento  
3. Why browser folklore  
4. How to play  
5. Trust / sources ethos  
6. Trust strip metrics  
7. Footer  

### Culture SEO page order (fixed)

1. Breadcrumb  
2. Quick Answer  
3. Action CTAs  
4. Body sections  
5. Term / example grid  
6. FAQ  
7. Sources  
8. Related links  

---

## Components

### SiteHeader

- Background: `canvas` / translucent paper; blur optional.
- Height ~56–64px; bottom hairline.
- Wordmark: display or tracked sans, ink or gold on altar hero overlay.
- Nav links: `body-sm`, ink-muted → ink hover.
- Primary CTA: pill cinnabar.

### SiteFooter

- Background: `canvas-soft`.
- Multi-column: 展品 / 文化 / 关于.
- Disclaimer one-liner + domain.
- No heavy ornament.

### Button primary

- bg `primary`, text `on-primary`, radius `full`, padding 12px 22px.
- Hover: `primary-hover`; focus-visible: 2px ring cinnabar offset 2px.

### Button secondary

- bg transparent or `surface`, border hairline-strong, text ink.
- Radius `full` or `md`.

### ExhibitCard

- Surface white/paper, radius `md`, shadow `card`, padding `lg`.
- Cover 16:10 or 4:3; title display; tagline body-sm.
- Badge: small seal-like chip (cinnabar wash or gold outline) — not neon.
- Footer actions: 开始游玩 (primary text link or button) · 读文化.

### SectionHeader

- Grid: index (〇一 or 01) in gold/cinnabar eyebrow + title stack.
- Claim is the H2; no decorative dragon dividers.

### QuickAnswer

- Soft surface or left gold hairline bar.
- Label:「快速回答」eyebrow.
- 3–5 sentences body-lg; plain text first for GEO.

### CultureTermGrid

- 2–3 columns; each term: strong name + short meaning.
- Semantic colors only for jiaobei signs (bamboo/ochre/indigo).

### FaqList

- Disclosure or stacked Q/A; questions heading weight 600.
- Answers body-md, ink-muted.
- Must sync with FAQPage JSON-LD.

### SourceList

- Ordered or bulleted external links; open in new tab with `rel="noopener noreferrer"`.
- Prefer museums / ihchina / gov culture sites.

### PlayCta

- Always visible near Quick Answer on culture pages.
- Label pattern:「现在体验：{游戏名}」.

### Breadcrumb

- body-sm; separators `·` or `/`; current page not a link.

### TrustStrip

- Horizontal metrics; large tabular numbers + short labels.
- Only factual claims (exhibit count, free, local camera, etc.).

### HeroBand (altar variant)

- bg altar, type paper-cream, gold hairlines.
- Optional faint radial gold/cinnabar wash (already in globals).
- CTAs: primary cinnabar solid + secondary ghost on paper stroke.

---

## Texture & decoration (restraint)

**Allowed**

- 2–4% noise or paper grain overlay on canvas (CSS or SVG).
- 1px gold or ink hairlines.
- Small square seal mark as badge (unicode or SVG), low frequency.
- Numbered section indices.

**Forbidden**

- Full-bleed red temple wallpaper.
- Animated dragons, particle confetti, purple AI gradients.
- Drop shadows heavier than `shadow.card` on every box.
- Stock “oriental” clipart borders on SEO reading pages.

---

## Motion

```yaml
motion:
  duration-fast: 150ms
  duration-med: 280ms
  ease: cubic-bezier(0.22, 1, 0.36, 1)
  enter: fade-up 12px, staggered 40–60ms
```

- Hover: translateY(-2px) or border-color gold on cards.
- Honor `prefers-reduced-motion: reduce` → no transform entrance.

---

## Accessibility

- Body text on paper: ink on canvas contrast ≥ 4.5:1.
- Cinnabar buttons: use `on-primary` cream, not pure yellow on red without check.
- Focus visible on all interactive elements.
- Touch targets ≥ 44px where possible.
- `lang="zh-CN"` on html; meaningful alt on exhibit images.

---

## SEO / GEO content chrome (visual)

Culture pages are **documents**, not landing-page noise:

- Reading width constrained.
- H1 once; H2 for sections.
- Quick Answer above the fold on desktop when possible.
- FAQ visually distinct but not collapsible-only without SSR text (content must exist in HTML).

---

## Do / Don’t

| Do | Don’t |
|----|--------|
| One cinnabar CTA language sitewide | Multiple competing neon CTAs |
| Song for claims, Hei for UI/FAQ | All-Inter or all-kai-calligraphy body |
| Cite sources under culture claims | Absolute “神明确切旨意” copy |
| Dual theme museum/altar with shared fonts | Unrelated third pastel theme |
| Notion section claims | Feature-grid lorem without narrative |

---

## Implementation notes

1. Prefer `data-theme="museum"` on culture/home layouts; game routes set altar on runtime root.
2. Shared components live under `src/components/site/` (or equivalent).
3. Culture content data drives pages + sitemap from one registry.
4. When redesigning, **match this file first**; section mock images are directional only.

---

## Version

- `alpha` — approved direction 2026-07-20; refine after P1 visual review.
