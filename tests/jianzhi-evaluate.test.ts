import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateObjective } from '../src/games/jianzhi/core/evaluate.ts';
import { JIANZHI_COMBOS } from '../src/games/jianzhi/content/combos.ts';

test('motifs mode requires all objective ids', () => {
  const r = evaluateObjective(
    { objectiveMode: 'motifs', objectiveMotifIds: ['lotus', 'fish'] },
    ['lotus'],
  );
  assert.equal(r.passed, false);
  assert.deepEqual(r.missing, ['fish']);
});

test('motifs mode passes when all present', () => {
  const r = evaluateObjective(
    { objectiveMode: 'motifs', objectiveMotifIds: ['fu'] },
    ['fu', 'fish'],
  );
  assert.equal(r.passed, true);
  assert.deepEqual(r.missing, []);
});

test('any-combo mode passes when any library combo is formed', () => {
  const fail = evaluateObjective(
    { objectiveMode: 'any-combo', objectiveMotifIds: [] },
    ['fu'],
    JIANZHI_COMBOS,
  );
  assert.equal(fail.passed, false);

  const ok = evaluateObjective(
    { objectiveMode: 'any-combo', objectiveMotifIds: [] },
    ['lotus', 'fish'],
    JIANZHI_COMBOS,
  );
  assert.equal(ok.passed, true);
});
