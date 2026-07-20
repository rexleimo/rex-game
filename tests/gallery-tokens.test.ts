import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('tokens.css defines spec color and motion tokens', () => {
  const css = readFileSync(new URL('src/styles/tokens.css', root), 'utf8');
  for (const token of [
    '--g-abyss: #0A0705',
    '--g-lacquer: #120B07',
    '--g-float: #1A130C',
    '--g-card: #241A10',
    '--g-cinnabar-hi: #E8452F',
    '--g-cinnabar: #C82E21',
    '--g-cinnabar-deep: #A81E14',
    '--g-gold: #C9A24B',
    '--g-gold-hi: #E8CF9A',
    '--g-paper: #F7F1E6',
    '--g-cream: #E8DCC4',
    '--g-ease: cubic-bezier(0.22, 1, 0.36, 1)',
  ]) {
    assert.ok(css.includes(token), `tokens.css missing: ${token}`);
  }
});

test('gallery.css exposes theme-gallery shell and shared primitives', () => {
  const css = readFileSync(new URL('src/styles/gallery.css', root), 'utf8');
  for (const sel of [
    '.theme-gallery',
    '.g-container',
    '.g-section',
    '.g-label',
    '.g-display',
    '.g-btn--primary',
    '.g-btn--ghost',
    '.visually-hidden',
    'prefers-reduced-motion',
  ]) {
    assert.ok(css.includes(sel), `gallery.css missing: ${sel}`);
  }
  const layout = readFileSync(new URL('app/layout.tsx', root), 'utf8');
  assert.match(layout, /tokens\.css/);
  assert.match(layout, /gallery\.css/);
});
