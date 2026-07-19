'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MOTIFS, getMotif } from './content/motifs';
import { JIANZHI_LESSONS, LESSON_COUNT, getLesson } from './content/lessons';
import { JIANZHI_COMMISSIONS, getCommission } from './content/commissions';
import { JIANZHI_CULTURE_ENTRIES } from './content/culture';
import { JIANZHI_COMBOS, getCombo } from './content/combos';
import { createPaperCanvas } from './runtime/paperCanvas';
import { createPaperAudio } from './runtime/audio';
import { evaluateObjective } from './core/evaluate';
import { detectCombos } from './core/rebus';
import {
  PROGRESS_KEY_V2,
  PROGRESS_KEY_V1,
  addWork,
  collectMotifs,
  createInitialJianzhiProgress,
  createWork,
  discoverCombos,
  parseJianzhiProgress,
  recordCommissionCompletion,
  recordLessonCompletion,
  removeWork,
} from './core/progress';
import type {
  EvidenceKind,
  FoldMode,
  JianzhiCommission,
  JianzhiLesson,
  JianzhiProgress,
  JianzhiSettings,
  MotifDef,
  SavedWork,
} from './core/types';
import styles from './JianzhiGame.module.css';

const WORKS_KEY = 'rex-game:jianzhi:works:v1';
const SETTINGS_KEY = 'rex-game:jianzhi:settings:v1';

const FOLD_OPTIONS: Array<{ id: FoldMode; label: string; hint: string }> = [
  { id: 'single', label: '单面', hint: '不折叠，自由剪' },
  { id: 'book', label: '对折', hint: '左右镜像，剪「福」最宜' },
  { id: 'four', label: '四折', hint: '四向对称，窗花首选' },
  { id: 'rosette', label: '团花', hint: '旋转放射，丝路团花' },
];

type View = 'enter' | 'map' | 'workshop' | 'codex' | 'settings';
type ToolMode = 'motif' | 'cut';
type CodexTab = 'motif' | 'combo' | 'archive' | 'works';
type LessonPhase = 'reading' | 'craft' | 'reveal' | 'quiz' | 'result';

function evidenceLabel(e: EvidenceKind): string {
  if (e === 'recorded') return '资料记载';
  if (e === 'oral-tradition') return '民间流传';
  return '游戏化演绎';
}

function loadProgress(): JianzhiProgress {
  try {
    const v2 = window.localStorage.getItem(PROGRESS_KEY_V2);
    if (v2) return parseJianzhiProgress(v2);
    const v1 = window.localStorage.getItem(PROGRESS_KEY_V1);
    if (v1) {
      const migrated = parseJianzhiProgress(v1);
      window.localStorage.setItem(PROGRESS_KEY_V2, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    /* ignore */
  }
  return createInitialJianzhiProgress();
}

function persistProgress(p: JianzhiProgress) {
  try {
    window.localStorage.setItem(PROGRESS_KEY_V2, JSON.stringify(p));
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
    ctx.fillStyle = tone === 'muted' ? '#ece3cf' : '#f3e9d2';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = tone === 'red' ? '#9f251d' : tone === 'ink' ? '#2a2622' : '#a99c86';
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(size * 0.46, size * 0.46);
    motif.draw(ctx);
    ctx.restore();
  }, [motif, size, tone]);
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size, display: 'block' }} aria-hidden />;
}

function Subnav({
  active,
  onNavigate,
}: {
  active: View;
  onNavigate: (v: View, codexTab?: CodexTab) => void;
}) {
  return (
    <nav className={styles.subnav} aria-label="工坊导航">
      <button type="button" className={styles.subnavBtn} aria-current={active === 'map' ? 'page' : undefined} onClick={() => onNavigate('map')}>
        功课地图
      </button>
      <button type="button" className={styles.subnavBtn} aria-current={active === 'workshop' ? 'page' : undefined} onClick={() => onNavigate('workshop')}>
        自习台
      </button>
      <button type="button" className={styles.subnavBtn} aria-current={active === 'codex' ? 'page' : undefined} onClick={() => onNavigate('codex', 'motif')}>
        纹样册
      </button>
      <button type="button" className={styles.subnavBtn} onClick={() => onNavigate('codex', 'works')}>
        作品
      </button>
      <button type="button" className={styles.subnavBtn} aria-current={active === 'settings' ? 'page' : undefined} onClick={() => onNavigate('settings')}>
        设置
      </button>
    </nav>
  );
}

export function JianzhiGame() {
  const [view, setView] = useState<View>('enter');
  const [fold, setFold] = useState<FoldMode>('book');
  const [tool, setTool] = useState<ToolMode>('motif');
  const [selectedMotif, setSelectedMotif] = useState(MOTIFS[0].id);
  const [activeLesson, setActiveLesson] = useState<JianzhiLesson | null>(null);
  const [activeCommission, setActiveCommission] = useState<JianzhiCommission | null>(null);
  const [phase, setPhase] = useState<LessonPhase>('craft');
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [progress, setProgress] = useState<JianzhiProgress>(createInitialJianzhiProgress);
  const [works, setWorks] = useState<SavedWork[]>([]);
  const [settings, setSettings] = useState<JianzhiSettings>({ reducedMotion: false, muted: false });
  const [codexTab, setCodexTab] = useState<CodexTab>('motif');
  const [toast, setToast] = useState('');
  const [preview, setPreview] = useState<SavedWork | null>(null);
  const [revealPhrase, setRevealPhrase] = useState('');
  const [revealPrinciple, setRevealPrinciple] = useState('');
  const [quizPick, setQuizPick] = useState<number | null>(null);
  const [quizExplainVisible, setQuizExplainVisible] = useState(false);
  const [resultReward, setResultReward] = useState('');

  const canvasHost = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ReturnType<typeof createPaperCanvas> | null>(null);
  const lastPlacedRef = useRef('');
  const announcedRef = useRef<Set<string>>(new Set());
  const pendingCompleteRef = useRef<{ motifIds: string[]; comboIds: string[] } | null>(null);
  const audioRef = useRef<ReturnType<typeof createPaperAudio> | null>(null);
  if (!audioRef.current) audioRef.current = createPaperAudio();

  const activeObjective = activeLesson ?? activeCommission;
  const isPractice = !activeLesson && !activeCommission;
  const foldLocked = !!activeObjective;
  const effectiveFold = activeObjective ? activeObjective.foldSuggestion : fold;
  const activeQuiz = activeLesson?.quiz ?? activeCommission?.quiz;

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

  const navigateFromSubnav = useCallback((v: View, tab?: CodexTab) => {
    if (v === 'workshop') {
      setActiveLesson(null);
      setActiveCommission(null);
      setPhase('craft');
      setPlacedIds([]);
      lastPlacedRef.current = '';
      pendingCompleteRef.current = null;
      setView('workshop');
      return;
    }
    if (v === 'codex' && tab) setCodexTab(tab);
    setView(v);
  }, []);

  // 引擎生命周期：reading 结束后挂载；reveal/quiz/result 不重挂以免清空展开纸面
  const canvasSession =
    view === 'workshop' && phase !== 'reading'
      ? `${activeLesson?.id ?? 'none'}:${activeCommission?.id ?? 'none'}`
      : null;

  useEffect(() => {
    if (!canvasSession || !canvasHost.current) return;
    const engine = createPaperCanvas(canvasHost.current, {
      reducedMotion: settings.reducedMotion,
      onReady: () =>
        engineRef.current?.setTool(
          tool === 'motif' ? { type: 'motif', motifId: selectedMotif } : { type: 'cut' },
        ),
    });
    engineRef.current = engine;
    engine.setReducedMotion(settings.reducedMotion);
    engine.setTool(tool === 'motif' ? { type: 'motif', motifId: selectedMotif } : { type: 'cut' });
    engine.setFold(activeObjective ? activeObjective.foldSuggestion : fold);
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
  }, [canvasSession]);

  useEffect(() => {
    if (foldLocked && activeObjective) {
      engineRef.current?.setFold(activeObjective.foldSuggestion);
      return;
    }
    engineRef.current?.setFold(fold);
  }, [fold, foldLocked, activeObjective]);

  useEffect(() => {
    engineRef.current?.setTool(tool === 'motif' ? { type: 'motif', motifId: selectedMotif } : { type: 'cut' });
  }, [tool, selectedMotif]);

  const formedCombos = useMemo(() => detectCombos(placedIds, JIANZHI_COMBOS), [placedIds]);

  useEffect(() => {
    if (view !== 'workshop' || phase !== 'craft') return;
    const fresh = formedCombos.filter((c) => !announcedRef.current.has(c.id));
    if (!fresh.length) return;
    fresh.forEach((c) => announcedRef.current.add(c.id));
    setProgress((prev) => {
      const next = discoverCombos(
        prev,
        fresh.map((c) => c.id),
      );
      persistProgress(next);
      return next;
    });
    const c = fresh[fresh.length - 1];
    flashToast(`✦ 拼成「${c.phrase}」—— ${c.tagline}`);
    playChime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formedCombos, view, phase]);

  const leaveWorkshop = useCallback(() => {
    setActiveLesson(null);
    setActiveCommission(null);
    setPhase('craft');
    pendingCompleteRef.current = null;
    setQuizPick(null);
    setQuizExplainVisible(false);
    setView('map');
  }, []);

  const resetQuizState = useCallback(() => {
    setQuizPick(null);
    setQuizExplainVisible(false);
  }, []);

  const beginCraft = useCallback(() => {
    if (!activeObjective) return;
    setFold(activeObjective.foldSuggestion);
    setPlacedIds([]);
    lastPlacedRef.current = '';
    resetQuizState();
    setPhase('craft');
  }, [activeObjective, resetQuizState]);

  const finalizeCompletion = useCallback(() => {
    const pending = pendingCompleteRef.current;
    const motifIds = pending?.motifIds ?? placedIds;
    const comboIds = pending?.comboIds ?? detectCombos(motifIds, JIANZHI_COMBOS).map((c) => c.id);
    const newMotifs = activeObjective
      ? [...new Set([...activeObjective.objectiveMotifIds, ...motifIds])]
      : motifIds;

    let reward = '';
    if (activeLesson) {
      reward = activeLesson.reward;
      setProgress((prev) => {
        const next = recordLessonCompletion(
          prev,
          activeLesson.id,
          activeLesson.order,
          activeLesson.cultureEntryIds,
          newMotifs,
          LESSON_COUNT,
          comboIds,
        );
        persistProgress(next);
        return next;
      });
    } else if (activeCommission) {
      reward = activeCommission.reward;
      setProgress((prev) => {
        const next = recordCommissionCompletion(
          prev,
          activeCommission.id,
          activeCommission.cultureEntryIds,
          newMotifs,
          comboIds,
        );
        persistProgress(next);
        return next;
      });
    }
    pendingCompleteRef.current = null;
    setResultReward(reward);
    setPhase('result');
    playChime();
  }, [activeObjective, activeLesson, activeCommission, placedIds, playChime]);

  const goQuizOrResult = useCallback(() => {
    const quiz = activeLesson?.quiz ?? activeCommission?.quiz;
    if (quiz) {
      resetQuizState();
      setPhase('quiz');
      return;
    }
    finalizeCompletion();
  }, [activeLesson, activeCommission, resetQuizState, finalizeCompletion]);

  const handleUnfold = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;
    await engine.unfold();
    playChime();
    const ids = engine.placedMotifIds();
    if (!activeObjective) {
      flashToast('自习台可自由剪折 · 存作品或拼吉语');
      return;
    }

    const evaluation = evaluateObjective(
      { objectiveMode: activeObjective.objectiveMode, objectiveMotifIds: activeObjective.objectiveMotifIds },
      ids,
      JIANZHI_COMBOS,
    );
    if (!evaluation.passed) {
      if (activeObjective.objectiveMode === 'any-combo') {
        flashToast('请再拼出一句吉语——把纹样凑成一句彩头');
      } else {
        const missing = evaluation.missing.map((id) => getMotif(id)?.name ?? id);
        flashToast(`还差这些纹样：${missing.join('、')} —— 点「继续剪」补上`);
      }
      return;
    }

    const detected = detectCombos(ids, JIANZHI_COMBOS);
    const comboIds = detected.map((c) => c.id);
    pendingCompleteRef.current = { motifIds: ids, comboIds };

    let phrase = '';
    let principle = '';
    if (activeObjective.targetComboId) {
      const combo = getCombo(activeObjective.targetComboId);
      phrase = combo?.phrase ?? '';
      principle = combo?.principle ?? '';
    } else if (activeObjective.objectiveMode === 'any-combo' && detected[0]) {
      phrase = detected[0].phrase;
      principle = detected[0].principle;
    } else {
      phrase = activeObjective.objectiveMotifIds
        .map((id) => getMotif(id)?.name)
        .filter(Boolean)
        .join(' · ');
      principle = activeObjective.objectiveMotifIds
        .map((id) => getMotif(id)?.meaning)
        .filter(Boolean)
        .join('；');
    }
    setRevealPhrase(phrase);
    setRevealPrinciple(principle);
    setPhase('reveal');
  }, [activeObjective, flashToast, playChime]);

  const enterLesson = useCallback(
    (lesson: JianzhiLesson) => {
      if (lesson.order > progress.curriculumUnlocked) return;
      setActiveLesson(lesson);
      setActiveCommission(null);
      setFold(lesson.foldSuggestion);
      setTool('motif');
      setSelectedMotif(lesson.objectiveMotifIds[0] ?? MOTIFS[0].id);
      setPlacedIds([]);
      lastPlacedRef.current = '';
      pendingCompleteRef.current = null;
      announcedRef.current = new Set(progress.discoveredCombos);
      resetQuizState();
      setPhase('reading');
      setView('workshop');
    },
    [progress.curriculumUnlocked, progress.discoveredCombos, resetQuizState],
  );

  const enterCommission = useCallback(
    (commission: JianzhiCommission) => {
      if (!progress.graduated) return;
      setActiveLesson(null);
      setActiveCommission(commission);
      setFold(commission.foldSuggestion);
      setTool('motif');
      setSelectedMotif(commission.objectiveMotifIds[0] ?? MOTIFS[0].id);
      setPlacedIds([]);
      lastPlacedRef.current = '';
      pendingCompleteRef.current = null;
      announcedRef.current = new Set(progress.discoveredCombos);
      resetQuizState();
      setPhase('reading');
      setView('workshop');
    },
    [progress.graduated, progress.discoveredCombos, resetQuizState],
  );

  const startPractice = useCallback(() => {
    setActiveLesson(null);
    setActiveCommission(null);
    setPhase('craft');
    setPlacedIds([]);
    lastPlacedRef.current = '';
    pendingCompleteRef.current = null;
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
      fold: effectiveFold,
      motifIds: ids,
      name: names.length ? `《${names.join('·')}》` : '我的剪纸',
    });
    setWorks((prev) => {
      const next = addWork(prev, work);
      persistWorks(next);
      return next;
    });
    if (isPractice && ids.length) {
      setProgress((prev) => {
        const nextP = collectMotifs(prev, ids);
        persistProgress(nextP);
        return nextP;
      });
    }
    flashToast('已存入「我的作品」');
  }, [effectiveFold, isPractice, flashToast]);

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
    setProgress(createInitialJianzhiProgress());
    setWorks([]);
    lastPlacedRef.current = '';
    announcedRef.current = new Set();
    try {
      window.localStorage.removeItem(PROGRESS_KEY_V2);
      window.localStorage.removeItem(PROGRESS_KEY_V1);
      window.localStorage.removeItem(WORKS_KEY);
    } catch {
      /* ignore */
    }
    flashToast('进度与作品已清空');
  }, [flashToast]);

  const selectedMotifDef = useMemo(() => getMotif(selectedMotif), [selectedMotif]);
  const targetComboId = activeObjective?.targetComboId;
  const targetCombo = targetComboId ? getCombo(targetComboId) : undefined;

  const workshopTitle = activeLesson
    ? `${activeLesson.title} · ${activeLesson.subtitle}`
    : activeCommission
      ? `${activeCommission.title} · ${activeCommission.season}`
      : '自习台 · 自由创作';

  const objectiveReady =
    !!activeObjective &&
    (activeObjective.objectiveMode === 'any-combo'
      ? formedCombos.length > 0
      : activeObjective.objectiveMotifIds.length > 0 &&
        activeObjective.objectiveMotifIds.every((id) => placedIds.includes(id)));

  const nextLesson = useMemo(() => {
    if (!activeLesson) return undefined;
    const found = JIANZHI_LESSONS.find((l) => l.order === activeLesson.order + 1);
    return found ? getLesson(found.id) : undefined;
  }, [activeLesson]);
  const nextLessonUnlocked = !!nextLesson && nextLesson.order <= progress.curriculumUnlocked;

  const finishToMap = useCallback(() => {
    setActiveLesson(null);
    setActiveCommission(null);
    setPhase('craft');
    pendingCompleteRef.current = null;
    resetQuizState();
    setView('map');
  }, [resetQuizState]);

  const continueNextLesson = useCallback(() => {
    if (!nextLesson || nextLesson.order > progress.curriculumUnlocked) {
      finishToMap();
      return;
    }
    enterLesson(nextLesson);
  }, [nextLesson, progress.curriculumUnlocked, finishToMap, enterLesson]);

  const onQuizSelect = useCallback((index: number) => {
    setQuizPick(index);
    setQuizExplainVisible(true);
  }, []);

  return (
    <section className={styles.root} aria-label="纸上生花：剪纸文化游戏">
      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}

      {view === 'enter' && (
        <div className={styles.enter}>
          <p className={styles.wordmark}>纸上生花</p>
          <h1 className={styles.heroTitle}>
            学徒工坊
          </h1>
          <p className={styles.heroLead}>
            拜帖读源流，折纸练对称，落剪拼吉语。你是工坊里的学徒——完成七课功课出师后，师傅会把时令委托交给你。
          </p>
          <button type="button" className={styles.primaryBtn} onClick={() => setView('map')}>
            进入工坊
          </button>
        </div>
      )}

      {view === 'map' && (
        <div className={styles.shell}>
          <div className={styles.map}>
            <header className={styles.mapHeader}>
              <div>
                <p className={styles.wordmark}>纸上生花</p>
                <h1 className={styles.heroTitle} style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                  功课地图
                </h1>
                <p className={styles.heroLead} style={{ fontSize: '0.95rem' }}>
                  已解锁 {progress.curriculumUnlocked} / {LESSON_COUNT}
                  {progress.graduated ? ' · 已出师' : ''}
                  {' · '}已收录纹样 {progress.collectedMotifIds.length}/{MOTIFS.length}
                </p>
              </div>
              <div className={styles.seal} aria-hidden>
                纸<br />上
              </div>
            </header>

            <Subnav active="map" onNavigate={navigateFromSubnav} />

            <div className={styles.lessonTrack}>
              {JIANZHI_LESSONS.map((lesson) => {
                const locked = lesson.order > progress.curriculumUnlocked;
                const done = progress.completedLessons.includes(lesson.id);
                const current = !locked && !done && lesson.order === progress.curriculumUnlocked;
                const cls = [
                  styles.lessonCard,
                  locked ? styles.lessonLocked : '',
                  done ? styles.lessonDone : '',
                  current ? styles.lessonCurrent : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    className={cls}
                    disabled={locked}
                    onClick={() => enterLesson(lesson)}
                  >
                    <span className={styles.sideLabel}>
                      {String(lesson.order).padStart(2, '0')} · {lesson.region}
                    </span>
                    <strong>{lesson.title}</strong>
                    <small>{lesson.subtitle}</small>
                    <em>
                      {locked ? '未解锁' : done ? '已完成' : current ? '当前功课' : '可重温'}
                    </em>
                  </button>
                );
              })}
            </div>

            {progress.graduated && (
              <section className={styles.commissionSection} aria-label="时令委托">
                <header className={styles.mapHeader}>
                  <div>
                    <p className={styles.wordmark}>时令委托</p>
                    <p className={styles.heroLead} style={{ fontSize: '0.95rem', margin: 0 }}>
                      出师后，村里把年节与喜事的剪纸托付给你。
                    </p>
                  </div>
                </header>
                {JIANZHI_COMMISSIONS.map((c) => {
                  const done = progress.completedCommissions.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.commissionCard} ${done ? styles.commissionDone : ''}`}
                      onClick={() => enterCommission(c)}
                    >
                      <span className={styles.sideLabel}>{c.season}</span>
                      <strong>{c.title}</strong>
                      <small>{c.brief}</small>
                      <em>{done ? '已交付 ✓' : '待接单'}</em>
                    </button>
                  );
                })}
              </section>
            )}
          </div>
        </div>
      )}

      {view === 'workshop' && (
        <div className={styles.workshop}>
          <div className={styles.workshopBar}>
            <button type="button" className={styles.barBack} onClick={leaveWorkshop}>
              ← 功课地图
            </button>
            <p className={styles.barTitle}>{workshopTitle}</p>
            <span className={styles.barFold}>
              {FOLD_OPTIONS.find((f) => f.id === effectiveFold)?.label}折
              {foldLocked ? ' · 本课指定' : ''}
            </span>
          </div>

          {phase === 'reading' && activeObjective ? (
            <div className={styles.workshopBody} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.reading} role="region" aria-label="拜帖研读">
                <h2 className={styles.readingTitle}>
                  {activeLesson ? '拜帖 · 先读再剪' : '委托拜帖 · 先读再剪'}
                </h2>
                <div className={styles.readingBlock}>
                  <strong>源流</strong>
                  <p style={{ margin: '6px 0 0' }}>{activeObjective.reading.origin}</p>
                </div>
                <div className={styles.readingBlock}>
                  <strong>技法</strong>
                  <p style={{ margin: '6px 0 0' }}>{activeObjective.reading.technique}</p>
                </div>
                <div className={styles.readingBlock}>
                  <strong>聚焦</strong>
                  <p style={{ margin: '6px 0 0' }}>{activeObjective.reading.focus}</p>
                </div>
                {activeObjective.narrative.map((line, i) => (
                  <div key={i} className={styles.readingBlock}>
                    <p style={{ margin: 0 }}>{line}</p>
                  </div>
                ))}
                <button type="button" className={styles.primaryBtn} onClick={beginCraft}>
                  上工
                </button>
              </div>
            </div>
          ) : (
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
                        className={`${styles.foldBtn} ${effectiveFold === opt.id ? styles.foldActive : ''}`}
                        title={foldLocked ? `本课指定：${opt.hint}` : opt.hint}
                        disabled={foldLocked}
                        aria-disabled={foldLocked}
                        onClick={() => {
                          if (foldLocked) return;
                          setFold(opt.id);
                        }}
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
                    <button type="button" className={styles.actionBtn} onClick={() => engineRef.current?.undo()}>
                      撤销
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => engineRef.current?.clear()}>
                      清空
                    </button>
                    <button type="button" className={styles.actionBtn} onClick={() => engineRef.current?.fold()}>
                      继续剪
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.unfoldBtn} ${objectiveReady ? styles.unfoldReady : ''}`}
                      onClick={handleUnfold}
                    >
                      展开 ✦
                    </button>
                  </div>
                  <div className={styles.saveRow}>
                    <button type="button" className={styles.ghostBtn} onClick={saveWork}>
                      存入作品
                    </button>
                    <button type="button" className={styles.ghostBtn} onClick={downloadCurrent}>
                      下载图片
                    </button>
                  </div>
                </div>
              </div>

              <aside className={styles.side}>
                {targetCombo && (
                  <div className={styles.comboTarget}>
                    <p className={styles.comboTargetLabel}>本课要拼的吉语</p>
                    <p className={styles.comboTargetPhrase}>{targetCombo.phrase}</p>
                    <div>
                      {targetCombo.motifIds.map((id) => {
                        const m = getMotif(id);
                        const ok = placedIds.includes(id);
                        return (
                          <span key={id} className={`${styles.comboPiece} ${ok ? styles.comboPieceOk : ''}`}>
                            {ok ? '✓ ' : ''}
                            {m?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeObjective && (
                  <div className={styles.card}>
                    <p className={styles.sideLabel}>{activeLesson ? '本课任务' : '委托任务'}</p>
                    <ul className={styles.objectiveList}>
                      {activeObjective.objectiveMode === 'any-combo' ? (
                        <li className={styles.objectiveItem}>
                          自由拼句：任选纹样凑出一句吉话，图谱会为你记下。
                        </li>
                      ) : activeObjective.objectiveMotifIds.length === 0 ? (
                        <li className={styles.objectiveItem}>自由拼句：任选纹样凑出一句吉话。</li>
                      ) : (
                        activeObjective.objectiveMotifIds.map((id) => {
                          const m = getMotif(id);
                          const done = placedIds.includes(id);
                          return (
                            <li key={id} className={`${styles.objectiveItem} ${done ? styles.objectiveOk : ''}`}>
                              <span>{done ? '✓' : '○'}</span> 剪出「{m?.name}」—— {m?.meaning}
                            </li>
                          );
                        })
                      )}
                    </ul>
                    {activeLesson && (
                      <p className={styles.focusNote}>文化聚焦：{activeLesson.culturalFocus}</p>
                    )}
                    {activeCommission && (
                      <p className={styles.focusNote}>{activeCommission.brief}</p>
                    )}
                  </div>
                )}

                {isPractice && (
                  <div className={styles.card}>
                    <p className={styles.sideLabel}>自习台</p>
                    <p className={styles.focusNote} style={{ border: 0, margin: 0, padding: 0 }}>
                      自由折剪、拼吉语、存作品。自习不推进功课进度；拼成的吉语会记入图谱。
                    </p>
                  </div>
                )}

                {formedCombos.length > 0 && (
                  <div className={styles.comboLog}>
                    <p className={styles.sideLabel}>已拼成 · 本次</p>
                    <div>
                      {formedCombos.map((c) => (
                        <span key={c.id} className={styles.comboLogItem}>
                          {c.phrase}
                        </span>
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
                          onClick={() => {
                            setSelectedMotif(m.id);
                            playSnip();
                          }}
                          title={`${m.name} · ${m.meaning}`}
                        >
                          <MotifGlyph motif={m} size={40} tone="red" />
                          <span>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {tool === 'motif' && selectedMotifDef && (
                  <div className={styles.card}>
                    <p className={styles.sideLabel}>
                      当前纹样 · {evidenceLabel(selectedMotifDef.evidence)}
                    </p>
                    <strong>
                      {selectedMotifDef.name}{' '}
                      <small>{selectedMotifDef.pinyin}</small>
                    </strong>
                    <p className={styles.focusNote}>{selectedMotifDef.meaning}</p>
                    <p className={styles.focusNote}>{selectedMotifDef.lesson}</p>
                  </div>
                )}

                {tool === 'cut' && (
                  <div className={styles.card}>
                    <p className={styles.sideLabel}>自由剪</p>
                    <p className={styles.focusNote}>
                      在亮起的折面里拖动手指或鼠标，划出的线条会从红纸中镂空。配合不同折法，一条线会变成对称的满纸花纹。
                    </p>
                  </div>
                )}
              </aside>
            </div>
          )}

          {phase === 'reveal' && (
            <div className={styles.reveal} role="dialog" aria-label="吉语揭晓">
              <div className={styles.revealInner}>
                <p className={styles.sideLabel}>展开见花</p>
                <h2 className={styles.revealPhrase}>{revealPhrase || '功课达成'}</h2>
                <p className={styles.revealPrinciple}>{revealPrinciple}</p>
                <div className={styles.revealActions}>
                  <button type="button" className={styles.primaryBtn} onClick={goQuizOrResult}>
                    继续
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'quiz' && activeQuiz && (
            <div className={styles.reveal} role="dialog" aria-label="文化小问">
              <div className={styles.revealInner}>
                <p className={styles.sideLabel}>文化小问</p>
                <h2 className={styles.readingTitle} style={{ fontSize: '1.2rem' }}>
                  {activeQuiz.question}
                </h2>
                <div className={styles.quiz}>
                  {activeQuiz.options.map((opt, i) => {
                    const picked = quizPick === i;
                    const isAnswer = i === activeQuiz.answer;
                    const showMark = quizExplainVisible && picked;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={styles.quizOption}
                        style={
                          showMark
                            ? {
                                borderColor: isAnswer ? 'var(--jz-gold)' : 'var(--jz-red)',
                                background: isAnswer ? 'rgba(201, 162, 39, 0.12)' : 'rgba(166, 51, 43, 0.08)',
                              }
                            : undefined
                        }
                        onClick={() => onQuizSelect(i)}
                      >
                        <span>{String.fromCharCode(65 + i)}.</span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {quizExplainVisible && (
                  <p className={styles.quizExplain}>{activeQuiz.explain}</p>
                )}
                {quizExplainVisible && (
                  <div className={styles.revealActions}>
                    <button type="button" className={styles.primaryBtn} onClick={finalizeCompletion}>
                      收下功课
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div className={styles.reveal} role="dialog" aria-label="功课结果">
              <div className={styles.result}>
                <p className={styles.sideLabel}>功课完成</p>
                <h2 className={styles.revealPhrase}>
                  {activeLesson?.title ?? activeCommission?.title ?? '完成'}
                </h2>
                <p className={styles.revealPrinciple}>{resultReward || '已记入工坊进度'}</p>
                <div className={styles.revealActions}>
                  {activeLesson && nextLesson && nextLessonUnlocked && (
                    <button type="button" className={styles.primaryBtn} onClick={continueNextLesson}>
                      下一课：{nextLesson.title}
                    </button>
                  )}
                  <button
                    type="button"
                    className={activeLesson && nextLesson && nextLessonUnlocked ? styles.ghostBtn : styles.primaryBtn}
                    onClick={finishToMap}
                  >
                    返回功课地图
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'codex' && (
        <div className={styles.shell}>
          <div className={styles.codex}>
            <header className={styles.mapHeader}>
              <div>
                <p className={styles.wordmark}>师傅纹样册</p>
                <h1 className={styles.heroTitle} style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                  纹样册
                </h1>
                <p className={styles.heroLead} style={{ fontSize: '0.95rem' }}>
                  每一道镂空都是一个心愿，每一句吉话都由纹样拼成。
                </p>
              </div>
              <div className={styles.seal} aria-hidden>
                图<br />鉴
              </div>
            </header>

            <Subnav active="codex" onNavigate={navigateFromSubnav} />

            <div className={styles.tabs} role="tablist">
              <button
                type="button"
                className={`${styles.tab} ${codexTab === 'motif' ? styles.tabActive : ''}`}
                onClick={() => setCodexTab('motif')}
              >
                纹样 {progress.collectedMotifIds.length}/{MOTIFS.length}
              </button>
              <button
                type="button"
                className={`${styles.tab} ${codexTab === 'combo' ? styles.tabActive : ''}`}
                onClick={() => setCodexTab('combo')}
              >
                吉语 {progress.discoveredCombos.length}/{JIANZHI_COMBOS.length}
              </button>
              <button
                type="button"
                className={`${styles.tab} ${codexTab === 'archive' ? styles.tabActive : ''}`}
                onClick={() => setCodexTab('archive')}
              >
                档案 {progress.cultureEntryIds.length}/{JIANZHI_CULTURE_ENTRIES.length}
              </button>
              <button
                type="button"
                className={`${styles.tab} ${codexTab === 'works' ? styles.tabActive : ''}`}
                onClick={() => setCodexTab('works')}
              >
                作品 {works.length}
              </button>
            </div>

            {codexTab === 'motif' && (
              <div className={styles.motifGrid}>
                {MOTIFS.map((m) => {
                  const known = progress.collectedMotifIds.includes(m.id);
                  return (
                    <article key={m.id} className={styles.archiveCard} style={known ? undefined : { opacity: 0.55 }}>
                      <MotifGlyph motif={m} size={92} tone={known ? 'red' : 'muted'} />
                      <h3>
                        {m.name} <small>{m.pinyin}</small>
                      </h3>
                      <p className={styles.focusNote}>{m.meaning}</p>
                      {known ? (
                        <>
                          <p className={styles.focusNote}>{m.lesson}</p>
                          <p className={styles.focusNote}>
                            {m.region} · {evidenceLabel(m.evidence)}
                          </p>
                          <a href={m.sourceUrl} target="_blank" rel="noreferrer">
                            资料入口：{m.sourceLabel} ↗
                          </a>
                        </>
                      ) : (
                        <p className={styles.focusNote}>在工坊里剪出这个纹样，即可解锁它的寓意与故事。</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {codexTab === 'combo' && (
              <div className={styles.motifGrid}>
                {JIANZHI_COMBOS.map((c) => {
                  const known = progress.discoveredCombos.includes(c.id);
                  return (
                    <article key={c.id} className={styles.archiveCard} style={known ? undefined : { opacity: 0.55 }}>
                      <h3>{known ? c.phrase : '＿＿＿＿'}</h3>
                      <div>
                        {c.motifIds.map((id, i) => {
                          const m = getMotif(id);
                          return (
                            <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
                              {i > 0 && <span>＋</span>}
                              {m && <MotifGlyph motif={m} size={46} tone={known ? 'red' : 'muted'} />}
                              <span>{m?.name}</span>
                            </span>
                          );
                        })}
                      </div>
                      {known ? (
                        <>
                          <p className={styles.focusNote}>{c.principle}</p>
                          <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                            {c.sourceLabel} ↗
                          </a>
                        </>
                      ) : (
                        <p className={styles.focusNote}>
                          把上面这些纹样剪到同一张纸上，就能读出这句吉话，并解锁它的成句原理。
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {codexTab === 'archive' && (
              <div className={styles.motifGrid}>
                {JIANZHI_CULTURE_ENTRIES.map((entry) => {
                  const known = progress.cultureEntryIds.includes(entry.id);
                  return (
                    <article key={entry.id} className={styles.archiveCard} style={known ? undefined : { opacity: 0.55 }}>
                      <h3>{entry.title}</h3>
                      <p className={styles.focusNote}>{entry.summary}</p>
                      {known ? (
                        <>
                          <p className={styles.focusNote}>{entry.detail}</p>
                          <p className={styles.focusNote}>
                            {entry.region} · {evidenceLabel(entry.evidence)}
                          </p>
                          <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                            资料入口：{entry.sourceLabel} ↗
                          </a>
                        </>
                      ) : (
                        <p className={styles.focusNote}>完成对应功课或委托即可解锁这条文化笔记。</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            {codexTab === 'works' && (
              <>
                {works.length === 0 ? (
                  <p className={styles.focusNote}>还没有作品。去「自习台」剪一张，再点「存入作品」吧。</p>
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
              <button type="button" className={styles.ghostBtn} onClick={() => setView('map')}>
                ← 返回功课地图
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'settings' && (
        <div className={styles.shell}>
          <header className={styles.mapHeader}>
            <div>
              <p className={styles.wordmark}>设置</p>
              <h1 className={styles.heroTitle} style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                游戏设置
              </h1>
              <p className={styles.heroLead} style={{ fontSize: '0.95rem' }}>
                动效与音效，随你习惯。
              </p>
            </div>
            <div className={styles.seal} aria-hidden>
              设<br />置
            </div>
          </header>

          <Subnav active="settings" onNavigate={navigateFromSubnav} />

          <section className={styles.settings}>
            <label className={styles.settingsRow}>
              减少动态效果（展开动画更轻）
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              />
            </label>
            <label className={styles.settingsRow}>
              静音（剪与展开的音效）
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) => updateSettings({ muted: e.target.checked })}
              />
            </label>
            <button type="button" className={styles.ghostBtn} onClick={clearAllProgress}>
              清空进度与作品
            </button>
          </section>

          <div className={styles.backRow}>
            <button type="button" className={styles.ghostBtn} onClick={() => setView('map')}>
              ← 返回功课地图
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className={styles.reveal} onClick={() => setPreview(null)} role="presentation">
          <div className={styles.revealInner} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={preview.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.dataUrl} alt={preview.name} style={{ width: '100%', borderRadius: 8 }} />
            <p className={styles.revealPhrase}>{preview.name}</p>
            <p className={styles.revealPrinciple}>
              {FOLD_OPTIONS.find((f) => f.id === preview.fold)?.label}折
              {preview.motifIds.length
                ? ` · ${preview.motifIds.map((id) => getMotif(id)?.name).filter(Boolean).join('、')}`
                : ''}
            </p>
            <div className={styles.revealActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => deleteWork(preview.id)}>
                删除
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = preview.dataUrl;
                  a.download = `${preview.name}.png`;
                  a.click();
                }}
              >
                下载
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
