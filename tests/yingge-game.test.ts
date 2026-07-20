import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import test from 'node:test';

import {
  applyMorale,
  cycleFormation,
  getFormationModifiers,
  judgeCombatBeat,
  resolveCombatAttack,
} from '../src/games/chaoshan-yingge/core/combat.ts';
import { calculatePerformanceResult, judgeTiming } from '../src/games/chaoshan-yingge/core/rhythm.ts';
import { YINGGE_CHAPTERS, YINGGE_CULTURE_ENTRIES } from '../src/games/chaoshan-yingge/content/chapters.ts';
import {
  createInitialCampaignProgress,
  recordChapterOutcome,
} from '../src/games/chaoshan-yingge/core/progress.ts';
import {
  ENEMY_PROFILES,
  YINGGE_STAGES,
  getStageDefinition,
} from '../src/games/chaoshan-yingge/content/stages.ts';
import {
  ATTACK_CULTURE_LABELS,
  evaluateCulturalResponse,
  getEnemyCultureGuide,
} from '../src/games/chaoshan-yingge/core/culturalCombat.ts';

const root = new URL('../', import.meta.url);
const registrySource = readFileSync(new URL('src/core/gamesRegistry.ts', root), 'utf8');
const homeSource = readFileSync(new URL('app/page.tsx', root), 'utf8');
const pageSource = readFileSync(new URL('app/games/chaoshan-yingge/page.tsx', root), 'utf8');
const gameSource = readFileSync(new URL('src/games/chaoshan-yingge/YinggeGame.tsx', root), 'utf8');
const runtimeSource = readFileSync(new URL('src/games/chaoshan-yingge/runtime/createYinggeGame.ts', root), 'utf8');
const enemyAssetKinds = ['ash-wisp', 'flanker', 'pouncer', 'swarm', 'tile-guard', 'miasma-chief'];

test('timing judgment uses the calibrated four-tier windows', () => {
  assert.equal(judgeTiming(0.044), 'perfect');
  assert.equal(judgeTiming(-0.09), 'great');
  assert.equal(judgeTiming(0.149), 'good');
  assert.equal(judgeTiming(0.151), 'miss');
});

test('performance result rewards accuracy, continuity, formation, and spirit', () => {
  const result = calculatePerformanceResult({
    judgments: ['perfect', 'perfect', 'great', 'good'],
    maxCombo: 4,
    formationHits: 2,
    formationTotal: 2,
  });

  assert.equal(result.accuracy, 89);
  assert.equal(result.continuity, 100);
  assert.equal(result.formation, 100);
  assert.equal(result.spirit, 96);
  assert.equal(result.grade, '甲');
});
test('combat rhythm rewards the beat without blocking free attacks', () => {
  assert.equal(judgeCombatBeat(0.069), 'perfect');
  assert.equal(judgeCombatBeat(-0.149), 'on-beat');
  assert.equal(judgeCombatBeat(0.151), 'free');

  const perfect = resolveCombatAttack({
    attack: 'thrust',
    formation: 'snake',
    beatDeltaSeconds: 0.04,
    combo: 3,
  });
  const free = resolveCombatAttack({
    attack: 'thrust',
    formation: 'snake',
    beatDeltaSeconds: 0.3,
    combo: 3,
  });

  assert.ok(perfect.damage > free.damage);
  assert.ok(perfect.moraleGain > free.moraleGain);
  assert.equal(free.judgment, 'free');
  assert.ok(free.damage > 0);
});

test('formations provide distinct tactical bonuses and cycle predictably', () => {
  assert.equal(cycleFormation('snake'), 'circle');
  assert.equal(cycleFormation('circle'), 'goose');
  assert.equal(cycleFormation('goose'), 'snake');

  const snake = getFormationModifiers('snake');
  const circle = getFormationModifiers('circle');
  const goose = getFormationModifiers('goose');

  assert.ok(snake.speedMultiplier > circle.speedMultiplier);
  assert.ok(circle.damageTakenMultiplier < snake.damageTakenMultiplier);
  assert.ok(circle.guardWindowMultiplier > snake.guardWindowMultiplier);
  assert.ok(goose.rangeMultiplier > circle.rangeMultiplier);
  assert.ok(goose.moraleMultiplier > snake.moraleMultiplier);
});

test('morale is clamped and the team ultimate spends a full meter', () => {
  assert.deepEqual(applyMorale(96, 12), { morale: 100, ultimateReady: true });
  assert.deepEqual(applyMorale(100, -100), { morale: 0, ultimateReady: false });
  assert.deepEqual(applyMorale(4, -20), { morale: 0, ultimateReady: false });
});

test('the runtime exposes horizontal combat controls and optimized character art', () => {
  assert.match(runtimeSource, /resolveCombatAttack/);
  assert.match(runtimeSource, /KeyJ/);
  assert.match(runtimeSource, /KeyK/);
  assert.match(runtimeSource, /KeyL/);
  assert.match(runtimeSource, /ShiftLeft/);
  assert.match(runtimeSource, /Space/);
  assert.match(runtimeSource, /head-hammer/);
  assert.match(runtimeSource, /\.webp/);
  assert.match(runtimeSource, /evaluateCulturalResponse/);
  assert.match(runtimeSource, /culturalMatches/);
  assert.doesNotMatch(runtimeSource, /createNotes\(/);
});

test('all five chapters and culture entries retain region and source metadata', () => {
  assert.equal(YINGGE_CHAPTERS.length, 5);
  assert.deepEqual(YINGGE_CHAPTERS.map((chapter) => chapter.id), [
    'drum-basics',
    'heroes-enter',
    'formation',
    'village-parade',
    'grand-performance',
  ]);

  for (const entry of YINGGE_CULTURE_ENTRIES) {
    assert.ok(entry.region.length > 0);
    assert.ok(entry.sourceLabel.length > 0);
    assert.ok(entry.sourceUrl.startsWith('https://'));
    assert.ok(['recorded', 'oral-tradition', 'game-interpretation'].includes(entry.evidence));
  }
});

test('the campaign defines five distinct action stages with escalating encounters', () => {
  assert.equal(YINGGE_STAGES.length, YINGGE_CHAPTERS.length);
  assert.equal(new Set(YINGGE_STAGES.map((stage) => stage.theme)).size, 5);
  assert.equal(new Set(YINGGE_STAGES.map((stage) => stage.boss.label)).size, 5);

  for (const chapter of YINGGE_CHAPTERS) {
    const stage = getStageDefinition(chapter.id);
    assert.equal(stage.chapterId, chapter.id);
    assert.ok(stage.durationSeconds >= 45);
    assert.ok(stage.waves.length >= 3);
    assert.ok(stage.waves.every((wave) => wave.enemies.length > 0));
    assert.ok(stage.boss.hp > 0);
    assert.ok(stage.culturalMission.length >= 12);
  }

  assert.ok(getStageDefinition('grand-performance').boss.phases.length >= 3);
});

test('enemy profiles cover every runtime art asset and preserve tactical differences', () => {
  assert.deepEqual(Object.keys(ENEMY_PROFILES).sort(), [
    'ash-wisp',
    'flanker',
    'miasma-chief',
    'pouncer',
    'swarm',
    'tile-guard',
  ]);
  assert.ok(ENEMY_PROFILES.flanker.speed > ENEMY_PROFILES['tile-guard'].speed);
  assert.ok(ENEMY_PROFILES['tile-guard'].damageReduction > ENEMY_PROFILES['ash-wisp'].damageReduction);
  assert.ok(ENEMY_PROFILES.pouncer.strikeDamage > ENEMY_PROFILES.swarm.strikeDamage);
});

test('each obstacle teaches a readable cultural response instead of acting as a generic target', () => {
  const guides = enemyAssetKinds.map((kind) => getEnemyCultureGuide(kind as keyof typeof ENEMY_PROFILES));

  assert.equal(new Set(guides.map((guide) => `${guide.preferredAttack}:${guide.preferredFormation}`)).size, guides.length);
  assert.ok(guides.every((guide) => guide.lesson.length >= 12));
  assert.deepEqual(ATTACK_CULTURE_LABELS, {
    thrust: '点槌·开路',
    sweep: '展槌·合围',
    smash: '震槌·定势',
    counter: '守势·回槌',
    ultimate: '众槌·同声',
  });
});

test('matching the obstacle, formation, and drum beat rewards coordinated performance', () => {
  const guide = getEnemyCultureGuide('swarm');
  const coordinated = evaluateCulturalResponse('swarm', guide.preferredAttack, guide.preferredFormation, 'perfect');
  const forceOnly = evaluateCulturalResponse('swarm', 'smash', 'snake', 'free');

  assert.equal(coordinated.attackMatch, true);
  assert.equal(coordinated.formationMatch, true);
  assert.equal(coordinated.rhythmMatch, true);
  assert.ok(coordinated.damageMultiplier > forceOnly.damageMultiplier);
  assert.ok(coordinated.moraleBonus > forceOnly.moraleBonus);
  assert.ok(coordinated.cultureScore > forceOnly.cultureScore);
});

test('runtime enemy art is shipped as compact WebP instead of source PNG files', () => {
  let totalBytes = 0;
  for (const kind of enemyAssetKinds) {
    const asset = new URL(`public/assets/yingge/game/enemies/${kind}/idle.webp`, root);
    assert.equal(existsSync(asset), true, `${kind} should have a runtime WebP`);
    totalBytes += statSync(asset).size;
  }
  assert.ok(totalBytes < 1_500_000, `enemy runtime art is ${totalBytes} bytes`);
  assert.match(runtimeSource, /game\/enemies/);
  assert.doesNotMatch(runtimeSource, /idle-source/);
});

test('campaign progress unlocks only after victory and keeps best chapter results', () => {
  const initial = createInitialCampaignProgress();
  const failed = recordChapterOutcome(initial, 'drum-basics', false, 72);
  assert.equal(failed.unlocked, 1);
  assert.equal(failed.bestSpirit['drum-basics'], undefined);

  const cleared = recordChapterOutcome(failed, 'drum-basics', true, 72);
  assert.equal(cleared.unlocked, 2);
  assert.equal(cleared.bestSpirit['drum-basics'], 72);

  const improved = recordChapterOutcome(cleared, 'drum-basics', true, 91);
  assert.equal(improved.bestSpirit['drum-basics'], 91);
  assert.equal(recordChapterOutcome(improved, 'drum-basics', true, 80).bestSpirit['drum-basics'], 91);
});

test('the Yingge experience opens with a dedicated start menu', () => {
  assert.match(gameSource, /type View = 'menu' \| 'guide' \| 'chapters'/);
  assert.match(gameSource, /\u4e3b\u7ebf\u6f14\u51fa/);
  assert.match(gameSource, /\u7ae0\u8282\u9009\u62e9/);
  assert.match(gameSource, /\u6e38\u620f\u8bbe\u7f6e/);
  assert.match(gameSource, /\u8fd4\u56de\u5f00\u59cb\u83dc\u5355/);
  assert.match(gameSource, /togglePause/);
  assert.match(gameSource, /\u5408\u961f/);
  assert.match(gameSource, /\u5de1\u6e38\u624b\u518c/);
  assert.match(gameSource, /game\/enemies\/\$\{kind\}\/idle\.webp/);
  assert.match(gameSource, /\u91cd\u65b0\u6311\u6218/);
  assert.match(gameSource, /\u4e0b\u4e00\u7ae0/);
});

test('the game is registered and exposed as a statically rendered culture page', () => {
  assert.match(registrySource, /id: 'chaoshan-yingge'/);
  assert.match(registrySource, /href: '\/games\/chaoshan-yingge'/);
  // Home lists all exhibits in museum bento (ExhibitCard map).
  assert.match(homeSource, /exhibits|ExhibitCard|theme-museum/);
  assert.match(homeSource, /games\.map/);
  assert.match(pageSource, /<YinggeGame/);
  assert.match(pageSource, /'@type': 'VideoGame'/);
  assert.match(pageSource, /潮汕英歌/);
  assert.match(gameSource, /import\('\.\/runtime\/createYinggeGame'\)/);
  assert.match(gameSource, /文化档案/);
  assert.match(gameSource, /音画校准/);
});

test('YinggeGame shell imports GameChrome and gs button classes on non-play views', () => {
  assert.match(gameSource, /from ['"]@\/components\/game\/GameChrome['"]/);
  assert.match(gameSource, /game-shell\.css/);
  assert.match(gameSource, /gs-btn--primary/);
  assert.match(gameSource, /gs-btn--ghost/);
  assert.ok(
    gameSource.includes('<GameChrome') || gameSource.includes('gs-head'),
    'expected GameChrome or gs-head on yingge shell',
  );
});
