'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import type { BeastId, MountainId } from '../core/types.ts';
import type { DerivedStats } from '../core/progression.ts';
import type { Difficulty } from './frameData.ts';
import { VIEW_H, VIEW_W } from './frameData.ts';
import type { BattleOutcome } from './rules.ts';
import { buildLevel } from './levels.ts';
import { bus, resetTouch, sceneCmd, type BossHud, type HudState } from './bus.ts';
import { setAudioMuted } from './audio.ts';
import type { WorldScene, WorldConfig } from './WorldScene.ts';
import styles from '../ShanhaiWenshouGame.module.css';

/**
 * 动作世界 React 壳：挂 Phaser（客户端动态 import）、HUD 覆盖层、
 * 触屏控制、对话/结算桥。数值与逻辑都在 core/action 纯函数层。
 */

export interface OutcomePayload extends BattleOutcome {
  title: string;
  isBoss: boolean;
}

export interface ActionGameProps {
  mountain: MountainId;
  mountainName: string;
  stats: DerivedStats;
  hp: number;
  qi: number;
  party: BeastId[];
  partyNames: string[];
  hasHerb: boolean;
  difficulty: Difficulty;
  collected: string[];
  muted: boolean;
  patrol?: { beastId: BeastId; level: number; title: string };
  freshBoss: boolean;
  freshElite: boolean;
  bossIntro?: { name: string; lines: string[] };
  /** 二周目强化：兽等级加成。 */
  ngBoost?: number;
  /** 隐藏 boss（通关后重访出现）。 */
  hiddenBeast?: boolean;
  /** 行囊物品 id（知识门）。 */
  inventory: string[];
  /** 累计收服（名缚门）。 */
  tamedTotal: number;
  onGained: (g: { kind: string; itemId?: string; amount: number }) => void;
  onOutcome: (o: OutcomePayload) => void;
  onRite: () => void;
  onExit: (hp: number, qi: number) => void;
  onToggleMute: () => void;
}

const EMPTY_HUD: HudState = {
  hp: 1, maxHp: 1, qi: 0, maxQi: 1,
  layers: 0, axes: { shape: false, sound: false, nature: false },
  nameReady: false, poison: false, inverted: false, shield: 0, itemCd: 0, beastCds: [],
};

const SEAL_NAMES = { shape: '形', sound: '声', nature: '性' } as const;

export function ActionGame(props: ActionGameProps) {
  const {
    mountain, mountainName, stats, hp, qi, party, partyNames, hasHerb,
    difficulty, collected, muted, patrol, freshBoss, freshElite, bossIntro, ngBoost, hiddenBeast, inventory, tamedTotal,
    onGained, onOutcome, onRite, onExit, onToggleMute,
  } = props;

  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const hudRef = useRef<HudState>(EMPTY_HUD);
  const hpRef = useRef(hp);
  const qiRef = useRef(qi);
  const [hud, setHud] = useState<HudState>(EMPTY_HUD);
  const [boss, setBoss] = useState<BossHud>(null);
  const [toast, setToast] = useState<{ text: string; at: number } | null>(null);
  const [dialog, setDialog] = useState<{ name: string; lines: string[] } | null>(null);
  const [paused, setPaused] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  const [, setTick] = useState(0);
  const outcomeRef = useRef(onOutcome);
  const riteRef = useRef(onRite);
  outcomeRef.current = onOutcome;
  riteRef.current = onRite;

  hpRef.current = hp;
  qiRef.current = qi;

  useEffect(() => setAudioMuted(muted), [muted]);

  // 1s 心跳：让 toast 到期消失（暂停/对话期间没有 hud 事件也要刷新）
  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  // —— 触屏检测 ——
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    setTouchMode(coarse);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    sceneCmd.dialogOpen = false;
  }, []);

  // —— 挂 Phaser ——
  useEffect(() => {
    let disposed = false;
    resetTouch();
    sceneCmd.dialogOpen = false;
    const offs = [
      bus.on('hud', (h) => {
        hudRef.current = h;
        hpRef.current = h.hp;
        qiRef.current = h.qi;
        setHud(h);
      }),
      bus.on('boss', (b) => setBoss(b)),
      bus.on('toast', (text) => setToast({ text, at: Date.now() })),
      bus.on('dialog', (d) => {
        if (d) setDialog(d);
      }),
      bus.on('outcome', (o) => {
        if (!o) return;
        sceneCmd.paused = true;
        outcomeRef.current(o);
      }),
      bus.on('rite', () => {
        sceneCmd.paused = true;
        riteRef.current();
      }),
      bus.on('died', () => setToast({ text: '眼前一黑……祠座的香火把你引了回去。', at: Date.now() })),
      bus.on('adviseCamp', () => setToast({ text: '连败三次——先回藏馆接委托、炼佩饰，再战不迟。', at: Date.now() })),
    ];

    void (async () => {
      const PhaserMod = await import('phaser');
      const { WorldScene: WorldSceneCls } = await import('./WorldScene.ts');
      const { resolveAssetBase } = await import('./assets.ts');
      if (disposed || !hostRef.current) return;
      const assetBase = await resolveAssetBase();
      const cfg: WorldConfig = {
        mountain, stats, hp, qi, party, hasHerb, difficulty, collected,
        patrol, freshBoss, freshElite, bossIntro, ngBoost, hiddenBeast, inventory, tamedTotal,
        assetBase,
      };
      const game = new PhaserMod.Game({
        type: PhaserMod.AUTO,
        parent: hostRef.current,
        width: VIEW_W,
        height: VIEW_H,
        backgroundColor: '#17100b',
        scale: { mode: PhaserMod.Scale.FIT, autoCenter: PhaserMod.Scale.CENTER_BOTH },
        physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 1500 }, debug: false } },
      });
      game.scene.add('world', WorldSceneCls as unknown as new () => Phaser.Scene, true, { cfg });
      gameRef.current = game;
    })();

    return () => {
      disposed = true;
      for (const off of offs) off();
      gameRef.current?.destroy(true);
      gameRef.current = null;
      resetTouch();
    };
    // 场景按挂载键重建，不随轻量 props 变化重启
  }, [mountain]); // eslint-disable-line react-hooks/exhaustive-deps

  const resume = useCallback(() => {
    setPaused(false);
    sceneCmd.paused = false;
  }, []);

  const exit = useCallback(() => {
    onExit(hpRef.current, qiRef.current);
  }, [onExit]);

  const hpPct = Math.max(0, Math.min(100, (hud.hp / Math.max(1, hud.maxHp)) * 100));
  const qiPct = Math.max(0, Math.min(100, (hud.qi / Math.max(1, hud.maxQi)) * 100));
  const bossPct = boss ? Math.max(0, (boss.hp / Math.max(1, boss.maxHp)) * 100) : 0;
  const stancePct = boss && boss.stanceMax > 0 ? (boss.stance / boss.stanceMax) * 100 : 0;
  const toastFresh = toast && Date.now() - toast.at < 4200;

  return (
    <div className={styles.actionRoot}>
      <div className={styles.actionStageBox}>
        <div ref={hostRef} className={styles.actionHost} />

        {/* —— HUD 左上：杖穗血条 / 气 / 识破印章 —— */}
        <div className={styles.hudPanel}>
          <div className={styles.hudRow}>
            <span className={styles.hudMountain}>{mountainName}</span>
            <button type="button" className={styles.hudIconBtn} onClick={() => setAudioMuted(!muted)} aria-label="声音">
              {muted ? '🔇' : '🔊'}
            </button>
            <button type="button" className={styles.hudIconBtn} onClick={() => { setPaused(true); sceneCmd.paused = true; }} aria-label="暂停">
              ⏸
            </button>
          </div>
          <div className={styles.hpTrack} aria-label="体力">
            <div className={styles.hpFill} style={{ width: `${hpPct}%` }} />
            {hud.shield > 0 && <div className={styles.shieldChip}>盾 {hud.shield}</div>}
          </div>
          <div className={styles.qiTrack} aria-label="气">
            <div className={styles.qiFill} style={{ width: `${qiPct}%` }} />
          </div>
          <div className={styles.sealRow}>
            {(['shape', 'sound', 'nature'] as const).map((axis) => (
              <span key={axis} className={`${styles.seal} ${hud.axes[axis] ? styles.sealOn : ''}`} title={SEAL_NAMES[axis]}>
                {SEAL_NAMES[axis]}
              </span>
            ))}
            {hud.poison && <span className={styles.badIcon}>瘴</span>}
            {hud.inverted && <span className={styles.badIcon}>惑</span>}
          </div>
        </div>

        {/* —— boss/精英 条 —— */}
        {boss && (
          <div className={`${styles.bossBarBox} ${boss.isBoss ? styles.bossBarBig : ''}`}>
            <div className={styles.bossBarTitle}>
              {boss.title ?? boss.name}
              {boss.phase === 2 ? ' · 狂' : ''}
            </div>
            <div className={styles.bossTrack}>
              <div className={styles.bossFill} style={{ width: `${bossPct}%` }} />
            </div>
            {boss.stanceMax > 0 && (
              <div className={styles.stanceTrack}>
                <div className={styles.stanceFill} style={{ width: `${stancePct}%` }} />
              </div>
            )}
          </div>
        )}

        {/* —— toast —— */}
        {toast && toastFresh && (
          <div key={toast.at} className={styles.toastBox}>{toast.text}</div>
        )}

        {/* —— 问名 大按钮 —— */}
        {hud.nameReady && (
          <button
            type="button"
            className={styles.askNameBtn}
            onPointerDown={(e) => { e.preventDefault(); sceneCmd.touch.ask = true; window.setTimeout(() => { sceneCmd.touch.ask = false; }, 80); }}
          >
            问名 · Q
          </button>
        )}

        {/* —— 右下：兽伴 / 药 —— */}
        <div className={styles.sideButtons}>
          {party.map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.sideBtn}
              disabled={(hud.beastCds[i] ?? 0) > 0}
              onPointerDown={(e) => { e.preventDefault(); sceneCmd.touch[`beast${(i + 1) as 1 | 2 | 3}`] = true; window.setTimeout(() => { sceneCmd.touch[`beast${(i + 1) as 1 | 2 | 3}`] = false; }, 80); }}
            >
              兽{i + 1}{(hud.beastCds[i] ?? 0) > 0 ? ` ${hud.beastCds[i]!.toFixed(0)}s` : ''}
            </button>
          ))}
          {party.length > 0 && partyNames.length > 0 && (
            <span className={styles.partyHint}>{partyNames.join(' · ')}</span>
          )}
          <button
            type="button"
            className={styles.sideBtn}
            disabled={!hasHerb || hud.itemCd > 0}
            onPointerDown={(e) => { e.preventDefault(); sceneCmd.touch.item = true; window.setTimeout(() => { sceneCmd.touch.item = false; }, 80); }}
          >
            {hasHerb ? (hud.itemCd > 0 ? `药 ${hud.itemCd.toFixed(0)}s` : '药 · H') : '无药'}
          </button>
        </div>

        {/* —— 触屏控制 —— */}
        {touchMode && <TouchControls />}

        {/* —— 对话 —— */}
        {dialog && (
          <div className={styles.dialogWrap} onClick={closeDialog}>
            <div className={styles.dialogCard} role="dialog" aria-label={dialog.name}>
              <p className={styles.dialogName}>{dialog.name}</p>
              {dialog.lines.map((line, i) => (
                <p key={i} className={styles.dialogLine}>{line}</p>
              ))}
              <button type="button" className={styles.dialogBtn} onClick={closeDialog}>继续</button>
            </div>
          </div>
        )}

        {/* —— 暂停菜单 —— */}
        {paused && (
          <div className={styles.dialogWrap}>
            <div className={styles.dialogCard}>
              <p className={styles.dialogName}>暂歇</p>
              <p className={styles.dialogLine}>键位：A/D 移动 · W/Space 跳 · J 轻 · K 蓄力重 · L 翻滚 · I 弹反 · Q 问名 · H 药 · 1/2/3 兽伴</p>
              <div className={styles.dialogActions}>
                <button type="button" className={styles.dialogBtn} onClick={resume}>继续</button>
                <button type="button" className={styles.dialogBtnGhost} onClick={() => { resume(); exit(); }}>回卷轴（保存行脚）</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 桌面键位条 */}
      {!touchMode && (
        <p className={styles.keyHint}>
          A/D 移动 · W/Space 跳 · J 轻攻三连 · K 蓄力重击 · L 翻滚 · I 识破格挡 · Q 问名/行礼 · H 用药 · 1/2/3 兽伴技 · Esc 暂停
        </p>
      )}
    </div>
  );
}

/* ================= 触屏控制 ================= */

function TouchControls() {
  const padRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const setTouch = (patch: Partial<typeof sceneCmd.touch>) => {
    Object.assign(sceneCmd.touch, patch);
  };

  const onPadMove = (e: React.PointerEvent) => {
    const pad = padRef.current;
    if (!pad) return;
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const max = rect.width / 2;
    const cl = Math.min(1, Math.hypot(dx, dy) / max);
    const ang = Math.atan2(dy, dx);
    const kx = Math.cos(ang) * cl * max * 0.7;
    const ky = Math.sin(ang) * cl * max * 0.7;
    setKnob({ x: kx, y: ky });
    setTouch({
      left: dx < -max * 0.25,
      right: dx > max * 0.25,
      up: dy < -max * 0.4 || (dy < -max * 0.25 && cl > 0.5),
      down: dy > max * 0.5,
      jump: dy < -max * 0.6,
    });
  };

  const onPadEnd = () => {
    setKnob({ x: 0, y: 0 });
    setTouch({ left: false, right: false, up: false, down: false, jump: false });
  };

  const hold = (key: 'light' | 'heavy' | 'roll' | 'parry') => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture(e.pointerId); setTouch({ [key]: true } as Partial<typeof sceneCmd.touch>); },
    onPointerUp: () => setTouch({ [key]: false } as Partial<typeof sceneCmd.touch>),
    onPointerCancel: () => setTouch({ [key]: false } as Partial<typeof sceneCmd.touch>),
    onPointerLeave: () => setTouch({ [key]: false } as Partial<typeof sceneCmd.touch>),
  });

  return (
    <>
      <div
        ref={padRef}
        className={styles.touchPad}
        onPointerMove={(e) => { if (e.buttons > 0 || e.pointerType === 'touch') onPadMove(e); }}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); onPadMove(e); }}
        onPointerUp={onPadEnd}
        onPointerCancel={onPadEnd}
      >
        <div className={styles.touchKnob} style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <div className={styles.touchButtons}>
        <button type="button" className={`${styles.touchBtn} ${styles.touchBtnJump}`} {...hold('light')}>攻</button>
        <button type="button" className={styles.touchBtn} {...hold('heavy')}>重</button>
        <button type="button" className={styles.touchBtn} {...hold('roll')}>滚</button>
        <button type="button" className={`${styles.touchBtn} ${styles.touchBtnParry}`} {...hold('parry')}>挡</button>
        <button type="button" className={styles.touchBtn} onPointerDown={(e) => { e.preventDefault(); setTouch({ jump: true }); window.setTimeout(() => setTouch({ jump: false }), 100); }}>跳</button>
      </div>
    </>
  );
}

export function levelWidthOf(mountain: MountainId): number {
  return buildLevel(mountain).width;
}

export type { WorldScene };
