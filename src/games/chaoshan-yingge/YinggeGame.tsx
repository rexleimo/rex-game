'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { YINGGE_CHAPTERS, YINGGE_CULTURE_ENTRIES } from './content/chapters';
import { ENEMY_PROFILES, getStageDefinition } from './content/stages';
import {
  ATTACK_CULTURE_LABELS,
  FORMATION_CULTURE_LABELS,
  getEnemyCultureGuide,
} from './core/culturalCombat';
import {
  createInitialCampaignProgress,
  parseCampaignProgress,
  recordChapterOutcome,
} from './core/progress';
import type {
  CampaignProgress,
  ChapterDefinition,
  ChapterOutcome,
  CultureEntry,
  EnemyKind,
  YinggeGameConfig,
} from './core/types';
import type { YinggeRuntimeHandle } from './runtime/createYinggeGame';
import styles from './YinggeGame.module.css';
import { FirstPlayGuide } from '@/components/game/FirstPlayGuide';
import { GameChrome } from '@/components/game/GameChrome';
import '@/styles/game-shell.css';

const SETTINGS_KEY = 'rex-game:yingge:settings:v1';
const PROGRESS_KEY = 'rex-game:yingge:campaign:v2';
const LEGACY_PROGRESS_KEY = 'rex-game:yingge:unlocked:v1';
const DEFAULT_CONFIG: YinggeGameConfig = { latencyOffsetMs: 0, reducedMotion: false, muted: false };
const GUIDE_ENEMY_KINDS: EnemyKind[] = ['ash-wisp', 'flanker', 'pouncer', 'swarm', 'tile-guard', 'miasma-chief'];

type View = 'menu' | 'guide' | 'chapters' | 'settings' | 'playing' | 'result' | 'archive';

function loadSettings(): YinggeGameConfig {
  try {
    const saved = window.localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

function evidenceLabel(entry: CultureEntry) {
  if (entry.evidence === 'recorded') return '资料记载';
  if (entry.evidence === 'oral-tradition') return '民间流传';
  return '游戏化演绎';
}

export function YinggeGame() {
  const [view, setView] = useState<View>('menu');
  const [selectedChapter, setSelectedChapter] = useState(YINGGE_CHAPTERS[0]);
  const [config, setConfig] = useState<YinggeGameConfig>(DEFAULT_CONFIG);
  const [progress, setProgress] = useState<CampaignProgress>(createInitialCampaignProgress);
  const [result, setResult] = useState<ChapterOutcome | null>(null);
  const [loading, setLoading] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');
  const canvasHost = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<YinggeRuntimeHandle | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setConfig(loadSettings());
    const saved = window.localStorage.getItem(PROGRESS_KEY);
    const legacyUnlocked = Number(window.localStorage.getItem(LEGACY_PROGRESS_KEY));
    const nextProgress = saved
      ? parseCampaignProgress(saved)
      : Number.isFinite(legacyUnlocked) && legacyUnlocked > 0
        ? { unlocked: Math.min(legacyUnlocked, YINGGE_CHAPTERS.length), bestSpirit: {} }
        : createInitialCampaignProgress();
    setProgress(nextProgress);
    setSelectedChapter(YINGGE_CHAPTERS[nextProgress.unlocked - 1]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(config));
  }, [config]);

  const stopRuntime = useCallback(() => {
    runtimeRef.current?.destroy();
    runtimeRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;
  }, []);

  useEffect(() => {
    if (view !== 'playing' || !canvasHost.current) return;
    let cancelled = false;
    setLoading(true);
    setRuntimeError('');

    import('./runtime/createYinggeGame')
      .then(({ createYinggeGame }) => {
        if (cancelled || !canvasHost.current) return;
        runtimeRef.current = createYinggeGame(canvasHost.current, {
          chapter: selectedChapter,
          config,
          audioContext: audioContextRef.current,
          onReady: () => setLoading(false),
          onFinish: (outcome) => {
            setResult(outcome);
            setProgress((current) => {
              const nextProgress = recordChapterOutcome(
                current,
                selectedChapter.id,
                outcome.victory,
                outcome.result.spirit,
              );
              window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
              return nextProgress;
            });
            stopRuntime();
            setView('result');
          },
        });
      })
      .catch((error: unknown) => {
        setLoading(false);
        setRuntimeError(error instanceof Error ? error.message : '游戏引擎加载失败');
      });

    return () => {
      cancelled = true;
      runtimeRef.current?.destroy();
      runtimeRef.current = null;
    };
  }, [config, selectedChapter, stopRuntime, view]);

  useEffect(() => () => stopRuntime(), [stopRuntime]);

  const unlockedCulture = useMemo(() => {
    const ids = new Set(
      YINGGE_CHAPTERS.slice(0, progress.unlocked).flatMap((chapter) => chapter.cultureEntryIds),
    );
    return YINGGE_CULTURE_ENTRIES.filter((entry) => ids.has(entry.id));
  }, [progress.unlocked]);

  const beginPerformance = async (chapter = selectedChapter) => {
    stopRuntime();
    setSelectedChapter(chapter);
    setResult(null);
    setRuntimeError('');
    const AudioContextConstructor = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextConstructor) {
      const context = new AudioContextConstructor();
      audioContextRef.current = context;
      await context.resume();
    }
    setView('playing');
  };

  const leavePerformance = () => {
    stopRuntime();
    setView('chapters');
  };

  const selectChapter = (chapter: ChapterDefinition) => {
    if (chapter.order > progress.unlocked) return;
    setSelectedChapter(chapter);
  };

  const playNextChapter = () => {
    const nextChapter = YINGGE_CHAPTERS[selectedChapter.order];
    if (nextChapter && nextChapter.order <= progress.unlocked) void beginPerformance(nextChapter);
  };

  return (
    <section className={styles.root} aria-label="潮汕英歌横版动作游戏">
      <FirstPlayGuide
        storageKey="rex-game:yingge:first-play-guide:v1"
        title="先听鼓点，再合槌成阵"
        description="第一场演出从最基础的节奏和阵形开始，按提示出槌即可逐步熟悉战舞。"
        steps={[
          '点击“主线演出”进入已开放的第一章。',
          '跟随场内提示用 J、K、L 出槌；A、D 可以调整站位。',
          '按 Shift 换阵，Space 合槌；踩准鼓点会获得更高气势。',
        ]}
      />
      <div className="yg-grain" aria-hidden />

      {view === 'menu' && (
        <GameChrome title="潮汕英歌" edition={`已开放 ${progress.unlocked} / ${YINGGE_CHAPTERS.length}`}>
        <div className="yg-start">
          <div className="yg-start-stage">
            <section className="yg-start-copy">
              <p className="yg-eyebrow">巡游开路 / 合槌成阵</p>
              <h1><span>英歌</span><br />合槌成阵</h1>
              <p className="yg-start-intro">带领英歌队沿乡里巡游，以槌法击散游戏化的瘴气阻障，在自由格斗中踩准锣鼓、切换队形，完成一场有气势的战舞会演。</p>

              <nav className="yg-start-menu" aria-label="开始菜单">
                <button className="is-primary gs-btn--primary" type="button" onClick={() => void beginPerformance()}>
                  <span>01</span><strong>主线演出</strong><small>继续：{selectedChapter.title}</small>
                </button>
                <button type="button" onClick={() => setView('chapters')}>
                  <span>02</span><strong>章节选择</strong><small>查看五段巡游战线</small>
                </button>
                <button type="button" onClick={() => setView('guide')}>
                  <span>03</span><strong>巡游手册</strong><small>看图认识阻障、槌法与阵形</small>
                </button>
                <button type="button" onClick={() => setView('archive')}>
                  <span>04</span><strong>文化档案</strong><small>已收入 {unlockedCulture.length} 项</small>
                </button>
                <button type="button" onClick={() => setView('settings')}>
                  <span>05</span><strong>游戏设置</strong><small>音画校准与动效</small>
                </button>
              </nav>
              {runtimeError && <p className="yg-error" role="alert">{runtimeError}</p>}
            </section>

            <div className="yg-poster yg-start-poster" aria-hidden>
              <div className="yg-sun" />
              <div className="yg-figure yg-figure--one"><i /><b /><em /></div>
              <div className="yg-figure yg-figure--two"><i /><b /><em /></div>
              <div className="yg-figure yg-figure--three"><i /><b /><em /></div>
              <p>槌起<br />成阵</p>
            </div>
          </div>

          <footer className="yg-start-footer">
            <span>A/D 移动 · J/K/L 槌法 · U 防御 · Shift 换阵 · Space 合击</span>
            <span>支持触屏操作</span>
            <span>进度保存于本地</span>
          </footer>
        </div>
        </GameChrome>
      )}

      {view === 'guide' && (
        <GameChrome title="潮汕英歌" edition="巡游手册">
        <div className="yg-guide">
          <header className="yg-guide-head">
            <div>
              <p className="yg-eyebrow">HOW TO PLAY / 破障不是乱打</p>
              <h1><span>巡游</span>手册</h1>
              <p>先辨认阻障，再选择槌法和阵形；最后听准鼓心出槌。三项配合正确，才会获得最高伤害、士气与合队成绩。</p>
            </div>
            <div className="yg-guide-head-actions">
              <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('menu')}>返回菜单</button>
              <button className="gs-btn gs-btn--primary" type="button" onClick={() => void beginPerformance()}>看完 · 击鼓开演</button>
            </div>
          </header>

          <section className="yg-guide-rule" aria-label="基本判定规则">
            <div><b>01</b><strong>看阻障</strong><span>认清对方的移动方式和破障提示</span></div>
            <div><b>02</b><strong>合槌阵</strong><span>槌法与阵形各自正确才算队伍配合</span></div>
            <div><b>03</b><strong>听鼓心</strong><span>踩中重拍完成三项配合，获得最高奖励</span></div>
          </section>

          <div className="yg-guide-list">
            {GUIDE_ENEMY_KINDS.map((kind, index) => {
              const profile = ENEMY_PROFILES[kind];
              const guide = getEnemyCultureGuide(kind);
              return (
                <article className="yg-guide-card" key={kind}>
                  <div className="yg-guide-art">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <img
                      src={`/assets/yingge/game/enemies/${kind}/idle.webp`}
                      alt={`${profile.label}游戏形象`}
                    />
                  </div>
                  <div className="yg-guide-card-copy">
                    <p>抽象巡游阻障</p>
                    <h2>{profile.label}</h2>
                    <div className="yg-guide-response">
                      <div>
                        <small>推荐槌法</small>
                        <strong>{ATTACK_CULTURE_LABELS[guide.preferredAttack]}</strong>
                      </div>
                      <div>
                        <small>推荐阵形</small>
                        <strong>{FORMATION_CULTURE_LABELS[guide.preferredFormation]}</strong>
                        <span className={`yg-formation-mark is-${guide.preferredFormation}`} aria-hidden>
                          <i /><i /><i /><i />
                        </span>
                      </div>
                    </div>
                    <blockquote>{guide.lesson}</blockquote>
                  </div>
                </article>
              );
            })}
          </div>

          <footer className="yg-guide-foot">
            <p><strong>文化说明：</strong>这里的槌法名称属于游戏交互化表达，不代表潮汕各地英歌队统一使用同一套动作称谓。</p>
            <button className="gs-btn gs-btn--primary" type="button" onClick={() => void beginPerformance()}>我已看懂 · 开始巡游</button>
          </footer>
        </div>
        </GameChrome>
      )}

      {view === 'chapters' && (
        <GameChrome title="潮汕英歌" edition="章节选择">
        <div className="yg-shell">
          <header className="yg-masthead">
            <div>
              <p className="yg-eyebrow">REX GAME / 非遗互动展品 02</p>
              <h1><span>合槌</span>成阵</h1>
              <p className="yg-title-en">CHAOSHAN YINGGE · RHYTHM OF THE PROCESSION</p>
            </div>
            <div className="yg-seal" aria-label="潮汕英歌">英<br />歌</div>
          </header>

          <div className="yg-lead-grid">
            <div className="yg-manifesto">
              <p className="yg-dropcap">战舞开路，合槌成阵。</p>
              <p>敌对形象只代表游戏化的瘴气与巡游阻障，不把真实神祇塑造成普通敌人。你可以自由出槌；踩中锣鼓重拍会获得残影、伤害与士气奖励。</p>
              <div className="yg-actions">
                <button className="gs-btn gs-btn--primary" type="button" onClick={() => void beginPerformance()}>击鼓开演</button>
                <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('guide')}>巡游手册</button>
                <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('archive')}>文化档案</button>
                <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('menu')}>返回开始菜单</button>
              </div>
              {runtimeError && <p className="yg-error" role="alert">{runtimeError}</p>}
            </div>

            <div className="yg-poster" aria-hidden>
              <div className="yg-sun" />
              <div className="yg-figure yg-figure--one"><i /><b /><em /></div>
              <div className="yg-figure yg-figure--two"><i /><b /><em /></div>
              <div className="yg-figure yg-figure--three"><i /><b /><em /></div>
              <p>一人听拍<br />众人成阵</p>
            </div>
          </div>

          <div className="yg-chapter-layout">
            <nav className="yg-chapters" aria-label="章节选择">
              <p className="yg-section-label">巡游战线 / COMBAT ROUTE</p>
              {YINGGE_CHAPTERS.map((chapter) => {
                const locked = chapter.order > progress.unlocked;
                const active = chapter.id === selectedChapter.id;
                return (
                  <button
                    className={`yg-chapter ${active ? 'is-active' : ''}`}
                    type="button"
                    key={chapter.id}
                    disabled={locked}
                    onClick={() => selectChapter(chapter)}
                  >
                    <span>{String(chapter.order).padStart(2, '0')}</span>
                    <strong>{chapter.title}</strong>
                    <small>{locked ? '完成前章后解锁' : progress.bestSpirit[chapter.id] ? `${chapter.tempoLabel} · 最佳 ${progress.bestSpirit[chapter.id]}` : chapter.tempoLabel}</small>
                  </button>
                );
              })}
            </nav>

            <article className="yg-chapter-note">
              <p>{selectedChapter.region}</p>
              <h2>{selectedChapter.title}</h2>
              <blockquote>{selectedChapter.subtitle}</blockquote>
              <dl>
                <div><dt>节奏</dt><dd>{selectedChapter.tempoLabel}</dd></div>
                <div><dt>本章认识</dt><dd>{selectedChapter.culturalFocus}</dd></div>
                <div><dt>巡游目标</dt><dd>{getStageDefinition(selectedChapter.id).objective}</dd></div>
                <div><dt>文化任务</dt><dd>{getStageDefinition(selectedChapter.id).culturalMission}</dd></div>
                <div><dt>操作</dt><dd>J 点槌开路，K 展槌合围，L 震槌定势，U 守势回槌，Shift 换阵，Space 众槌同声</dd></div>
              </dl>
            </article>
          </div>


        </div>
        </GameChrome>
      )}

      {view === 'settings' && (
        <GameChrome title="潮汕英歌" edition="游戏设置">
        <div className="yg-shell">
          <header className="yg-masthead">
            <div>
              <p className="yg-eyebrow">PLAY SETTINGS / 演出准备</p>
              <h1><span>音画</span>设置</h1>
              <p className="yg-title-en">CALIBRATION ? ACCESSIBILITY ? AUDIO</p>
            </div>
            <div className="yg-seal" aria-hidden>校<br />准</div>
          </header>

          <section className="yg-calibration" aria-labelledby="calibration-title">
            <div>
              <p className="yg-section-label">PLAY SETTINGS</p>
              <h2 id="calibration-title">音画校准</h2>
              <p>若画面总比鼓声早或晚，移动补偿值。蓝牙耳机通常需要更大的正向补偿。</p>
            </div>
            <label className="yg-range">
              <span>延迟补偿 <b>{config.latencyOffsetMs > 0 ? '+' : ''}{config.latencyOffsetMs} ms</b></span>
              <input
                type="range" min="-120" max="240" step="5"
                value={config.latencyOffsetMs}
                onChange={(event) => setConfig((current) => ({ ...current, latencyOffsetMs: Number(event.target.value) }))}
              />
            </label>
            <div className="yg-toggles">
              <label><input type="checkbox" checked={config.reducedMotion} onChange={(event) => setConfig((current) => ({ ...current, reducedMotion: event.target.checked }))} /> 减少动态效果</label>
              <label><input type="checkbox" checked={config.muted} onChange={(event) => setConfig((current) => ({ ...current, muted: event.target.checked }))} /> 静音演出</label>
            </div>
          </section>
          <div className="yg-actions">
            <button className="gs-btn gs-btn--primary" type="button" onClick={() => setView('menu')}>返回开始菜单</button>
            <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('chapters')}>进入章节选择</button>
          </div>
        </div>
        </GameChrome>
      )}

      {view === 'playing' && (
        <div className="yg-performance">
          <div className="yg-performance-bar">
            <button className="gs-btn gs-btn--ghost" type="button" onClick={leavePerformance}>退出巡游</button>
            <p>{selectedChapter.title} <span>{selectedChapter.tempoLabel}</span></p>
            <div className="yg-performance-tools">
              <span>不是乱打：看破障提示 · 选槌法 · 合阵形 · 踩鼓心</span>
              <button className="gs-btn gs-btn--ghost" type="button" onClick={() => runtimeRef.current?.togglePause()}>暂停</button>
            </div>
          </div>
          <div className="yg-canvas" ref={canvasHost} />
          <div className="yg-landscape-hint">请将手机横过来继续英歌巡游</div>
          {loading && <div className="yg-loading">正在立鼓 · 整队 · 铺开巡游战线</div>}
          {runtimeError && (
            <div className="yg-runtime-error" role="alert">
              <p>{runtimeError}</p>
              <button className="gs-btn gs-btn--ghost" type="button" onClick={leavePerformance}>返回章节</button>
            </div>
          )}
        </div>
      )}

      {view === 'result' && result && (
        <GameChrome title="潮汕英歌" edition="演出结果">
        <div className="yg-result">
          <div className="yg-result-mark">
            <span>{result.victory ? '本场评定' : '巡游未竟'}</span>
            <strong>{result.victory ? result.result.grade : '再'}</strong>
            <small>{result.victory ? '等' : '战'}</small>
          </div>
          <div className="yg-result-copy">
            <p className="yg-eyebrow">第 {selectedChapter.order} 章{result.victory ? '完成' : '中止'} / {selectedChapter.title}</p>
            <h2>{!result.victory ? '阵脚可重整，鼓声不会停。' : result.result.spirit >= 90 ? '槌落同声，整队如一。' : result.result.spirit >= 75 ? '鼓点已稳，再把队伍收紧。' : '先听清鼓心，再落下一槌。'}</h2>
            <div className="yg-score-grid">
              <div><span>准点</span><b>{result.result.accuracy}</b></div>
              <div><span>连贯</span><b>{result.result.continuity}</b></div>
              <div><span>合队</span><b>{result.result.formation}</b></div>
              <div><span>功绩</span><b>{result.score}</b></div>
              <div><span>气势</span><b>{result.result.spirit}</b></div>
            </div>
            <p className="yg-unlock">{result.victory ? `本章文化档案已收入：${selectedChapter.culturalFocus}` : `剩余体力 ${result.remainingHp} · 失败不会解锁后续章节`}</p>
            <div className="yg-actions">
              <button className="gs-btn gs-btn--primary" type="button" onClick={() => void beginPerformance()}>重新挑战</button>
              {result.victory && selectedChapter.order < YINGGE_CHAPTERS.length && (
                <button className="gs-btn gs-btn--ghost" type="button" onClick={playNextChapter}>下一章</button>
              )}
              <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('chapters')}>返回章节</button>
              {result.victory && <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView('archive')}>查看新档案</button>}
            </div>
          </div>
        </div>
        </GameChrome>
      )}

      {view === 'archive' && (
        <GameChrome title="潮汕英歌" edition="文化档案">
        <div className="yg-archive">
          <header>
            <div>
              <p className="yg-eyebrow">FIELD NOTES / 已解锁 {unlockedCulture.length} 项</p>
              <h2>文化档案</h2>
              <p>资料记载、民间流传与游戏化演绎分开标识。英歌各地有别，不用一个版本覆盖全部地方传统。</p>
            </div>
            <button className="gs-btn gs-btn--ghost" type="button" onClick={() => setView(result ? 'result' : 'menu')}>返回</button>
          </header>
          <div className="yg-archive-grid">
            {unlockedCulture.map((entry, index) => (
              <article key={entry.id}>
                <div className="yg-entry-number">{String(index + 1).padStart(2, '0')}</div>
                <p className="yg-entry-meta"><span>{entry.region}</span><b>{evidenceLabel(entry)}</b></p>
                <h3>{entry.title}</h3>
                <p className="yg-entry-summary">{entry.summary}</p>
                <p>{entry.detail}</p>
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer">资料入口：{entry.sourceLabel} ↗</a>
              </article>
            ))}
          </div>
        </div>
        </GameChrome>
      )}
    </section>
  );
}
