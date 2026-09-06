'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGameOpen } from '@/core/analytics/useGameOpen';
import { trackGameFinish, trackGameStart, trackStepComplete } from '@/core/analytics';
import { GameChrome } from '@/components/game/GameChrome';
import { FirstPlayGuide } from '@/components/game/FirstPlayGuide';
import { completeToday, dailyRng, isDayDone, loadDaily, todayKey } from '@/core/daily';
import '@/styles/game-shell.css';
import { loadSave, persistSave, wipeSave } from './core/save';
import type { BeastId, MountainId, StoryBeat, WenshouSave } from './core/types';
import { codexCount, deriveStats, favorSum, grantExp, partyCap, registerEncounter, registerTame, tameRate } from './core/progression';
import { getBeast } from './content/beasts';
import { getMountain, MOUNTAINS } from './content/mountains';
import { STORY_BEATS } from './content/story';
import { CampScene } from './components/CampScene';
import { CodexScene } from './components/CodexScene';
import { StoryScene } from './components/StoryScene';
import { ActionGame, type OutcomePayload } from './action/ActionGame';
import { sceneCmd } from './action/bus';
import { favorTier } from './action/frameData';
import type { Difficulty } from './action/frameData';
import { commissionState, commissionsFor } from './action/commissions';
import { getItem } from './content/items';
import { ENDINGS, NG_OPEN_BEATS, pickEnding } from './content/story';
import styles from './ShanhaiWenshouGame.module.css';

/**
 * 《山海问兽》主流程（GDD v1.0 动作 RPG 版）：
 * 卷首 → 动作世界（十山横版实时战斗）→ 杀/驯结算 → 祭礼 → 十山卷轴 → 藏馆。
 * 答题弹窗全部退役（GDD「三不做」第一条规定）；questions.ts 转图鉴彩蛋。
 */

type View = 'title' | 'world' | 'camp' | 'codex' | 'story' | 'map' | 'end';

const PLAYER_NAME = '阿蘅';
const DIFFICULTY_KEY = 'rex-game:shanhai-wenshou:difficulty:v1';

const DIFFICULTY_LABELS: { id: Difficulty; name: string; desc: string }[] = [
  { id: 'simple', name: '简明', desc: '弹反窗口加倍 · 识破两印即可问名' },
  { id: 'standard', name: '标准', desc: '三印齐 + 兽血低于两成半，方可问名' },
  { id: 'assist', name: '辅助', desc: '弹反窗口加倍 · 受伤更轻 · 两印可问名' },
];

function loadDifficulty(): Difficulty {
  if (typeof window === 'undefined') return 'standard';
  const raw = window.localStorage.getItem(DIFFICULTY_KEY);
  return raw === 'simple' || raw === 'assist' ? raw : 'standard';
}

export function ShanhaiWenshouGame() {
  useGameOpen('shanhai-wenshou');
  const [save, setSave] = useState<WenshouSave | null>(null);
  const [view, setView] = useState<View>('title');
  const [storyBeats, setStoryBeats] = useState<StoryBeat[]>([]);
  const afterStoryRef = useRef<() => void>(() => setView('map'));
  const [outcome, setOutcome] = useState<(OutcomePayload & { lines: string[] }) | null>(null);
  const [riteOpen, setRiteOpen] = useState(false);
  const [worldKey, setWorldKey] = useState(0);
  const [patrol, setPatrol] = useState<{ beastId: BeastId; level: number; title: string } | undefined>(undefined);
  const [hiddenBeast, setHiddenBeast] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [muted, setMuted] = useState(false);
  const dailyDeepLink = useRef(false);

  // —— 存档装载 ——
  useEffect(() => {
    setSave(loadSave());
    setDifficulty(loadDifficulty());
    if (new URLSearchParams(window.location.search).get('mode') === 'daily') {
      dailyDeepLink.current = true;
    }
  }, []);

  // 深链落到巡山
  useEffect(() => {
    if (!save || !dailyDeepLink.current) return;
    dailyDeepLink.current = false;
    if (isDayDone(loadDaily(), todayKey(), 'shanhai-wenshou')) return;
    startPatrol();
  }, [save != null]); // eslint-disable-line react-hooks/exhaustive-deps

  // —— 计时 ——
  useEffect(() => {
    if (!save) return;
    const timer = window.setInterval(() => {
      setSave((prev) => {
        if (!prev) return prev;
        const next = { ...prev, stats: { ...prev.stats, playtimeMs: prev.stats.playtimeMs + 15_000 } };
        persistSave(next);
        return next;
      });
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [save != null]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = useCallback((updater: (prev: WenshouSave) => WenshouSave) => {
    setSave((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      persistSave(next);
      return next;
    });
  }, []);

  const mountain = useMemo(
    () => MOUNTAINS[Math.min(save?.mountainIndex ?? 0, MOUNTAINS.length - 1)]!,
    [save?.mountainIndex],
  );

  // —— 剧情队列 ——
  const unseenBeats = useCallback(
    (predicate: (b: StoryBeat) => boolean): StoryBeat[] => {
      if (!save) return [];
      return STORY_BEATS.filter((b) => predicate(b) && !save.seenStory.includes(b.id));
    },
    [save],
  );

  const showStory = useCallback((beats: StoryBeat[], then: () => void) => {
    if (beats.length === 0) {
      then();
      return;
    }
    commit((prev) => ({
      ...prev,
      seenStory: [...new Set([...prev.seenStory, ...beats.map((b) => b.id)])],
    }));
    afterStoryRef.current = then;
    setStoryBeats(beats);
    setView('story');
  }, [commit]);

  // —— 进山 ——
  const enterMountain = useCallback((mid: MountainId, opts?: { patrol?: typeof patrol }) => {
    const m = getMountain(mid);
    if (!m || !save) return;
    setPatrol(opts?.patrol);
    setOutcome(null);
    setRiteOpen(false);
    setHiddenBeast(opts?.patrol ? false : hiddenOf(mid, save));
    const open = unseenBeats((b) => !b.ng && b.at.kind === 'mountainOpen' && b.at.mountain === mid);
    trackGameStart('shanhai-wenshou', opts?.patrol ? 'patrol' : 'mountain');
    showStory(open, () => {
      setWorldKey((k) => k + 1);
      setView('world');
    });
  }, [save, unseenBeats, showStory]);

  const startPatrol = useCallback(() => {
    if (!save) return;
    const rng = dailyRng(todayKey(), 'shanhai-wenshou');
    const pool = (Object.keys(save.beasts) as BeastId[]).filter((id) => (save.beasts[id] ?? 0) > 0);
    const beastId = pool[Math.floor(rng() * Math.max(1, pool.length))] ?? 'xingxing';
    const level = Math.max(2, Math.min(30, save.level + 2));
    const current = MOUNTAINS[Math.min(save.mountainIndex, MOUNTAINS.length - 1)]!;
    enterMountain(current.id, { patrol: { beastId, level, title: `巡山 · 瘴化${getBeast(beastId)?.name ?? ''}` } });
  }, [save, enterMountain]);

  // —— 拾取 ——
  const onGained = useCallback(
    (g: { kind: string; itemId?: string; amount: number }) => {
      if (!save) return;
      const mid = mountain.id;
      commit((prev) => {
        const next: WenshouSave = { ...prev, items: { ...prev.items } };
        if (g.kind === 'herb' && g.itemId) {
          next.items[g.itemId] = (next.items[g.itemId] ?? 0) + g.amount;
          const prog = prev.mountains[mid];
          const gathered = prog?.gathered.includes(g.itemId) ? prog.gathered : [...(prog?.gathered ?? []), g.itemId];
          next.mountains = {
            ...prev.mountains,
            [mid]: {
              cleared: prog?.cleared ?? false,
              gathered,
              npcs: prog?.npcs ?? [],
              gatePassed: prog?.gatePassed ?? false,
              bossDefeated: prog?.bossDefeated ?? false,
              eliteDefeated: prog?.eliteDefeated ?? false,
            },
          };
        } else if (g.kind === 'jade') {
          next.jade = prev.jade + 2 * Math.max(1, g.amount);
        } else if (g.kind === 'use' && g.itemId) {
          next.items[g.itemId] = Math.max(0, (next.items[g.itemId] ?? 0) - g.amount);
        } else if (g.kind === 'stele' && g.itemId) {
          next.stelesRead = { ...prev.stelesRead, [g.itemId as MountainId]: 1 };
        }
        return next;
      });
    },
    [save, mountain.id, commit],
  );

  // —— 战斗结算（驯/杀） ——
  const onOutcome = useCallback(
    (o: OutcomePayload) => {
      if (!save) return;
      const mid = mountain.id;
      const beastName = getBeast(o.beastId)?.name ?? o.beastId;
      const lines = o.kind === 'tamed'
        ? [`「${beastName}」喝下了真名，形定神安——它随你同行。`, o.title ? `${o.title}俯首于祠前，山间的瘴气似乎薄了一层。` : '']
        : [`你以杖了断了「${beastName}」的狂形。材料入囊，山风里却多了一声叹息。`];
      const afterBeats = o.isBoss ? unseenBeats((b) => b.at.kind === 'afterBoss' && b.at.mountain === mid) : [];
      const dialogLines = [...lines, ...afterBeats.map((b) => (b.aside ? `（${b.text}）` : `${b.speaker}：${b.text}`))];

      commit((prev) => {
        const next: WenshouSave = {
          ...prev,
          items: { ...prev.items },
          beasts: { ...prev.beasts },
          party: [...prev.party],
          favor: { ...prev.favor },
          stats: { ...prev.stats, battlesWon: prev.stats.battlesWon + 1 },
        };
        grantExp(next, o.exp);
        for (const drop of o.drops) next.items[drop] = (next.items[drop] ?? 0) + 1;
        registerEncounter(next, o.beastId);
        if (o.kind === 'tamed') {
          registerTame(next, o.beastId);
          if (next.party.length < partyCap(next.level)) next.party.push(o.beastId);
        }
        const prevFavor = next.favor?.[mid] ?? 0;
        next.favor = { ...(next.favor ?? {}), [mid]: Math.max(-10, Math.min(20, prevFavor + o.favorDelta)) };
        // 清巢委托计数（本山的野生/精英兽）
        const cullKey = `cull:${mid}:${o.beastId}`;
        next.commissionProgress = { ...(prev.commissionProgress ?? {}), [cullKey]: (prev.commissionProgress?.[cullKey] ?? 0) + 1 };
        // 隐藏 boss 战绩
        if (o.title?.includes('谣音之主')) next.hidden = { ...(prev.hidden ?? {}), yaoyin: 1 };
        if (o.title?.includes('初齿')) next.hidden = { ...(prev.hidden ?? {}), chuzhi: 1 };
        if (o.isBoss) {
          const prog = prev.mountains[mid];
          next.mountains = {
            ...prev.mountains,
            [mid]: {
              cleared: prog?.cleared ?? false,
              gathered: prog?.gathered ?? [],
              npcs: prog?.npcs ?? [],
              gatePassed: prog?.gatePassed ?? false,
              bossDefeated: true,
              eliteDefeated: prog?.eliteDefeated ?? false,
            },
          };
          next.jade += 30;
        } else if (o.title?.includes('巡山')) {
          next.jade += 24;
        } else {
          next.jade += 5;
        }
        return next;
      });

      if (o.title?.includes('巡山')) {
        completeToday('shanhai-wenshou');
        trackStepComplete('shanhai-wenshou', 'patrol', o.kind);
      }
      trackGameFinish('shanhai-wenshou', o.isBoss ? 'boss' : 'wild', o.kind === 'tamed' ? 'tamed' : 'win');
      if (o.kind === 'tamed') trackStepComplete('shanhai-wenshou', 'battle', 'tamed');

      // 普通击杀走飘条结算（ActionGame 已弹 toast），不打开结算窗
      if (!o.quiet) setOutcome({ ...o, lines: dialogLines });
    },
    [save, mountain.id, commit, unseenBeats],
  );

  // —— 结算后：继续（精英/野外）或行祭礼（山主） ——
  const closeOutcome = useCallback(() => {
    if (!outcome) return;
    const wasBoss = outcome.isBoss;
    setOutcome(null);
    if (wasBoss && !patrol) {
      setRiteOpen(true);
    } else {
      // 野外/精英：解除暂停继续行脚
      window.dispatchEvent(new CustomEvent('wenshou-unpause'));
      if (patrol) {
        setPatrol(undefined);
        setView('map');
      }
    }
  }, [outcome, patrol]);

  // —— 祭礼（非答题：三献礼成） ——
  const finishRite = useCallback(() => {
    if (!save) return;
    const mid = mountain.id;
    const clearedBeats = unseenBeats((b) => (b.at.kind === 'mountainCleared' || b.at.kind === 'afterBoss') && 'mountain' in b.at && b.at.mountain === mid);
    commit((prev) => {
      const prog = prev.mountains[mid];
      const favor = { ...prev.favor };
      favor[mid] = Math.max(-10, Math.min(20, (favor[mid] ?? 0) + 2));
      const next: WenshouSave = {
        ...prev,
        favor,
        mountains: {
          ...prev.mountains,
          [mid]: {
            cleared: true,
            gathered: prog?.gathered ?? [],
            npcs: prog?.npcs ?? [],
            gatePassed: true,
            bossDefeated: true,
            eliteDefeated: prog?.eliteDefeated ?? Boolean(getMountain(mid)?.eliteFight == null),
          },
        },
      };
      if (mid === 'wuming') {
        next.chapterDone = true;
        next.jade += 100;
      } else {
        next.mountainIndex = Math.min(prev.mountainIndex + 1, MOUNTAINS.length - 1);
      }
      return next;
    });
    setRiteOpen(false);
    trackGameFinish('shanhai-wenshou', 'rite', 'win');
    const isFinal = mid === 'wuming';
    let endBeats: StoryBeat[] = [];
    if (isFinal) {
      const cur = save;
      const ending = ENDINGS[pickEnding(cur.ngPlus ?? 0, tameRate(cur), favorSum(cur))];
      endBeats = [...ending, ...unseenBeats((b) => !b.ng && b.at.kind === 'chapterEnd')];
    }
    showStory(isFinal ? endBeats : clearedBeats, () => {
      setWorldKey((k) => k + 1);
      setView(isFinal ? 'end' : 'map');
    });
  }, [save, mountain.id, commit, unseenBeats, showStory]);

  // —— 退出世界（存 hp/qi） ——
  const onExitWorld = useCallback(
    (hp: number, qi: number) => {
      commit((prev) => ({ ...prev, hp: Math.max(1, hp), qi }));
      setPatrol(undefined);
      setView('map');
    },
    [commit],
  );

  // —— 卷首 / 难度 ——
  const startNew = useCallback(() => {
    if (!save) return;
    const open = (save.ngPlus ?? 0) > 0
      ? NG_OPEN_BEATS
      : unseenBeats((b) => !b.ng && b.at.kind === 'chapterOpen');
    trackGameStart('shanhai-wenshou', 'chapter');
    showStory(open, () => {
      setWorldKey((k) => k + 1);
      setView('world');
    });
  }, [save, unseenBeats, showStory]);

  // —— 二周目：重问十山（保留成长，山与瘴重置，兽强化）——
  const startNGPlus = useCallback(() => {
    if (!save) return;
    commit((prev) => ({
      ...prev,
      ngPlus: Math.min(9, (prev.ngPlus ?? 0) + 1),
      mountainIndex: 0,
      mountains: {},
      // 委托/拓印随周目重开（山望、图鉴、佩饰、兽伴保留）
      claimedCommissions: {},
      commissionProgress: {},
      stelesRead: {},
      hp: deriveStats(prev).maxHp,
      qi: deriveStats(prev).maxQi,
    }));
    trackGameStart('shanhai-wenshou', 'ngplus');
    showStory(NG_OPEN_BEATS, () => {
      setWorldKey((k) => k + 1);
      setView('world');
    });
  }, [save, commit, showStory]);

  const chooseDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
    try {
      window.localStorage.setItem(DIFFICULTY_KEY, d);
    } catch { /* ignore */ }
  }, []);

  // 结算浮层关闭后解除场景暂停（ActionGame 内监听该事件）
  useEffect(() => {
    const handler = () => sceneCmd.paused = false;
    window.addEventListener('wenshou-unpause', handler);
    return () => window.removeEventListener('wenshou-unpause', handler);
  }, []);

  if (!save) {
    return (
      <main className={styles.root}>
        <div className={styles.loading}>正在展开图志……</div>
      </main>
    );
  }

  const stats = deriveStats(save);
  const currentProgress = save.mountains[mountain.id];

  return (
    <main className={styles.root}>
      <FirstPlayGuide
        storageKey="rex-game:shanhai-wenshou:guide:v2"
        title="山海问兽 · 动作玩法说明"
        description="一部可以玩的《南山经》。以杖问兽，以名定形——走过鹊山首脉十座山，读招、识破、问名收服，或了断取材。所有引文出自《山海经·南山经》原文。"
        steps={[
          'A/D 移动，W/Space 跳，J 轻攻三连，K 蓄力重击（破架式），L 翻滚（无敌帧），I 识破格挡（弹反）。',
          '看预备动作读招：红闪+兽鸣=要出招了。在声兆瞬间弹反可得「声」印；集齐形/声/性三印、兽血低于两成半，按 Q 问名收服。',
          '祠座歇脚回满、存复活点。打死山主后行祭礼，此山才算走完；驯多杀少，山望更高。',
        ]}
      />
      <GameChrome title="山海问兽" edition={EDITION[view](mountain, riteOpen)}>
        {view === 'title' && (
          <div className={styles.titleRoot}>
            <p className={styles.titleEyebrow}>南山经 · 鹊山首脉</p>
            <h2 className={styles.titleMain}>山海问兽</h2>
            <p className={styles.titleLead}>
              「以杖问兽，以名定形。」
              <br />
              一部可以玩的《山海经·南山经》：横版动作闯过十座山，读招识破异兽，问其真名收为兽伴——或了断取材。读过图鉴的人，少挨打。
            </p>
            <div className={styles.diffRow}>
              {DIFFICULTY_LABELS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`${styles.diffBtn} ${difficulty === d.id ? styles.diffBtnOn : ''}`}
                  onClick={() => chooseDifficulty(d.id)}
                >
                  <strong>{d.name}</strong>
                  <small>{d.desc}</small>
                </button>
              ))}
            </div>
            {(save.ngPlus ?? 0) > 0 ? (
              <p className={styles.titleEyebrow}>第 {(save.ngPlus ?? 0) + 1} 周目 · 兽已老一轮</p>
            ) : null}
            <div className={styles.titleActions}>
              {save.chapterDone && (
                <button type="button" className={styles.primaryBtn} onClick={startNGPlus}>
                  二周目 · 重问十山
                </button>
              )}
              {save.stats.battlesWon > 0 || save.mountainIndex > 0 ? (
                <button type="button" className={styles.primaryBtn} onClick={() => enterMountain(mountain.id)}>
                  继续行脚 · {mountain.name}
                </button>
              ) : null}
              <button type="button" className={styles.primaryBtn} onClick={startNew}>
                {save.stats.battlesWon > 0 ? ((save.ngPlus ?? 0) > 0 ? '再入图志' : '重读序章') : '踏入图志'}
              </button>
              <button type="button" className={styles.ghostBtn} onClick={() => setView('map')}>
                十山卷轴
              </button>
              <button type="button" className={styles.ghostBtn} onClick={() => setView('codex')}>
                图志 · 兽栏
              </button>
              <button type="button" className={styles.ghostBtn} onClick={() => setView('camp')}>
                藏馆（家）
              </button>
            </div>
            <dl className={styles.titleStats}>
              <div>
                <dt>行脚</dt>
                <dd>Lv.{save.level} · {mountain.order}/10 山</dd>
              </div>
              <div>
                <dt>图鉴</dt>
                <dd>{codexCount(save)}/13 兽</dd>
              </div>
              <div>
                <dt>山望</dt>
                <dd>{(() => {
                  const f = save.favor?.[mountain.id] ?? 0;
                  const t = favorTier(f);
                  return t === 'devoted' ? '山民亲善' : t === 'warm' ? '温热' : t === 'cold' ? '侧目' : '冷淡';
                })()}</dd>
              </div>
              <div>
                <dt>累计行脚</dt>
                <dd>{formatPlaytime(save.stats.playtimeMs)}</dd>
              </div>
            </dl>
          </div>
        )}

        {view === 'world' && (
          <ActionGame
            key={`${mountain.id}-${worldKey}`}
            mountain={mountain.id}
            mountainName={mountain.name}
            stats={stats}
            hp={save.hp}
            qi={save.qi}
            party={save.party as BeastId[]}
            partyNames={save.party.map((id) => getBeast(id)?.name ?? id)}
            hasHerb={(save.items.zhuyu ?? 0) > 0}
            difficulty={difficulty}
            collected={currentProgress?.gathered ?? []}
            muted={muted}
            patrol={patrol}
            hiddenBeast={hiddenBeast}
            ngBoost={(save.ngPlus ?? 0) * 5}
            inventory={Object.keys(save.items)}
            tamedTotal={save.stats.tamedCount}
            freshBoss={!currentProgress?.bossDefeated}
            freshElite={mountain.eliteFight != null && !currentProgress?.eliteDefeated}
            bossIntro={(() => {
              const before = STORY_BEATS.filter((b) => b.at.kind === 'beforeBoss' && b.at.mountain === mountain.id);
              return {
                name: mountain.boss.title,
                lines: [...before.map((b) => (b.aside ? `（${b.text}）` : `${b.speaker}：${b.text}`)), `${PLAYER_NAME}拔杖。${mountain.boss.intro}`],
              };
            })()}
            onGained={onGained}
            onOutcome={onOutcome}
            onRite={() => setRiteOpen(true)}
            onExit={onExitWorld}
            onToggleMute={() => setMuted((m) => !m)}
          />
        )}

        {view === 'map' && (
          <ScrollMap
            save={save}
            onEnter={(mid) => enterMountain(mid)}
            onPatrol={startPatrol}
            onCamp={() => setView('camp')}
            onCodex={() => setView('codex')}
            onTitle={() => setView('title')}
          />
        )}

        {view === 'camp' && (
          <CampScene
            save={save}
            mountain={mountain.id}
            onClaim={(commissionId) => {
              commit((prev) => {
                const def = commissionsFor(mountain.id).find((c) => c.id === commissionId);
                if (!def) return prev;
                const st = commissionState(def, prev);
                if (st.claimed || !st.done) return prev;
                const next: WenshouSave = { ...prev, items: { ...prev.items }, favor: { ...(prev.favor ?? {}) } };
                void next;
                next.claimedCommissions = { ...(prev.claimedCommissions ?? {}), [commissionId]: 1 };
                if (def.kind === 'gather' && def.item) {
                  // 寻物：交货消耗
                  next.items[def.item] = Math.max(0, (next.items[def.item] ?? 0) - (def.amount ?? 1));
                }
                if (def.rewardItem) next.items[def.rewardItem] = (next.items[def.rewardItem] ?? 0) + 1;
                next.jade = prev.jade + def.jade;
                next.favor = { ...(next.favor ?? {}), [mountain.id]: Math.max(-10, Math.min(20, (next.favor?.[mountain.id] ?? 0) + def.favor)) };
                grantExp(next, def.exp);
                return next;
              });
            }}
            onEquip={(charmId) => {
              commit((prev) => {
                const slots = prev.charms ?? [];
                if (slots.includes(charmId) || slots.length >= 3 || (prev.items[charmId] ?? 0) <= 0) return prev;
                return { ...prev, charms: [...slots, charmId], charm: charmId };
              });
            }}
            onUnequip={(slot) => {
              commit((prev) => {
                const slots = [...(prev.charms ?? [])];
                if (slot < 0 || slot >= slots.length) return prev;
                slots.splice(slot, 1);
                return { ...prev, charms: slots, charm: slots[slots.length - 1] };
              });
            }}
            onRest={() => {
              commit((prev) => ({ ...prev, hp: deriveStats(prev).maxHp, qi: deriveStats(prev).maxQi }));
              setView('map');
            }}
            onCraft={(itemId) => {
              commit((prev) => {
                const item = getItem(itemId);
                if (!item?.craft) return prev;
                const nextItems = { ...prev.items };
                for (const [id, n] of Object.entries(item.craft.inputs)) {
                  nextItems[id] = (nextItems[id] ?? 0) - n;
                  if (nextItems[id] <= 0) delete nextItems[id];
                }
                nextItems[itemId] = (nextItems[itemId] ?? 0) + 1;
                return { ...prev, items: nextItems };
              });
            }}
            onParty={(beastId) => {
              commit((prev) => {
                const id = beastId as BeastId;
                const cap = partyCap(prev.level);
                if (prev.party.includes(id)) return { ...prev, party: prev.party.filter((b) => b !== id) };
                const party = prev.party.length >= cap ? [...prev.party.slice(1), id] : [...prev.party, id];
                return { ...prev, party };
              });
            }}
            onBuy={(itemId) => {
              commit((prev) => {
                const item = getItem(itemId);
                if (!item?.price || prev.jade < item.price) return prev;
                return { ...prev, jade: prev.jade - item.price, items: { ...prev.items, [itemId]: (prev.items[itemId] ?? 0) + 1 } };
              });
            }}
            onUpgrade={(key) => {
              commit((prev) => {
                const costs = { qi: [40, 90, 170, 300], satchel: [30, 70, 140], tame: [35, 80, 160], blessing: [50, 110, 200] } as const;
                const lv = prev.shrine[key];
                const cost = costs[key][lv];
                if (cost == null || prev.jade < cost) return prev;
                return { ...prev, jade: prev.jade - cost, shrine: { ...prev.shrine, [key]: lv + 1 } };
              });
            }}
            onBack={() => setView('map')}
          />
        )}

        {view === 'codex' && <CodexScene save={save} onBack={() => setView('map')} />}

        {view === 'story' && (
          <StoryScene
            beats={storyBeats}
            onDone={() => {
              setStoryBeats([]);
              afterStoryRef.current();
            }}
          />
        )}

        {view === 'end' && (
          <div className={styles.endRoot}>
            <p className={styles.titleEyebrow}>卷尾 · 鹊山首经读毕</p>
            <h2>凡十山，二千九百五十里。</h2>
            <dl className={styles.titleStats}>
              <div>
                <dt>行脚</dt>
                <dd>Lv.{save.level}</dd>
              </div>
              <div>
                <dt>图鉴</dt>
                <dd>{codexCount(save)}/13 兽 · 收服 {save.stats.tamedCount} 次</dd>
              </div>
              <div>
                <dt>战斗</dt>
                <dd>{save.stats.battlesWon} 场</dd>
              </div>
              <div>
                <dt>这次行脚</dt>
                <dd>{formatPlaytime(save.stats.playtimeMs)}</dd>
              </div>
            </dl>
            <div className={styles.titleActions}>
              <button type="button" className={styles.primaryBtn} onClick={() => setView('map')}>
                回山海（巡山开放）
              </button>
              <button type="button" className={styles.ghostBtn} onClick={() => setView('codex')}>
                翻图志
              </button>
            </div>
          </div>
        )}

        {/* —— 结算浮层（世界场景之上） —— */}
        {view === 'world' && outcome && (
          <div className={styles.outcomeWrap}>
            <div className={styles.outcomeCard}>
              <p className={styles.outcomeTitle}>{outcome.kind === 'tamed' ? '问名 · 收服' : '了断'}</p>
              {outcome.lines.filter(Boolean).map((line, i) => (
                <p key={i} className={styles.outcomeSub}>{line}</p>
              ))}
              <div className={styles.outcomeRewards}>
                <span className={styles.rewardChip}>经验 +{outcome.exp}</span>
                {outcome.favorDelta !== 0 && (
                  <span className={styles.rewardChip}>山望 {outcome.favorDelta > 0 ? '+' : ''}{outcome.favorDelta}</span>
                )}
                {outcome.drops.slice(0, 4).map((d, i) => (
                  <span key={i} className={styles.rewardChip}>{getItem(d)?.name ?? d}</span>
                ))}
                {outcome.isBoss && <span className={styles.rewardChip}>金玉 +30</span>}
              </div>
              <div className={styles.titleActions}>
                <button type="button" className={styles.primaryBtn} onClick={closeOutcome}>
                  {outcome.isBoss && !patrol ? '行祭山之礼' : '继续行脚'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* —— 祭礼仪式（三献礼，非答题） —— */}
        {view === 'world' && riteOpen && (
          <div className={styles.riteWrap}>
            <div className={styles.riteCard}>
              <p className={styles.riteTitle}>祭 · 山</p>
              <p className={styles.riteLine}>{mountain.god.name}</p>
              <p className={styles.riteLine}>
                「毛用一璋玉瘗，糈用稌米，一璧稻米、白菅为席。」
                <br />
                你以璋玉瘗毛，以稌米为糈，三献而上香。鸟身龙首之神在云端敛翼受礼。
              </p>
              <p className={styles.riteLine}>{mountain.name}的瘴气散了。山安，民安。</p>
              <div className={styles.titleActions}>
                <button type="button" className={styles.primaryBtn} onClick={finishRite}>
                  {mountain.id === 'wuming' ? '卷终' : '礼成 · 展开卷轴'}
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className={styles.footNote}>
          <span>原文出《山海经·南山经》｜「狂化」「瘴化」为游戏化演绎｜进度只存本机</span>
          <button
            type="button"
            className={styles.wipeBtn}
            onClick={() => {
              if (window.confirm('清空《山海问兽》的全部进度？此操作不可撤销。')) {
                wipeSave();
                setSave(loadSave());
                setView('title');
              }
            }}
          >
            清空进度
          </button>
        </footer>
      </GameChrome>
    </main>
  );
}

/* ================= 十山卷轴地图 ================= */

function ScrollMap({
  save,
  onEnter,
  onPatrol,
  onCamp,
  onCodex,
  onTitle,
}: {
  save: WenshouSave;
  onEnter: (mid: MountainId) => void;
  onPatrol: () => void;
  onCamp: () => void;
  onCodex: () => void;
  onTitle: () => void;
}) {
  const patrolAvailable = !isDayDone(loadDaily(), todayKey(), 'shanhai-wenshou');
  return (
    <div className={styles.mapRoot}>
      <div className={styles.campHead}>
        <h2>十山卷轴</h2>
        <p className={styles.campMeta}>
          「凡䧿山之首，自招摇之山以至箕尾之山，凡十山，二千九百五十里。」
          走过的山染上山望之色，吞名的山一片留白。
        </p>
      </div>
      <div className={styles.mapScroll}>
        <div className={styles.mapTrack}>
          {MOUNTAINS.map((m, i) => {
            const prog = save.mountains[m.id];
            const unlocked = i <= save.mountainIndex;
            const cleared = prog?.cleared ?? false;
            const current = i === save.mountainIndex && !cleared;
            const favor = save.favor?.[m.id] ?? 0;
            const tier = favorTier(favor);
            return (
              <div
                key={m.id}
                role={unlocked ? 'button' : undefined}
                tabIndex={unlocked ? 0 : -1}
                className={`${styles.mapNode} ${unlocked ? styles.mapNodeOn : styles.mapNodeLocked} ${cleared ? styles.mapNodeDone : ''}`}
                onClick={unlocked ? () => onEnter(m.id) : undefined}
                onKeyDown={unlocked ? (e) => { if (e.key === 'Enter' || e.key === ' ') onEnter(m.id); } : undefined}
              >
                <span className={styles.mapOrder}>第{['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][i]}山</span>
                <span className={styles.mapName}>{m.name}</span>
                {cleared ? (
                  <span className={styles.mapSeal}>✦ 已祭 · 山望{tier === 'devoted' ? '亲善' : tier === 'warm' ? '温热' : tier === 'cold' ? '侧目' : '冷淡'}</span>
                ) : current ? (
                  <span className={styles.mapCurrent}>▶ 当前可入</span>
                ) : unlocked ? (
                  <span className={styles.mapSeal}>可入</span>
                ) : (
                  <span className={styles.mapOrder}>瘴雾未开</span>
                )}
                <span className={styles.mapOrder}>{getBeast(m.boss.beastId)?.name ?? ''}守祠</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.titleActions}>
        <button type="button" className={styles.primaryBtn} onClick={() => onEnter(MOUNTAINS[Math.min(save.mountainIndex, MOUNTAINS.length - 1)]!.id)}>
          入山 · {MOUNTAINS[Math.min(save.mountainIndex, MOUNTAINS.length - 1)]!.name}
        </button>
        {patrolAvailable && (
          <button type="button" className={styles.secondaryBtn} onClick={onPatrol}>
            巡山（今日瘴信）
          </button>
        )}
        <button type="button" className={styles.ghostBtn} onClick={onCamp}>藏馆（家）</button>
        <button type="button" className={styles.ghostBtn} onClick={onCodex}>图志 · 兽栏</button>
        <button type="button" className={styles.ghostBtn} onClick={onTitle}>卷首</button>
      </div>
    </div>
  );
}

const EDITION: Record<View, (m: { name: string }, rite: boolean) => string> = {
  title: () => '卷首',
  world: (m, rite) => (rite ? '祭山' : `山野 · ${m.name}`),
  map: () => '十山卷轴',
  camp: () => '藏馆 · 家',
  codex: () => '图志 · 兽栏',
  story: () => '行卷',
  end: () => '卷尾',
};

/** 隐藏 boss 出现条件：杻阳祭后见「谣音之主」；无名通卷（或二周目）后崖底见「初齿」。 */
function hiddenOf(mid: MountainId, save: WenshouSave): boolean {
  if (mid === 'niuyang') return Boolean(save.mountains[mid]?.cleared) && !save.hidden?.yaoyin;
  if (mid === 'wuming') return (Boolean(save.chapterDone) || (save.ngPlus ?? 0) > 0) && !save.hidden?.chuzhi;
  return false;
}

function formatPlaytime(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} 小时 ${m} 分` : `${m} 分钟`;
}
