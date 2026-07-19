'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MOTIFS, getMotif } from './content/motifs';
import { JIANZHI_CHAPTERS, JIANZHI_CULTURE_ENTRIES } from './content/chapters';
import { JIANZHI_COMBOS, getCombo } from './content/combos';
import { createPaperCanvas } from './runtime/paperCanvas';
import { createPaperAudio } from './runtime/audio';
import { evaluateChapter } from './core/evaluate';
import { detectCombos } from './core/rebus';
import {
  addWork,
  collectMotifs,
  createInitialJianzhiProgress,
  createWork,
  discoverCombos,
  parseJianzhiProgress,
  recordChapterCompletion,
  removeWork,
} from './core/progress';
import type {
  EvidenceKind,
  FoldMode,
  JianzhiChapter,
  JianzhiProgress,
  JianzhiSettings,
  MotifDef,
  SavedWork,
} from './core/types';
import styles from './JianzhiGame.module.css';

const PROGRESS_KEY = 'rex-game:jianzhi:progress:v1';
const WORKS_KEY = 'rex-game:jianzhi:works:v1';
const SETTINGS_KEY = 'rex-game:jianzhi:settings:v1';

const FOLD_OPTIONS: Array<{ id: FoldMode; label: string; hint: string }> = [
  { id: 'single', label: '单面', hint: '不折叠，自由剪' },
  { id: 'book', label: '对折', hint: '左右镜像，剪「福」最宜' },
  { id: 'four', label: '四折', hint: '四向对称，窗花首选' },
  { id: 'rosette', label: '团花', hint: '旋转放射，丝路团花' },
];

const TOTAL_CHAPTERS = JIANZHI_CHAPTERS.length;

type View = 'menu' | 'workshop' | 'story' | 'codex' | 'settings';
type ToolMode = 'motif' | 'cut';
type CodexTab = 'motif' | 'combo' | 'archive' | 'works';

interface PendingCompletion {
  chapter: JianzhiChapter;
  newMotifs: string[];
  comboIds: string[];
}
interface QuizState {
  chapter: JianzhiChapter;
  selected: number | null;
}
interface ResultState {
  chapter: JianzhiChapter;
  newMotifs: string[];
  comboIds: string[];
}

function evidenceLabel(e: EvidenceKind): string {
  if (e === 'recorded') return '资料记载';
  if (e === 'oral-tradition') return '民间流传';
  return '游戏化演绎';
}

const createInitialProgress = createInitialJianzhiProgress;

function loadProgress(): JianzhiProgress {
  try {
    return parseJianzhiProgress(window.localStorage.getItem(PROGRESS_KEY));
  } catch {
    return createInitialProgress();
  }
}

function persistProgress(p: JianzhiProgress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function loadWorks(): SavedWork[] {
  try {
    const raw = window.localStorage.getItem(WORKS_KEY);
    if (raw) return JSON.parse(raw) as SavedWork[];
  } catch {
    /* ignore */
  }
  return [];
}

function persistWorks(works: SavedWork[]) {
  try {
    window.localStorage.setItem(WORKS_KEY, JSON.stringify(works));
  } catch {
    /* ignore */
  }
}

function loadSettings(): JianzhiSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) return { reducedMotion: false, muted: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { reducedMotion: false, muted: false };
}

/** 版画海报里的对称剪影（纯装饰）。 */
function PaperCut() {
  return (
    <svg className={styles.posterCut} viewBox="0 0 200 200" aria-hidden fill="currentColor">
      <g opacity="0.92">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse
            key={i}
            cx="100"
            cy="58"
            rx="15"
            ry="40"
            transform={`rotate(${i * 60} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="18" />
        <circle cx="100" cy="100" r="9" fill="var(--red)" />
      </g>
    </svg>
  );
}

/** 把纹样的 draw() 剪影画成一张小剪纸图，用于图鉴 / 吉语图谱 / 纹样面板。 */
type GlyphTone = 'red' | 'ink' | 'muted';
function MotifGlyph({ motif, size = 88, tone = 'red' }: { motif: MotifDef; size?: number; tone?: GlyphTone }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    // 宣纸底
    ctx.fillStyle = tone === 'muted' ? '#ece3cf' : '#f3e9d2';
    ctx.fillRect(0, 0, size, size);
    // 剪影
    ctx.fillStyle = tone === 'red' ? '#9f251d' : tone === 'ink' ? '#2a2622' : '#a99c86';
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(size * 0.46, size * 0.46);
    motif.draw(ctx);
    ctx.restore();
  }, [motif, size, tone]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size, display: 'block' }} aria-hidden />;
}

export function JianzhiGame() {
  const [view, setView] = useState<View>('menu');
  const [fold, setFold] = useState<FoldMode>('book');
  const [tool, setTool] = useState<ToolMode>('motif');
  const [selectedMotif, setSelectedMotif] = useState(MOTIFS[0].id);
  const [activeChapter, setActiveChapter] = useState<JianzhiChapter | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<JianzhiProgress>(createInitialProgress);
  const [works, setWorks] = useState<SavedWork[]>([]);
  const [settings, setSettings] = useState<JianzhiSettings>({ reducedMotion: false, muted: false });
  const [codexTab, setCodexTab] = useState<CodexTab>('motif');
  const [toast, setToast] = useState('');
  const [pendingCompletion, setPendingCompletion] = useState<PendingCompletion | null>(null);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);
  const [preview, setPreview] = useState<SavedWork | null>(null);

  const canvasHost = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ReturnType<typeof createPaperCanvas> | null>(null);
  const lastPlacedRef = useRef('');
  const announcedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<ReturnType<typeof createPaperAudio> | null>(null);
  if (!audioRef.current) audioRef.current = createPaperAudio();

  // 初始化
  useEffect(() => {
    setProgress(loadProgress());
    setWorks(loadWorks());
    setSettings(loadSettings());
  }, []);

  const flashToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  const playSnip = useCallback(() => audioRef.current?.playSnip(settings.muted), [settings.muted]);
  const playChime = useCallback(() => audioRef.current?.playChime(settings.muted), [settings.muted]);

  // 引擎生命周期
  useEffect(() => {
    if (view !== 'workshop' || !canvasHost.current) return;
    const engine = createPaperCanvas(canvasHost.current, {
      reducedMotion: settings.reducedMotion,
      onReady: () => engineRef.current?.setTool(tool === 'motif' ? { type: 'motif', motifId: selectedMotif } : { type: 'cut' }),
    });
    engineRef.current = engine;
    engine.setReducedMotion(settings.reducedMotion);
    engine.setTool(tool === 'motif' ? { type: 'motif', motifId: selectedMotif } : { type: 'cut' });
    engine.setFold(activeChapter ? activeChapter.foldSuggestion : fold);
    engine.onReject(() => flashToast('这一折只剪外侧，请在亮起的折面里落剪'));
    engine.onChange(() => {
      const ids = engine.placedMotifIds();
      const key = ids.join(',');
      if (key !== lastPlacedRef.current) {
        lastPlacedRef.current = key;
        setPlacedIds(ids);
      }
    });
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeChapter]);

  useEffect(() => {
    engineRef.current?.setFold(activeChapter ? activeChapter.foldSuggestion : fold);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fold]);

  useEffect(() => {
    engineRef.current?.setTool(tool === 'motif' ? { type: 'motif', motifId: selectedMotif } : { type: 'cut' });
  }, [tool, selectedMotif]);

  // 已在纸上「成句」的吉语组合（用于追踪、记录与提示）
  const formedCombos = useMemo(() => detectCombos(placedIds, JIANZHI_COMBOS), [placedIds]);

  // 拼读成句：即时提示 + 解锁图谱（不重复播报已知句）
  useEffect(() => {
    if (view !== 'workshop') return;
    const fresh = formedCombos.filter((c) => !announcedRef.current.has(c.id));
    if (!fresh.length) return;
    fresh.forEach((c) => announcedRef.current.add(c.id));
    setProgress((prev) => {
      const next = discoverCombos(prev, fresh.map((c) => c.id));
      persistProgress(next);
      return next;
    });
    const c = fresh[fresh.length - 1];
    flashToast(`✦ 拼成「${c.phrase}」—— ${c.tagline}`);
    playChime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formedCombos, view]);

  const finalizeCompletion = useCallback(
    (chapter: JianzhiChapter, newMotifs: string[], comboIds: string[]) => {
      setProgress((prev) => {
        const next = recordChapterCompletion(
          prev,
          chapter.id,
          chapter.order,
          chapter.cultureEntryIds,
          newMotifs,
          TOTAL_CHAPTERS,
          comboIds,
        );
        persistProgress(next);
        return next;
      });
      setResult({ chapter, newMotifs, comboIds });
    },
    [],
  );

  const handleUnfold = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    await engine.unfold();
    playChime();
    const ids = engine.placedMotifIds();
    if (!activeChapter) return;
    const evaluation = evaluateChapter(activeChapter, ids);
    if (evaluation.passed) {
      const comboIds = detectCombos(ids, JIANZHI_COMBOS).map((c) => c.id);
      const newMotifs = [...new Set([...activeChapter.objectiveMotifIds, ...ids])];
      if (activeChapter.quiz) {
        // 先做章末理解题，再结算
        setPendingCompletion({ chapter: activeChapter, newMotifs, comboIds });
        setQuiz({ chapter: activeChapter, selected: null });
      } else {
        finalizeCompletion(activeChapter, newMotifs, comboIds);
      }
    } else {
      const missing = evaluation.missing.map((id) => getMotif(id)?.name ?? id);
      flashToast(`还差这些纹样：${missing.join('、')} —— 点「继续剪」补上`);
    }
  }, [activeChapter, flashToast, playChime, finalizeCompletion]);

  const finishQuiz = useCallback(() => {
    if (!pendingCompletion) return;
    finalizeCompletion(pendingCompletion.chapter, pendingCompletion.newMotifs, pendingCompletion.comboIds);
    setQuiz(null);
    setPendingCompletion(null);
  }, [pendingCompletion, finalizeCompletion]);

  const enterChapter = useCallback(
    (chapter: JianzhiChapter) => {
      if (chapter.order > progress.unlocked) return;
      setActiveChapter(chapter);
      setFold(chapter.foldSuggestion);
      setTool('motif');
      setSelectedMotif(chapter.objectiveMotifIds[0] ?? MOTIFS[0].id);
      setPlacedIds([]);
      lastPlacedRef.current = '';
      announcedRef.current = new Set(progress.discoveredCombos);
      setView('workshop');
      setShowIntro(true);
    },
    [progress.unlocked, progress.discoveredCombos],
  );

  const startFreeWorkshop = useCallback(() => {
    setActiveChapter(null);
    setPlacedIds([]);
    lastPlacedRef.current = '';
    announcedRef.current = new Set(progress.discoveredCombos);
    setView('workshop');
  }, [progress.discoveredCombos]);

  const saveWork = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const dataUrl = engine.exportPNG(2);
    if (!dataUrl) return;
    const ids = engine.placedMotifIds();
    const names = ids.map((id) => getMotif(id)?.name).filter(Boolean) as string[];
    const work = createWork({
      dataUrl,
      fold: activeChapter ? activeChapter.foldSuggestion : fold,
      motifIds: ids,
      name: names.length ? `《${names.join('·')}》` : '我的剪纸',
    });
    setWorks((prev) => {
      const next = addWork(prev, work);
      persistWorks(next);
      return next;
    });
    if (!activeChapter && ids.length) {
      setProgress((prev) => {
        const nextP = collectMotifs(prev, ids);
        persistProgress(nextP);
        return nextP;
      });
    }
    flashToast('已存入「我的作品」');
  }, [activeChapter, fold, flashToast]);

  const downloadCurrent = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const dataUrl = engine.exportPNG(2);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `纸上生花-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const deleteWork = useCallback(
    (id: string) => {
      setWorks((prev) => {
        const next = removeWork(prev, id);
        persistWorks(next);
        return next;
      });
      if (preview?.id === id) setPreview(null);
    },
    [preview],
  );

  const updateSettings = useCallback((patch: Partial<JianzhiSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      engineRef.current?.setReducedMotion(next.reducedMotion);
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearAllProgress = useCallback(() => {
    setProgress(createInitialProgress());
    setWorks([]);
    lastPlacedRef.current = '';
    announcedRef.current = new Set();
    try {
      window.localStorage.removeItem(PROGRESS_KEY);
      window.localStorage.removeItem(WORKS_KEY);
    } catch {
      /* ignore */
    }
    flashToast('进度与作品已清空');
  }, [flashToast]);

  const selectedMotifDef = useMemo(() => getMotif(selectedMotif), [selectedMotif]);
  const targetCombo = activeChapter?.targetComboId ? getCombo(activeChapter.targetComboId) : undefined;

  return (
    <section className={styles.root} aria-label="纸上生花：剪纸文化游戏">
      {toast && <div className={styles.toast} role="status">{toast}</div>}

      {view === 'menu' && (
        <div className={styles.menu}>
          <header className={styles.rail}>
            <p>REX GAME / 非遗互动展品 03</p>
            <p>CHINESE PAPER-CUTTING</p>
            <span>已解锁章节 {progress.unlocked} / {TOTAL_CHAPTERS}</span>
          </header>

          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>折 · 剪 · 读 · 展</p>
              <h1>纸上<span>生花</span></h1>
              <p className={styles.lead}>
                拿起虚拟的红纸，对折、落剪、展开——再把纹样拼成一句吉话。莲配鱼是「连年有余」，蝠配桃是「福寿双全」，读懂剪纸里藏了千年的谐音与象征。
              </p>
              <nav className={styles.menuNav} aria-label="开始菜单">
                <button type="button" className={styles.menuBtn} onClick={startFreeWorkshop}>
                  <span>01</span><strong>创作工坊</strong><small>自由拼句，随手成花</small>
                </button>
                <button type="button" className={styles.menuBtn} onClick={() => setView('story')}>
                  <span>02</span><strong>故事关卡</strong><small>读帖 · 拼句 · 答题</small>
                </button>
                <button type="button" className={styles.menuBtn} onClick={() => { setCodexTab('combo'); setView('codex'); }}>
                  <span>03</span><strong>吉语图谱</strong><small>已解读 {progress.discoveredCombos.length} / {JIANZHI_COMBOS.length}</small>
                </button>
                <button type="button" className={styles.menuBtn} onClick={() => { setCodexTab('motif'); setView('codex'); }}>
                  <span>04</span><strong>纹样图鉴</strong><small>已收录 {progress.collectedMotifIds.length} / {MOTIFS.length}</small>
                </button>
                <button type="button" className={styles.menuBtn} onClick={() => { setCodexTab('works'); setView('codex'); }}>
                  <span>05</span><strong>我的作品</strong><small>已存 {works.length} 件</small>
                </button>
                <button type="button" className={styles.menuBtn} onClick={() => setView('settings')}>
                  <span>06</span><strong>游戏设置</strong><small>动效与音效</small>
                </button>
              </nav>
            </div>
            <div className={styles.poster} aria-hidden>
              <div className={styles.posterSun} />
              <PaperCut />
              <p>一纸千纹 · 看图说吉话</p>
              <div className={styles.posterSeal}>纸<br />上</div>
            </div>
          </div>

          <footer className={styles.menuFooter}>
            <span>读帖 · 选折法 · 戳纹样 · 拼吉语 · 展开见花</span>
            <span>进度与作品保存于本地浏览器</span>
          </footer>
        </div>
      )}

      {view === 'story' && (
        <div className={styles.shell}>
          <header className={styles.masthead}>
            <div>
              <p className={styles.eyebrow}>REX GAME / 非遗互动展品 03</p>
              <h1>故事关卡</h1>
              <p className={styles.titleEn}>跟随纸灵，读帖识源流、拼纹成吉语、答题悟其理，修复被「忘却之风」吹散的民间记忆。</p>
            </div>
            <div className={styles.seal} aria-hidden>故<br />事</div>
          </header>
          <p className={styles.storyIntro}>
            每一章先「读帖」认识这一路剪纸的源流与技法，再在工坊里把纹样拼成一句吉话，最后用一道理解题巩固其中的谐音或象征。完成当前章，才会解锁下一章。
          </p>
          <div className={styles.chapterList}>
            {JIANZHI_CHAPTERS.map((chapter) => {
              const locked = chapter.order > progress.unlocked;
              const done = progress.completedChapters.includes(chapter.id);
              const combo = chapter.targetComboId ? getCombo(chapter.targetComboId) : undefined;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  className={`${styles.chapter} ${locked ? styles.chapterLocked : ''} ${done ? styles.chapterDone : ''}`}
                  disabled={locked}
                  onClick={() => enterChapter(chapter)}
                >
                  <span className={styles.chapterNo}>{String(chapter.order).padStart(2, '0')}</span>
                  <strong>{chapter.title}</strong>
                  <small>{chapter.subtitle}{combo ? ` · 拼「${combo.phrase}」` : ''}</small>
                  <em>{locked ? '未解锁' : done ? '已完成 ✓' : chapter.region}</em>
                </button>
              );
            })}
          </div>
          <div className={styles.backRow}>
            <button type="button" className={styles.ghostBtn} onClick={() => setView('menu')}>← 返回菜单</button>
          </div>
        </div>
      )}

      {view === 'workshop' && (
        <div className={styles.workshop}>
          <div className={styles.workshopBar}>
            <button type="button" className={styles.barBack} onClick={() => setView(activeChapter ? 'story' : 'menu')}>
              ← {activeChapter ? '故事关卡' : '菜单'}
            </button>
            <p className={styles.barTitle}>
              {activeChapter ? `${activeChapter.title} · ${activeChapter.subtitle}` : '创作工坊 · 自由创作'}
            </p>
            <span className={styles.barFold}>{FOLD_OPTIONS.find((f) => f.id === fold)?.label}折</span>
          </div>

          <div className={styles.workshopBody}>
            <div className={styles.stage}>
              <div className={styles.canvasFrame}>
                <div ref={canvasHost} className={styles.canvasHost} />
              </div>

              <div className={styles.controls}>
                <div className={styles.foldRow} role="group" aria-label="折法">
                  {FOLD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`${styles.foldBtn} ${fold === opt.id ? styles.foldActive : ''}`}
                      title={opt.hint}
                      onClick={() => setFold(opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className={styles.toolRow}>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${tool === 'motif' ? styles.toolActive : ''}`}
                    onClick={() => setTool('motif')}
                  >
                    纹样戳印
                  </button>
                  <button
                    type="button"
                    className={`${styles.toolBtn} ${tool === 'cut' ? styles.toolActive : ''}`}
                    onClick={() => setTool('cut')}
                  >
                    自由剪
                  </button>
                  <span className={styles.toolHint}>
                    {tool === 'motif' ? '点折面落剪，纹样自动对称' : '在折面里拖动，划出镂空'}
                  </span>
                </div>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.actionBtn} onClick={() => engineRef.current?.undo()}>撤销</button>
                  <button type="button" className={styles.actionBtn} onClick={() => engineRef.current?.clear()}>清空</button>
                  <button type="button" className={styles.actionBtn} onClick={() => engineRef.current?.fold()}>继续剪</button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.unfoldBtn} ${activeChapter && activeChapter.objectiveMotifIds.every((id) => placedIds.includes(id)) && activeChapter.objectiveMotifIds.length > 0 ? styles.unfoldReady : ''}`}
                    onClick={handleUnfold}
                  >
                    展开 ✦
                  </button>
                </div>
                <div className={styles.saveRow}>
                  <button type="button" className={styles.ghostBtn} onClick={saveWork}>存入作品</button>
                  <button type="button" className={styles.ghostBtn} onClick={downloadCurrent}>下载图片</button>
                </div>
              </div>
            </div>

            <aside className={styles.side}>
              {targetCombo && (
                <div className={styles.comboTarget}>
                  <p className={styles.comboTargetLabel}>本章要拼的吉语</p>
                  <p className={styles.comboTargetPhrase}>{targetCombo.phrase}</p>
                  <div className={styles.comboTargetPieces}>
                    {targetCombo.motifIds.map((id) => {
                      const m = getMotif(id);
                      const ok = placedIds.includes(id);
                      return (
                        <span key={id} className={`${styles.comboPiece} ${ok ? styles.comboPieceOk : ''}`}>
                          {ok ? '✓ ' : ''}{m?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeChapter && (
                <div className={styles.card}>
                  <p className={styles.sideLabel}>本章任务</p>
                  <ul className={styles.objectiveList}>
                    {activeChapter.objectiveMotifIds.length === 0 ? (
                      <li className={styles.objectiveItem}>自由拼句：任选纹样凑出一句吉话，图谱会为你记下。</li>
                    ) : (
                      activeChapter.objectiveMotifIds.map((id) => {
                        const m = getMotif(id);
                        const done = placedIds.includes(id);
                        return (
                          <li key={id} className={`${styles.objectiveItem} ${done ? styles.objectiveOk : ''}`}>
                            <span>{done ? '✓' : '○'}</span>剪出「{m?.name}」—— {m?.meaning}
                          </li>
                        );
                      })
                    )}
                  </ul>
                  <p className={styles.focusNote}>文化聚焦：{activeChapter.culturalFocus}</p>
                </div>
              )}

              {formedCombos.length > 0 && (
                <div className={styles.comboLog}>
                  <p className={styles.sideLabel}>已拼成 · 本次</p>
                  <div className={styles.comboLogList}>
                    {formedCombos.map((c) => (
                      <span key={c.id} className={styles.comboLogItem}>{c.phrase}</span>
                    ))}
                  </div>
                </div>
              )}

              {tool === 'motif' && (
                <div className={styles.card}>
                  <p className={styles.sideLabel}>纹样 · 点选后落剪</p>
                  <div className={styles.paletteGrid}>
                    {MOTIFS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`${styles.chip} ${selectedMotif === m.id ? styles.chipActive : ''} ${progress.collectedMotifIds.includes(m.id) ? styles.chipKnown : ''}`}
                        onClick={() => { setSelectedMotif(m.id); playSnip(); }}
                        title={`${m.name} · ${m.meaning}`}
                      >
                        <MotifGlyph motif={m} size={40} tone="red" />
                        <span className={styles.chipName}>{m.name}</span>
                        <span className={styles.chipMeaning}>{m.meaning}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tool === 'motif' && selectedMotifDef && (
                <div className={styles.meanCard}>
                  <p className={styles.sideLabel}>
                    当前纹样 · <span className={styles.evidence}>{evidenceLabel(selectedMotifDef.evidence)}</span>
                  </p>
                  <h3>{selectedMotifDef.name} <small>{selectedMotifDef.pinyin}</small></h3>
                  <p className={styles.meanMain}>{selectedMotifDef.meaning}</p>
                  <p className={styles.meanLesson}>{selectedMotifDef.lesson}</p>
                  <p className={styles.meanRegion}>{selectedMotifDef.region}</p>
                </div>
              )}

              {tool === 'cut' && (
                <div className={styles.meanCard}>
                  <p className={styles.sideLabel}>自由剪</p>
                  <p className={styles.meanLesson}>
                    在亮起的折面里拖动手指或鼠标，划出的线条会从红纸中镂空。配合不同折法，一条线会变成对称的满纸花纹。
                  </p>
                </div>
              )}
            </aside>
          </div>

          {showIntro && activeChapter && (
            <div className={styles.overlay}>
              <div className={styles.introCard}>
                <p className={styles.eyebrow}>{activeChapter.region} · 读帖</p>
                <h2>{activeChapter.title}</h2>
                <p className={styles.introSub}>{activeChapter.subtitle}</p>
                {activeChapter.narrative.map((line, i) => (
                  <p key={i} className={styles.introLine}>{line}</p>
                ))}
                <dl className={styles.introReading}>
                  <div className={styles.introReadingRow}>
                    <dt className={styles.introReadingTerm}>源流</dt>
                    <dd className={styles.introReadingDef}>{activeChapter.reading.origin}</dd>
                  </div>
                  <div className={styles.introReadingRow}>
                    <dt className={styles.introReadingTerm}>技法</dt>
                    <dd className={styles.introReadingDef}>{activeChapter.reading.technique}</dd>
                  </div>
                  <div className={styles.introReadingRow}>
                    <dt className={styles.introReadingTerm}>看点</dt>
                    <dd className={styles.introReadingDef}>{activeChapter.reading.focus}</dd>
                  </div>
                </dl>
                <div className={styles.introActions}>
                  <button type="button" className={styles.ghostBtn} onClick={() => { setView('story'); setShowIntro(false); }}>稍后再说</button>
                  <button type="button" className={styles.primaryBtn} onClick={() => setShowIntro(false)}>开始创作</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'codex' && (
        <div className={styles.shell}>
          <header className={styles.masthead}>
            <div>
              <p className={styles.eyebrow}>FIELD NOTES / 图鉴</p>
              <h1>纹样图鉴</h1>
              <p className={styles.titleEn}>每一道镂空都是一个心愿，每一句吉话都由纹样拼成。</p>
            </div>
            <div className={styles.seal} aria-hidden>图<br />鉴</div>
          </header>

          <div className={styles.tabs} role="tablist">
            <button type="button" className={`${styles.tab} ${codexTab === 'motif' ? styles.tabActive : ''}`} onClick={() => setCodexTab('motif')}>纹样 {progress.collectedMotifIds.length}/{MOTIFS.length}</button>
            <button type="button" className={`${styles.tab} ${codexTab === 'combo' ? styles.tabActive : ''}`} onClick={() => setCodexTab('combo')}>吉语图谱 {progress.discoveredCombos.length}/{JIANZHI_COMBOS.length}</button>
            <button type="button" className={`${styles.tab} ${codexTab === 'archive' ? styles.tabActive : ''}`} onClick={() => setCodexTab('archive')}>文化档案 {progress.cultureEntryIds.length}/{JIANZHI_CULTURE_ENTRIES.length}</button>
            <button type="button" className={`${styles.tab} ${codexTab === 'works' ? styles.tabActive : ''}`} onClick={() => setCodexTab('works')}>我的作品 {works.length}</button>
          </div>

          {codexTab === 'motif' && (
            <div className={styles.codexGrid}>
              {MOTIFS.map((m) => {
                const known = progress.collectedMotifIds.includes(m.id);
                return (
                  <article key={m.id} className={`${styles.codexCard} ${known ? '' : styles.codexLocked}`}>
                    <div className={styles.codexGlyphWrap}>
                      <MotifGlyph motif={m} size={92} tone={known ? 'red' : 'muted'} />
                    </div>
                    <div className={styles.codexNum}>{known ? '✓' : '锁'}</div>
                    <h3>{m.name} <small>{m.pinyin}</small></h3>
                    <p className={styles.codexMeaning}>{m.meaning}</p>
                    {known ? (
                      <>
                        <p className={styles.codexLesson}>{m.lesson}</p>
                        <p className={styles.codexMeta}>{m.region} · <span className={styles.evidence}>{evidenceLabel(m.evidence)}</span></p>
                        <a className={styles.codexSrc} href={m.sourceUrl} target="_blank" rel="noreferrer">资料入口：{m.sourceLabel} ↗</a>
                      </>
                    ) : (
                      <p className={styles.codexLesson}>在工坊里剪出这个纹样，即可解锁它的寓意与故事。</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {codexTab === 'combo' && (
            <div className={styles.comboGrid}>
              {JIANZHI_COMBOS.map((c) => {
                const known = progress.discoveredCombos.includes(c.id);
                return (
                  <article key={c.id} className={`${styles.comboCard} ${known ? '' : styles.comboCardLocked}`}>
                    <div className={styles.comboCardHead}>
                      <h3 className={styles.comboCardPhrase}>{known ? c.phrase : '＿＿＿＿'}</h3>
                    </div>
                    <div className={styles.comboCardMotifs}>
                      {c.motifIds.map((id, i) => {
                        const m = getMotif(id);
                        return (
                          <span key={id} style={{ display: 'contents' }}>
                            {i > 0 && <span className={styles.comboCardPlus}>＋</span>}
                            <span className={styles.comboCardMotif}>
                              {m && <MotifGlyph motif={m} size={46} tone={known ? 'red' : 'muted'} />}
                              <span className={styles.comboCardName}>{m?.name}</span>
                            </span>
                          </span>
                        );
                      })}
                    </div>
                    {known ? (
                      <>
                        <p className={styles.comboCardPrinciple}>{c.principle}</p>
                        <a className={styles.comboCardSrc} href={c.sourceUrl} target="_blank" rel="noreferrer">{c.sourceLabel} ↗</a>
                      </>
                    ) : (
                      <p className={styles.comboCardPrinciple}>把上面这些纹样剪到同一张纸上，就能读出这句吉话，并解锁它的成句原理。</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {codexTab === 'archive' && (
            <div className={styles.codexGrid}>
              {JIANZHI_CULTURE_ENTRIES.map((entry) => {
                const known = progress.cultureEntryIds.includes(entry.id);
                return (
                  <article key={entry.id} className={`${styles.codexCard} ${known ? '' : styles.codexLocked}`}>
                    <div className={styles.codexNum}>{known ? '✓' : '锁'}</div>
                    <h3>{entry.title}</h3>
                    <p className={styles.codexMeaning}>{entry.summary}</p>
                    {known ? (
                      <>
                        <p className={styles.codexLesson}>{entry.detail}</p>
                        <p className={styles.codexMeta}>{entry.region} · <span className={styles.evidence}>{evidenceLabel(entry.evidence)}</span></p>
                        <a className={styles.codexSrc} href={entry.sourceUrl} target="_blank" rel="noreferrer">资料入口：{entry.sourceLabel} ↗</a>
                      </>
                    ) : (
                      <p className={styles.codexLesson}>完成对应故事章节即可解锁这条文化笔记。</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {codexTab === 'works' && (
            <>
              {works.length === 0 ? (
                <p className={styles.emptyNote}>还没有作品。去「创作工坊」剪一张，再点「存入作品」吧。</p>
              ) : (
                <div className={styles.worksGrid}>
                  {works.map((w) => (
                    <button key={w.id} type="button" className={styles.workCard} onClick={() => setPreview(w)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.dataUrl} alt={w.name} />
                      <span>{w.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className={styles.backRow}>
            <button type="button" className={styles.ghostBtn} onClick={() => setView('menu')}>← 返回菜单</button>
          </div>
        </div>
      )}

      {view === 'settings' && (
        <div className={styles.shell}>
          <header className={styles.masthead}>
            <div>
              <p className={styles.eyebrow}>SETTINGS / 设置</p>
              <h1>游戏设置</h1>
              <p className={styles.titleEn}>动效与音效，随你习惯。</p>
            </div>
            <div className={styles.seal} aria-hidden>设<br />置</div>
          </header>
          <section className={styles.settingsBox}>
            <label className={styles.toggle}>
              <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => updateSettings({ reducedMotion: e.target.checked })} />
              减少动态效果（展开动画更轻）
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={settings.muted} onChange={(e) => updateSettings({ muted: e.target.checked })} />
              静音（剪与展开的音效）
            </label>
            <button type="button" className={styles.dangerBtn} onClick={clearAllProgress}>清空进度与作品</button>
          </section>
          <div className={styles.backRow}>
            <button type="button" className={styles.ghostBtn} onClick={() => setView('menu')}>← 返回菜单</button>
          </div>
        </div>
      )}

      {quiz && (
        <div className={styles.overlay}>
          <div className={styles.quizCard}>
            <p className={styles.eyebrow}>章末理解题</p>
            <h2>{quiz.chapter.title}</h2>
            <p className={styles.quizQuestion}>{quiz.chapter.quiz!.question}</p>
            <div className={styles.quizOptions}>
              {quiz.chapter.quiz!.options.map((opt, i) => {
                const answered = quiz.selected !== null;
                const isAnswer = i === quiz.chapter.quiz!.answer;
                const isPicked = i === quiz.selected;
                const cls = answered
                  ? isAnswer
                    ? styles.quizOptionRight
                    : isPicked
                      ? styles.quizOptionWrong
                      : ''
                  : '';
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.quizOption} ${cls}`}
                    disabled={answered}
                    onClick={() => setQuiz((s) => (s ? { ...s, selected: i } : s))}
                  >
                    <b>{String.fromCharCode(65 + i)}</b>{opt}
                  </button>
                );
              })}
            </div>
            {quiz.selected !== null && (
              <>
                <p className={styles.quizExplain}>{quiz.chapter.quiz!.explain}</p>
                <div className={styles.introActions}>
                  <button type="button" className={styles.primaryBtn} onClick={finishQuiz}>领取奖励 →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className={styles.overlay}>
          <div className={styles.resultCard}>
            <p className={styles.eyebrow}>本章完成</p>
            <h2>{result.chapter.title}</h2>
            {(() => {
              const combo = result.chapter.targetComboId && result.comboIds.includes(result.chapter.targetComboId)
                ? getCombo(result.chapter.targetComboId)
                : undefined;
              return combo ? (
                <div className={styles.resultComboBanner}>
                  <strong>拼成「{combo.phrase}」</strong>
                  <span>{combo.principle}</span>
                </div>
              ) : null;
            })()}
            <p className={styles.resultReward}>{result.chapter.reward}</p>
            {result.newMotifs.length > 0 && (
              <div className={styles.resultMotifs}>
                {result.newMotifs.map((id) => {
                  const m = getMotif(id);
                  return m ? (
                    <span key={id} className={styles.resultMotif}>{m.name} · {m.meaning}</span>
                  ) : null;
                })}
              </div>
            )}
            <div className={styles.introActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => { setResult(null); setCodexTab('combo'); setView('codex'); }}>看吉语图谱</button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  setResult(null);
                  const next = JIANZHI_CHAPTERS[result.chapter.order];
                  if (next && next.order <= progress.unlocked) enterChapter(next);
                  else setView('story');
                }}
              >
                {JIANZHI_CHAPTERS[result.chapter.order] && JIANZHI_CHAPTERS[result.chapter.order].order <= progress.unlocked ? '下一章 →' : '返回故事'}
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className={styles.overlay} onClick={() => setPreview(null)}>
          <div className={styles.previewCard} onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.dataUrl} alt={preview.name} />
            <h3>{preview.name}</h3>
            <p className={styles.meanRegion}>
              {FOLD_OPTIONS.find((f) => f.id === preview.fold)?.label}折
              {preview.motifIds.length ? ` · ${preview.motifIds.map((id) => getMotif(id)?.name).filter(Boolean).join('、')}` : ''}
            </p>
            <div className={styles.introActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => deleteWork(preview.id)}>删除</button>
              <button type="button" className={styles.primaryBtn} onClick={() => { const a = document.createElement('a'); a.href = preview.dataUrl; a.download = `${preview.name}.png`; a.click(); }}>下载</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
