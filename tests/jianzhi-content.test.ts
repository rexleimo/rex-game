import assert from 'node:assert/strict';
import test from 'node:test';
import { JIANZHI_LESSONS, LESSON_COUNT, getLesson } from '../src/games/jianzhi/content/lessons.ts';
import { JIANZHI_COMMISSIONS, getCommission } from '../src/games/jianzhi/content/commissions.ts';
import { JIANZHI_CULTURE_ENTRIES } from '../src/games/jianzhi/content/culture.ts';
import { getMotif } from '../src/games/jianzhi/content/motifs.ts';
import { getCombo } from '../src/games/jianzhi/content/combos.ts';

test('exactly 7 lessons ordered 1..7 with graduate last', () => {
  assert.equal(JIANZHI_LESSONS.length, LESSON_COUNT);
  assert.equal(LESSON_COUNT, 7);
  JIANZHI_LESSONS.forEach((l, i) => assert.equal(l.order, i + 1));
  assert.equal(JIANZHI_LESSONS[6].id, 'graduate');
  assert.equal(JIANZHI_LESSONS[6].objectiveMode, 'any-combo');
});

test('every lesson motif and combo id exists', () => {
  for (const l of JIANZHI_LESSONS) {
    for (const id of l.objectiveMotifIds) {
      assert.ok(getMotif(id), `missing motif ${id} in lesson ${l.id}`);
    }
    if (l.targetComboId) {
      assert.ok(getCombo(l.targetComboId), `missing combo ${l.targetComboId}`);
    }
    for (const cid of l.cultureEntryIds) {
      assert.ok(
        JIANZHI_CULTURE_ENTRIES.some((e) => e.id === cid),
        `missing culture ${cid}`,
      );
    }
  }
});

test('two commissions reference valid motifs', () => {
  assert.equal(JIANZHI_COMMISSIONS.length, 2);
  assert.ok(JIANZHI_COMMISSIONS.find((c) => c.id === 'spring-window'));
  assert.ok(JIANZHI_COMMISSIONS.find((c) => c.id === 'wedding-xi'));
  for (const c of JIANZHI_COMMISSIONS) {
    for (const id of c.objectiveMotifIds) {
      assert.ok(getMotif(id), id);
    }
    if (c.targetComboId) {
      assert.ok(getCombo(c.targetComboId), `missing combo ${c.targetComboId}`);
    }
    for (const cid of c.cultureEntryIds) {
      assert.ok(
        JIANZHI_CULTURE_ENTRIES.some((e) => e.id === cid),
        `missing culture ${cid}`,
      );
    }
  }
});

test('getLesson returns by id', () => {
  const awaken = getLesson('awaken');
  assert.ok(awaken);
  assert.equal(awaken.id, 'awaken');
  assert.ok(awaken.title.includes('红纸'));
  assert.equal(getLesson('graduate')?.id, 'graduate');
  assert.equal(getLesson('nope'), undefined);
});

test('getCommission returns by id', () => {
  assert.equal(getCommission('spring-window')?.season, '春节');
  assert.equal(getCommission('wedding-xi')?.targetComboId, 'fu-gui-shuang-xi');
  assert.equal(getCommission('nope'), undefined);
});

test('culture entries retain the seven archive ids', () => {
  const ids = JIANZHI_CULTURE_ENTRIES.map((e) => e.id).sort();
  assert.deepEqual(ids, [
    'heritage',
    'north-south',
    'origin',
    'rosette-silk',
    'wedding-flower',
    'window-flower',
    'zodiac',
  ]);
});

test('lesson objective bindings match redesign table', () => {
  const byId = Object.fromEntries(JIANZHI_LESSONS.map((l) => [l.id, l]));
  assert.deepEqual(byId.awaken.objectiveMotifIds, ['fu']);
  assert.equal(byId.awaken.foldSuggestion, 'book');
  assert.deepEqual(byId.symmetry.objectiveMotifIds, ['fish']);
  assert.deepEqual(byId['rebus-intro'].objectiveMotifIds, ['lotus', 'fish']);
  assert.equal(byId['rebus-intro'].targetComboId, 'lian-nian-you-yu');
  assert.deepEqual(byId['window-four'].objectiveMotifIds, ['plum']);
  assert.equal(byId['window-four'].foldSuggestion, 'four');
  assert.deepEqual(byId['silk-rosette'].objectiveMotifIds, ['butterfly', 'peony']);
  assert.equal(byId['silk-rosette'].targetComboId, 'die-lian-hua');
  assert.deepEqual(byId['fu-shou'].objectiveMotifIds, ['bat', 'peach']);
  assert.equal(byId['fu-shou'].targetComboId, 'fu-shou-shuang-quan');
  assert.deepEqual(byId.graduate.objectiveMotifIds, []);
  assert.equal(byId.graduate.objectiveMode, 'any-combo');
});
