'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameOpen } from '@/core/analytics/useGameOpen';
import { trackGameFinish, trackGameStart, trackStepComplete } from '@/core/analytics';
import { GameChrome } from '@/components/game/GameChrome';
import { FirstPlayGuide } from '@/components/game/FirstPlayGuide';
import '@/styles/game-shell.css';
import { Codex } from './modes/Codex';
import type { JiaguProgress, JiaguModeId, ViewId, MatchRun, SenseRun, OmenRun, OracleGlyph } from './core/types';
import {
  createInitialProgress,
  loadProgress,
  recordKnownIds,
  clearMistakeIds,
  saveProgress,
  shuffle,
} from './core/progress';
import { GLYPHS, CURRICULUM_GLYPH_COUNT } from './content/glyphs';
import { OMENS } from './content/omens';
import { ORACLE_CATALOG_FORMS, ORACLE_CATALOG_FORM_COUNT } from './content/oracleCatalog';
import { MatchMode } from './modes/MatchMode';
import { SenseMode, buildSenseItems } from './modes/SenseMode';
import { OmenMode } from './modes/OmenMode';
import { CraftMode } from './modes/CraftMode';
import { ReviewMode } from './modes/ReviewMode';
import { ReferenceMode } from './modes/ReferenceMode';
import styles from './JiaguGame.module.css';

const EDITION: Record<ViewId, string> = {
  home: '甲骨问契',
  daily: '今日三契',
  match: '辨形配对',
  sense: '契意三选一',
  omen: '卜辞填空',
  craft: '部件造字',
  review: '错题复习',
  reference: '字形寻踪',
  codex: '字图鉴',
  result: '本局小结',
};

const DAILY_MATCH_PAIRS = 3;
const DAILY_SENSE_COUNT = 2;
const DAILY_OMEN_COUNT = 1;

export function JiaguGame() {
  useGameOpen('jiaguwen');
  const [view, setView] = useState<ViewId>('home');
  const [progress, setProgress] = useState<JiaguProgress>(() => createInitialProgress());
  const [result, setResult] = useState<{
    mode: JiaguModeId;
    title: string;
    detail: string;
    scoreLabel: string;
  } | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [view]);

  const commit = useCallback((updater: (p: JiaguProgress) => JiaguProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const glyphPool = useMemo(() => {
    const known = progress.knownIds.length;
    if (known >= 16) return GLYPHS;
    if (known >= 6) return GLYPHS.filter((g) => g.tier <= 2);
    return GLYPHS.filter((g) => g.tier === 1);
  }, [progress.knownIds.length]);

  const openMode = (mode: JiaguModeId) => {
    trackGameStart('jiaguwen', mode);
    setView(mode);
  };

  const unlockDailyKnown = (glyphIds: string[], correctCount: number) => {
    if (glyphIds.length === 0 || correctCount === 0) return;
    commit((prev) => {
      const next = recordKnownIds(prev, glyphIds);
      return {
        ...next,
        correctTotal: next.correctTotal + correctCount,
        runs: { ...next.runs, daily: next.runs.daily + 1 },
      };
    });
  };

  const onDailyComplete = useCallback(
    (payload: { match: { moves: number }; sense: { correct: number; total: number }; omen: { correct: number } }) => {
      const { match, sense, omen } = payload;
      const newKnown: string[] = [];
      if (match.moves > 0) newKnown.push(...sampleKnownFromMatch(DAILY_MATCH_PAIRS));
      if (sense.correct >= sense.total) {
        newKnown.push(...getDailySenseGlyphs().slice(0, DAILY_SENSE_COUNT).map((g) => g.id));
      }
      if (omen.correct > 0) {
        const omenItem = getDailyOmen();
        if (omenItem) newKnown.push(omenItem.blankId);
      }
      const correctCount = (match.moves > 0 ? DAILY_MATCH_PAIRS : 0) + sense.correct + omen.correct;
      unlockDailyKnown([...new Set(newKnown)], correctCount);

      const title = '今日三契完成';
      const detail = '辨形、契意、卜辞各走了一遍。新认识的字已记入图鉴。';
      const scoreLabel = `${sense.correct + omen.correct}/${DAILY_SENSE_COUNT + DAILY_OMEN_COUNT} 题全对 · ${match.moves} 步`;
      setResult({ mode: 'daily', title, detail, scoreLabel });
      trackGameFinish('jiaguwen', 'daily', 'win');
      setView('result');
    },
    [commit],
  );

  const onMatchComplete = useCallback(
    (payload: { moves: number; knownIds: string[]; missedIds?: string[] }) => {
      const title = '辨形完成';
      const detail = `用 ${payload.moves} 步完成配对。配对的字已加入已识字库。`;
      const scoreLabel = `${payload.moves} 步`;
      commit((prev) => {
        const next = recordKnownIds(prev, payload.knownIds);
        const best = next.bestMatchMoves == null ? payload.moves : Math.min(next.bestMatchMoves, payload.moves);
        return {
          ...next,
          bestMatchMoves: best,
          correctTotal: next.correctTotal + payload.knownIds.length,
          runs: { ...next.runs, match: next.runs.match + 1 },
          mistakeIds: payload.missedIds?.length ? [...new Set([...next.mistakeIds, ...payload.missedIds])] : next.mistakeIds,
        };
      });
      setResult({ mode: 'match', title, detail, scoreLabel });
      trackGameFinish('jiaguwen', 'match', 'win');
      setView('result');
    },
    [commit],
  );

  const onSenseComplete = useCallback(
    (payload: { correct: number; total: number; knownIds: string[]; missedIds?: string[] }) => {
      const title = payload.correct >= payload.total ? '契意全对' : '契意完成';
      const detail = `${payload.correct}/${payload.total} 题正确。答对的字义已写入记忆。`;
      const scoreLabel = `${payload.correct}/${payload.total}`;
      commit((prev) => {
        const next = recordKnownIds(prev, payload.knownIds);
        return {
          ...next,
          correctTotal: next.correctTotal + payload.correct,
          runs: { ...next.runs, sense: next.runs.sense + 1 },
          mistakeIds: payload.missedIds?.length ? [...new Set([...next.mistakeIds, ...payload.missedIds])] : next.mistakeIds,
        };
      });
      setResult({ mode: 'sense', title, detail, scoreLabel });
      trackGameFinish('jiaguwen', 'sense', payload.correct >= payload.total ? 'win' : 'pass');
      setView('result');
    },
    [commit],
  );

  const onOmenComplete = useCallback(
    (payload: { correct: number; total: number; knownIds: string[]; missedIds?: string[] }) => {
      const title = payload.correct >= payload.total ? '卜辞通读' : '卜辞完成';
      const detail = '卜辞是古人向未知发问的短句。填对的字已加入已识字库。';
      const scoreLabel = `${payload.correct}/${payload.total}`;
      commit((prev) => {
        const next = recordKnownIds(prev, payload.knownIds);
        return {
          ...next,
          correctTotal: next.correctTotal + payload.correct,
          runs: { ...next.runs, omen: next.runs.omen + 1 },
          mistakeIds: payload.missedIds?.length ? [...new Set([...next.mistakeIds, ...payload.missedIds])] : next.mistakeIds,
        };
      });
      setResult({ mode: 'omen', title, detail, scoreLabel });
      trackGameFinish('jiaguwen', 'omen', payload.correct >= payload.total ? 'win' : 'pass');
      setView('result');
    },
    [commit],
  );

  const onCraftComplete = useCallback(
    (payload: { correct: number; total: number; knownIds: string[] }) => {
      const title = payload.correct >= payload.total ? '部件通晓' : '部件造字完成';
      const detail = `${payload.correct}/${payload.total} 题正确。拼对的部件字已加入已识字库。`;
      const scoreLabel = `${payload.correct}/${payload.total}`;
      commit((prev) => {
        const next = recordKnownIds(prev, payload.knownIds);
        return {
          ...next,
          correctTotal: next.correctTotal + payload.correct,
          runs: { ...next.runs, craft: next.runs.craft + 1 },
        };
      });
      setResult({ mode: 'craft', title, detail, scoreLabel });
      trackGameFinish('jiaguwen', 'craft', payload.correct >= payload.total ? 'win' : 'pass');
      setView('result');
    },
    [commit],
  );

  const onReviewComplete = useCallback(
    (payload: { correct: number; total: number; knownIds: string[]; clearedIds: string[] }) => {
      const title = payload.correct >= payload.total ? '错题清零' : '错题复习完成';
      const detail = `${payload.correct}/${payload.total} 题正确。答对的字已移出错题本。`;
      const scoreLabel = `${payload.correct}/${payload.total}`;
      commit((prev) => {
        const next = recordKnownIds(prev, payload.knownIds);
        return {
          ...next,
          correctTotal: next.correctTotal + payload.correct,
          runs: { ...next.runs, review: next.runs.review + 1 },
          mistakeIds: clearMistakeIds(next, payload.clearedIds).mistakeIds,
        };
      });
      setResult({ mode: 'review', title, detail, scoreLabel });
      trackGameFinish('jiaguwen', 'review', payload.correct >= payload.total ? 'win' : 'pass');
      setView('result');
    },
    [commit],
  );

  const onReferenceComplete = useCallback(
    (payload: { correct: number; total: number }) => {
      commit((prev) => ({
        ...prev,
        correctTotal: prev.correctTotal + payload.correct,
        runs: { ...prev.runs, reference: prev.runs.reference + 1 },
      }));
      setResult({
        mode: 'reference',
        title: '字形寻踪完成',
        detail: '你比看了公开字形样本与上游释读字头。它们是探索线索，不替代具体字例与学术释读。',
        scoreLabel: `${payload.correct}/${payload.total}`,
      });
      trackGameFinish('jiaguwen', 'reference', payload.correct >= payload.total ? 'win' : 'pass');
      setView('result');
    },
    [commit],
  );

  const openCodex = () => setView('codex');

  const onCodexRead = useCallback(
    (id: string) => {
      commit((prev) => {
        if (prev.readIds.includes(id)) return prev;
        return { ...prev, readIds: [...prev.readIds, id] };
      });
      trackStepComplete('jiaguwen', 'codex', 'glyph-read');
    },
    [commit],
  );

  return (
    <main className={styles.root}>
      <FirstPlayGuide
        storageKey="rex-game:jiaguwen:first-play-guide:v1"
        title="甲骨问契使用说明"
        description="甲骨文是商代刻在龟甲兽骨上的文字。这里的字形为教学示意，帮助理解「字为什么长这样」。"
        steps={[
          '「今日三契」把辨形、契意、卜辞串成一局，最适合初次体验。',
          '「字图鉴」可回看已识字的形、义与文化说明。',
          '进度只保存在本机浏览器，无登录、无上传。',
        ]}
      />
      <GameChrome title="甲骨问契" edition={EDITION[view]}>
        {view === 'home' && (
          <div className={styles.home}>
            <section className={styles.intro}>
              <p className={styles.documentType}>契文与卜事</p>
              <h2>甲骨问契 · 字与卜</h2>
              <p className={styles.lead}>
                从课程字认识象形线条，再在公开字形索引中对照更多异体与释读字头。
              </p>
              <dl className={styles.heroStats}>
                <div>
                  <dt>已识课程字</dt>
                  <dd>{progress.knownIds.length}/{CURRICULUM_GLYPH_COUNT}</dd>
                </div>
                <div>
                  <dt>教学图鉴</dt>
                  <dd>{progress.readIds.length}/{CURRICULUM_GLYPH_COUNT} 已读</dd>
                </div>
              </dl>
            </section>

            <section className={styles.modeGrid}>
              <button type="button" className={styles.modeCard} onClick={() => openMode('daily')}>
                <span className={styles.modeName}>今日三契</span>
                <span className={styles.modeDesc}>一局走通辨形、契意、卜辞</span>
              </button>
              <button type="button" className={styles.modeCard} onClick={() => openMode('match')}>
                <span className={styles.modeName}>辨形配对</span>
                <span className={styles.modeDesc}>把甲骨形和汉字连起来</span>
              </button>
              <button type="button" className={styles.modeCard} onClick={() => openMode('sense')}>
                <span className={styles.modeName}>契意三选一</span>
                <span className={styles.modeDesc}>看形象，选字义</span>
              </button>
              <button type="button" className={styles.modeCard} onClick={() => openMode('omen')}>
                <span className={styles.modeName}>卜辞填空</span>
                <span className={styles.modeDesc}>读懂一句问事的短句</span>
              </button>
              <button type="button" className={styles.modeCard} onClick={() => openMode('reference')}>
                <span className={styles.modeName}>字形寻踪</span>
                <span className={styles.modeDesc}>从 {ORACLE_CATALOG_FORM_COUNT.toLocaleString()} 个公开样本中辨认字头</span>
              </button>
              <button type="button" className={styles.modeCard} onClick={() => openMode('craft')}>
                <span className={styles.modeName}>部件造字</span>
                <span className={styles.modeDesc}>用甲骨部件拼出合体字</span>
              </button>
              {progress.mistakeIds.length > 0 && (
                <button type="button" className={`${styles.modeCard} ${styles.modeCardAlert}`} onClick={() => openMode('review')}>
                  <span className={styles.modeName}>错题复习</span>
                  <span className={styles.modeDesc}>{progress.mistakeIds.length} 个待复习的字</span>
                </button>
              )}
            </section>

            <section className={styles.codexTeaser}>
              <p className={styles.documentType}>字图鉴</p>
              <p className={styles.lead}>教学图鉴已识 {progress.knownIds.length} 字；公开字形索引可检索 {ORACLE_CATALOG_FORM_COUNT.toLocaleString()} 个样本。</p>
              <button type="button" className={styles.secondaryBtn} onClick={openCodex}>
                打开图鉴 →
              </button>
            </section>
          </div>
        )}

        {view === 'daily' && (
          <DailyRun
            pool={glyphPool}
            onComplete={onDailyComplete}
            onBack={() => setView('home')}
          />
        )}

        {view === 'match' && (
          <MatchMode pool={glyphPool} pairCount={4} onComplete={onMatchComplete} onBack={() => setView('home')} />
        )}

        {view === 'sense' && (
          <SenseMode pool={glyphPool} itemCount={4} onComplete={onSenseComplete} onBack={() => setView('home')} />
        )}

        {view === 'omen' && (
          <OmenMode itemCount={3} onComplete={onOmenComplete} onBack={() => setView('home')} />
        )}

        {view === 'craft' && (
          <CraftMode itemCount={5} onComplete={onCraftComplete} onBack={() => setView('home')} />
        )}

        {view === 'review' && (
          <ReviewMode
            mistakeIds={progress.mistakeIds}
            itemCount={Math.min(5, Math.max(3, progress.mistakeIds.length))}
            onComplete={onReviewComplete}
            onBack={() => setView('home')}
          />
        )}

        {view === 'reference' && (
          <ReferenceMode forms={ORACLE_CATALOG_FORMS} itemCount={6} onComplete={onReferenceComplete} onBack={() => setView('home')} />
        )}

        {view === 'codex' && (
          <Codex knownIds={progress.knownIds} onRead={onCodexRead} onBack={() => setView('home')} />
        )}

        {view === 'result' && result && (
          <div className={styles.result}>
            <p className={styles.eyebrow}>{EDITION.result}</p>
            <h2>{result.title}</h2>
            <p className={styles.lead}>{result.detail}</p>
            <p className={styles.scoreLabel}>{result.scoreLabel}</p>
            <div className={styles.resultActions}>
              <button type="button" className={styles.primaryBtn} onClick={() => setView('home')}>
                回首页
              </button>
              <button type="button" className={styles.secondaryBtn} onClick={() => openCodex()}>
                去图鉴
              </button>
            </div>
          </div>
        )}
      </GameChrome>
    </main>
  );
}

function getDailySenseGlyphs(): typeof GLYPHS {
  return shuffle(GLYPHS.filter((g) => g.tier === 1)).slice(0, DAILY_SENSE_COUNT + DAILY_OMEN_COUNT);
}

function getDailyOmen(): typeof OMENS[number] | undefined {
  return shuffle(OMENS)[0];
}

function sampleKnownFromMatch(pairCount: number): string[] {
  return shuffle(GLYPHS.filter((g) => g.tier <= 2)).slice(0, pairCount).map((g) => g.id);
}

function DailyRun({
  pool,
  onComplete,
  onBack,
}: {
  pool: OracleGlyph[];
  onComplete: (payload: {
    match: { moves: number };
    sense: { correct: number; total: number };
    omen: { correct: number };
  }) => void;
  onBack: () => void;
}) {
  const [step, setStep] = useState<'match' | 'sense' | 'omen' | 'done'>('match');
  const [matchMoves, setMatchMoves] = useState(0);
  const [senseCorrect, setSenseCorrect] = useState(0);

  const senseGlyphs = useMemo(() => shuffle(pool.slice()).slice(0, DAILY_SENSE_COUNT), [pool]);
  const omenItem = useMemo(() => shuffle(OMENS)[0], []);

  if (step === 'match') {
    return (
      <MatchMode
        pool={pool}
        pairCount={DAILY_MATCH_PAIRS}
        onComplete={(p) => {
          setMatchMoves(p.moves);
          setStep('sense');
        }}
        onBack={onBack}
      />
    );
  }

  if (step === 'sense') {
    const items = buildSenseItems(senseGlyphs, senseGlyphs.length);
    return (
      <SenseMode
        pool={pool}
        items={items}
        itemCount={items.length}
        onComplete={(p) => {
          setSenseCorrect(p.correct);
          setStep('omen');
        }}
        onBack={() => setStep('match')}
      />
    );
  }

  if (step === 'omen') {
    return (
      <OmenMode
        items={[omenItem]}
        itemCount={1}
        onComplete={(p) => {
          onComplete({
            match: { moves: matchMoves },
            sense: { correct: senseCorrect, total: DAILY_SENSE_COUNT },
            omen: { correct: p.correct },
          });
        }}
        onBack={() => setStep('sense')}
      />
    );
  }

  return null;
}
