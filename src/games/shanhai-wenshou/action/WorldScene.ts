import * as Phaser from 'phaser';
import type { BeastId } from '../core/types.ts';
import { getBeast, scaleBeast } from '../content/beasts.ts';
import type { DerivedStats } from '../core/progression.ts';
import type { DifficultyProfile } from './frameData.ts';
import { DIFFICULTIES, PLAYER_FRAMES, VIEW_H, VIEW_W, calcDamage, canAskName, hitstopMs, insightCount, knockbackVelocity, shakePx, type Difficulty, type InputFrame, type WeightClass } from './frameData.ts';
import { getMoveset, type BeastMove, type BeastMoveset } from './moves.ts';
import { buildCommonArt, buildMountainArt, DECO_TEX, TEX } from './art.ts';
import { buildLevel, type LevelDef, type PickupDef } from './levels.ts';
import { MOUNTAINS } from '../content/mountains.ts';

const MOUNTAIN_IDS = MOUNTAINS.map((m) => m.id);
import type { InsightProgress } from './rules.ts';
import { initInsight, refreshInsight, registerMercy, settleBattle } from './rules.ts';
import { bus, sceneCmd } from './bus.ts';
import { playCue, playSfx } from './audio.ts';

/**
 * 世界场景：Phaser 只渲状态（GDD §7）——移动/战斗由固定步长驱动，
 * 数值全部来自 frameData/moves/rules 三个纯函数模块。
 */

const STEP_MS = 1000 / 60;

/** Arcade body 类型收窄（sprite.body 是 Body|StaticBody 联合）。 */
function bodyOf(e: { body: unknown }): Phaser.Physics.Arcade.Body {
  // e.body 是物理精灵，真正的 Arcade Body 在其 .body 属性上
  const sprite = e.body as unknown as { body?: Phaser.Physics.Arcade.Body };
  return sprite.body!;
}

export interface WorldConfig {
  mountain: import('../core/types.ts').MountainId;
  stats: DerivedStats;
  hp: number;
  qi: number;
  party: BeastId[];
  hasHerb: boolean;
  difficulty: Difficulty;
  collected: string[];
  patrol?: { beastId: BeastId; level: number; title: string };
  freshBoss: boolean;
  freshElite: boolean;
  /** boss 入场对话（beforeBoss 剧情）。 */
  bossIntro?: { name: string; lines: string[] };
  /** 二周目强化：全部兽等级加成。 */
  ngBoost?: number;
  /** 行囊物品 id（知识门「持有即过」判定）。 */
  inventory: string[];
  /** 累计收服数（名缚门）。 */
  tamedTotal: number;
  /** 隐藏 boss（通关后重访本山出现）。 */
  hiddenBeast?: boolean;
  /** 素材基址：默认像素管线，可切 Kenney/itch 覆盖包（assets.ts）。 */
  assetBase?: string;
}

type PlayerState =
  | 'idle' | 'run' | 'jump' | 'roll' | 'climb'
  | 'light1' | 'light2' | 'light3' | 'heavy_charge' | 'heavy_release'
  | 'parry' | 'hurt' | 'stagger' | 'getup' | 'dead';

interface BeastEnt {
  id: number;
  beastId: BeastId;
  name: string;
  title?: string;
  zone: 'wild' | 'elite' | 'boss';
  moveset: BeastMoveset;
  weight: WeightClass;
  level: number;
  isWuming: boolean;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  stance: number;
  stanceMax: number;
  state: 'sleep' | 'chase' | 'windup' | 'active' | 'recover' | 'stagger' | 'downed' | 'fakedeath' | 'dead';
  stateF: number;
  move: BeastMove | null;
  cds: Map<string, number>;
  dir: 1 | -1;
  homeX: number;
  aggro: boolean;
  hitBySwing: number;
  hitPlayerThisMove: boolean;
  progress: InsightProgress;
  fakedOnce: boolean;
  enraged: boolean;
  phase: 1 | 2;
  standH: number;
  body: Phaser.Physics.Arcade.Sprite;
  rig: Phaser.GameObjects.Container;
  img: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  ring: Phaser.GameObjects.Image | null;
  hpbar: Phaser.GameObjects.Graphics | null;
  spawn: { x: number; level: number };
  aggroSpeed: number;
}

interface Projectile {
  img: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  dmgMult: number;
  atk: number;
  effect?: BeastMove['onHit'];
  life: number;
  fromPlayer: boolean;
}

interface PickupEnt {
  def: PickupDef;
  img: Phaser.GameObjects.Image;
  key: string;
  taken: boolean;
}

interface GateEnt {
  def: import('./levels.ts').GateDef;
  wall: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  quietT: number;
  parries: number;
  tideT: number;
  hintCd: number;
  open: boolean;
}

/** 兽 → 精灵表帧组（beasts.png 每兽 2 帧）。 */
const BEAST_INDEX: Record<string, number> = {
  xingxing: 0, baiyuan: 1, fuchong: 2, guaishe: 3, lushu: 4, xuangui: 5,
  lu: 6, lei: 7, boyi: 8, changfu: 9, guanguan: 10, chiru: 11, jiuwei: 12,
};
const PIXEL_BASE = '/assets/shanhai-wenshou/pixel/';

export class WorldScene extends Phaser.Scene {
  private cfg!: WorldConfig;
  private level!: LevelDef;
  private diff!: DifficultyProfile;

  private playerBody!: Phaser.Physics.Arcade.Sprite;
  private playerSpr!: Phaser.GameObjects.Sprite;

  private hp = 0;
  private maxHp = 0;
  private qi = 0;
  private maxQi = 0;
  private shield = 0;
  private pstate: PlayerState = 'idle';
  private pf = 0;
  private facing: 1 | -1 = 1;
  private comboIndex = 0;
  private comboResetF = 0;
  private chargeF = 0;
  private iframes = 0;
  private poisonF = 0;
  private poisonTick = 0;
  private invertF = 0;
  private hasteF = 0;
  private swingId = 0;
  private coyote = 0;
  private parrySuccessF = 0;
  private itemCd = 0;
  private beastCds: number[] = [0, 0, 0];
  private deaths = 0;
  private respawnX = 140;
  private bossResolved = false;
  private eliteResolved = false;
  private riteEmitted = false;
  private adviseGiven = false;
  private checkpointCd = 0;

  private beasts: BeastEnt[] = [];
  private projectiles: Projectile[] = [];
  private pickupEnts: PickupEnt[] = [];
  private gates: GateEnt[] = [];
  private thornCd = 0;
  private cluesCollected = 0;
  private jadeCollected = 0;
  /** 本次驻足已谈过的话头（离开范围后清除，防止对话反复弹）。 */
  private talked = new Set<string>();
  private nextBeastId = 1;

  private solids!: Phaser.GameObjects.Group;
  private gateWall: Phaser.GameObjects.Rectangle | null = null;
  private arenaWalls: Phaser.GameObjects.Rectangle[] = [];
  private bossEngaged = false;
  private currentBoss: BeastEnt | null = null;
  private target: BeastEnt | null = null;

  private get pbody(): Phaser.Physics.Arcade.Body {
    return this.playerBody.body as Phaser.Physics.Arcade.Body;
  }

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private prev: InputFrame = this.emptyPrev();
  /** 输入缓冲（帧）：非可操作态按下的键保留 8 帧，进入可操作态即执行——动作手感基础件。 */
  private buf: Partial<Record<keyof InputFrame, number>> = {};
  private acc = 0;
  private frame = 0;
  private hitstopLeft = 0;
  private camManuel = false;
  private fogTile?: Phaser.GameObjects.TileSprite;
  private skyTiles?: { clouds: Phaser.GameObjects.TileSprite; rf: Phaser.GameObjects.TileSprite; rm: Phaser.GameObjects.TileSprite; rn: Phaser.GameObjects.TileSprite };
  private cloudDrift = 0;
  private swoosh!: Phaser.GameObjects.Image;
  private emitters!: { ink: Phaser.GameObjects.Particles.ParticleEmitter; gold: Phaser.GameObjects.Particles.ParticleEmitter; heal: Phaser.GameObjects.Particles.ParticleEmitter };

  constructor() {
    super('world');
  }

  preload(): void {
    const base = this.cfg?.assetBase ?? PIXEL_BASE;
    this.load.spritesheet('pl', `${base}pl.png`, { frameWidth: 48, frameHeight: 64 });
    this.load.spritesheet('beasts', `${base}beasts.png`, { frameWidth: 88, frameHeight: 80 });
    for (const m of MOUNTAIN_IDS) {
      this.load.image(`gd_${m}`, `${base}ground_${m}.png`);
      this.load.image(`pf_${m}`, `${base}plat_${m}.png`);
      this.load.image(`wt_${m}`, `${base}water_${m}.png`);
      this.load.image(`rf_${m}`, `${base}rf_${m}.png`);
      this.load.image(`rm_${m}`, `${base}rm_${m}.png`);
      this.load.image(`rn_${m}`, `${base}rn_${m}.png`);
    }
    this.load.image('p_lantern', `${base}lantern.png`);
    this.load.image('p_shrine', `${base}shrine.png`);
    this.load.image('p_stele', `${base}stele.png`);
    this.load.image('p_herb', `${base}herb.png`);
    this.load.image('p_jade', `${base}jade.png`);
    this.load.image('p_clue', `${base}clue.png`);
  }

  init(data: { cfg: WorldConfig; level?: LevelDef }): void {
    this.cfg = data.cfg;
    this.diff = DIFFICULTIES[data.cfg.difficulty];
    this.level = data.level ?? buildLevel(data.cfg.mountain, { hidden: data.cfg.hiddenBeast });
    this.beasts = [];
    this.projectiles = [];
    this.gates = [];
    this.bossResolved = !data.cfg.freshBoss;
    this.eliteResolved = !data.cfg.freshElite;
    this.bossEngaged = false;
    this.currentBoss = null;
    this.riteEmitted = false;
    this.adviseGiven = false;
    this.deaths = 0;
    this.gateWall = null;
    this.arenaWalls = [];
  }

  create(): void {
    const m = this.cfg.mountain;
    buildMountainArt(this, m, this.level.night);
    buildCommonArt(this);

    this.maxHp = this.cfg.stats.maxHp;
    this.hp = Math.max(1, Math.min(this.cfg.hp, this.maxHp));
    this.maxQi = this.cfg.stats.maxQi;
    this.qi = Math.max(0, Math.min(this.cfg.qi, this.maxQi));
    this.respawnX = this.level.checkpoints[0] ?? 140;

    const { width, groundY } = this.level;
    this.physics.world.setBounds(0, -400, width, groundY + 480);

    // —— 视差背景（像素山五层：天穹 / 云带 / 雪峰 / 圆丘 / 树线）——
    this.add.image(VIEW_W / 2, VIEW_H / 2, TEX.sky(m)).setScrollFactor(0).setDepth(-30).setDisplaySize(VIEW_W + 2, VIEW_H);
    this.skyTiles = {
      clouds: this.add.tileSprite(0, 22, VIEW_W, 150, TEX.clouds).setOrigin(0).setScrollFactor(0).setDepth(-29),
      rf: this.add.tileSprite(0, -120, VIEW_W, 540, `rf_${m}`).setOrigin(0).setScrollFactor(0).setDepth(-28),
      rm: this.add.tileSprite(0, -40, VIEW_W, 540, `rm_${m}`).setOrigin(0).setScrollFactor(0).setDepth(-26),
      rn: this.add.tileSprite(0, 105, VIEW_W, 540, `rn_${m}`).setOrigin(0).setScrollFactor(0).setDepth(-24),
    };

    // —— 地形 ——
    this.solids = this.add.group();
    const groundRect = this.add.rectangle(width / 2, groundY + 40, width, 80);
    this.physics.add.existing(groundRect, true);
    this.solids.add(groundRect);
    this.add.tileSprite(width / 2, groundY + 42, width, 84, `gd_${m}`).setDepth(0);
    for (const p of this.level.platforms) {
      const r = this.add.rectangle(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h);
      this.physics.add.existing(r, true);
      this.solids.add(r);
      this.add.tileSprite(p.x + p.w / 2, p.y + p.h / 2, p.w, p.h, `pf_${m}`).setDepth(0);
    }
    for (const w of this.level.waters) {
      this.add.tileSprite(w.x + w.w / 2, groundY + 12, w.w, 40, `wt_${m}`).setDepth(1).setAlpha(0.85);
    }
    // —— 装饰与段落路牌（替代旧的半透明大字）——
    for (const d of this.level.decos) {
      const img = this.add.image(d.x, d.y, DECO_TEX[d.kind](m)).setOrigin(0.5, 1).setDepth(1);
      if (d.flip) img.setFlipX(true);
      if (d.kind === 'sign' && d.label) {
        this.add.text(d.x, d.y - 38, d.label, {
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '12px',
          color: '#4a3118',
        }).setOrigin(0.5).setDepth(2);
      }
    }
    for (const st of this.level.steles) {
      this.add.image(st.x, groundY - 38, 'p_stele').setDepth(1).setScale(1.3);
    }
    for (const c of this.level.checkpoints) {
      this.add.image(c, groundY - 34, 'p_lantern').setDepth(1).setScale(1.4);
      this.tweens.add({ targets: this.add.image(c, groundY - 42, TEX.glow).setDepth(1).setAlpha(0.5), alpha: 0.15, duration: 900, yoyo: true, repeat: -1 });
    }
    this.add.image(this.level.boss.arenaX + this.level.boss.arenaW - 80, groundY - 66, 'p_shrine').setDepth(1).setScale(1.5);

    // —— 拾取（过滤已采）——
    const collected = new Set(this.cfg.collected);
    for (const pk of this.level.pickups) {
      const key = pk.itemId ?? `clue@${pk.x}`;
      if (pk.itemId && collected.has(pk.itemId)) continue;
      const tex = pk.kind === 'clue' ? 'p_clue' : pk.kind === 'jade' ? 'p_jade' : 'p_herb';
      const img = this.add.image(pk.x, pk.y, tex).setDepth(2);
      this.tweens.add({ targets: img, y: pk.y - 5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.pickupEnts.push({ def: pk, img, key, taken: false });
    }

    // —— NPC ——
    for (const npc of this.level.npcs) {
      const tex = npc.name.includes('守祠') ? TEX.npcKeeper : npc.name === '阿果' ? TEX.npc : TEX.npcElder;
      const img = this.add.image(npc.x, groundY - 21, tex).setDepth(3);
      img.setData('npc', npc);
      img.setData('hinted', false);
    }

    // —— 玩家 ——
    this.playerBody = this.physics.add.sprite(60, groundY - 40, 'px').setVisible(false);
    this.pbody.setSize(20, 44);
    this.playerBody.setCollideWorldBounds(true);
    this.physics.add.collider(this.playerBody, this.solids);
    this.createPlayerAnims();
    this.playerSpr = this.add.sprite(60, groundY + 2, 'pl', 0).setOrigin(0.5, 0.97).setDepth(6);
    this.playerSpr.play('pl_idle');
    this.swoosh = this.add.image(0, 0, TEX.swoosh).setDepth(8).setVisible(false).setOrigin(0.15, 0.5);

    // —— 粒子 ——
    this.emitters = {
      ink: this.add.particles(0, 0, TEX.inkDrop, { lifespan: 420, speed: { min: 60, max: 240 }, scale: { start: 1, end: 0.2 }, alpha: { start: 0.9, end: 0 }, emitting: false, gravityY: 500 }).setDepth(8),
      gold: this.add.particles(0, 0, TEX.goldFlake, { lifespan: 620, speed: { min: 40, max: 190 }, scale: { start: 1, end: 0.3 }, alpha: { start: 1, end: 0 }, emitting: false, gravityY: 240 }).setDepth(8),
      heal: this.add.particles(0, 0, TEX.glow, { lifespan: 700, speedY: { min: -70, max: -20 }, scale: { start: 0.5, end: 0 }, alpha: { start: 0.7, end: 0 }, emitting: false }).setDepth(8),
    };

    // —— 兽（二周目：等级按 ngBoost 强化）——
    const boost = this.cfg.ngBoost ?? 0;
    for (const s of this.level.spawns) this.spawnBeast(s.beastId, s.x, s.level + boost, s.zone, s.title);
    const gate = this.level.eliteGate;
    if (gate && !this.eliteResolved) {
      this.spawnBeast(gate.spawn.beastId, gate.spawn.x, gate.spawn.level + boost, 'elite', gate.spawn.title);
      this.gateWall = this.add.rectangle(gate.x, groundY - 60, 12, 120);
      this.physics.add.existing(this.gateWall, true);
      this.solids.add(this.gateWall);
      this.gateWall.setData('gate', true);
    }
    if (this.cfg.patrol) {
      this.spawnBeast(this.cfg.patrol.beastId, this.level.width * 0.55, this.cfg.patrol.level + boost, 'elite', this.cfg.patrol.title);
    }
    if (!this.bossResolved) {
      this.spawnBeast(this.level.boss.spawn.beastId, this.level.boss.spawn.x, this.level.boss.spawn.level + Math.floor(boost * 0.6), 'boss', this.level.boss.spawn.title, this.level.boss.isWuming);
    }

    // —— 知识机关门 ——
    for (const g of this.level.gates) {
      const wall = this.add.rectangle(g.x, groundY - 70, 14, 140, 0x241f18, 0.9);
      this.physics.add.existing(wall, true);
      this.solids.add(wall);
      const label = this.add.text(g.x, groundY - 176, g.canon, { fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#e4c479' }).setOrigin(0.5).setDepth(2).setAlpha(0.9);
      this.gates.push({ def: g, wall, label, quietT: 0, parries: 0, tideT: 0, hintCd: 0, open: false });
    }
    // —— 荆棘 ——
    for (const t of this.level.thorns) {
      const spikes = this.add.graphics().setDepth(1);
      const n = Math.floor(t.w / 16);
      for (let i = 0; i < n; i += 1) {
        const x = t.x - t.w / 2 + i * 16;
        spikes.fillStyle(0x8a5a34, 1);
        spikes.fillTriangle(x, groundY, x + 8, groundY - 13, x + 16, groundY);
        spikes.fillStyle(0xd8b06a, 1);
        spikes.fillTriangle(x + 4, groundY, x + 8, groundY - 13, x + 10, groundY);
      }
      this.add.rectangle(t.x, groundY - 4, t.w, 8, 0x000000, 0).setData('thorn', t);
    }

    // —— 雾 / 纸纹 ——
    if (this.level.fog > 0.02) {
      this.fogTile = this.add.tileSprite(0, 0, VIEW_W + 240, VIEW_H, TEX.mist(m)).setOrigin(0).setScrollFactor(0.9).setDepth(20).setAlpha(this.level.fog * 0.75);
    }
    this.add.tileSprite(0, 0, VIEW_W, VIEW_H, TEX.grain).setOrigin(0).setScrollFactor(0).setDepth(21).setAlpha(0.55);

    // —— 摄像机（GDD §5.3：前瞻跟随 + 逐屏 clamp）——
    const cam = this.cameras.main;
    cam.setBounds(0, 0, width, VIEW_H);

    // —— 键位 ——
    const kb = this.input.keyboard!;
    this.keys = kb.addKeys('A,D,W,S,SPACE,J,K,L,I,Q,H,ONE,TWO,THREE') as Record<string, Phaser.Input.Keyboard.Key>;
    const arrows = kb.createCursorKeys();
    this.keys.LEFT = arrows.left;
    this.keys.RIGHT = arrows.right;
    this.keys.UP = arrows.up;
    this.keys.DOWN = arrows.down;

    this.input.keyboard!.on('keydown-ESC', () => {
      sceneCmd.paused = true;
      bus.emit('toast', '已暂停——点右上「继续」返回。');
    });

    // HUD 首帧
    this.time.delayedCall(60, () => {
      bus.emit('toast', this.level.night ? '夜山 行路小心——怪木间有兽鸣。' : '向东行——祠座可歇脚，兽可问名。');
      this.emitHud();
    });
  }

  /* ================= 兽生成 ================= */

  private spawnBeast(beastId: BeastId, x: number, level: number, zone: 'wild' | 'elite' | 'boss', title?: string, isWuming = false): BeastEnt {
    const def = getBeast(beastId)!;
    const scaled = scaleBeast(def.base, level, zone !== 'wild');
    // 野生猪兽血量加厚：太薄的血条会让「问名窗口」被连段直接跳过
    if (zone === 'wild') scaled.maxHp = Math.round(scaled.maxHp * 1.6);
    const moveset = getMoveset(beastId, isWuming);
    const weight: WeightClass = moveset.weight;
    const sizeByWeight: Record<WeightClass, [number, number, number]> = {
      light: [46, 40, 0.42],
      fierce: [60, 54, 0.55],
      ancient: [78, 70, zone === 'boss' ? 0.82 : 0.72],
    };
    const [bw, bh, , ] = sizeByWeight[weight];
    const body = this.physics.add.sprite(x, this.level.groundY - bh, 'px').setVisible(false);
    bodyOf({ body }).setSize(bw, bh);
    body.setCollideWorldBounds(true);
    this.physics.add.collider(body, this.solids);
    const sprScale = (weight === 'light' ? 0.92 : weight === 'fierce' ? 1.18 : zone === 'boss' ? 1.75 : 1.5);
    const img = this.add.sprite(0, 0, 'beasts', (BEAST_INDEX[beastId] ?? 0) * 2).setOrigin(0.5, 1).setScale(sprScale);
    const rig = this.add.container(x, this.level.groundY, [img]).setDepth(4);
    const label = this.add.text(x, this.level.groundY - 128, '', { fontFamily: "'Noto Serif SC', serif", fontSize: '14px', color: '#ffb0a0' }).setOrigin(0.5).setDepth(9).setAlpha(0);
    const hpbar = this.add.graphics().setDepth(5);
    const progress = initInsight();
    const ent: BeastEnt = {
      id: this.nextBeastId++,
      beastId, name: def.name, title, zone, moveset, weight, level, isWuming,
      hp: scaled.maxHp, maxHp: scaled.maxHp, atk: scaled.atk, def: scaled.def,
      stance: weight === 'light' ? 0 : (weight === 'fierce' ? 100 : 140),
      stanceMax: weight === 'fierce' ? 100 : 140,
      state: 'sleep', stateF: 0, move: null, cds: new Map(), dir: -1,
      homeX: x, aggro: false, hitBySwing: -1, hitPlayerThisMove: false,
      progress, fakedOnce: false, enraged: false, phase: 1,
      standH: bh,
      body, rig, img, label, ring: null, hpbar,
      spawn: { x, level },
      aggroSpeed: weight === 'light' ? 150 : weight === 'fierce' ? 118 : 92,
    };
    this.beasts.push(ent);
    return ent;
  }

  /* ================= 主循环 ================= */

  override update(_time: number, delta: number): void {
    if (sceneCmd.exit) {
      this.scene.stop();
      return;
    }
    const running = !sceneCmd.paused && !sceneCmd.dialogOpen;
    this.cloudDrift += delta * 0.004;
    if (running && this.physics.world.isPaused) this.physics.world.resume();
    if (!running && !this.physics.world.isPaused) this.physics.world.pause();
    if (running) {
      if (this.hitstopLeft > 0) {
        this.hitstopLeft -= delta;
      } else {
        this.acc += Math.min(delta, 100);
        while (this.acc >= STEP_MS) {
          this.acc -= STEP_MS;
          this.step();
        }
      }
    }
    this.syncPlayerRig(delta);
    for (const b of this.beasts) this.syncBeastRig(b, delta);
    this.updateCamera(delta);
    if (this.frame % 6 === 0) this.emitHud();
  }

  private emptyPrev(): InputFrame {
    return { left: false, right: false, up: false, down: false, jump: false, light: false, heavy: false, roll: false, parry: false, ask: false, beast1: false, beast2: false, beast3: false, item: false };
  }

  private readInput(): { cur: InputFrame; press: InputFrame } {
    const k = this.keys;
    const t = sceneCmd.touch;
    const flip = this.invertF > 0;
    const cur: InputFrame = {
      left: (k.A?.isDown || k.LEFT?.isDown || t.left) === true,
      right: (k.D?.isDown || k.RIGHT?.isDown || t.right) === true,
      up: (k.W?.isDown || k.UP?.isDown || t.up) === true,
      down: (k.S?.isDown || k.DOWN?.isDown || t.down) === true,
      jump: (k.W?.isDown || k.SPACE?.isDown || k.UP?.isDown || t.jump) === true,
      light: (k.J?.isDown || t.light) === true,
      heavy: (k.K?.isDown || t.heavy) === true,
      roll: (k.L?.isDown || t.roll) === true,
      parry: (k.I?.isDown || t.parry) === true,
      ask: (k.Q?.isDown || t.ask) === true,
      beast1: (k.ONE?.isDown || t.beast1) === true,
      beast2: (k.TWO?.isDown || t.beast2) === true,
      beast3: (k.THREE?.isDown || t.beast3) === true,
      item: (k.H?.isDown || t.item) === true,
    };
    if (flip) {
      const l = cur.left;
      cur.left = cur.right;
      cur.right = l;
    }
    const press = this.emptyPrev();
    (Object.keys(cur) as (keyof InputFrame)[]).forEach((key) => {
      press[key] = cur[key] && !this.prev[key];
      if (press[key]) this.buf[key] = 8;
      else if ((this.buf[key] ?? 0) > 0) this.buf[key] = (this.buf[key] ?? 0) - 1;
    });
    this.prev = cur;
    return { cur, press };
  }

  /** 消费缓冲中的一次按键（含本帧刚按下的）。 */
  private take(key: keyof InputFrame): boolean {
    if ((this.buf[key] ?? 0) > 0) {
      this.buf[key] = 0;
      return true;
    }
    return false;
  }

  /* ================= 固定步长模拟 ================= */

  private step(): void {
    this.frame += 1;
    const { cur, press } = this.readInput();
    const body = this.pbody;

    // 计时器
    if (this.iframes > 0) this.iframes -= 1;
    if (this.invertF > 0) this.invertF -= 1;
    if (this.hasteF > 0) this.hasteF -= 1;
    if (this.itemCd > 0) this.itemCd -= 1;
    if (this.checkpointCd > 0) this.checkpointCd -= 1;
    if (this.comboResetF > 0) this.comboResetF -= 1;
    else if (this.pstate === 'idle' || this.pstate === 'run') this.comboIndex = 0;
    if (this.parrySuccessF > 0) this.parrySuccessF -= 1;
    if (this.poisonF > 0) {
      this.poisonF -= 1;
      this.poisonTick += 1;
      if (this.poisonTick >= 30) {
        this.poisonTick = 0;
        this.damagePlayer(2, null, true);
      }
    }
    this.qi = Math.min(this.maxQi, this.qi + 0.03);

    // 死亡态：等待自动重生
    if (this.pstate === 'dead') {
      if (this.pf >= 70) this.respawn();
      this.pf += 1;
      return;
    }

    // 兽伴技 / 用药 / 问名（全局指令，任何可操作态可按）
    if (press.item) this.useHerb();
    if (press.beast1) this.companionSkill(0);
    if (press.beast2) this.companionSkill(1);
    if (press.beast3) this.companionSkill(2);

    const actionable = this.pstate === 'idle' || this.pstate === 'run' || this.pstate === 'jump';
    this.pickTarget();

    // 问名（仪式）
    if (press.ask && this.target && this.isNameReady(this.target)) {
      this.startNaming(this.target);
      return;
    }
    // 鯥假死行礼（慈悲）
    if (press.ask) {
      const fd = this.beasts.find((b) => b.state === 'fakedeath' && Math.abs(b.body.x - this.playerBody.x) < 90);
      if (fd && registerMercy(fd.progress, 'lu_bow')) {
        refreshInsight(fd.progress, fd.moveset.moves.length);
        bus.emit('toast', '你朝蛰伏的鯥行了一礼——「蛰伏非死」。性之印亮起。');
        this.emitters.gold.explode(10, fd.body.x, fd.body.y - 40);
        playSfx('clue');
      }
    }

    if (actionable) {
      // 水域减速
      const inWater = this.level.waters.some((w) => this.playerBody.x > w.x && this.playerBody.x < w.x + w.w) && body.blocked.down;
      const speedBase = PLAYER_FRAMES.run.speed * (0.9 + Math.min(0.35, this.cfg.stats.spd / 50)) * (this.hasteF > 0 ? 1.4 : 1) * (inWater ? 0.55 : 1);

      // 攀爬（伊苏 3 式：贴可爬壁 + 上/下）。判定放宽到 26px，垂直窗 -180px，手机/高帧也好贴。
      const nearClimb = this.level.platforms.some((p) => p.climbable && Math.abs(this.playerBody.x - (p.x < this.playerBody.x ? p.x : p.x + p.w)) < 26 && this.playerBody.y < p.y + 24 && this.playerBody.y > p.y - 180);
      if ((cur.up || cur.down) && nearClimb && !body.blocked.down) {
        this.pstate = 'climb';
      }

      if (this.pstate !== 'climb') {
        let vx = 0;
        if (cur.left) vx -= 1;
        if (cur.right) vx += 1;
        if (vx !== 0) this.facing = vx > 0 ? 1 : -1;
        body.setVelocityX(vx * speedBase);
        // 跳跃走输入缓冲（攻击/受击收招时按跳也会在可操作第一帧生效），土狼 9 帧容错。
        const wantJump = this.take('jump');
        if (body.blocked.down) {
          this.coyote = PLAYER_FRAMES.jump.coyote;
          if (this.pstate === 'jump') this.pstate = vx !== 0 ? 'run' : 'idle';
          if (wantJump) {
            body.setVelocityY(PLAYER_FRAMES.jump.vy);
            this.pstate = 'jump';
            this.coyote = 0;
            playSfx('jump');
          }
        } else {
          // 土狼时间：离地 ≤ coyote 帧内仍可起跳（悬崖边容错）
          if (this.coyote > 0) this.coyote -= 1;
          if (wantJump && this.coyote > 0) {
            body.setVelocityY(PLAYER_FRAMES.jump.vy);
            this.pstate = 'jump';
            this.coyote = 0;
            playSfx('jump');
          } else if (this.pstate !== 'jump') {
            this.pstate = 'jump';
          }
        }
        if (!body.blocked.down && cur.jump === false && body.velocity.y < 0) {
          body.setVelocityY(body.velocity.y + PLAYER_FRAMES.jump.cutGravity * STEP_MS / 1000);
        }
      } else {
        // 攀爬态：关重力手动上下
        body.setAllowGravity(false);
        body.setVelocityY((cur.up ? -1 : cur.down ? 1 : 0) * PLAYER_FRAMES.climb.speed);
        body.setVelocityX(0);
        if (!cur.up && !cur.down) {
          body.setAllowGravity(true);
          this.pstate = body.blocked.down ? 'idle' : 'jump';
        }
        if (body.blocked.down) {
          body.setAllowGravity(true);
          this.pstate = 'idle';
        }
      }

      // 招式输入（走缓冲：收招期间按下的键会在可操作的第一帧生效）
      if (this.take('light')) this.startLight();
      else if (this.take('heavy')) {
        this.pstate = 'heavy_charge';
        this.pf = 0;
        this.chargeF = 0;
      } else if (this.take('roll') && this.qi >= 2) {
        this.qi -= 2;
        this.pstate = 'roll';
        this.pf = 0;
        body.setVelocityX(this.facing * PLAYER_FRAMES.roll.speed);
        playSfx('roll');
      } else if (this.take('parry') && this.qi >= 1) {
        this.pstate = 'parry';
        this.pf = 0;
        this.qi = Math.max(0, this.qi - 0.5);
      } else if (this.take('jump') && this.pstate === 'climb') {
        body.setAllowGravity(true);
        body.setVelocityY(PLAYER_FRAMES.jump.vy * 0.8);
        body.setVelocityX(this.facing * 160);
        this.pstate = 'jump';
      }
    } else if (this.pstate === 'heavy_charge') {
      this.chargeF += 1;
      const speedBase = PLAYER_FRAMES.run.speed * 0.35;
      let vx = 0;
      if (cur.left) vx -= 1;
      if (cur.right) vx += 1;
      if (vx !== 0) this.facing = vx > 0 ? 1 : -1;
      body.setVelocityX(vx * speedBase);
      if (!cur.heavy) this.releaseHeavy();
      else if (this.chargeF > 180) this.releaseHeavy();
    }

    // 状态帧推进
    this.advancePlayerState();

    // —— 兽 AI ——
    for (const b of this.beasts) this.stepBeast(b);

    // —— 投掷物 ——
    this.stepProjectiles();
    // —— 知识门 / 荆棘 ——
    this.stepGates();
    this.stepThorns();

    // —— 拾取 / 祠座 / NPC / 界碑 / 祠门 ——
    this.stepTriggers();

    // —— boss 触发 ——
    this.stepBossTrigger();
  }

  /* ================= 玩家状态机 ================= */

  private startLight(): void {
    if (this.comboResetF <= 0) this.comboIndex = 0;
    const idx = Math.min(this.comboIndex, 2) as 0 | 1 | 2;
    this.pstate = (['light1', 'light2', 'light3'] as const)[idx];
    this.pf = 0;
    this.swingId += 1;
    this.comboIndex = idx + 1 > 2 ? 0 : idx + 1;
    this.comboResetF = 30;
    playSfx('swing');
  }

  private releaseHeavy(): void {
    const charged = Math.min(1, this.chargeF / PLAYER_FRAMES.heavy.chargeMax);
    this.heavyChargeAtRelease = 0.6 + charged * 0.4;
    this.pstate = 'heavy_release';
    this.pf = 0;
    this.swingId += 1;
    this.qi = Math.max(0, this.qi - 4);
    playSfx('swingHeavy');
  }

  private heavyChargeAtRelease = 1;

  private advancePlayerState(): void {
    const body = this.pbody;
    this.pf += 1;
    switch (this.pstate) {
      case 'light1': case 'light2': case 'light3': {
        const idx = (['light1', 'light2', 'light3'] as const).indexOf(this.pstate as 'light1') as 0 | 1 | 2;
        const f = PLAYER_FRAMES.light[idx];
        if (this.pf === f.windup + 1) {
          this.showSwoosh(f.lunge);
          body.setVelocityX(this.facing * f.lunge * 2.4);
        }
        if (this.pf > f.windup && this.pf <= f.windup + f.active) {
          this.playerStrike(f.mult, false, 52 + f.lunge * 0.4);
        }
        if (this.pf >= f.windup + f.active + f.recover) this.afterAction();
        break;
      }
      case 'heavy_release': {
        const f = PLAYER_FRAMES.heavy;
        if (this.pf === f.windup + 1) {
          this.showSwoosh(70, true);
          body.setVelocityX(this.facing * 96);
        }
        if (this.pf > f.windup && this.pf <= f.windup + f.active) {
          this.playerStrike(PLAYER_FRAMES.heavy.mult * this.heavyChargeAtRelease, true, 66);
        }
        if (this.pf >= f.windup + f.active + f.recover) this.afterAction();
        break;
      }
      case 'roll': {
        if (this.pf === PLAYER_FRAMES.roll.iframeFrom) this.iframes = PLAYER_FRAMES.roll.iframeTo - PLAYER_FRAMES.roll.iframeFrom;
        if (this.pf === 2 || this.pf === 10) body.setVelocityX(this.facing * PLAYER_FRAMES.roll.speed * (this.pf === 10 ? 0.7 : 1));
        if (this.pf >= PLAYER_FRAMES.roll.total) this.afterAction();
        break;
      }
      case 'parry': {
        if (this.pf >= PLAYER_FRAMES.parry.total) this.afterAction();
        break;
      }
      case 'hurt': if (this.pf >= PLAYER_FRAMES.hurt) this.pstate = 'idle'; break;
      case 'stagger': if (this.pf >= PLAYER_FRAMES.stagger) { this.pstate = 'getup'; this.pf = 0; } break;
      case 'getup': if (this.pf >= PLAYER_FRAMES.getup) this.pstate = 'idle'; break;
      case 'jump': if (body.blocked.down) this.pstate = Math.abs(body.velocity.x) > 20 ? 'run' : 'idle'; break;
      default: break;
    }
  }

  private afterAction(): void {
    const body = this.pbody;
    this.pstate = body.blocked.down ? (Math.abs(body.velocity.x) > 20 ? 'run' : 'idle') : 'jump';
    this.pf = 0;
  }

  private showSwoosh(lungePx: number, heavy = false): void {
    this.swoosh.setPosition(this.playerBody.x + this.facing * (26 + lungePx * 0.3), this.playerBody.y - 16);
    this.swoosh.setScale(this.facing * (heavy ? 1.4 : 1), heavy ? 1.3 : 1);
    this.swoosh.setVisible(true).setAlpha(0.9);
    this.tweens.add({ targets: this.swoosh, alpha: 0, duration: 140, onComplete: () => this.swoosh.setVisible(false) });
  }

  private playerStrike(mult: number, heavy: boolean, reach: number): void {
    const px = this.playerBody.x;
    const py = this.playerBody.y;
    const hitRect = new Phaser.Geom.Rectangle(this.facing > 0 ? px + 6 : px - 6 - reach, py - 36, reach, 42);
    for (const b of this.beasts) {
      if (b.state === 'dead') continue;
      const bb = bodyOf(b);
      const beastRect = new Phaser.Geom.Rectangle(bb.left, bb.top, bb.width, bb.height);
      if (!Phaser.Geom.Intersects.RectangleToRectangle(hitRect, beastRect)) continue;
      if (b.hitBySwing === this.swingId) continue;
      b.hitBySwing = this.swingId;
      this.hitBeast(b, mult, heavy);
    }
  }

  private hitBeast(b: BeastEnt, mult: number, heavy: boolean): void {
    if (b.state === 'fakedeath') {
      // 打假死的鯥：它恼了
      if (registerMercy(b.progress, 'lu_wrong')) { /* 慈悲窗口关闭 */ }
      b.fakedOnce = true;
      b.state = 'chase';
      b.enraged = true;
      b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.12);
      bus.emit('toast', '鯥被搅醒了——「冬死」非「真死」。它恼了。');
      return;
    }
    const layers = insightCount(b.progress.axes);
    const dmg = calcDamage({ atk: this.cfg.stats.atk, mult: mult * (b.state === 'downed' ? 1.5 : 1), def: b.def, insightLayers: layers });
    b.hp = Math.max(0, b.hp - dmg);
    this.qi = Math.min(this.maxQi, this.qi + 1);
    // 打击感：顿帧 / 震屏 / 墨粒
    const stop = hitstopMs(heavy, b.hp <= 0);
    this.hitstop(stop, heavy);
    this.emitters.ink.explode(heavy ? 12 : 7, b.body.x + Phaser.Math.Between(-8, 8), b.body.y - 20);
    if (heavy) this.emitters.gold.explode(5, b.body.x, b.body.y - 24);
    playSfx(heavy ? 'hitHeavy' : 'hitLight');
    // 伤害数字：飘字反馈，打多疼一眼见
    const dmgText = this.add.text(
      b.body.x + Phaser.Math.Between(-12, 12), b.body.y - 64,
      String(Math.round(dmg)),
      { fontFamily: "'Noto Serif SC', serif", fontSize: heavy ? '19px' : '15px', color: heavy ? '#ffd27a' : '#f4ecd8', stroke: '#14100c', strokeThickness: 3 },
    ).setOrigin(0.5).setDepth(11);
    this.tweens.add({ targets: dmgText, y: dmgText.y - 36, alpha: 0, duration: 550, onComplete: () => dmgText.destroy() });
    if (b.hp <= 0) {
      this.killBeast(b, 'slain');
      return;
    }
    // 架式与硬直
    if (b.weight === 'light') {
      // 轻兽：任何命中都会打断（连段吃得满）
      const kb = knockbackVelocity(b.weight, heavy, this.facing);
      b.body.setVelocity(kb.vx, kb.vy);
      b.state = 'stagger';
      b.stateF = heavy ? 26 : 16;
      b.move = null;
    } else {
      b.stance -= heavy ? PLAYER_FRAMES.heavy.stanceMult * 15 : 15;
      if (b.stance <= 0) {
        b.stance = b.stanceMax;
        b.state = 'downed';
        b.stateF = 150;
        b.move = null;
        bus.emit('toast', `${b.name}架式破了——处决窗！`);
        this.hitstop(140, true);
      } else if (heavy) {
        b.state = 'stagger';
        b.stateF = 12;
      }
    }
    this.emitBossBar();
  }

  private hitstop(ms: number, heavy: boolean): void {
    this.hitstopLeft = Math.max(this.hitstopLeft, ms);
    this.cameras.main.shake(70, heavy ? 0.006 : 0.003);
  }

  private damagePlayer(rawDmg: number, src: BeastEnt | null, dot = false): void {
    if (this.pstate === 'dead') return;
    if (!dot && this.iframes > 0) return;
    const dmg = Math.max(1, Math.round(rawDmg * this.diff.playerDamageTaken));
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      if (this.shield > 0) {
        playSfx('parry');
        this.emitters.heal.explode(4, this.playerBody.x, this.playerBody.y);
        return;
      }
    }
    this.hp = Math.max(0, this.hp - dmg);
    if (dot) {
      this.emitHud();
      if (this.hp <= 0) this.onPlayerDeath();
      return;
    }
    const kb = src ? knockbackVelocity('light', false, (this.playerBody.x < src.body.x ? -1 : 1) as 1 | -1) : { vx: -this.facing * 160, vy: -120 };
    this.playerBody.setVelocity(kb.vx, kb.vy);
    if (this.hp <= 0) {
      this.onPlayerDeath();
      return;
    }
    this.pstate = 'hurt';
    this.pf = 0;
    this.iframes = 40;
    this.hitstop(50, false);
    playSfx('hurt');
    this.cameras.main.flash(80, 120, 30, 20);
  }

  private onPlayerDeath(): void {
    this.pstate = 'dead';
    this.pf = 0;
    this.hp = 0;
    playSfx('death');
    this.deaths += 1;
    bus.emit('died', undefined);
    if (this.deaths >= 3 && !this.adviseGiven && (this.bossEngaged || this.target?.zone === 'elite')) {
      this.adviseGiven = true;
      bus.emit('adviseCamp', undefined);
    }
  }

  private respawn(): void {
    this.hp = Math.max(1, Math.round(this.maxHp * 0.5));
    this.qi = this.maxQi;
    this.poisonF = 0;
    this.invertF = 0;
    this.shield = 0;
    this.pstate = 'idle';
    this.pf = 0;
    this.iframes = 60;
    this.playerBody.setPosition(this.respawnX, this.level.groundY - 40);
    this.playerBody.setVelocity(0, 0);
    this.cameras.main.fadeIn(260, 12, 10, 8);
    // 未解决的兽回位回血
    for (const b of this.beasts) {
      if (b.state === 'dead') continue;
      if (b.zone === 'wild' && !b.aggro) continue;
      b.hp = b.maxHp;
      b.stance = b.stanceMax;
      b.state = b.zone === 'wild' ? 'sleep' : 'sleep';
      b.aggro = false;
      b.move = null;
      b.body.setPosition(b.spawn.x, this.level.groundY - 40);
      b.body.setVelocity(0, 0);
    }
    this.disengageBoss();
    bus.emit('toast', '祠座香火把你送了回来——歇口气，再问一次。');
    this.emitHud();
  }

  private disengageBoss(): void {
    if (this.bossEngaged && this.currentBoss && this.currentBoss.state !== 'dead') {
      this.bossEngaged = false;
      this.currentBoss = null;
      for (const w of this.arenaWalls) w.destroy();
      this.arenaWalls = [];
      this.cameras.main.setZoom(1);
    }
    this.emitBossBar();
  }

  /* ================= 兽 AI ================= */

  private pickTarget(): void {
    let best: BeastEnt | null = null;
    let bestD = 460;
    for (const b of this.beasts) {
      if (b.state === 'dead') continue;
      const d = Math.abs(b.body.x - this.playerBody.x);
      if (d < bestD && b.aggro) {
        best = b;
        bestD = d;
      }
    }
    if (best !== this.target) {
      this.target = best;
      this.emitBossBar();
    }
  }

  private isNameReady(b: BeastEnt): boolean {
    if (b.zone === 'boss' && this.level.boss.untamable) return false;
    if (b.zone === 'boss' && !this.level.boss.isWuming) {
      // 山主：识破要求更严格（标准档 3 层）
    }
    return canAskName(insightCount(b.progress.axes), this.diff.layersToName, b.hp / b.maxHp, this.diff.askHpRatio);
  }

  private stepBeast(b: BeastEnt): void {
    if (b.state === 'dead') return;
    b.stateF += 1;
    for (const [k, v] of b.cds) {
      if (v > 0) b.cds.set(k, v - 1);
    }
    const dx = this.playerBody.x - b.body.x;
    const adx = Math.abs(dx);
    const body = bodyOf(b);

    // 仇恨：惊一群而动一群（340px 内同类齐上，野外打群架）
    if (!b.aggro && adx < 250 && b.zone !== 'boss') {
      b.aggro = true;
      if (b.zone === 'wild') {
        for (const o of this.beasts) {
          if (o !== b && o.zone === 'wild' && !o.aggro && o.state !== 'dead' && Math.abs(o.body.x - b.body.x) < 340) {
            o.aggro = true;
          }
        }
      }
    }
    if (b.zone === 'boss' && !b.aggro && this.bossEngaged) b.aggro = true;

    switch (b.state) {
      case 'sleep': {
        body.setVelocityX(0);
        if (b.aggro) b.state = 'chase';
        break;
      }
      case 'chase': {
        b.dir = dx > 0 ? 1 : -1;
        const speed = b.aggroSpeed * (b.phase === 2 ? b.moveset.phase2?.speedMult ?? 1 : 1) * (b.enraged ? 1.25 : 1);
        const keep = 46 + (b.zone === 'boss' ? 20 : 0);
        if (b.zone === 'wild' && !b.aggro) {
          // 未仇恨的野兽只在巢边踱步
          body.setVelocityX(Math.abs(b.body.x - b.homeX) > 90 ? (b.body.x > b.homeX ? -1 : 1) * speed * 0.3 : 0);
          break;
        }
        if (adx > keep) body.setVelocityX(b.dir * speed);
        else body.setVelocityX(body.velocity.x * 0.7);
        // 挑招：冷却完毕且够得着
        const ready = b.moveset.moves.filter((mv) => (b.cds.get(mv.id) ?? 0) <= 0 && adx <= mv.range);
        if (ready.length > 0 && body.blocked.down) {
          const mv = ready[Math.floor(Math.random() * ready.length)]!;
          b.move = mv;
          b.state = 'windup';
          b.stateF = 0;
          b.hitPlayerThisMove = false;
          b.cds.set(mv.id, mv.cd);
          // 声兆：预备即出声（听音辨招）
          playCue(mv.cue);
          b.label.setText(mv.name).setAlpha(1);
          this.tweens.add({ targets: b.label, alpha: 0, duration: 900, delay: 500 });
          if (b.ring) { b.ring.destroy(); b.ring = null; }
          if (mv.kind === 'howl') {
            b.ring = this.add.image(b.body.x, b.body.y, TEX.ring).setDepth(3).setScale(0.2).setAlpha(0.4).setTint(0xff8866);
          }
        }
        break;
      }
      case 'windup': {
        body.setVelocityX(body.velocity.x * 0.8);
        if (b.stateF >= (b.move?.windup ?? 24)) {
          b.state = 'active';
          b.stateF = 0;
          this.beastMoveActive(b);
        }
        break;
      }
      case 'active': {
        const mv = b.move;
        if (!mv) { b.state = 'recover'; b.stateF = 0; break; }
        if (mv.kind === 'dash' || mv.kind === 'leap') {
          this.beastContactCheck(b, mv);
        } else if (mv.kind === 'melee' || mv.kind === 'aoe') {
          // 原地招式：在判定中点出一次判定
          if (!b.hitPlayerThisMove && b.stateF >= Math.floor(mv.active / 2)) {
            b.hitPlayerThisMove = true;
            const dist = Math.abs(this.playerBody.x - b.body.x);
            const dyOk = Math.abs(this.playerBody.y - b.body.y) < 70;
            if (dist <= mv.range && dyOk) this.hitPlayerByBeast(b, mv);
          }
        }
        if (mv.kind === 'howl' && b.stateF === Math.floor(mv.active / 2)) {
          this.howlResolve(b, mv);
        }
        if (b.stateF >= mv.active) {
          if (mv.kind === 'heal') {
            b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.08);
            this.emitters.heal.explode(8, b.body.x, b.body.y - 20);
            bus.emit('toast', `${b.name}的歌谣起了效——它在回血，快打断！`);
          }
          if (mv.kind === 'summon') this.summonMinions(b);
          if (mv.kind === 'fakeDeath') {
            b.state = 'fakedeath';
            b.stateF = 0;
            b.move = null;
            b.label.setText('蛰伏……（近身按 Q 行礼）').setAlpha(1);
            break;
          }
          b.state = 'recover';
          b.stateF = 0;
        }
        break;
      }
      case 'recover': {
        body.setVelocityX(body.velocity.x * 0.8);
        if (b.ring) { b.ring.destroy(); b.ring = null; }
        if (b.stateF >= (b.move?.recover ?? 16)) {
          b.move = null;
          b.state = 'chase';
          b.stateF = 0;
        }
        break;
      }
      case 'stagger': {
        body.setVelocityX(body.velocity.x * 0.85);
        if (b.stateF >= 24) { b.state = 'chase'; b.stateF = 0; }
        break;
      }
      case 'downed': {
        body.setVelocityX(0);
        if (b.stateF >= 150) { b.state = 'chase'; b.stateF = 0; b.stance = b.stanceMax; }
        break;
      }
      case 'fakedeath': {
        body.setVelocityX(0);
        // 假死 6 秒：没人打扰就继续蛰伏（近身 Q 行礼得性印）
        if (b.stateF >= 360) { b.state = 'chase'; b.stateF = 0; b.label.setAlpha(0); }
        break;
      }
      default: break;
    }

    // 目睹即识破（形）：活过一次招式
    if (b.state === 'recover' && b.move) {
      b.progress.seenMoves.add(b.move.id);
      const gained = refreshInsight(b.progress, b.moveset.moves.length);
      if (gained.includes('shape')) bus.emit('toast', `形之印——${b.name}的招式你都见过了。`);
    }
    // 冬蛰假死触发（鯥）
    if (b.moveset.fakeDeathAt && !b.fakedOnce && b.state !== 'fakedeath' && b.hp / b.maxHp <= b.moveset.fakeDeathAt) {
      b.fakedOnce = true;
      b.state = 'active';
      b.stateF = 0;
      b.move = { id: 'lu_fake', name: '冬蛰假死', kind: 'fakeDeath', windup: 20, active: 6, recover: 0, range: 0, dmgMult: 0, cd: 0, cue: 'moo', note: '假死时不追打，行礼(Q)→直接+1层' };
      playCue('moo');
      b.label.setText('冬蛰——气若游丝').setAlpha(1);
    }
    // boss 二阶段
    if (b.zone === 'boss' && b.phase === 1 && b.hp / b.maxHp <= 0.5) {
      b.phase = 2;
      b.aggroSpeed *= b.moveset.phase2?.speedMult ?? 1.2;
      bus.emit('toast', `${b.name}狂性大发——招式换了语汇！`);
      this.cameras.main.shake(200, 0.008);
      this.hitstop(120, true);
    }
  }

  private beastMoveActive(b: BeastEnt): void {
    const mv = b.move!;
    const body = bodyOf(b);
    const dx = this.playerBody.x - b.body.x;
    b.dir = dx > 0 ? 1 : -1;
    switch (mv.kind) {
      case 'dash':
        body.setVelocityX(b.dir * (b.aggroSpeed * 2.4));
        if (mv.id === 'xx_dash' || mv.id === 'by_hop') body.setVelocityY(-160);
        break;
      case 'leap':
        body.setVelocityY(-480);
        body.setVelocityX(b.dir * Math.min(360, Math.abs(dx) * 1.6));
        break;
      case 'projectile': {
        const tex = mv.id.includes('fruit') ? TEX.projFruit : mv.cue === 'hiss' ? TEX.projVenom : TEX.projFeather;
        const img = this.add.image(b.body.x + b.dir * 30, b.body.y - 20, tex).setDepth(7);
        const speed = mv.projSpeed ?? 340;
        this.projectiles.push({ img, vx: b.dir * speed, vy: 0, dmgMult: mv.dmgMult, atk: b.atk, effect: mv.onHit, life: 220, fromPlayer: false });
        break;
      }
      case 'howl': {
        if (b.ring) b.ring.destroy();
        b.ring = this.add.image(b.body.x, b.body.y - 10, TEX.ring).setDepth(7).setScale(0.3).setAlpha(0.8);
        this.tweens.add({ targets: b.ring, scale: (mv.range * 2) / 72, alpha: 0, duration: (mv.windup + mv.active) * STEP_MS });
        break;
      }
      default: break;
    }
  }

  private beastContactCheck(b: BeastEnt, mv: BeastMove): void {
    if (b.hitPlayerThisMove) return;
    const body = bodyOf(b);
    if (mv.kind === 'leap' && !body.blocked.down) return;
    const dx = Math.abs(this.playerBody.x - b.body.x);
    const dy = Math.abs(this.playerBody.y - b.body.y);
    if (dx <= mv.range * 0.5 + 20 && dy <= 50) {
      b.hitPlayerThisMove = true;
      this.hitPlayerByBeast(b, mv);
    }
  }

  private howlResolve(b: BeastEnt, mv: BeastMove): void {
    if (b.hitPlayerThisMove) return;
    b.hitPlayerThisMove = true;
    const dist = Math.abs(this.playerBody.x - b.body.x);
    if (dist > mv.range) return;
    const parrying = this.pstate === 'parry' && this.pf <= this.diff.parryWindow;
    if (parrying) {
      this.onParrySuccess(b, mv);
      return;
    }
    this.hitPlayerByBeast(b, mv, 0.6);
  }

  private hitPlayerByBeast(b: BeastEnt, mv: BeastMove, multScale = 1): void {
    // 弹反判定
    if (this.pstate === 'parry' && this.pf <= this.diff.parryWindow) {
      this.onParrySuccess(b, mv);
      return;
    }
    const dmg = calcDamage({ atk: b.atk * (b.enraged ? 1.2 : 1), mult: mv.dmgMult * multScale, def: this.cfg.stats.def }) * this.diff.beastDamage;
    this.damagePlayer(Math.max(1, Math.round(dmg)), b);
    if (mv.onHit === 'poison' && this.cfg.stats.immunes.length === 0) {
      this.poisonF = 360;
      bus.emit('toast', '瘴毒入体——用赤鱬珠或回祠座可解。');
    }
    if (mv.onHit === 'invert' && !this.cfg.stats.immunes.includes('mi')) {
      this.invertF = 150;
      bus.emit('toast', '方向倒了——它的声音仍在耳边（下次弹反它）。');
    }
    if (mv.onHit === 'drain') {
      b.hp = Math.min(b.maxHp, b.hp + 4);
    }
  }

  private onParrySuccess(b: BeastEnt, mv: BeastMove): void {
    this.parrySuccessF = 20;
    this.qi = Math.min(this.maxQi, this.qi + 3);
    b.progress.parryCount += 1;
    if (mv.soundTell) b.progress.soundParries += 1;
    const gained = refreshInsight(b.progress, b.moveset.moves.length);
    for (const axis of gained) {
      bus.emit('toast', axis === 'shape' ? `形之印——你读穿了${b.name}。` : axis === 'sound' ? `声之印——「其音」被你听破了。` : `性之印——它的心性你看明白了。`);
    }
    // 弹反成功：兽踉跄 40 帧（重兽也踉跄）
    b.state = 'stagger';
    b.stateF = 0;
    b.move = null;
    b.body.setVelocity(-b.dir * 140, -60);
    this.hitstop(90, false);
    this.emitters.ink.explode(10, b.body.x, b.body.y - 24);
    this.cameras.main.flash(60, 220, 210, 180);
    playSfx('parry');
    this.floatText(this.playerBody.x, this.playerBody.y - 50, mv.soundTell ? '弹！听破' : '弹！');
    this.pstate = 'idle';
    this.pf = 0;
    this.emitBossBar();
  }

  private summonMinions(b: BeastEnt): void {
    const minions = this.beasts.filter((x) => x.zone === 'wild' && x.state !== 'dead').length;
    if (minions >= 3) return;
    const pool = b.beastId === 'lu' ? 'xingxing' : b.beastId;
    for (let i = 0; i < 2; i += 1) {
      const m = this.spawnBeast(pool as BeastId, b.body.x + (i === 0 ? -140 : 140), Math.max(1, b.level - 2), 'wild');
      m.aggro = true;
      m.state = 'chase';
    }
    bus.emit('toast', `${b.name}的哞声召来了同类——先清小的！`);
  }

  /* ================= 投掷物 / 拾取 / 触发器 ================= */

  private stepProjectiles(): void {
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const p = this.projectiles[i]!;
      p.img.x += p.vx * STEP_MS / 1000;
      p.img.y += p.vy * STEP_MS / 1000;
      p.life -= 1;
      let dead = p.life <= 0 || p.img.x < 0 || p.img.x > this.level.width;
      const px = this.playerBody.x;
      const py = this.playerBody.y;
      if (!dead && !p.fromPlayer && Math.abs(p.img.x - px) < 20 && Math.abs(p.img.y - (py - 20)) < 28) {
        const parrying = this.pstate === 'parry' && this.pf <= this.diff.parryWindow;
        if (parrying) {
          // 弹反投掷物：反弹回去
          p.fromPlayer = true;
          p.vx *= -1.3;
          p.life = 160;
          this.hitstop(70, false);
          playSfx('parry');
          this.emitters.ink.explode(5, p.img.x, p.img.y);
          continue;
        }
        if (this.iframes <= 0) {
          const dmg = calcDamage({ atk: p.atk, mult: p.dmgMult, def: this.cfg.stats.def }) * this.diff.beastDamage;
          this.damagePlayer(Math.max(1, Math.round(dmg)), null);
          if (p.effect === 'poison') {
            this.poisonF = 360;
            bus.emit('toast', '毒涎溅到——快找水或赤鱬珠。');
          }
          dead = true;
        }
      }
      if (p.fromPlayer) {
        for (const b of this.beasts) {
          if (b.state === 'dead') continue;
          if (Math.abs(p.img.x - b.body.x) < 34 && Math.abs(p.img.y - (b.body.y - 10)) < 44) {
            this.hitBeast(b, p.dmgMult, false);
            dead = true;
            break;
          }
        }
      }
      if (dead) {
        p.img.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private stepTriggers(): void {
    const px = this.playerBody.x;
    const py = this.playerBody.y;
    // 拾取
    for (const pk of this.pickupEnts) {
      if (pk.taken) continue;
      if (Math.abs(px - pk.def.x) < 26 && Math.abs(py - pk.def.y) < 34) {
        pk.taken = true;
        pk.img.destroy();
        if (pk.def.kind === 'clue') {
          this.cluesCollected += 1;
          for (const b of this.beasts) {
            if (b.state === 'dead') continue;
            b.progress.clues += 1;
            const gained = refreshInsight(b.progress, b.moveset.moves.length);
            if (gained.includes('nature')) bus.emit('toast', '线索拼上了——性之印发亮。');
          }
          bus.emit('gained', { kind: 'clue', amount: 1 });
          playSfx('clue');
          this.floatText(pk.def.x, pk.def.y, '迹·线索');
        } else if (pk.def.itemId) {
          if (pk.def.kind === 'jade') this.jadeCollected += 1;
          bus.emit('gained', { kind: pk.def.kind, itemId: pk.def.itemId, amount: pk.def.amount });
          playSfx('pickup');
          this.emitters.gold.explode(6, pk.def.x, pk.def.y);
          this.floatText(pk.def.x, pk.def.y, `拾得 ×${pk.def.amount}`);
        }
      }
    }
    // 祠座
    if (this.checkpointCd <= 0) {
      for (const c of this.level.checkpoints) {
        if (Math.abs(px - c) < 34 && py > this.level.groundY - 90) {
          if (this.hp < this.maxHp || this.poisonF > 0) {
            this.hp = this.maxHp;
            this.qi = this.maxQi;
            this.poisonF = 0;
            this.checkpointCd = 300;
            this.respawnX = c;
            this.emitters.heal.explode(12, px, py - 20);
            playSfx('check');
            bus.emit('toast', '祠座香火暖身——伤与瘴都散了。');
            this.emitHud();
          } else {
            this.respawnX = c;
          }
        }
      }
    }
    // NPC / 界碑对话：需玩家驻足（跑图路过不打断）；一次驻足只触发一遍，离开 140px 后可重谈
    const standing = Math.abs(this.pbody.velocity.x) < 30;
    for (const npc of this.level.npcs) {
      const key = `npc:${npc.id}`;
      const far = Math.abs(px - npc.x) > 140;
      if (far) this.talked.delete(key);
      if (!far && Math.abs(px - npc.x) < 46 && standing && !sceneCmd.dialogOpen && !this.talked.has(key)) {
        this.talked.add(key);
        sceneCmd.dialogOpen = true;
        bus.emit('dialog', { name: npc.name, lines: npc.lines });
      }
    }
    for (const st of this.level.steles) {
      const key = `stele@${st.x}`;
      const far = Math.abs(px - st.x) > 140;
      if (far) this.talked.delete(key);
      if (!far && Math.abs(px - st.x) < 40 && standing && !sceneCmd.dialogOpen && !this.talked.has(key)) {
        this.talked.add(key);
        sceneCmd.dialogOpen = true;
        bus.emit('dialog', { name: '界碑 · 原文', lines: [st.text] });
        bus.emit('gained', { kind: 'stele', itemId: this.cfg.mountain, amount: 1 });
      }
    }
    // 精英门
    if (this.gateWall && this.eliteResolved) {
      this.solids.remove(this.gateWall);
      this.gateWall.destroy();
      this.gateWall = null;
      bus.emit('gateOpen', undefined);
      playSfx('gate');
    }
    // 山祠祭礼
    const shrineX = this.level.boss.arenaX + this.level.boss.arenaW - 80;
    if (!this.riteEmitted && this.bossResolved && Math.abs(px - shrineX) < 46) {
      this.riteEmitted = true;
      playSfx('rite');
      bus.emit('rite', undefined);
    }
  }

  private stepGates(): void {
    const px = this.playerBody.x;
    for (const gate of this.gates) {
      if (gate.open) continue;
      const d = gate.def;
      let open = false;
      switch (d.kind) {
        case 'item': open = this.cfg.inventory.includes(d.item!); break;
        case 'jade': open = this.jadeCollected >= (d.need ?? 2); break;
        case 'clue': open = this.cluesCollected >= (d.need ?? 2); break;
        case 'tame': open = this.cfg.tamedTotal >= (d.need ?? 3); break;
        case 'still': {
          if (Math.abs(px - d.x) < 260) {
            const attacking = sceneCmd.touch.light || sceneCmd.touch.heavy || this.prev.light || this.prev.heavy;
            gate.quietT = attacking ? 0 : gate.quietT + 1;
            if (gate.quietT >= 180) open = true;
          } else gate.quietT = 0;
          break;
        }
        case 'parry': {
          gate.tideT += 1;
          if (gate.tideT % 160 === 0) {
            const ring = this.add.image(d.x, this.level.groundY - 60, TEX.ring).setDepth(7).setScale(0.3).setAlpha(0.8);
            this.tweens.add({ targets: ring, scale: 6, alpha: 0, duration: 900, onComplete: () => ring.destroy() });
            playCue('woodknock');
            // 整段弹反态都算听破（22 帧窗），不再要求掐单帧；范围放宽到 320。
            const parrying = this.pstate === 'parry' && Math.abs(px - d.x) < 320;
            if (parrying) {
              gate.parries += 1;
              this.qi = Math.min(this.maxQi, this.qi + 3);
              this.floatText(d.x, this.level.groundY - 130, `听破 ${gate.parries}/2`);
              playSfx('parry');
            } else if (Math.abs(px - d.x) < 320) {
              this.floatText(d.x, this.level.groundY - 130, '听锣再挡（I）');
            }
          }
          open = gate.parries >= 2;
          break;
        }
        case 'tide': {
          gate.tideT += 1;
          const passable = gate.tideT % 420 < 250;
          const body = gate.wall.body as Phaser.Physics.Arcade.StaticBody;
          body.enable = !passable;
          gate.wall.setFillStyle(0x241f18, passable ? 0.25 : 0.9);
          if (passable) open = true; // 只求穿过，不销毁（潮会回来）
          break;
        }
      }
      if (open && !gate.open) {
        gate.open = true;
        gate.label.setColor('#8fd0a0');
        if (d.kind !== 'tide') {
          this.solids.remove(gate.wall);
          gate.wall.destroy();
          this.emitters.ink.explode(10, d.x, this.level.groundY - 70);
          playSfx('gate');
        }
        bus.emit('toast', d.kind === 'tide' ? '潮退了——快过！' : '机关应知识而开。');
      }
      // 阻挡提示
      gate.hintCd -= 1;
      if (!gate.open && Math.abs(px - d.x) < 70 && gate.hintCd <= 0) {
        gate.hintCd = 260;
        bus.emit('toast', d.hint);
      }
    }
  }

  private stepThorns(): void {
    if (this.thornCd > 0) this.thornCd -= 1;
    const px = this.playerBody.x;
    const py = this.playerBody.y;
    for (const t of this.level.thorns) {
      if (Math.abs(px - t.x) < t.w / 2 && py > this.level.groundY - 60 && this.thornCd <= 0) {
        this.thornCd = 60;
        this.damagePlayer(4, null);
        this.pbody.setVelocityY(-260);
      }
    }
  }

  private stepBossTrigger(): void {
    if (this.bossResolved || this.bossEngaged) return;
    const b = this.beasts.find((x) => x.zone === 'boss' && x.state !== 'dead');
    if (!b) return;
    if (this.playerBody.x > this.level.boss.arenaX + 60) {
      this.bossEngaged = true;
      this.currentBoss = b;
      b.aggro = true;
      b.state = 'chase';
      // 锁场
      const ax = this.level.boss.arenaX;
      const aw = this.level.boss.arenaW;
      for (const wx of [ax + 20, ax + aw - 20]) {
        const wall = this.add.rectangle(wx, this.level.groundY - 70, 14, 140);
        this.physics.add.existing(wall, true);
        this.solids.add(wall);
        this.arenaWalls.push(wall);
      }
      if (this.cfg.bossIntro && this.cfg.bossIntro.lines.length > 0) {
        sceneCmd.dialogOpen = true;
        bus.emit('dialog', this.cfg.bossIntro);
      } else {
        bus.emit('toast', `${b.title ?? b.name}——${this.level.boss.intro}`);
      }
      const cam = this.cameras.main;
      this.tweens.add({ targets: cam, zoom: 0.9, duration: 500, yoyo: true, hold: 700, onComplete: () => cam.setZoom(1) });
      playCue('thud');
      this.emitBossBar();
    }
  }

  /* ================= 问名 / 结算 ================= */

  private startNaming(b: BeastEnt): void {
    sceneCmd.paused = true;
    const def = getBeast(b.beastId)!;
    const cam = this.cameras.main;
    this.tweens.add({ targets: cam, zoom: 1.25, duration: 400 });
    const veil = this.add.rectangle(VIEW_W / 2, VIEW_H / 2, VIEW_W, VIEW_H, 0x100c08, 0.72).setScrollFactor(0).setDepth(40);
    const blob = this.add.image(VIEW_W / 2, VIEW_H / 2, TEX.inkBlob).setScrollFactor(0).setDepth(41).setScale(10).setAlpha(0.9);
    const nameText = this.add.text(VIEW_W / 2, VIEW_H / 2 - 30, `真名 · ${def.name}`, { fontFamily: "'Noto Serif SC', serif", fontSize: '44px', color: '#e4c479' }).setOrigin(0.5).setScrollFactor(0).setDepth(42);
    const quote = this.add.text(VIEW_W / 2, VIEW_H / 2 + 34, def.effect + '——名定形随。', { fontFamily: "'Noto Serif SC', serif", fontSize: '18px', color: '#f4ecd8' }).setOrigin(0.5).setScrollFactor(0).setDepth(42);
    playSfx('tame');
    this.emitters.gold.explode(24, b.body.x, b.body.y - 40);
    this.time.delayedCall(1900, () => {
      veil.destroy();
      blob.destroy();
      nameText.destroy();
      quote.destroy();
      this.tweens.add({ targets: cam, zoom: 1, duration: 300 });
      sceneCmd.paused = false;
      // 兽随名定形而退场：先标记 dead 防渲染/结算重复，再销毁
      b.state = 'dead';
      this.emitters.gold.explode(18, b.body.x, b.body.y - 40);
      b.hpbar?.setVisible(false);
      this.tweens.add({
        targets: [b.img, b.label],
        alpha: 0,
        duration: 450,
        onComplete: () => {
          b.rig.destroy();
          b.label.destroy();
          b.hpbar?.destroy();
          b.body.destroy();
          if (b.ring) b.ring.destroy();
        },
      });
      this.finishBeast(b, 'tamed');
    });
  }

  private killBeast(b: BeastEnt, kind: 'slain' | 'tamed'): void {
    if (b.state === 'dead') return;
    b.state = 'dead';
    b.hpbar?.setVisible(false);
    this.tweens.add({
      targets: [b.img, b.label],
      alpha: 0,
      y: b.zone === 'wild' ? '+=20' : '+=30',
      duration: 600,
      onComplete: () => {
        b.rig.destroy();
        b.label.destroy();
        b.hpbar?.destroy();
        b.body.destroy();
        if (b.ring) b.ring.destroy();
      },
    });
    this.emitters.ink.explode(16, b.body.x, b.body.y - 20);
    this.finishBeast(b, kind);
  }

  private finishBeast(b: BeastEnt, kind: 'slain' | 'tamed'): void {
    const outcome = settleBattle(b.beastId, kind, 0);
    playSfx(kind === 'tamed' ? 'tame' : 'slain');
    if (b.zone === 'boss') {
      this.bossResolved = true;
      this.bossEngaged = false;
      this.currentBoss = null;
      for (const w of this.arenaWalls) w.destroy();
      this.arenaWalls = [];
      bus.emit('outcome', { ...outcome, title: b.title ?? b.name, isBoss: true });
      this.emitBossBar();
    } else {
      if (b.zone === 'elite') {
        this.eliteResolved = true;
      }
      bus.emit('outcome', { ...outcome, title: b.title ?? b.name, isBoss: false });
      if (b.zone === 'elite') bus.emit('gateOpen', undefined);
    }
    if (this.target === b) {
      this.target = null;
      this.emitBossBar();
    }
  }

  private floatText(x: number, y: number, text: string): void {
    const t = this.add.text(x, y, text, { fontFamily: "'Noto Serif SC', serif", fontSize: '14px', color: '#f4ecd8' }).setOrigin(0.5).setDepth(9);
    this.tweens.add({ targets: t, y: y - 34, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private useHerb(): void {
    if (!this.cfg.hasHerb || this.itemCd > 0) return;
    this.itemCd = 480;
    this.hp = Math.min(this.maxHp, this.hp + Math.round(this.maxHp * 0.3));
    this.poisonF = 0;
    bus.emit('gained', { kind: 'use', itemId: 'zhuyu', amount: 1 });
    this.emitters.heal.explode(10, this.playerBody.x, this.playerBody.y - 20);
    this.floatText(this.playerBody.x, this.playerBody.y - 50, '祝余 · 食之不饥');
    playSfx('heal');
    this.emitHud();
  }

  private companionSkill(idx: number): void {
    if (idx >= this.cfg.party.length || this.beastCds[idx]! > 0) return;
    const id = this.cfg.party[idx]!;
    this.beastCds[idx] = 1800;
    const kind = (['lushu', 'chiru'].includes(id) ? 'heal' : ['xuangui', 'boyi'].includes(id) ? 'shield' : ['lei', 'guanguan'].includes(id) ? 'haste' : 'strike') as 'heal' | 'shield' | 'haste' | 'strike';
    if (kind === 'heal') {
      this.hp = Math.min(this.maxHp, this.hp + Math.round(this.maxHp * 0.25));
      this.poisonF = 0;
      bus.emit('toast', '兽伴歌谣——伤势缓过来了。');
      this.emitters.heal.explode(10, this.playerBody.x, this.playerBody.y - 24);
    } else if (kind === 'shield') {
      this.shield += 40 + this.cfg.stats.def * 2;
      bus.emit('toast', '兽伴玄甲护体——接下来的一部分伤害由它挡下。');
    } else if (kind === 'haste') {
      this.hasteF = 480;
      bus.emit('toast', '兽伴引路——身轻如燕（8 秒）。');
    } else {
      this.swingId += 1;
      const before = this.beasts.map((b) => b.hp);
      this.playerStrike(2.2, true, 120);
      const after = this.beasts.map((b) => b.hp);
      if (before.every((v, i) => v === after[i])) this.beastCds[idx] = 240;
      bus.emit('toast', '兽伴扑击——与你同击！');
    }
    playSfx('clue');
    this.emitHud();
  }

  /* ================= 渲染同步 / HUD ================= */

  private syncPlayerRig(delta: number): void {
    void delta;
    this.playerSpr.setPosition(this.playerBody.x, this.playerBody.y + 22);
    this.playerSpr.setFlipX(this.facing < 0);
    const map: Partial<Record<PlayerState, string>> = {
      idle: 'pl_idle', run: 'pl_run', jump: 'pl_jump', roll: 'pl_roll', climb: 'pl_climb',
      light1: 'pl_light1', light2: 'pl_light2', light3: 'pl_light3',
      heavy_charge: 'pl_heavy', heavy_release: 'pl_heavy', parry: 'pl_parry',
      hurt: 'pl_hurt', stagger: 'pl_hurt', getup: 'pl_idle', dead: 'pl_dead',
    };
    const key = map[this.pstate] ?? 'pl_idle';
    if (this.playerSpr.anims.currentAnim?.key !== key) this.playerSpr.play(key, true);
    if (this.pstate === 'roll') this.playerSpr.setRotation(this.facing * this.pf * 0.4);
    else if (this.pstate === 'dead') this.playerSpr.setRotation(this.facing * 1.45);
    else this.playerSpr.setRotation(0);
  }

  private syncBeastRig(b: BeastEnt, delta: number): void {
    void delta;
    if (b.state === 'dead' || !b.body || !b.rig || !b.label) return;
    const bh = b.standH;
    b.rig.setPosition(b.body.x, b.body.y + bh / 2);
    b.img.setRotation(0);
    b.rig.setScale(b.dir, 1);
    b.label.setPosition(b.body.x, b.body.y - bh - 16);
    // 野兽小血条：开打才露头，boss 走大血条不画
    if (b.hpbar) {
      b.hpbar.clear();
      if (b.aggro && b.hp < b.maxHp && b.zone !== 'boss') {
        const w = 52, pct = Math.max(0, b.hp / b.maxHp);
        const x = b.body.x - w / 2, y = b.body.y - bh - 30;
        b.hpbar.fillStyle(0x14100c, 0.7).fillRect(x, y, w, 5);
        b.hpbar.fillStyle(pct > 0.5 ? 0xd86a4a : 0xe03a2a, 1).fillRect(x + 1, y + 1, (w - 2) * pct, 3);
      }
    }
    switch (b.state) {
      case 'windup': {
        // 部位红闪：预备期脉动
        if (Math.floor(b.stateF / 4) % 2 === 0) b.img.setTintFill(0xff6650);
        else b.img.clearTint();
        b.img.setRotation(-0.12 * b.dir);
        if (b.ring) b.ring.setPosition(b.body.x, b.body.y).setScale(0.3 + b.stateF * 0.012);
        break;
      }
      case 'active': b.img.clearTint(); b.img.setRotation(0.22 * b.dir); break;
      case 'stagger': b.img.clearTint(); b.img.setRotation(Math.sin(b.stateF * 0.5) * 0.2); break;
      case 'downed': b.img.clearTint(); b.img.setRotation(1.2); break;
      case 'fakedeath': b.img.clearTint(); b.img.setRotation(1.45); b.img.setAlpha(0.7); break;
      case 'chase': b.img.clearTint(); b.img.setAlpha(1); b.img.setFrame((BEAST_INDEX[b.beastId] ?? 0) * 2 + (Math.floor(this.frame / 20) % 2)); b.img.setRotation(bodyOf(b).velocity.x * -0.0006); break;
      default: b.img.clearTint(); b.img.setAlpha(1); break;
    }
  }

  private updateCamera(delta: number): void {
    void delta;
    const cam = this.cameras.main;
    const lookahead = this.facing * 110;
    const targetX = this.playerBody.x + lookahead - VIEW_W / 2;
    cam.scrollX += (targetX - cam.scrollX) * 0.12;
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, 0, this.level.width - VIEW_W);
    // 视差（tileSprite 1:1 平铺，避免旧方案 7 倍横拉糊成色块）
    if (this.skyTiles) {
      const sx = cam.scrollX;
      this.skyTiles.rf.tilePositionX = sx * 0.14;
      this.skyTiles.rm.tilePositionX = sx * 0.34;
      this.skyTiles.rn.tilePositionX = sx * 0.6;
      this.skyTiles.clouds.tilePositionX = sx * 0.07 + this.cloudDrift;
    }
    if (this.fogTile) {
      this.fogTile.tilePositionX += 0.25;
      this.fogTile.setPosition(cam.scrollX * 0.9, 0);
    }
  }

  private createPlayerAnims(): void {
    const mk = (key: string, frames: number[], frameRate: number, repeat: number) => {
      if (this.anims.exists(key)) return;
      this.anims.create({ key, frames: this.anims.generateFrameNumbers('pl', { frames }), frameRate, repeat });
    };
    mk('pl_idle', [0, 1], 2, -1);
    mk('pl_run', [2, 3, 4, 5, 6, 7], 12, -1);
    mk('pl_jump', [8, 9], 8, 0);
    mk('pl_roll', [10, 11, 12, 13], 16, 0);
    mk('pl_light1', [14, 15], 14, 0);
    mk('pl_light2', [16, 17], 14, 0);
    mk('pl_light3', [18, 19], 14, 0);
    mk('pl_heavy', [20, 21], 10, 0);
    mk('pl_parry', [22], 1, 0);
    mk('pl_hurt', [23], 1, 0);
    mk('pl_climb', [24, 25], 4, -1);
    mk('pl_dead', [26], 1, 0);
  }

  private emitHud(): void {
    const t = this.target;
    bus.emit('hud', {
      hp: Math.round(this.hp),
      maxHp: this.maxHp,
      qi: Math.round(this.qi),
      maxQi: this.maxQi,
      layers: t ? insightCount(t.progress.axes) : 0,
      axes: t ? { ...t.progress.axes } : { shape: false, sound: false, nature: false },
      nameReady: t ? this.isNameReady(t) : false,
      poison: this.poisonF > 0,
      inverted: this.invertF > 0,
      shield: Math.round(this.shield),
      itemCd: Math.max(0, Math.round((this.itemCd / 60) * 10) / 10),
      beastCds: this.beastCds.map((c) => Math.max(0, Math.round((c / 60) * 10) / 10)),
    });
  }

  private emitBossBar(): void {
    const b = this.currentBoss ?? (this.target && this.target.aggro ? this.target : null);
    if (!b || b.state === 'dead') {
      bus.emit('boss', null);
      return;
    }
    const prefix = b.zone === 'boss' ? '【山主】' : b.zone === 'elite' ? '【精英】' : '野·';
    bus.emit('boss', {
      name: b.name,
      title: prefix + (b.title ?? b.name),
      hp: Math.round(b.hp),
      maxHp: b.maxHp,
      stance: Math.round(b.stance),
      stanceMax: b.stanceMax,
      phase: b.phase,
      isBoss: b.zone === 'boss',
    });
  }
}
