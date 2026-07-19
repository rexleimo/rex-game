# Chinese-Style Site + Culture SEO/GEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Notion-structured, Chinese museum-aesthetic full site for rex-game with dual surfaces (Museum Light / Altar Dark), shared chrome, and a crawlable culture SEO/GEO content cluster for 圣杯 / 英歌 / 剪纸.

**Architecture:** Single static Next.js export site. Culture pages are data-driven from `src/content/culture/` (one registry → routes + sitemap). Shared UI under `src/components/site/`. Museum theme is default for marketing/culture; game runtimes keep Altar Dark. SEO helpers build FAQ/Breadcrumb/WebPage JSON-LD. No game-physics changes.

**Tech Stack:** Next.js 15 App Router (`output: 'export'`, `trailingSlash: true`), React 19, TypeScript, CSS modules / global CSS variables, Node test runner (`node --test`), domain `https://game.rexai.top`.

**Spec:** `docs/superpowers/specs/2026-07-20-chinese-style-site-seo-geo-design.md`  
**Design system:** `DESIGN.md`  
**Notion IA reference only:** `docs/notion-design-reference.md`

## Global Constraints

- Static export only — no SSR-only APIs; all culture routes must be pre-renderable.
- Trailing slashes on all public URLs (match `next.config.mjs`).
- Dual surface: Museum Light default for home/culture/about; Altar Dark for game runtime roots.
- Single primary CTA color: cinnabar `#B22C25` (museum) / existing lacquer red on altar.
- Wordmark: primary `REX GAME`, subtitle `趣玩民俗`.
- Culture URL slugs: English only (`jiaobei` | `yingge` | `jianzhi` + topic slugs below).
- Content voice: 常见说法 / 地区差异 / 本游戏设计 — never absolute divine authority; entertainment disclaimer required.
- Do not modify Babylon/Phaser/canvas core gameplay logic.
- Tests: `pnpm test` or `npm test` → `node --experimental-strip-types --test tests/*.test.ts`.
- Commits: small, conventional (`feat:`, `test:`, `style:`, `docs:`).

### Locked first-batch culture routes

| Path | Kind |
|------|------|
| `/culture/` | index |
| `/culture/jiaobei/` | hub |
| `/culture/jiaobei/sheng-yin-xiao/` | topic |
| `/culture/jiaobei/how-to-read/` | topic |
| `/culture/jiaobei/online-vs-ritual/` | topic |
| `/culture/yingge/` | hub |
| `/culture/yingge/rhythm-and-formation/` | topic |
| `/culture/yingge/faces-and-roles/` | topic |
| `/culture/jianzhi/` | hub |
| `/culture/jianzhi/fold-and-cut/` | topic |
| `/culture/jianzhi/auspicious-motifs/` | topic |
| `/about/` | about |

---

## File map (create / modify)

| Path | Responsibility |
|------|----------------|
| `src/content/culture/types.ts` | Culture page types |
| `src/content/culture/registry.ts` | All hubs + topics + index helpers |
| `src/content/culture/pages/*.ts` | Per-page content bodies (optional split; registry may import) |
| `src/content/site.ts` | Site-wide disclaimer, trust metrics, nav links |
| `src/core/seo/jsonld.ts` | JSON-LD builders |
| `src/components/site/SiteHeader.tsx` | Global nav |
| `src/components/site/SiteFooter.tsx` | Global footer |
| `src/components/site/HeroBand.tsx` | Home/culture heroes |
| `src/components/site/ExhibitCard.tsx` | Game cards |
| `src/components/site/SectionHeader.tsx` | Numbered section titles |
| `src/components/site/QuickAnswer.tsx` | GEO quick answer block |
| `src/components/site/CultureTermGrid.tsx` | Term cards |
| `src/components/site/FaqList.tsx` | FAQ UI |
| `src/components/site/SourceList.tsx` | External sources |
| `src/components/site/PlayCta.tsx` | CTA to game |
| `src/components/site/Breadcrumb.tsx` | Breadcrumbs |
| `src/components/site/TrustStrip.tsx` | Metrics strip |
| `src/components/site/CultureDocument.tsx` | Full T3 template |
| `src/components/site/JsonLd.tsx` | Script tag helper |
| `src/styles/museum.css` | Museum theme + site chrome |
| `src/styles/globals.css` | Keep altar tokens; add theme hooks |
| `app/layout.tsx` | Import museum CSS; optional theme default |
| `app/page.tsx` | T1 home redesign |
| `app/about/page.tsx` | About |
| `app/culture/page.tsx` | Culture index |
| `app/culture/[hub]/page.tsx` | Hub pages (static params) |
| `app/culture/[hub]/[topic]/page.tsx` | Topic pages |
| `app/sitemap.ts` | Enumerate all routes from registry |
| `app/games/*/page.tsx` | Align SEO blocks + links to culture |
| `tests/culture-content.test.ts` | Registry completeness |
| `tests/seo-jsonld.test.ts` | JSON-LD shape |
| `tests/sitemap-routes.test.ts` | Sitemap coverage via registry |
| `docs/design-refs/` | P1 section mock images (optional paths) |

---

### Task 1: Culture content types + empty registry contract (TDD)

**Files:**
- Create: `src/content/culture/types.ts`
- Create: `src/content/culture/registry.ts` (stubs with one minimal hub for compile)
- Create: `tests/culture-content.test.ts`
- Create: `src/content/site.ts`

**Interfaces:**
- Produces:
  - `export type CultureHubId = 'jiaobei' | 'yingge' | 'jianzhi'`
  - `export type EvidenceLevel = 'recorded' | 'oral-tradition' | 'game-design'`
  - `export interface FaqItem { question: string; answer: string }`
  - `export interface SourceLink { name: string; href: string }`
  - `export interface CultureTerm { name: string; meaning: string; evidence?: EvidenceLevel }`
  - `export interface CultureSection { id: string; title: string; paragraphs: string[] }`
  - `export interface CulturePage { kind: 'hub' | 'topic'; hub: CultureHubId; slug: string; path: string; title: string; description: string; h1: string; keywords: string[]; quickAnswer: string[]; sections: CultureSection[]; terms?: CultureTerm[]; faq: FaqItem[]; sources: SourceList[]; relatedPaths: string[]; gameHref: string; gameName: string; dateModified: string; howToSteps?: { name: string; text: string }[] }`
  - `export function listCulturePages(): CulturePage[]`
  - `export function getCulturePage(hub: string, topic?: string): CulturePage | undefined`
  - `export function listCultureHubs(): CulturePage[]`
  - `export const SITE_DISCLAIMER: string`
  - `export const SITE_ORIGIN = 'https://game.rexai.top'`

- [ ] **Step 1: Write the failing test**

Create `tests/culture-content.test.ts`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { listCulturePages, getCulturePage, listCultureHubs } from '../src/content/culture/registry.ts';
import { SITE_DISCLAIMER, SITE_ORIGIN } from '../src/content/site.ts';

const REQUIRED_PATHS = [
  '/culture/jiaobei/',
  '/culture/jiaobei/sheng-yin-xiao/',
  '/culture/jiaobei/how-to-read/',
  '/culture/jiaobei/online-vs-ritual/',
  '/culture/yingge/',
  '/culture/yingge/rhythm-and-formation/',
  '/culture/yingge/faces-and-roles/',
  '/culture/jianzhi/',
  '/culture/jianzhi/fold-and-cut/',
  '/culture/jianzhi/auspicious-motifs/',
];

test('SITE_ORIGIN and disclaimer are set', () => {
  assert.equal(SITE_ORIGIN, 'https://game.rexai.top');
  assert.ok(SITE_DISCLAIMER.includes('娱乐') || SITE_DISCLAIMER.includes('文化'));
});

test('registry lists all first-batch culture pages with SEO minimums', () => {
  const pages = listCulturePages();
  const paths = new Set(pages.map((p) => p.path));
  for (const path of REQUIRED_PATHS) {
    assert.ok(paths.has(path), `missing ${path}`);
  }
  for (const page of pages) {
    assert.ok(page.quickAnswer.length >= 3, `${page.path} needs ≥3 quickAnswer sentences`);
    assert.ok(page.faq.length >= 4, `${page.path} needs ≥4 FAQ`);
    assert.ok(page.sources.length >= 1, `${page.path} needs sources`);
    assert.ok(page.h1.length > 0);
    assert.ok(page.description.length >= 40);
    assert.ok(page.gameHref.startsWith('/games/'));
    assert.match(page.dateModified, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(listCultureHubs().length, 3);
});

test('getCulturePage resolves hub and topic', () => {
  const hub = getCulturePage('jiaobei');
  assert.ok(hub);
  assert.equal(hub.kind, 'hub');
  const topic = getCulturePage('jiaobei', 'sheng-yin-xiao');
  assert.ok(topic);
  assert.equal(topic.path, '/culture/jiaobei/sheng-yin-xiao/');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types --test tests/culture-content.test.ts`  
Expected: FAIL (module not found or missing paths)

- [ ] **Step 3: Implement types + site constants + full registry content**

`src/content/site.ts`:

```ts
export const SITE_ORIGIN = 'https://game.rexai.top';

export const SITE_DISCLAIMER =
  '本站为文化展示与互动娱乐，不构成宗教、医疗、法律、财务或人生决策建议。地方称法、礼序与判读可能不同，请以当地传统为准。';

export const SITE_NAV = [
  { href: '/#exhibits', label: '展品' },
  { href: '/culture/', label: '文化馆' },
  { href: '/about/', label: '关于' },
] as const;
```

`src/content/culture/types.ts` — full types as in Interfaces above (`SourceList` → use `SourceLink[]` named `sources`).

`src/content/culture/registry.ts` — implement all 10 pages with real Chinese copy:

- Reuse meanings from `src/games/shantou-jiaobei/content/culture.ts` + `faq.tsx` for jiaobei.
- Reuse themes from `YINGGE_CULTURE_ENTRIES` for yingge.
- Reuse themes from `JIANZHI_CULTURE_ENTRIES` / public guide text for jianzhi.
- Every page: `quickAnswer` 3–5 sentences; `faq` ≥4; `sources` ≥1 with real https URLs (ihchina, existing jiaobei sources, etc.).
- `path` always trailing slash.
- `gameHref`: `/games/shantou-jiaobei/`, `/games/chaoshan-yingge/`, `/games/jianzhi/`.
- `dateModified`: `'2026-07-20'`.

Helper:

```ts
export function listCulturePages(): CulturePage[] { return CULTURE_PAGES; }
export function listCultureHubs(): CulturePage[] {
  return CULTURE_PAGES.filter((p) => p.kind === 'hub');
}
export function getCulturePage(hub: string, topic?: string): CulturePage | undefined {
  if (!topic) {
    return CULTURE_PAGES.find((p) => p.kind === 'hub' && p.hub === hub);
  }
  return CULTURE_PAGES.find((p) => p.hub === hub && p.slug === topic && p.kind === 'topic');
}
```

Keep file maintainable: either one registry array or `pages/jiaobei.ts` exports merged in registry — prefer split files if registry exceeds ~400 lines:

- `src/content/culture/jiaobei.ts`
- `src/content/culture/yingge.ts`
- `src/content/culture/jianzhi.ts`
- `registry.ts` concatenates.

- [ ] **Step 4: Run tests to verify pass**

Run: `node --experimental-strip-types --test tests/culture-content.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content tests/culture-content.test.ts
git commit -m "feat(content): culture registry and SEO page data for three games"
```

---

### Task 2: JSON-LD helpers (TDD)

**Files:**
- Create: `src/core/seo/jsonld.ts`
- Create: `src/components/site/JsonLd.tsx`
- Create: `tests/seo-jsonld.test.ts`

**Interfaces:**
- Consumes: `FaqItem`, `CulturePage` from content types; `SITE_ORIGIN`
- Produces:
  - `buildBreadcrumbJsonLd(items: { name: string; path: string }[])`
  - `buildFaqJsonLd(faq: FaqItem[])`
  - `buildWebPageJsonLd(page: Pick<CulturePage, 'path' | 'title' | 'description' | 'dateModified' | 'h1'>)`
  - `buildHowToJsonLd(name: string, steps: { name: string; text: string }[])`
  - `buildCulturePageGraph(page: CulturePage): object` — `@context` + `@graph`

- [ ] **Step 1: Write failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCulturePageGraph, buildFaqJsonLd } from '../src/core/seo/jsonld.ts';
import { getCulturePage } from '../src/content/culture/registry.ts';

test('FAQ JSON-LD maps questions', () => {
  const ld = buildFaqJsonLd([
    { question: 'Q1', answer: 'A1' },
  ]);
  assert.equal(ld['@type'], 'FAQPage');
  assert.equal(ld.mainEntity[0].name, 'Q1');
  assert.equal(ld.mainEntity[0].acceptedAnswer.text, 'A1');
});

test('culture page graph includes WebPage FAQ Breadcrumb', () => {
  const page = getCulturePage('jiaobei');
  assert.ok(page);
  const graph = buildCulturePageGraph(page) as { '@graph': { '@type': string }[] };
  const types = new Set(graph['@graph'].map((n) => n['@type']));
  assert.ok(types.has('WebPage'));
  assert.ok(types.has('BreadcrumbList'));
  assert.ok(types.has('FAQPage'));
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

`src/core/seo/jsonld.ts` (core logic):

```ts
import { SITE_ORIGIN } from '../../content/site.ts';
import type { CulturePage, FaqItem } from '../../content/culture/types.ts';

export function buildFaqJsonLd(faq: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };
}

export function buildWebPageJsonLd(page: Pick<CulturePage, 'path' | 'title' | 'description' | 'dateModified'>) {
  const url = `${SITE_ORIGIN}${page.path}`;
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'zh-CN',
    dateModified: page.dateModified,
  };
}

export function buildHowToJsonLd(name: string, steps: { name: string; text: string }[]) {
  return {
    '@type': 'HowTo',
    name,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildCulturePageGraph(page: CulturePage) {
  const crumbs = [
    { name: 'rex-game', path: '/' },
    { name: '文化馆', path: '/culture/' },
  ];
  if (page.kind === 'topic') {
    const hubPath = `/culture/${page.hub}/`;
    const hubTitle =
      page.hub === 'jiaobei' ? '潮汕掷筊' : page.hub === 'yingge' ? '潮汕英歌' : '中国剪纸';
    crumbs.push({ name: hubTitle, path: hubPath });
  }
  crumbs.push({ name: page.h1, path: page.path });

  const graph: object[] = [
    buildWebPageJsonLd(page),
    buildBreadcrumbJsonLd(crumbs),
    buildFaqJsonLd(page.faq),
  ];
  if (page.howToSteps?.length) {
    graph.push(buildHowToJsonLd(page.h1, page.howToSteps));
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
```

`JsonLd.tsx`:

```tsx
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git add src/core/seo src/components/site/JsonLd.tsx tests/seo-jsonld.test.ts
git commit -m "feat(seo): shared JSON-LD builders for culture pages"
```

---

### Task 3: Museum theme CSS foundation

**Files:**
- Create: `src/styles/museum.css`
- Modify: `src/styles/globals.css` (theme attribute hooks only)
- Modify: `app/layout.tsx` (import museum.css)

**Interfaces:**
- Produces: CSS variables under `html` / `[data-theme='museum']` matching `DESIGN.md`
- Altar variables remain on `:root` for games

- [ ] **Step 1: Add museum tokens and base chrome classes**

In `museum.css`, define at minimum:

```css
html[data-theme='museum'],
html:not([data-theme='altar']) body.museum-shell {
  /* if using body class instead, document one approach and stick to it */
}

/* Preferred approach: body class on marketing layouts */
body.theme-museum {
  --c-primary: #b22c25;
  --c-primary-hover: #96241e;
  --c-on-primary: #fff8f0;
  --c-canvas: #f7f1e6;
  --c-canvas-soft: #efe6d4;
  --c-surface: #fffcf6;
  --c-ink: #1a120b;
  --c-ink-muted: #6e5a46;
  --c-ink-faint: #8a7358;
  --c-hairline: rgba(42, 27, 18, 0.12);
  --c-gold: #c9a24b;
  --c-cyan: #3d6b73;
  color: var(--c-ink);
  background: var(--c-canvas);
  font-family: var(--font-body);
}

.theme-museum a { color: inherit; }
/* site-header, site-footer, section, buttons, culture-doc classes — full rules per DESIGN.md */
```

Implement classes used by later components:

- `.site-header`, `.site-footer`, `.site-hero`, `.site-hero--altar`
- `.exhibit-card`, `.section-header`, `.quick-answer`
- `.faq-list`, `.source-list`, `.play-cta`, `.breadcrumb`, `.trust-strip`
- `.culture-doc`, `.btn-primary`, `.btn-secondary`

Include `@media (prefers-reduced-motion: reduce)` to disable transforms.

- [ ] **Step 2: Import in layout**

```tsx
import '@/styles/museum.css';
```

Do **not** force museum on all body yet (games stay dark). Components will wrap marketing pages with `theme-museum` class on a root element, or set via small client-less wrapper:

```tsx
// Prefer pure server: <div className="theme-museum site-root">...</div>
// and CSS: .theme-museum { ... tokens ... } with min-height 100%
```

Use **wrapper approach** so game pages without wrapper keep altar body styles.

- [ ] **Step 3: Manual check** — `pnpm dev`, open a temporary smoke only after Task 4; for now ensure build still works:

Run: `pnpm build`  
Expected: success (no route break)

- [ ] **Step 4: Commit**

```bash
git add src/styles/museum.css src/styles/globals.css app/layout.tsx
git commit -m "style: add museum light theme tokens and chrome base"
```

---

### Task 4: Site chrome components (Header / Footer / CTAs)

**Files:**
- Create: `src/components/site/SiteHeader.tsx`
- Create: `src/components/site/SiteFooter.tsx`
- Create: `src/components/site/PlayCta.tsx`
- Create: `src/components/site/Breadcrumb.tsx`
- Create: `src/components/site/SectionHeader.tsx`
- Create: `src/components/site/TrustStrip.tsx`
- Create: `src/components/site/ExhibitCard.tsx`
- Create: `src/components/site/HeroBand.tsx`
- Create: `src/components/site/QuickAnswer.tsx`
- Create: `src/components/site/CultureTermGrid.tsx`
- Create: `src/components/site/FaqList.tsx`
- Create: `src/components/site/SourceList.tsx`
- Create: `src/components/site/CultureDocument.tsx`
- Create: `tests/site-components-contract.test.ts`

**Interfaces:**
- Consumes: `games` from `gamesRegistry`, `SITE_NAV`, `SITE_DISCLAIMER`, `CulturePage`
- Produces presentational components only (no fetch)

- [ ] **Step 1: Contract test (source-level, matches existing yingge style)**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('CultureDocument wires quick answer FAQ sources and play CTA', () => {
  const src = readFileSync(new URL('src/components/site/CultureDocument.tsx', root), 'utf8');
  assert.match(src, /QuickAnswer/);
  assert.match(src, /FaqList/);
  assert.match(src, /SourceList/);
  assert.match(src, /PlayCta/);
  assert.match(src, /JsonLd|buildCulturePageGraph/);
});

test('SiteHeader exposes culture and about nav', () => {
  const src = readFileSync(new URL('src/components/site/SiteHeader.tsx', root), 'utf8');
  assert.match(src, /文化馆/);
  assert.match(src, /REX GAME/);
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement components**

`CultureDocument.tsx` outline:

```tsx
import type { CulturePage } from '@/content/culture/types';
import { buildCulturePageGraph } from '@/core/seo/jsonld';
import { JsonLd } from './JsonLd';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { Breadcrumb } from './Breadcrumb';
import { QuickAnswer } from './QuickAnswer';
import { PlayCta } from './PlayCta';
import { CultureTermGrid } from './CultureTermGrid';
import { FaqList } from './FaqList';
import { SourceList } from './SourceList';
import { SITE_DISCLAIMER } from '@/content/site';

export function CultureDocument({ page }: { page: CulturePage }) {
  const crumbs = [/* same as jsonld breadcrumbs with name/href */];
  return (
    <div className="theme-museum site-root">
      <JsonLd data={buildCulturePageGraph(page)} />
      <SiteHeader />
      <main className="culture-doc">
        <Breadcrumb items={crumbs} />
        <h1>{page.h1}</h1>
        <QuickAnswer sentences={page.quickAnswer} />
        <PlayCta href={page.gameHref} label={`现在体验：${page.gameName}`} />
        {page.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </section>
        ))}
        {page.terms?.length ? <CultureTermGrid terms={page.terms} /> : null}
        <FaqList items={page.faq} />
        <SourceList sources={page.sources} />
        <p className="culture-doc__disclaimer">{SITE_DISCLAIMER}</p>
        {/* related links from page.relatedPaths */}
      </main>
      <SiteFooter />
    </div>
  );
}
```

`SiteHeader`: Link wordmark `/`, map `SITE_NAV`, primary CTA to `games[0].href`.  
`SiteFooter`: columns for games + culture hubs + disclaimer.  
`PlayCta`: `<Link className="btn-primary" href={href}>{label}</Link>`.  
Others: straightforward markup + museum classes.

- [ ] **Step 4: Run contract test — PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/site tests/site-components-contract.test.ts
git commit -m "feat(site): museum chrome and culture document template"
```

---

### Task 5: Culture routes + about + sitemap (TDD)

**Files:**
- Create: `app/culture/page.tsx`
- Create: `app/culture/[hub]/page.tsx`
- Create: `app/culture/[hub]/[topic]/page.tsx`
- Create: `app/about/page.tsx`
- Modify: `app/sitemap.ts`
- Create: `tests/sitemap-routes.test.ts`

**Interfaces:**
- Consumes: `listCulturePages`, `getCulturePage`, `listCultureHubs`, `games`
- Static params from registry

- [ ] **Step 1: Write sitemap/registry parity test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { listCulturePages } from '../src/content/culture/registry.ts';
import { games } from '../src/core/gamesRegistry.ts';

// Importing sitemap default may need dynamic; instead re-implement expected URL set:
test('expected public URLs cover culture games about home', () => {
  const urls = new Set<string>([
    'https://game.rexai.top/',
    'https://game.rexai.top/about/',
    'https://game.rexai.top/culture/',
  ]);
  for (const g of games) {
    const href = g.href.endsWith('/') ? g.href : `${g.href}/`;
    urls.add(`https://game.rexai.top${href}`);
  }
  for (const p of listCulturePages()) {
    urls.add(`https://game.rexai.top${p.path}`);
  }
  assert.ok(urls.size >= 1 + 1 + 1 + games.length + listCulturePages().length);
  // After sitemap.ts update, also read file:
});
```

Also assert `app/sitemap.ts` source includes `listCulturePages` and `/about/`:

```ts
import { readFileSync } from 'node:fs';
test('sitemap.ts enumerates culture registry and about', () => {
  const src = readFileSync(new URL('../app/sitemap.ts', import.meta.url), 'utf8');
  assert.match(src, /listCulturePages/);
  assert.match(src, /about/);
});
```

- [ ] **Step 2: Run — FAIL on sitemap source**

- [ ] **Step 3: Implement routes**

`app/culture/[hub]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CultureDocument } from '@/components/site/CultureDocument';
import { getCulturePage, listCultureHubs } from '@/content/culture/registry';

export function generateStaticParams() {
  return listCultureHubs().map((h) => ({ hub: h.hub }));
}

export function generateMetadata({ params }: { params: { hub: string } }): Metadata {
  const page = getCulturePage(params.hub);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: page.path },
    openGraph: { title: page.title, description: page.description, url: page.path },
  };
}

export default function CultureHubPage({ params }: { params: { hub: string } }) {
  const page = getCulturePage(params.hub);
  if (!page) notFound();
  return <CultureDocument page={page} />;
}
```

Note: Next 15 may require `params` as `Promise` — **match whatever this repo’s other dynamic routes use**. If none exist, check Next 15.1 types: if `params: Promise<{hub:string}>`, await params.

`app/culture/[hub]/[topic]/page.tsx` — same with `getCulturePage(hub, topic)` and:

```tsx
export function generateStaticParams() {
  return listCulturePages()
    .filter((p) => p.kind === 'topic')
    .map((p) => ({ hub: p.hub, topic: p.slug }));
}
```

`app/culture/page.tsx` — index listing hubs + topics with `theme-museum`, Quick Answer about the museum, links.

`app/about/page.tsx` — disclaimer, camera privacy, site purpose; metadata canonical `/about/`.

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { games } from '@/core/gamesRegistry';
import { listCulturePages } from '@/content/culture/registry';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-07-20');
  const routes: MetadataRoute.Sitemap = [
    { url: 'https://game.rexai.top/', lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://game.rexai.top/about/', lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://game.rexai.top/culture/', lastModified, changeFrequency: 'weekly', priority: 0.85 },
  ];
  for (const game of games) {
    const href = game.href.endsWith('/') ? game.href : `${game.href}/`;
    routes.push({
      url: `https://game.rexai.top${href}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }
  for (const page of listCulturePages()) {
    routes.push({
      url: `https://game.rexai.top${page.path}`,
      lastModified: new Date(page.dateModified),
      changeFrequency: 'monthly',
      priority: page.kind === 'hub' ? 0.8 : 0.7,
    });
  }
  return routes;
}
```

- [ ] **Step 4: Run tests + build**

```bash
node --experimental-strip-types --test tests/culture-content.test.ts tests/seo-jsonld.test.ts tests/sitemap-routes.test.ts
pnpm build
```

Expected: tests PASS; build emits `out/culture/**/index.html` and `out/about/index.html`.

- [ ] **Step 5: Commit**

```bash
git add app/culture app/about app/sitemap.ts tests/sitemap-routes.test.ts
git commit -m "feat(culture): static culture hubs, topics, about, and sitemap"
```

---

### Task 6: Homepage T1 redesign (Museum + Altar hero)

**Files:**
- Modify: `app/page.tsx`
- Modify: `src/styles/home.css` (or fold into museum.css; prefer `home.css` rewrite for home-only layout)
- Test: extend `tests/yingge-game.test.ts` or add `tests/home-ia.test.ts` if home assertions break

**Interfaces:**
- Consumes: `games`, site components, `SITE_DISCLAIMER`

- [ ] **Step 1: Write home IA contract test**

```ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('home page uses museum shell and culture CTA', () => {
  const src = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /theme-museum|SiteHeader/);
  assert.match(src, /文化馆|\/culture\//);
  assert.match(src, /id=\"exhibits\"|id='exhibits'/);
  assert.match(src, /games\.map|games\[0\]/);
});
```

- [ ] **Step 2: Run — may FAIL**

- [ ] **Step 3: Rewrite `app/page.tsx`**

Structure:

1. `theme-museum site-root`
2. `SiteHeader`
3. `HeroBand` variant altar: claim e.g.「在浏览器里，把民俗玩成展品」; primary CTA `games[0]`; secondary `/culture/`
4. Section `#exhibits` — map all `games` to `ExhibitCard` (play + culture hub link map):
   - shantou-jiaobei → `/culture/jiaobei/`
   - chaoshan-yingge → `/culture/yingge/`
   - jianzhi → `/culture/jianzhi/`
5. Section why / how / trust / `TrustStrip`
6. Keep/extend JSON-LD `WebSite` + `ItemList`
7. `SiteFooter`

Update metadata title/description to museum positioning (all three games, not only 圣杯).

- [ ] **Step 4: Fix any tests that assert old single-exhibit home**

Search:

```bash
rg "home-exhibit|当前展品|展品 01" tests app
```

Update assertions to multi-exhibit / new classes.

- [ ] **Step 5: `pnpm test && pnpm build`**

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx src/styles/home.css tests
git commit -m "feat(home): Notion-style museum homepage with exhibit bento"
```

---

### Task 7: Game pages SEO alignment (英歌 / 剪纸 / 圣杯 links)

**Files:**
- Modify: `app/games/chaoshan-yingge/page.tsx`
- Modify: `app/games/jianzhi/page.tsx`
- Modify: `app/games/shantou-jiaobei/page.tsx` (add hub link + ensure related culture paths)
- Optional CSS for guide blocks under museum or existing game CSS

**Interfaces:**
- Visible HTML guide with Quick Answer, FAQ (≥4), sources, link to `/culture/<hub>/`
- JSON-LD FAQPage + WebPage where missing
- Game runtime stays Altar (do not wrap entire game in theme-museum; only guide article can use paper panel classes)

- [ ] **Step 1: Tests**

```ts
test('yingge page has FAQ JSON-LD and culture hub link', () => {
  const src = readFileSync(new URL('../app/games/chaoshan-yingge/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /FAQPage|faqItems|faq/);
  assert.match(src, /\/culture\/yingge\//);
});

test('jianzhi page has FAQ JSON-LD and culture hub link', () => {
  const src = readFileSync(new URL('../app/games/jianzhi/page.tsx', import.meta.url), 'utf8');
  assert.match(src, /FAQPage|faqItems|faq/);
  assert.match(src, /\/culture\/jianzhi\//);
});
```

- [ ] **Step 2: FAIL then implement**

For yingge/jianzhi:

- Add `content/faq.ts` next to game content **or** import FAQ from culture hub page data (`getCulturePage('yingge').faq`).
- Prefer **import from culture registry** to stay DRY:

```ts
import { getCulturePage } from '@/content/culture/registry';
const hub = getCulturePage('yingge')!;
// use hub.quickAnswer, hub.faq, hub.sources in guide
```

- Render guide `<article>` below game with those fields + Play is already above.
- Expand JSON-LD `@graph` like jiaobei page.

Jiaobei: add explicit link to `/culture/jiaobei/` and related topics in guide footer.

- [ ] **Step 3: test + build PASS**

- [ ] **Step 4: Commit**

```bash
git add app/games src/games
git commit -m "feat(seo): align all game pages with culture hubs and FAQ schema"
```

---

### Task 8: Visual section references (P1 assets)

**Files:**
- Create: `docs/design-refs/README.md`
- Create: images under `docs/design-refs/` (or `aios/temp/design-refs/`) via image generation tools

**Interfaces:**
- Six horizontal references listed in spec §7.1
- README maps filename → section → DESIGN.md notes

- [ ] **Step 1: Generate six 16:9 section images** (use Imagine / project image skill)

Prompts must specify: xuan-paper or lacquer museum, cinnabar CTA, Song display Chinese UI chrome, no purple gradients, no cartoon dragons. One section per image.

Suggested filenames:

1. `01-home-hero-altar.png`
2. `02-exhibits-bento.png`
3. `03-culture-hub-hero.png`
4. `04-topic-article.png`
5. `05-game-guide-bridge.png`
6. `06-home-mobile.png`

- [ ] **Step 2: Write README index**

- [ ] **Step 3: Visual pass on implemented UI** — adjust museum.css spacing/type if refs show clear gaps (no layout rewrite unless mismatch is severe)

- [ ] **Step 4: Commit**

```bash
git add docs/design-refs
git commit -m "docs(design): section reference images for museum site"
```

Note: If binary images are too large for git, store under `aios/temp/design-refs/` and commit README only with paths — prefer committing compressed PNG/WebP if reasonable size.

---

### Task 9: Polish, reduced-motion, metadata defaults, verification

**Files:**
- Modify: `app/layout.tsx` metadata (site-wide description for three games)
- Modify: `src/styles/museum.css` / `home.css` as needed
- Modify: `CHANGELOG.md` + `VERSION` only if project versioning skill requires (check `versioning-by-impact` at end)

- [ ] **Step 1: Full test suite**

```bash
pnpm test
pnpm build
```

Expected: all tests pass; `out/` contains culture + about + games.

- [ ] **Step 2: Manual checklist**

- [ ] Home: hero CTAs work; `#exhibits` has 3 cards  
- [ ] `/culture/jiaobei/sheng-yin-xiao/` renders Quick Answer + FAQ  
- [ ] View-source contains `FAQPage`  
- [ ] Game pages still load (jiaobei/yingge/jianzhi)  
- [ ] Mobile: header wraps, no horizontal scroll  
- [ ] `prefers-reduced-motion`: no large motion  

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: polish museum site SEO shell and verify static export"
```

- [ ] **Step 4: Update spec status line** to `已实现 / 待部署` in design spec header (docs commit)

```bash
git add docs/superpowers/specs/2026-07-20-chinese-style-site-seo-geo-design.md
git commit -m "docs: mark chinese-style SEO/GEO spec implemented"
```

---

## Spec coverage self-check

| Spec requirement | Task |
|------------------|------|
| DESIGN system museum/altar | 3, DESIGN.md already written |
| Notion home chapters | 6 |
| Culture hubs + topics first batch | 1, 5 |
| About page | 5 |
| JSON-LD FAQ/WebPage/HowTo/Breadcrumb | 2, 5, 7 |
| Sitemap expansion | 5 |
| Game page SEO parity | 7 |
| Visual 6 sections | 8 |
| Dual surface | 3, 6, 7 |
| No gameplay core changes | enforced in constraints |
| GEO Quick Answer | 1 content + 4 CultureDocument |
| Internal linking | 4 footer, 5 related, 6 cards, 7 hubs |
| Static export | 5 build verification |

## Placeholder scan

No TBD steps. Content copy is required in Task 1 (real Chinese, not lorem). Next 15 `params` Promise typing must match repo — implementer checks `app/` patterns at Task 5.

## Type consistency

- `CulturePage.path` always trailing slash  
- `CultureHubId` = `'jiaobei' | 'yingge' | 'jianzhi'`  
- `getCulturePage(hub, topic?)`  
- `buildCulturePageGraph(page)` returns `@graph`  
- `SITE_ORIGIN` no trailing slash; paths supply slash  

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-20-chinese-style-site-seo-geo.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — this session with executing-plans, checkpoint reviews  

**Which approach?**
