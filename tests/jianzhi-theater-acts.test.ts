import assert from 'node:assert/strict';
import test from 'node:test';

test('acts cover all 7 lessons in order with character and scene', async () => {
  const { ACTS } = await import('../src/games/jianzhi/content/acts.ts');
  const { JIANZHI_LESSONS } = await import('../src/games/jianzhi/content/lessons.ts');
  assert.equal(ACTS.length, 4);
  const covered = ACTS.flatMap((a) => a.lessonIds);
  assert.deepEqual(covered, JIANZHI_LESSONS.map((l) => l.id));
  for (const act of ACTS) {
    assert.ok(act.character.name.length > 0, `${act.id} character missing`);
    assert.ok(act.scene.art.length > 0, `${act.id} scene missing`);
    assert.ok(act.theme.includes('·'), `${act.id} theme should be 「X · Y」`);
  }
});

test('buildActStates derives unlock/lit from progress without schema change', async () => {
  const { buildActStates } = await import('../src/games/jianzhi/theater/useTheater.ts');
  const base = {
    version: 2,
    curriculumUnlocked: 1,
    completedLessons: [],
    completedCommissions: [],
    collectedMotifIds: [],
    discoveredCombos: [],
    cultureEntryIds: [],
    graduated: false,
  } as const;
  const fresh = buildActStates(base as never);
  assert.equal(fresh[0].unlocked, true);
  assert.equal(fresh[1].unlocked, false);
  assert.equal(fresh.every((a) => !a.lit), true);
  const doneTwo = buildActStates({
    ...base,
    curriculumUnlocked: 3,
    completedLessons: ['awaken', 'symmetry'],
  } as never);
  assert.equal(doneTwo[0].lit, true);
  assert.equal(doneTwo[1].unlocked, true);
  assert.equal(doneTwo[2].unlocked, false);
});

test('TheaterMap renders act curtains with lock states', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../src/games/jianzhi/theater/TheaterMap.tsx', import.meta.url), 'utf8');
  assert.match(src, /th-curtain/);
  assert.match(src, /unlocked/);
  assert.match(src, /lit/);
});
