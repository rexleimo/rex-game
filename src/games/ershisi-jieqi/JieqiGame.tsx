'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameOpen } from '@/core/analytics/useGameOpen';
import { trackGameFinish, trackGameStart, trackStepComplete } from '@/core/analytics';
import { GameChrome } from '@/components/game/GameChrome';
import { FirstPlayGuide } from '@/components/game/FirstPlayGuide';
import '@/styles/game-shell.css';
import type { JieqiProgress, ModeId, SeasonId, ViewId } from './core/types';
import { SEASON_META } from './core/types';
import {
  loadProgress,
  markMatchResult,
  markQuizResult,
  markSortCleared,
  markTermRead,
  saveProgress,
  setLastResult,
} from './core/progress';
import { getTerm, termsBySeason, termsInOrder } from './content/terms';
import { SortMode } from './modes/SortMode';
import { MatchMode } from './modes/MatchMode';
import { QuizMode } from './modes/QuizMode';
import styles from './JieqiGame.module.css';

const EDITION: Record<ViewId, string> = {
  home: '太阳年历',
  sort: '时序排序',
  match: '物候配对',
  quiz: '节气问答',
  codex: '节气图鉴',
  result: '本局小结',
};

export function JieqiGame() {
  useGameOpen('ershisi-jieqi');
  const [view, setView] = useState<ViewId>('home');
  const [progress, setProgress] = useState<JieqiProgress>(() => loadProgress());
  const [codexId, setCodexId] = useState(termsInOrder()[0]?.id ?? 'lichun');
  const [selectedTermId, setSelectedTermId] = useState(termsInOrder()[0]?.id ?? 'lichun');
  const [result, setResult] = useState<{
    mode: ModeId;
    title: string;
    detail: string;
    scoreLabel: string;
  } | null>(null);
  const [sortChecked, setSortChecked] = useState(false);

  useEffect(() => {
    const saved = loadProgress();
    setProgress(saved);
    const nextUnread = termsInOrder().find((term) => !saved.readTermIds.includes(term.id));
    setSelectedTermId(nextUnread?.id ?? termsInOrder()[0]?.id ?? 'lichun');
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [view]);

  const commit = useCallback((updater: (p: JieqiProgress) => JieqiProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const openMode = (mode: ModeId) => {
    setSortChecked(false);
    trackGameStart('ershisi-jieqi', mode);
    setView(mode);
  };

  const onSortComplete = useCallback(
    (payload: { season: SeasonId | 'year'; correct: boolean; score: number; targetIds: string[] }) => {
      const seasonLabel =
        payload.season === 'year' ? '全年' : `${SEASON_META[payload.season].name}季`;
      const title = payload.correct ? `${seasonLabel}时序已校准` : `${seasonLabel}时序待复习`;
      const detail = payload.correct
        ? '节气按太阳年顺序排好了。可以去图鉴回看物候与农事。'
        : '有几处顺序还需记忆，对照答案再排一次。';
      const scoreLabel = `${payload.score} 分`;

      commit((prev) => {
        let next = prev;
        if (payload.correct) next = markSortCleared(next, payload.season);
        for (const id of payload.targetIds) next = markTermRead(next, id);
        return setLastResult(next, 'sort', title, detail, scoreLabel);
      });
      setResult({ mode: 'sort', title, detail, scoreLabel });
      setSortChecked(true);
      trackGameFinish('ershisi-jieqi', 'sort', payload.correct ? 'win' : 'retry');
    },
    [commit],
  );

  const onMatchComplete = useCallback(
    (payload: { moves: number; pairs: number }) => {
      const title = '物候配对完成';
      const detail = `用 ${payload.moves} 步完成 ${payload.pairs} 组配对。步数越少，记得越牢。`;
      const scoreLabel = `${payload.moves} 步`;
      commit((prev) =>
        setLastResult(markMatchResult(prev, payload.moves), 'match', title, detail, scoreLabel),
      );
      setResult({ mode: 'match', title, detail, scoreLabel });
      trackGameFinish('ershisi-jieqi', 'match', 'win');
      setView('result');
    },
    [commit],
  );

  const onQuizComplete = useCallback(
    (payload: { score: number; total: number; correct: number }) => {
      const title = payload.score >= 80 ? '农时小考优秀' : '农时小考完成';
      const detail = `${payload.correct}/${payload.total} 题正确。讲解已写入记忆，可去图鉴巩固。`;
      const scoreLabel = `${payload.score} 分`;
      commit((prev) =>
        setLastResult(markQuizResult(prev, payload.correct), 'quiz', title, detail, scoreLabel),
      );
      setResult({ mode: 'quiz', title, detail, scoreLabel });
      trackGameFinish('ershisi-jieqi', 'quiz', payload.score >= 80 ? 'win' : 'pass');
      setView('result');
    },
    [commit],
  );

  const openCodex = (id?: string) => {
    if (id) {
      setCodexId(id);
      commit((prev) => markTermRead(prev, id));
      trackStepComplete('ershisi-jieqi', 'codex', 'term-read');
    }
    setView('codex');
  };

  const codexTerm = getTerm(codexId) ?? termsInOrder()[0];
  const selectedTerm = getTerm(selectedTermId) ?? termsInOrder()[0];
  const readCount = progress.readTermIds.length;
  const sortCount = progress.sortCleared.length;

  const seasonProgress = useMemo(() => {
    return (Object.keys(SEASON_META) as SeasonId[]).map((s) => ({
      id: s,
      ...SEASON_META[s],
      cleared: progress.sortCleared.includes(s),
      terms: termsBySeason(s),
    }));
  }, [progress.sortCleared]);

  return (
    <main className={styles.root}>
      <FirstPlayGuide
        storageKey="rex-game:jieqi:first-play-guide:v1"
        title="二十四节气使用说明"
        description="这里收录全年节气顺序、代表物候和农事常识。进度保存在本机，无需登录。"
        steps={[
          '先浏览全年节气表，点击任一节气查看日期与简要说明。',
          '排序用于记忆先后，配对用于认识物候，问答用于复习常识。',
          '打开节气图鉴，可查看物候、农事、诗句与文化说明。',
        ]}
      />
      <GameChrome title="二十四节气" edition={EDITION[view]}>
        {view === 'home' && (
          <div className={styles.home}>
            <section className={styles.almanacIntro}>
              <div>
                <p className={styles.documentType}>太阳年历</p>
                <h2>二十四节气</h2>
                <p className={styles.lead}>按时间认识节气，观察物候，理解一年中的农事节律。</p>
              </div>
              <dl className={styles.heroStats}>
                <div>
                  <dt>图鉴</dt>
                  <dd>{readCount}/24 已读</dd>
                </div>
                <div>
                  <dt>排序</dt>
                  <dd>{sortCount}/5 通关</dd>
                </div>
                <div>
                  <dt>配对</dt>
                  <dd>{progress.matchBestMoves ? `最佳 ${progress.matchBestMoves} 步` : '暂无记录'}</dd>
                </div>
              </dl>
            </section>

            {selectedTerm && (
              <section className={styles.yearSection} aria-labelledby="year-title">
                <header className={styles.sectionHead}>
                  <div>
                    <h2 id="year-title">全年节气表</h2>
                    <p>从立春到大寒，共二十四个太阳位置节点。</p>
                  </div>
                  <button type="button" className={styles.textBtn} onClick={() => openCodex()}>
                    查看完整图鉴
                  </button>
                </header>

                <div className={styles.selectedTermBar}>
                  <div className={styles.selectedTermTitle}>
                    <span>第 {String(selectedTerm.order).padStart(2, '0')} 节气</span>
                    <strong>{selectedTerm.name}</strong>
                  </div>
                  <p>{selectedTerm.oneLiner}</p>
                  <div className={styles.selectedTermMeta}>
                    <span>{SEASON_META[selectedTerm.season].name}季</span>
                    <span>{selectedTerm.dateHint}</span>
                    <button type="button" onClick={() => openCodex(selectedTerm.id)}>
                      查看条目
                    </button>
                  </div>
                </div>

                <div className={styles.seasonTable}>
                  {seasonProgress.map((season) => (
                    <section key={season.id} className={styles.seasonRow}>
                      <header className={styles.seasonLead}>
                        <div>
                          <h3>{season.name}</h3>
                          <p>{season.blurb}</p>
                        </div>
                        <em>{season.cleared ? '排序已通关' : '排序未通关'}</em>
                      </header>
                      <div className={styles.seasonTerms}>
                        {season.terms.map((term) => {
                          const read = progress.readTermIds.includes(term.id);
                          const active = term.id === selectedTerm.id;
                          return (
                            <button
                              key={term.id}
                              type="button"
                              className={`${styles.termNode} ${read ? styles.termNodeRead : ''} ${active ? styles.termNodeActive : ''}`}
                              onClick={() => setSelectedTermId(term.id)}
                              aria-pressed={active}
                            >
                              <span>{String(term.order).padStart(2, '0')}</span>
                              <strong>{term.name}</strong>
                              <small>{term.dateHint.replace('约 ', '')}</small>
                              <i>{read ? '已读' : '未读'}</i>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            )}

            <section className={styles.playDock} aria-labelledby="play-title">
              <header className={styles.sectionHead}>
                <div>
                  <h2 id="play-title">选择玩法</h2>
                  <p>三种练习对应时序、物候和常识。</p>
                </div>
              </header>
              <div className={styles.playList}>
                <button type="button" className={styles.playRow} onClick={() => openMode('sort')}>
                  <span className={styles.playName}>
                    <strong>时序排序</strong>
                    <small>从一季六节开始，按先后放回时间轴。</small>
                  </span>
                  <span className={styles.playRecord}>{sortCount}/5 通关</span>
                  <span className={styles.playAction}>进入</span>
                </button>
                <button type="button" className={styles.playRow} onClick={() => openMode('match')}>
                  <span className={styles.playName}>
                    <strong>物候配对</strong>
                    <small>翻开十二张牌，连接节气名与代表物候。</small>
                  </span>
                  <span className={styles.playRecord}>
                    {progress.matchBestMoves ? `最佳 ${progress.matchBestMoves} 步` : '暂无记录'}
                  </span>
                  <span className={styles.playAction}>进入</span>
                </button>
                <button type="button" className={styles.playRow} onClick={() => openMode('quiz')}>
                  <span className={styles.playName}>
                    <strong>节气问答</strong>
                    <small>八道题复习物候、农事和节令常识。</small>
                  </span>
                  <span className={styles.playRecord}>{progress.quizRuns} 局完成</span>
                  <span className={styles.playAction}>进入</span>
                </button>
                <button type="button" className={styles.playRow} onClick={() => openCodex()}>
                  <span className={styles.playName}>
                    <strong>节气图鉴</strong>
                    <small>查阅二十四节气的日期、物候、农事与诗句。</small>
                  </span>
                  <span className={styles.playRecord}>{readCount}/24 已读</span>
                  <span className={styles.playAction}>打开</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {view === 'sort' && (
          <>
            <SortMode onBack={() => setView('home')} onComplete={onSortComplete} />
            {sortChecked && (
              <div className={styles.floatingNext}>
                <button type="button" className={styles.primaryBtn} onClick={() => setView('result')}>
                  查看本局小结
                </button>
              </div>
            )}
          </>
        )}

        {view === 'match' && (
          <MatchMode onBack={() => setView('home')} onComplete={onMatchComplete} />
        )}

        {view === 'quiz' && (
          <QuizMode onBack={() => setView('home')} onComplete={onQuizComplete} />
        )}

        {view === 'codex' && codexTerm && (
          <div className={styles.codex}>
            <div className={styles.modeHeadRow}>
              <button type="button" className={styles.ghostBtn} onClick={() => setView('home')}>
                返回
              </button>
              <p className={styles.codexProgress}>图鉴进度 {readCount}/24</p>
            </div>
            <div className={styles.codexLayout}>
              <aside className={styles.codexList}>
                {seasonProgress.map((season) => (
                  <section key={season.id} className={styles.codexSeason}>
                    <h3>
                      <span>{season.order}</span>
                      {season.name}季
                    </h3>
                    <div>
                      {season.terms.map((term) => (
                        <button
                          key={term.id}
                          type="button"
                          className={term.id === codexTerm.id ? styles.codexItemActive : styles.codexItem}
                          onClick={() => {
                            setCodexId(term.id);
                            commit((prev) => markTermRead(prev, term.id));
                          }}
                        >
                          <span>{String(term.order).padStart(2, '0')}</span>
                          <strong>{term.name}</strong>
                          {progress.readTermIds.includes(term.id) && <i>已读</i>}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </aside>
              <article
                className={styles.codexDetail}
                style={{ ['--tint' as string]: codexTerm.tint }}
              >
                <header>
                  <span className={styles.codexGlyph}>{String(codexTerm.order).padStart(2, '0')}</span>
                  <div>
                    <p className={styles.codexMeta}>
                      第 {codexTerm.order} 节气，{SEASON_META[codexTerm.season].name}季
                    </p>
                    <h2>{codexTerm.name}</h2>
                    <p>{codexTerm.dateHint}</p>
                  </div>
                </header>
                <p className={styles.codexOne}>{codexTerm.oneLiner}</p>
                <dl className={styles.codexFacts}>
                  <div>
                    <dt>物候</dt>
                    <dd>{codexTerm.phenology}</dd>
                  </div>
                  <div>
                    <dt>农事</dt>
                    <dd>{codexTerm.farming}</dd>
                  </div>
                  <div>
                    <dt>诗句</dt>
                    <dd>{codexTerm.verse}</dd>
                  </div>
                </dl>
                <p className={styles.codexLore}>{codexTerm.lore}</p>
              </article>
            </div>
          </div>
        )}

        {view === 'result' && result && (
          <div className={styles.result}>
            <p className={styles.resultLabel}>本局小结</p>
            <h2>{result.title}</h2>
            <p className={styles.resultScore}>{result.scoreLabel}</p>
            <p className={styles.lead}>{result.detail}</p>
            <div className={styles.modeActions}>
              <button type="button" className={styles.ghostBtn} onClick={() => setView('home')}>
                回首页
              </button>
              <button type="button" className={styles.primaryBtn} onClick={() => openMode(result.mode)}>
                再来一局
              </button>
              <button type="button" className={styles.primaryBtn} onClick={() => openCodex()}>
                打开图鉴
              </button>
            </div>
          </div>
        )}
      </GameChrome>
    </main>
  );
}
