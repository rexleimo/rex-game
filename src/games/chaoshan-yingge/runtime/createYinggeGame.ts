import * as Phaser from 'phaser';

import { ENEMY_PROFILES, getStageDefinition } from '../content/stages';
import { applyMorale, cycleFormation, getFormationModifiers, resolveCombatAttack } from '../core/combat';
import {
  ATTACK_CULTURE_LABELS,
  FORMATION_CULTURE_LABELS,
  evaluateCulturalResponse,
  formatEnemyCultureGuide,
  getEnemyCultureGuide,
} from '../core/culturalCombat';
import { calculatePerformanceResult } from '../core/rhythm';
import type {
  ChapterDefinition,
  ChapterOutcome,
  CombatAttackKind,
  EnemyKind,
  FormationKind,
  StageDefinition,
  TimingJudgment,
  YinggeGameConfig,
} from '../core/types';
import { scheduleDrumLoop } from './drumAudio';
import { drawStageArt } from './stageArt';

interface RuntimeOptions {
  chapter: ChapterDefinition;
  config: YinggeGameConfig;
  audioContext: AudioContext | null;
  onReady: () => void;
  onFinish: (outcome: ChapterOutcome) => void;
}

export interface YinggeRuntimeHandle {
  destroy: () => void;
  togglePause: () => void;
}

interface Enemy {
  body: Phaser.GameObjects.Container;
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  speed: number;
  strikeDamage: number;
  strikeInterval: number;
  damageReduction: number;
  nextStrikeAt: number;
  phaseIndex: number;
  boss: boolean;
  defeated: boolean;
}

const WIDTH = 1280;
const HEIGHT = 720;
const GROUND_Y = 520;
const PLAYER_MIN_X = 210;
const PLAYER_MAX_X = 820;
const POSE_DURATION: Record<CombatAttackKind, number> = {
  thrust: 180, sweep: 260, smash: 360, counter: 300, ultimate: 620,
};
const TEAM_COLORS = ['red', 'jade', 'gold'] as const;

class YinggeCombatScene extends Phaser.Scene {
  private readonly runtimeOptions: RuntimeOptions;
  private readonly stage: StageDefinition;
  private player?: Phaser.GameObjects.Image;
  private team: Phaser.GameObjects.Image[] = [];
  private enemies: Enemy[] = [];
  private decorations: Phaser.GameObjects.Container[] = [];
  private heldKeys = new Set<string>();
  private touchLeft = false;
  private touchRight = false;
  private elapsedSeconds = 0;
  private lastAttackAt = -2;
  private hp = 100;
  private score = 0;
  private morale = 0;
  private combo = 0;
  private maxCombo = 0;
  private formation: FormationKind = 'snake';
  private culturalMatches = 0;
  private culturalAttempts = 0;
  private judgments: TimingJudgment[] = [];
  private nextWave = 0;
  private nextTutorial = 0;
  private bossSpawned = false;
  private finished = false;
  private guarding = false;
  private paused = false;
  private keyDownHandler?: (event: KeyboardEvent) => void;
  private keyUpHandler?: (event: KeyboardEvent) => void;
  private visibilityHandler?: () => void;
  private hpFill?: Phaser.GameObjects.Rectangle;
  private moraleFill?: Phaser.GameObjects.Rectangle;
  private bossFill?: Phaser.GameObjects.Rectangle;
  private bossTrack?: Phaser.GameObjects.Rectangle;
  private bossLabel?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private formationText?: Phaser.GameObjects.Text;
  private beatText?: Phaser.GameObjects.Text;
  private cultureGuideText?: Phaser.GameObjects.Text;
  private timerText?: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;

  constructor(options: RuntimeOptions) {
    super({ key: 'yingge-combat' });
    this.runtimeOptions = options;
    this.stage = getStageDefinition(options.chapter.id);
  }

  preload() {
    const characterRoot = '/assets/yingge/game/characters';
    for (const pose of ['idle', 'thrust', 'sweep', 'smash', 'guard', 'counter', 'hit', 'ultimate', 'victory']) {
      this.load.image(`lead-${pose}`, `${characterRoot}/head-hammer/${pose}.webp`);
    }
    for (const color of TEAM_COLORS) {
      this.load.image(`team-${color}-idle`, `${characterRoot}/team/member-${color}/idle.webp`);
      this.load.image(`team-${color}-attack`, `${characterRoot}/team/member-${color}/attack.webp`);
    }
    const enemyRoot = '/assets/yingge/game/enemies';
    for (const kind of Object.keys(ENEMY_PROFILES) as EnemyKind[]) {
      this.load.image(`enemy-${kind}`, `${enemyRoot}/${kind}/idle.webp`);
    }
  }

  create() {
    this.decorations = drawStageArt(this, this.stage.theme).scrolling;
    this.createActors();
    this.createHud();
    this.createTouchControls();
    this.createPauseOverlay();
    this.bindInput();
    const audioContext = this.runtimeOptions.audioContext;
    if (audioContext) {
      scheduleDrumLoop(
        audioContext,
        audioContext.currentTime + 0.1,
        this.runtimeOptions.chapter.beatMap.bpm,
        this.stage.durationSeconds + 2,
        this.runtimeOptions.config.muted,
      );
    }
    this.runtimeOptions.onReady();
  }

  update(_: number, deltaMs: number) {
    if (this.finished || this.paused || !this.player) return;
    this.elapsedSeconds += deltaMs / 1000;
    const delta = Math.min(deltaMs / 1000, 0.04);
    const elapsed = this.elapsed();
    this.updateMovement(delta);
    this.updateTeam(delta);
    this.updateEnemies(elapsed, delta);
    this.updateProcession(delta);
    this.spawnProgression(elapsed);
    this.showTutorialCues(elapsed);
    this.timerText?.setText(`${Math.max(0, Math.ceil(this.stage.durationSeconds - elapsed))} 秒`);
    if (elapsed >= this.stage.durationSeconds) this.finish(false);
  }

  public togglePause() {
    this.setPaused(!this.paused);
  }

  private createActors() {
    this.player = this.add.image(390, GROUND_Y, 'lead-idle').setOrigin(0.5, 0.9).setDisplaySize(230, 250).setDepth(12);
    this.team = TEAM_COLORS.map((color, index) => this.add.image(260 - index * 78, GROUND_Y + index * 5, `team-${color}-idle`)
      .setOrigin(0.5, 0.9).setDisplaySize(154, 190));
    this.applyFormation(true);
  }

  private createHud() {
    this.add.rectangle(28, 25, 1224, 128, 0xfff8e8, 0.94).setOrigin(0).setStrokeStyle(2, 0x8b3428, 0.38).setDepth(20);
    this.add.text(50, 40, `第 ${this.runtimeOptions.chapter.order} 章 · ${this.runtimeOptions.chapter.title}`, {
      fontFamily: '"Noto Serif SC", "STSong", serif', fontSize: '25px', fontStyle: 'bold', color: '#3a2820',
    }).setDepth(21);
    this.add.text(50, 76, this.stage.objective, {
      fontFamily: '"Noto Sans SC", sans-serif', fontSize: '13px', color: '#725b4b',
    }).setDepth(21);
    this.add.rectangle(50, 126, 270, 16, 0x8f7860, 0.25).setOrigin(0, 0.5).setDepth(21);
    this.hpFill = this.add.rectangle(50, 126, 270, 16, 0xb92e24).setOrigin(0, 0.5).setDepth(22);
    this.formationText = this.add.text(382, 54, FORMATION_CULTURE_LABELS[this.formation], {
      fontFamily: '"Noto Serif SC", serif', fontSize: '21px', fontStyle: 'bold', color: '#17605c',
    }).setDepth(21);
    this.comboText = this.add.text(382, 92, '连槌 00', { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#7b3328' }).setDepth(21);
    this.scoreText = this.add.text(750, 52, '功绩 000000', { fontFamily: 'Georgia, serif', fontSize: '21px', color: '#3a2820' }).setDepth(21);
    this.timerText = this.add.text(1090, 45, `${this.stage.durationSeconds} 秒`, {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#3a2820',
    }).setOrigin(1, 0).setDepth(21);
    this.add.text(750, 92, '士气', { fontFamily: '"Noto Sans SC", sans-serif', fontSize: '15px', color: '#725b4b' }).setDepth(21);
    this.add.rectangle(800, 105, 290, 14, 0x8f7860, 0.24).setOrigin(0, 0.5).setDepth(21);
    this.moraleFill = this.add.rectangle(800, 105, 290, 14, 0xd29a32).setOrigin(0, 0.5).setScale(0, 1).setDepth(22);
    this.beatText = this.add.text(1220, 91, '自由出槌', {
      fontFamily: '"Noto Serif SC", serif', fontSize: '17px', fontStyle: 'bold', color: '#8b3428',
    }).setOrigin(1, 0).setDepth(21);
    this.add.rectangle(28, 162, 760, 48, 0xfff8e8, 0.9).setOrigin(0).setStrokeStyle(1, 0x17605c, 0.45).setDepth(20);
    this.cultureGuideText = this.add.text(48, 175, `本章文化任务：${this.stage.culturalMission}`, {
      fontFamily: '"Noto Sans SC", sans-serif', fontSize: '14px', color: '#315c58', wordWrap: { width: 720 },
    }).setDepth(21);
    this.bossLabel = this.add.text(1010, 174, this.stage.boss.label, {
      fontFamily: '"Noto Serif SC", serif', fontSize: '17px', color: '#713027',
    }).setOrigin(0.5).setVisible(false).setDepth(21);
    this.bossTrack = this.add.rectangle(1010, 202, 390, 12, 0x674e43, 0.2).setVisible(false).setDepth(21);
    this.bossFill = this.add.rectangle(815, 202, 390, 12, 0x8f2d25)
      .setOrigin(0, 0.5).setVisible(false).setDepth(22);
  }

  private createTouchControls() {
    this.input.addPointer(3);
    this.createHoldButton(55, '◀', (active) => { this.touchLeft = active; });
    this.createHoldButton(145, '▶', (active) => { this.touchRight = active; });
    this.createActionButton(500, '换阵', () => this.changeFormation(), 0xe2efe7, 0x17605c);
    this.createHoldButton(620, 'U 守势', (active) => this.setGuard(active));
    this.createActionButton(760, 'J 点槌', () => this.attack('thrust'));
    this.createActionButton(880, 'K 展槌', () => this.attack('sweep'));
    this.createActionButton(1000, 'L 震槌', () => this.attack('smash'));
    this.createActionButton(1140, '众槌同声', () => this.attack('ultimate'), 0xfff0c6, 0xd29a32);
  }

  private createActionButton(x: number, label: string, action: () => void, fill = 0xfff5df, stroke = 0x8b3428) {
    const button = this.add.rectangle(x, 665, x < 200 ? 74 : 104, 62, fill, 0.9)
      .setStrokeStyle(2, stroke, 0.7).setInteractive().setDepth(30);
    this.add.text(x, 665, label, { fontFamily: '"Noto Sans SC", sans-serif', fontSize: '17px', color: '#3a2820' })
      .setOrigin(0.5).setDepth(31);
    button.on('pointerdown', action);
  }

  private createHoldButton(x: number, label: string, action: (active: boolean) => void) {
    const button = this.add.rectangle(x, 665, x < 200 ? 74 : 104, 62, 0xfff5df, 0.9)
      .setStrokeStyle(2, 0x8b3428, 0.7).setInteractive().setDepth(30);
    this.add.text(x, 665, label, { fontFamily: '"Noto Sans SC", sans-serif', fontSize: '17px', color: '#3a2820' })
      .setOrigin(0.5).setDepth(31);
    button.on('pointerdown', () => action(true));
    button.on('pointerup', () => action(false));
    button.on('pointerout', () => action(false));
  }

  private createPauseOverlay() {
    const shade = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x283638, 0.68);
    const panel = this.add.rectangle(WIDTH / 2, HEIGHT / 2, 520, 240, 0xfff5df, 0.98).setStrokeStyle(4, 0x8b3428, 0.8);
    const title = this.add.text(WIDTH / 2, HEIGHT / 2 - 45, '巡游暂停', {
      fontFamily: '"Noto Serif SC", serif', fontSize: '42px', fontStyle: 'bold', color: '#3a2820',
    }).setOrigin(0.5);
    const note = this.add.text(WIDTH / 2, HEIGHT / 2 + 34, '按 P / Esc 或点击上方暂停按钮继续', {
      fontFamily: '"Noto Sans SC", sans-serif', fontSize: '17px', color: '#725b4b',
    }).setOrigin(0.5);
    this.pauseOverlay = this.add.container(0, 0, [shade, panel, title, note]).setDepth(80).setVisible(false);
  }

  private bindInput() {
    this.keyDownHandler = (event) => {
      if (event.code === 'Escape' || event.code === 'KeyP') {
        event.preventDefault();
        if (!event.repeat) this.togglePause();
        return;
      }
      if (this.paused) return;
      this.heldKeys.add(event.code);
      if (event.repeat) return;
      if (event.code === 'KeyJ') this.attack('thrust');
      if (event.code === 'KeyK') this.attack('sweep');
      if (event.code === 'KeyL') this.attack('smash');
      if (event.code === 'KeyU') this.setGuard(true);
      if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') this.changeFormation();
      if (event.code === 'Space') { event.preventDefault(); this.attack('ultimate'); }
    };
    this.keyUpHandler = (event) => {
      this.heldKeys.delete(event.code);
      if (event.code === 'KeyU') this.setGuard(false);
    };
    this.visibilityHandler = () => { if (document.hidden && !this.finished) this.setPaused(true); };
    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.keyDownHandler) window.removeEventListener('keydown', this.keyDownHandler);
      if (this.keyUpHandler) window.removeEventListener('keyup', this.keyUpHandler);
      if (this.visibilityHandler) document.removeEventListener('visibilitychange', this.visibilityHandler);
    });
  }

  private setPaused(paused: boolean) {
    if (this.finished || this.paused === paused) return;
    this.paused = paused;
    this.pauseOverlay?.setVisible(paused);
    this.heldKeys.clear();
    this.touchLeft = false;
    this.touchRight = false;
    this.setGuard(false);
    if (paused) void this.runtimeOptions.audioContext?.suspend();
    else void this.runtimeOptions.audioContext?.resume();
  }

  private updateMovement(delta: number) {
    if (!this.player) return;
    const left = this.heldKeys.has('KeyA') || this.heldKeys.has('ArrowLeft') || this.touchLeft;
    const right = this.heldKeys.has('KeyD') || this.heldKeys.has('ArrowRight') || this.touchRight;
    const speed = 260 * getFormationModifiers(this.formation).speedMultiplier;
    this.player.x = Phaser.Math.Clamp(this.player.x + ((right ? 1 : 0) - (left ? 1 : 0)) * speed * delta, PLAYER_MIN_X, PLAYER_MAX_X);
  }

  private updateTeam(delta: number) {
    if (!this.player) return;
    const offsets = this.formationOffsets();
    this.team.forEach((member, index) => {
      member.x = Phaser.Math.Linear(member.x, this.player!.x + offsets[index].x, Math.min(1, delta * 7));
      member.y = Phaser.Math.Linear(member.y, GROUND_Y + offsets[index].y, Math.min(1, delta * 7));
    });
  }

  private formationOffsets() {
    if (this.formation === 'circle') return [{ x: -88, y: -42 }, { x: -128, y: 30 }, { x: 66, y: 28 }];
    if (this.formation === 'goose') return [{ x: -96, y: -42 }, { x: -178, y: 4 }, { x: -260, y: 46 }];
    return [{ x: -105, y: 4 }, { x: -195, y: 10 }, { x: -285, y: 16 }];
  }

  private applyFormation(immediate = false) {
    if (!this.player) return;
    const offsets = this.formationOffsets();
    this.team.forEach((member, index) => {
      if (immediate) member.setPosition(this.player!.x + offsets[index].x, GROUND_Y + offsets[index].y);
      member.setDepth(10 - index);
    });
  }

  private changeFormation() {
    if (this.finished || this.paused) return;
    this.formation = cycleFormation(this.formation);
    this.formationText?.setText(FORMATION_CULTURE_LABELS[this.formation]);
    this.applyFormation();
    this.flash(FORMATION_CULTURE_LABELS[this.formation], '#17605c');
  }

  private setGuard(active: boolean) {
    this.guarding = active && !this.paused;
    if (this.guarding) this.player?.setTexture('lead-guard');
    else if (!this.finished) this.player?.setTexture('lead-idle');
  }

  private attack(kind: CombatAttackKind) {
    if (this.finished || this.paused || !this.player) return;
    const elapsed = this.elapsed();
    if (kind === 'ultimate' && this.morale < 100) { this.flash('士气未满', '#725b4b'); return; }
    const cooldown = kind === 'thrust' ? 0.23 : kind === 'sweep' ? 0.38 : kind === 'smash' ? 0.58 : 0.32;
    if (kind !== 'counter' && elapsed - this.lastAttackAt < cooldown) return;
    this.lastAttackAt = elapsed;
    this.guarding = false;
    const result = resolveCombatAttack({
      attack: kind, formation: this.formation, beatDeltaSeconds: this.nearestBeatDelta(elapsed), combo: this.combo,
    });
    this.morale = kind === 'ultimate' ? 0 : applyMorale(this.morale, result.moraleGain).morale;
    this.player.setTexture(`lead-${kind}`);
    this.team.forEach((member, index) => member.setTexture(`team-${TEAM_COLORS[index]}-attack`));
    const hits = this.enemies.filter((enemy) => !enemy.defeated && enemy.body.x >= this.player!.x - 20
      && enemy.body.x - this.player!.x <= result.range);
    let bestCultureCue = '';
    let bestCultureScore = -1;
    for (const enemy of hits) {
      const response = evaluateCulturalResponse(enemy.kind, kind, this.formation, result.judgment);
      this.culturalAttempts += 1;
      if (response.cultureScore === 3) this.culturalMatches += 1;
      if (kind !== 'ultimate') this.morale = applyMorale(this.morale, response.moraleBonus).morale;
      this.score += response.cultureScore * 35;
      this.damageEnemy(enemy, Math.round(result.damage * response.damageMultiplier), result.knockback, kind);
      if (response.cultureScore > bestCultureScore) {
        bestCultureCue = response.cue;
        bestCultureScore = response.cultureScore;
      }
    }
    if (hits.length > 0) {
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.score += Math.round(result.damage * hits.length * (1 + this.combo * 0.05));
    }
    this.judgments.push(result.judgment === 'perfect' ? 'perfect' : result.judgment === 'on-beat' ? 'great' : 'good');
    const rhythmCue = result.judgment === 'perfect' ? '正合鼓心' : result.judgment === 'on-beat' ? '槌随鼓走' : `${ATTACK_CULTURE_LABELS[kind]} · 先听鼓心`;
    this.flash(bestCultureCue || rhythmCue, bestCultureScore === 3 ? '#17605c' : result.judgment === 'free' ? '#725b4b' : '#a62b22');
    this.refreshHud();
    this.time.delayedCall(POSE_DURATION[kind], () => {
      if (!this.finished) this.player?.setTexture(this.guarding ? 'lead-guard' : 'lead-idle');
      this.team.forEach((member, index) => member.setTexture(`team-${TEAM_COLORS[index]}-idle`));
    });
    if (kind === 'ultimate') this.ultimateEffect();
  }

  private nearestBeatDelta(elapsed: number) {
    const beat = 60 / this.runtimeOptions.chapter.beatMap.bpm;
    const phase = ((elapsed % beat) + beat) % beat;
    return Math.min(phase, beat - phase);
  }

  private damageEnemy(enemy: Enemy, rawDamage: number, knockback: number, attack: CombatAttackKind) {
    const reduction = attack === 'smash' ? enemy.damageReduction * 0.45 : enemy.damageReduction;
    const damage = Math.max(1, Math.round(rawDamage * (1 - reduction)));
    enemy.hp = Math.max(0, enemy.hp - damage);
    enemy.body.x += knockback * (enemy.boss ? 0.22 : 1);
    this.tweens.add({ targets: enemy.body, alpha: 0.42, duration: 65, yoyo: true });
    if (enemy.boss) this.bossFill?.setScale(enemy.hp / enemy.maxHp, 1);
    if (enemy.hp > 0) return;
    enemy.defeated = true;
    this.score += enemy.boss ? 2600 : 220 + Math.round(enemy.maxHp);
    this.tweens.add({ targets: enemy.body, alpha: 0, y: enemy.body.y - 48, duration: 300, onComplete: () => enemy.body.destroy() });
    if (enemy.boss) this.finish(true);
  }

  private updateEnemies(elapsed: number, delta: number) {
    if (!this.player) return;
    for (const enemy of this.enemies) {
      if (enemy.defeated) continue;
      this.updateBossPhase(enemy);
      const distance = enemy.body.x - this.player.x;
      const rush = enemy.kind === 'pouncer' && distance > 130 && distance < 360 ? 1.65 : 1;
      if (distance > 94) enemy.body.x -= enemy.speed * rush * delta;
      else if (elapsed >= enemy.nextStrikeAt) {
        enemy.nextStrikeAt = elapsed + enemy.strikeInterval;
        this.enemyStrike(enemy);
      }
      if (enemy.kind === 'flanker') enemy.body.y = GROUND_Y + Math.sin(elapsed * 5 + enemy.body.x) * 9;
    }
  }

  private updateBossPhase(enemy: Enemy) {
    if (!enemy.boss) return;
    const phase = this.stage.boss.phases[enemy.phaseIndex];
    if (!phase || enemy.hp / enemy.maxHp > phase.threshold) return;
    enemy.speed *= phase.speedMultiplier;
    enemy.strikeInterval *= phase.strikeIntervalMultiplier;
    enemy.phaseIndex += 1;
    this.flash(phase.cue, '#8b3428');
    this.cameras.main.shake(this.runtimeOptions.config.reducedMotion ? 45 : 150, 0.005);
  }

  private enemyStrike(enemy: Enemy) {
    if (this.guarding) { this.attack('counter'); this.flash('守中反击', '#17605c'); return; }
    const taken = enemy.strikeDamage * getFormationModifiers(this.formation).damageTakenMultiplier;
    this.hp = Math.max(0, this.hp - taken);
    this.combo = 0;
    this.judgments.push('miss');
    this.player?.setTexture('lead-hit');
    this.cameras.main.shake(this.runtimeOptions.config.reducedMotion ? 40 : 110, 0.004);
    this.refreshHud();
    this.time.delayedCall(180, () => this.player?.setTexture(this.guarding ? 'lead-guard' : 'lead-idle'));
    if (this.hp <= 0) this.finish(false);
  }

  private spawnProgression(elapsed: number) {
    const wave = this.stage.waves[this.nextWave];
    if (wave && elapsed >= wave.at) {
      wave.enemies.forEach((kind, index) => this.spawnEnemy(1160 + index * 118, kind, false));
      this.showEnemyCultureGuide(wave.enemies[0]);
      this.flash(wave.cue, '#8b3428');
      this.nextWave += 1;
    }
    const lastWaveAt = this.stage.waves[this.stage.waves.length - 1].at;
    const active = this.enemies.some((enemy) => !enemy.defeated);
    if (!this.bossSpawned && this.nextWave >= this.stage.waves.length && (!active || elapsed >= lastWaveAt + 9)) {
      this.bossSpawned = true;
      this.spawnEnemy(1180, this.stage.boss.kind, true);
      this.bossLabel?.setVisible(true);
      this.bossFill?.setVisible(true).setScale(1, 1);
      this.bossTrack?.setVisible(true);
      this.showEnemyCultureGuide(this.stage.boss.kind);
      this.flash(`${this.stage.boss.label} · 稳阵迎击`, '#8b3428');
    }
  }

  private spawnEnemy(x: number, kind: EnemyKind, boss: boolean) {
    const profile = ENEMY_PROFILES[kind];
    const body = this.add.container(x, GROUND_Y).setDepth(8);
    const scale = boss ? 1.35 : 1;
    const width = boss ? Math.max(profile.displaySize[0] * scale, 220) : profile.displaySize[0];
    const height = boss ? Math.max(profile.displaySize[1] * scale, 230) : profile.displaySize[1];
    const shadow = this.add.ellipse(0, 3, width * 0.68, Math.max(18, height * 0.1), 0x4c5e5e, 0.2);
    const image = this.add.image(0, 0, `enemy-${kind}`).setOrigin(0.5, 0.92).setDisplaySize(width, height);
    body.add([shadow, image]);
    const hp = boss ? this.stage.boss.hp : profile.hp;
    this.enemies.push({
      body, kind, hp, maxHp: hp,
      speed: boss ? this.stage.boss.speed : profile.speed,
      strikeDamage: boss ? this.stage.boss.strikeDamage : profile.strikeDamage,
      strikeInterval: boss ? this.stage.boss.strikeInterval : profile.strikeInterval,
      damageReduction: profile.damageReduction,
      nextStrikeAt: 0, phaseIndex: 0, boss, defeated: false,
    });
  }

  private showEnemyCultureGuide(kind: EnemyKind) {
    const profile = ENEMY_PROFILES[kind];
    const guide = getEnemyCultureGuide(kind);
    this.cultureGuideText?.setText(`破障不是乱打｜${profile.label}：${formatEnemyCultureGuide(kind)}｜${guide.lesson}`);
  }

  private showTutorialCues(elapsed: number) {
    const cue = this.stage.tutorialCues[this.nextTutorial];
    if (!cue || elapsed < cue.at) return;
    this.flash(cue.text, '#17605c');
    this.nextTutorial += 1;
  }

  private updateProcession(delta: number) {
    for (const object of this.decorations) {
      object.x -= this.stage.processionSpeed * delta;
      if (object.x < -360) object.x += 1640;
    }
  }

  private refreshHud() {
    this.hpFill?.setScale(this.hp / 100, 1);
    this.moraleFill?.setScale(this.morale / 100, 1);
    this.scoreText?.setText(`功绩 ${String(this.score).padStart(6, '0')}`);
    this.comboText?.setText(`连槌 ${String(this.combo).padStart(2, '0')}`);
  }

  private flash(label: string, color: string) {
    this.beatText?.setText(label).setColor(color).setAlpha(1);
    if (!this.beatText) return;
    this.tweens.killTweensOf(this.beatText);
    this.tweens.add({ targets: this.beatText, alpha: 0.56, duration: this.runtimeOptions.config.reducedMotion ? 80 : 420 });
  }

  private ultimateEffect() {
    const ring = this.add.circle(this.player?.x ?? 400, 470, 40, 0xd8a33e, 0.32).setStrokeStyle(8, 0xb92e24, 0.78).setDepth(18);
    this.tweens.add({ targets: ring, scale: 9, alpha: 0, duration: this.runtimeOptions.config.reducedMotion ? 180 : 620, onComplete: () => ring.destroy() });
    this.cameras.main.shake(this.runtimeOptions.config.reducedMotion ? 60 : 250, 0.007);
  }

  private elapsed() {
    return this.elapsedSeconds + this.runtimeOptions.config.latencyOffsetMs / 1000;
  }

  private finish(victory: boolean) {
    if (this.finished) return;
    this.finished = true;
    this.paused = false;
    void this.runtimeOptions.audioContext?.resume();
    this.pauseOverlay?.setVisible(false);
    this.player?.setTexture(victory ? 'lead-victory' : 'lead-hit');
    const result = calculatePerformanceResult({
      judgments: this.judgments.length > 0 ? this.judgments : ['good'],
      maxCombo: this.maxCombo,
      formationHits: this.culturalMatches,
      formationTotal: Math.max(1, this.culturalAttempts),
    });
    this.flash(victory ? '巡游开路 · 英歌成阵' : '收稳阵脚 · 再战一巡', victory ? '#17605c' : '#8b3428');
    this.time.delayedCall(820, () => this.runtimeOptions.onFinish({ victory, result, score: this.score, remainingHp: Math.round(this.hp) }));
  }
}

export function createYinggeGame(container: HTMLElement, options: RuntimeOptions): YinggeRuntimeHandle {
  const scene = new YinggeCombatScene(options);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    parent: container,
    backgroundColor: '#f2e5c9',
    render: { antialias: true, pixelArt: false, roundPixels: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [scene],
    audio: { noAudio: true },
  });

  return {
    destroy() { game.destroy(true); },
    togglePause() { scene.togglePause(); },
  };
}
