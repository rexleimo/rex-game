import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialJianzhiProgress,
  parseJianzhiProgress,
  recordLessonCompletion,
  recordCommissionCompletion,
  collectMotifs,
  discoverCombos,
} from '../src/games/jianzhi/core/progress.ts';

test('initial progress is v2 locked to lesson 1', () => {
  const p = createInitialJianzhiProgress();
  assert.equal(p.version, 2);
  assert.equal(p.curriculumUnlocked, 1);
  assert.deepEqual(p.completedLessons, []);
  assert.deepEqual(p.completedCommissions, []);
  assert.equal(p.graduated, false);
});

test('recordLessonCompletion unlocks next and sets graduated on last lesson', () => {
  let p = createInitialJianzhiProgress();
  p = recordLessonCompletion(p, 'awaken', 1, ['origin'], ['fu'], 7, []);
  assert.ok(p.completedLessons.includes('awaken'));
  assert.equal(p.curriculumUnlocked, 2);
  assert.ok(p.cultureEntryIds.includes('origin'));
  assert.ok(p.collectedMotifIds.includes('fu'));

  p = recordLessonCompletion(p, 'graduate', 7, ['heritage'], [], 7, ['lian-nian-you-yu']);
  assert.equal(p.graduated, true);
  assert.equal(p.curriculumUnlocked, 7);
  assert.ok(p.discoveredCombos.includes('lian-nian-you-yu'));
});

test('recordCommissionCompletion does not change curriculumUnlocked', () => {
  let p = createInitialJianzhiProgress();
  p = { ...p, graduated: true, curriculumUnlocked: 7 };
  p = recordCommissionCompletion(p, 'spring-window', ['window-flower'], ['fu', 'fish'], []);
  assert.ok(p.completedCommissions.includes('spring-window'));
  assert.equal(p.curriculumUnlocked, 7);
});

test('parse migrates v1 completedChapters to completedLessons best-effort', () => {
  const v1 = JSON.stringify({
    unlocked: 3,
    completedChapters: ['awaken', 'north-window'],
    collectedMotifIds: ['fu'],
    cultureEntryIds: ['origin'],
    discoveredCombos: ['lian-nian-you-yu'],
  });
  const p = parseJianzhiProgress(v1);
  assert.equal(p.version, 2);
  assert.ok(p.completedLessons.includes('awaken'));
  assert.equal(p.curriculumUnlocked, 3);
  assert.ok(p.collectedMotifIds.includes('fu'));
  assert.ok(p.discoveredCombos.includes('lian-nian-you-yu'));
});

test('parse v2 round-trip', () => {
  const raw = createInitialJianzhiProgress();
  raw.curriculumUnlocked = 4;
  raw.completedLessons = ['awaken', 'symmetry', 'rebus-intro'];
  const p = parseJianzhiProgress(JSON.stringify(raw));
  assert.equal(p.curriculumUnlocked, 4);
  assert.equal(p.completedLessons.length, 3);
});

test('collectMotifs and discoverCombos are idempotent unions', () => {
  let p = createInitialJianzhiProgress();
  p = collectMotifs(p, ['fu', 'fish']);
  p = collectMotifs(p, ['fu']);
  assert.deepEqual(p.collectedMotifIds.sort(), ['fish', 'fu']);
  p = discoverCombos(p, ['lian-nian-you-yu']);
  p = discoverCombos(p, ['lian-nian-you-yu']);
  assert.deepEqual(p.discoveredCombos, ['lian-nian-you-yu']);
});
