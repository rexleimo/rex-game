import type { EnemyKind, EnemyProfile, StageDefinition, YinggeChapterId } from '../core/types';

export const ENEMY_PROFILES: Record<EnemyKind, EnemyProfile> = {
  'ash-wisp': {
    label: '灰烬瘴灵', hp: 72, speed: 68, strikeDamage: 7, strikeInterval: 1.6,
    damageReduction: 0, displaySize: [132, 168],
  },
  flanker: {
    label: '侧袭瘴影', hp: 58, speed: 102, strikeDamage: 8, strikeInterval: 1.35,
    damageReduction: 0, displaySize: [108, 190],
  },
  pouncer: {
    label: '扑击瓦尘', hp: 112, speed: 82, strikeDamage: 13, strikeInterval: 1.7,
    damageReduction: 0.08, displaySize: [190, 128],
  },
  swarm: {
    label: '群聚烟障', hp: 46, speed: 88, strikeDamage: 5, strikeInterval: 1.25,
    damageReduction: 0, displaySize: [128, 128],
  },
  'tile-guard': {
    label: '瓦盾阻障', hp: 190, speed: 44, strikeDamage: 11, strikeInterval: 1.9,
    damageReduction: 0.42, displaySize: [158, 174],
  },
  'miasma-chief': {
    label: '百障瘴核', hp: 620, speed: 50, strikeDamage: 14, strikeInterval: 1.25,
    damageReduction: 0.14, displaySize: [250, 310],
  },
};

export const YINGGE_STAGES: StageDefinition[] = [
  {
    chapterId: 'drum-basics', theme: 'village-road', durationSeconds: 48, processionSpeed: 18,
    objective: '听清重拍，以基础槌法护送队伍完成村落初巡。',
    culturalMission: '先听锣鼓再落槌：动作不必被节拍锁死，但整队同拍会更有气势。',
    tutorialCues: [
      { at: 1, text: 'A / D 移动 · J 快速戳刺' },
      { at: 7, text: '踩中重拍会增加伤害与士气' },
      { at: 15, text: 'U 防御，在受击瞬间反击' },
    ],
    waves: [
      { at: 2, enemies: ['ash-wisp', 'ash-wisp'], cue: '灰烬随风 · 稳住第一槌' },
      { at: 10, enemies: ['ash-wisp', 'flanker'], cue: '侧影逼近 · 前后微调' },
      { at: 19, enemies: ['ash-wisp', 'ash-wisp', 'flanker'], cue: '合槌清障 · 不必等拍出手' },
    ],
    boss: {
      kind: 'tile-guard', label: '村口瓦障', hp: 420, speed: 38, strikeDamage: 12, strikeInterval: 1.8,
      phases: [{ threshold: 0.45, speedMultiplier: 1.25, strikeIntervalMultiplier: 0.82, cue: '瓦障松动 · 重槌破势' }],
    },
  },
  {
    chapterId: 'heroes-enter', theme: 'ancestral-hall', durationSeconds: 52, processionSpeed: 20,
    objective: '辨清侧袭与扑击，在祠堂埕前完成对阵演练。',
    culturalMission: '认识脸谱角色与地方差异，同时学会队员之间相顾、相让、相接。',
    tutorialCues: [{ at: 2, text: 'K 横扫适合同时击退多股阻障' }, { at: 13, text: '长蛇阵移动快，圆阵受伤少' }],
    waves: [
      { at: 2, enemies: ['flanker', 'flanker'], cue: '侧袭瘴影 · 快槌截住' },
      { at: 11, enemies: ['pouncer', 'ash-wisp'], cue: '瓦尘扑落 · 留意重击' },
      { at: 21, enemies: ['flanker', 'pouncer', 'flanker'], cue: '两翼夹进 · 横扫开路' },
    ],
    boss: {
      kind: 'pouncer', label: '对阵瓦兽', hp: 560, speed: 74, strikeDamage: 15, strikeInterval: 1.45,
      phases: [{ threshold: 0.55, speedMultiplier: 1.35, strikeIntervalMultiplier: 0.78, cue: '瓦兽蓄势 · 圆阵承击' }],
    },
  },
  {
    chapterId: 'formation', theme: 'temple-square', durationSeconds: 56, processionSpeed: 22,
    objective: '根据敌群切换长蛇、圆阵与雁行，让全队协同开路。',
    culturalMission: '英歌重在群体配合：根据阻障展开、收拢或纵向聚势，用对阵形才算合队。',
    tutorialCues: [{ at: 2, text: 'Shift 换阵 · 雁行阵攻击范围最广' }, { at: 15, text: '士气满后 Space 发动团队合击' }],
    waves: [
      { at: 2, enemies: ['swarm', 'swarm', 'swarm'], cue: '烟障分散 · 雁行广击' },
      { at: 12, enemies: ['tile-guard', 'flanker'], cue: '瓦盾在前 · 侧影在后' },
      { at: 23, enemies: ['pouncer', 'swarm', 'swarm'], cue: '稳阵合槌 · 聚起士气' },
      { at: 32, enemies: ['tile-guard', 'pouncer'], cue: '双障压阵 · 守中反击' },
    ],
    boss: {
      kind: 'miasma-chief', label: '合阵瘴核', hp: 760, speed: 48, strikeDamage: 16, strikeInterval: 1.3,
      phases: [
        { threshold: 0.66, speedMultiplier: 1.18, strikeIntervalMultiplier: 0.88, cue: '瘴核一变 · 队形勿乱' },
        { threshold: 0.33, speedMultiplier: 1.35, strikeIntervalMultiplier: 0.72, cue: '瘴核再聚 · 合击破阵' },
      ],
    },
  },
  {
    chapterId: 'village-parade', theme: 'lantern-street', durationSeconds: 62, processionSpeed: 26,
    objective: '在灯火街巷的快速巡游中持续前进，处理连续混合波次。',
    culturalMission: '把战斗看成社区巡游中的护队任务：保持队形、鼓点与前进路线不断。',
    tutorialCues: [{ at: 2, text: '巡游加速 · 用 A / D 调整接敌距离' }, { at: 20, text: '圆阵能承受密集冲击' }],
    waves: [
      { at: 2, enemies: ['flanker', 'swarm', 'flanker'], cue: '灯街风急 · 两翼来袭' },
      { at: 11, enemies: ['pouncer', 'pouncer'], cue: '连续扑击 · 防守反槌' },
      { at: 21, enemies: ['tile-guard', 'swarm', 'swarm'], cue: '瓦盾堵巷 · 广域清障' },
      { at: 32, enemies: ['flanker', 'pouncer', 'tile-guard'], cue: '街巷三障 · 临阵换形' },
      { at: 42, enemies: ['swarm', 'swarm', 'flanker', 'flanker'], cue: '鼓催步紧 · 保住连槌' },
    ],
    boss: {
      kind: 'swarm', label: '巡巷障潮', hp: 880, speed: 68, strikeDamage: 17, strikeInterval: 1.15,
      phases: [
        { threshold: 0.7, speedMultiplier: 1.2, strikeIntervalMultiplier: 0.9, cue: '障潮分流 · 雁行扫开' },
        { threshold: 0.35, speedMultiplier: 1.42, strikeIntervalMultiplier: 0.7, cue: '障潮回卷 · 合槌定街' },
      ],
    },
  },
  {
    chapterId: 'grand-performance', theme: 'grand-stage', durationSeconds: 68, processionSpeed: 28,
    objective: '完成最终会演，在最密集的鼓点和三阶段首领中保持全队气势。',
    culturalMission: '最终目标不是猎杀怪物，而是让整队在变化中仍能同拍、同阵、同声完成会演。',
    tutorialCues: [{ at: 2, text: '最终会演 · 自由出槌，踩点得势' }, { at: 24, text: '保留一次满士气合击应对终局' }],
    waves: [
      { at: 2, enemies: ['ash-wisp', 'flanker', 'swarm'], cue: '百障入场 · 第一轮开槌' },
      { at: 11, enemies: ['tile-guard', 'pouncer'], cue: '重障相叠 · 先守后攻' },
      { at: 21, enemies: ['flanker', 'flanker', 'swarm', 'swarm'], cue: '快影并行 · 横扫成路' },
      { at: 31, enemies: ['tile-guard', 'pouncer', 'flanker'], cue: '三路压阵 · 临势换形' },
      { at: 42, enemies: ['pouncer', 'swarm', 'tile-guard'], cue: '会演将满 · 聚齐士气' },
    ],
    boss: {
      kind: 'miasma-chief', label: '百障瘴核', hp: 1180, speed: 54, strikeDamage: 18, strikeInterval: 1.1,
      phases: [
        { threshold: 0.75, speedMultiplier: 1.14, strikeIntervalMultiplier: 0.92, cue: '百障一聚 · 长蛇开锋' },
        { threshold: 0.48, speedMultiplier: 1.28, strikeIntervalMultiplier: 0.78, cue: '百障再合 · 圆阵承势' },
        { threshold: 0.22, speedMultiplier: 1.48, strikeIntervalMultiplier: 0.62, cue: '终槌将至 · 全队合击' },
      ],
    },
  },
];

export function getStageDefinition(chapterId: YinggeChapterId): StageDefinition {
  const stage = YINGGE_STAGES.find((item) => item.chapterId === chapterId);
  if (!stage) throw new Error(`Unknown Yingge stage: ${chapterId}`);
  return stage;
}
