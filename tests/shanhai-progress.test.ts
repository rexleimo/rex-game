import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialProgress,
  gradeFromScore,
  markReadCore,
  markRestored,
  parseProgress,
  restoredCount,
} from '../src/games/shanhai-shiyi/core/progress.ts';
import { allSnapped, scoreQuiz, scoreShapeRestore } from '../src/games/shanhai-shiyi/core/restoreScore.ts';
import { ARTIFACTS } from '../src/games/shanhai-shiyi/content/artifacts.ts';

test('parseProgress recovers from garbage', () => {
  assert.equal(parseProgress(null).version, 1);
  assert.equal(parseProgress({ version: 99 }).museumSlots.length, 0);
});

test('markRestored adds museum slot and learn ids', () => {
  let p = createInitialProgress();
  p = markRestored(p, 'A-R01-SR-001', 95, ['R01-L01', 'R01-L02']);
  assert.equal(p.artifacts['A-R01-SR-001']?.grade, 'S');
  assert.ok(p.museumSlots.includes('A-R01-SR-001'));
  assert.ok(p.learnedIds.includes('R01-L01'));
  assert.equal(restoredCount(p), 1);
  p = markReadCore(p, 'A-R01-SR-001');
  assert.equal(p.artifacts['A-R01-SR-001']?.readCore, true);
});

test('gradeFromScore bands', () => {
  assert.equal(gradeFromScore(98), 'SS');
  assert.equal(gradeFromScore(90), 'S');
  assert.equal(gradeFromScore(80), 'A');
  assert.equal(gradeFromScore(60), 'B');
  assert.equal(gradeFromScore(10), 'C');
});

test('shape score full snap is high', () => {
  const ding = ARTIFACTS.find((a) => a.id === 'A-R01-SR-001');
  assert.ok(ding && ding.restore.kind === 'shape');
  if (!ding || ding.restore.kind !== 'shape') return;
  const placed = ding.restore.pieces.map((p) => ({
    id: p.id,
    x: p.target.x,
    y: p.target.y,
    snapped: true,
  }));
  assert.equal(allSnapped(ding.restore.pieces, placed), true);
  assert.ok(scoreShapeRestore(ding.restore.pieces, placed, 0) >= 90);
});

test('quiz score', () => {
  assert.ok(scoreQuiz(true, 0) >= 90);
  assert.ok(scoreQuiz(false, 0) < 60);
});

test('ships full atlas of cards with complete lore fields', () => {
  assert.equal(ARTIFACTS.length, 166);
  assert.ok(ARTIFACTS.every((a) => a.coreLore && a.tellable && a.source && a.oneLiner));
  const ids = new Set(ARTIFACTS.map((a) => a.id));
  assert.equal(ids.size, 166);
  assert.ok(ids.has('A-R06-SR-001'));
  assert.ok(ids.has('A-R06-SR-020'));
  assert.ok(ids.has('A-R08-SR-001'));
  assert.ok(ids.has('A-R08-SR-020'));
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R01').length, 30);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R02').length, 20);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R03').length, 20);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R04').length, 20);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R05').length, 20);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R06').length, 20);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R07').length, 16);
  assert.equal(ARTIFACTS.filter((a) => a.region === 'R08').length, 20);
});

test('each card binds a playable restore', () => {
  for (const card of ARTIFACTS) {
    assert.ok(card.restore.kind === 'shape' || card.restore.kind === 'quiz', card.id);
    if (card.restore.kind === 'shape') {
      assert.ok(card.restore.pieces.length >= 2, card.id);
    } else {
      assert.ok(card.restore.options.some((o) => o.correct), card.id);
    }
  }
});
