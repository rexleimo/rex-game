import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('ExhibitSection: numbered label, dual entries, approved taglines', () => {
  const src = readFileSync(new URL('src/components/site/ExhibitSection.tsx', root), 'utf8');
  assert.match(src, /No\.01/);
  assert.match(src, /No\.03/);
  assert.match(src, /cultureHref/);
  assert.match(src, /开始占卜/);
  assert.match(src, /加入巡游/);
  assert.match(src, /开始创作/);
  const registry = readFileSync(new URL('src/core/gamesRegistry.ts', root), 'utf8');
  assert.match(registry, /看神明如何回你/);
  assert.match(registry, /中华战舞/);
  assert.match(registry, /读懂一纸吉语/);
});

test('HomeClaims / CultureGateway / HomeTrust render spec copy', () => {
  const claims = readFileSync(new URL('src/components/site/HomeClaims.tsx', root), 'utf8');
  assert.match(claims, /壹/);
  assert.match(claims, /在地线索/);
  assert.match(claims, /可核来源/);
  const gateway = readFileSync(new URL('src/components/site/CultureGateway.tsx', root), 'utf8');
  assert.match(gateway, /圣杯怎么看/);
  assert.match(gateway, /\/culture\/jiaobei\//);
  assert.match(gateway, /\/culture\/yingge\//);
  assert.match(gateway, /\/culture\/jianzhi\//);
  const trust = readFileSync(new URL('src/components/site/HomeTrust.tsx', root), 'utf8');
  assert.match(trust, /TRUST_METRICS/);
  assert.match(trust, /SITE_DISCLAIMER/);
});
