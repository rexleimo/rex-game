'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { FirstPlayGuide } from '@/components/game/FirstPlayGuide';
import { GameChrome } from '@/components/game/GameChrome';
import '@/styles/game-shell.css';

import { getArtifactArt } from './content/artifactArt';
import { ARTIFACTS, TYPE_LABEL, getArtifact, listArtifactsByRegion } from './content/artifacts';
import { FESTIVAL_TOPICS, getFestival, suggestFestivalIds } from './content/festivals';
import { REGIONS, getRegion } from './content/regions';
import { CultureCardView } from './components/CultureCardView';
import { RegionMotif } from './components/RegionMotif';
import {
  createInitialProgress,
  exportProgressJson,
  loadProgress,
  markReadCore,
  markRestored,
  readCount,
  restoredCount,
  saveProgress,
} from './core/progress';
import type { LoreCard, ShanhaiProgress, ViewId } from './core/types';
import { QuizRestore } from './restore/QuizRestore';
import { ShapePuzzle } from './restore/ShapePuzzle';
import styles from './ShanhaiGame.module.css';

export function ShanhaiGame() {
  const [progress, setProgress] = useState<ShanhaiProgress | null>(null);
  const [view, setView] = useState<ViewId>('home');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [postRestore, setPostRestore] = useState(false);
  const [acked, setAcked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [codexFilter, setCodexFilter] = useState<string>('all');
  const [festivalId, setFestivalId] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const commit = useCallback((next: ShanhaiProgress) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const region = useMemo(
    () => getRegion(progress?.regionId ?? 'R01'),
    [progress?.regionId],
  );

  const regionArtifacts = useMemo(
    () => listArtifactsByRegion(region.id),
    [region.id],
  );

  const activeCard = useMemo(
    () => (activeId ? getArtifact(activeId) : undefined),
    [activeId],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  const setRegion = (id: string) => {
    if (!progress) return;
    commit({ ...progress, regionId: id });
    setCodexFilter('all');
    showToast(`进入展区：${getRegion(id).name}`);
  };

  const openRestore = (id: string) => {
    setActiveId(id);
    setPostRestore(false);
    setAcked(Boolean(progress?.artifacts[id]?.readCore));
    setView('restore');
  };

  const openCard = (id: string, fromRestore = false) => {
    setActiveId(id);
    setPostRestore(fromRestore);
    setAcked(Boolean(progress?.artifacts[id]?.readCore));
    setView('card');
  };

  const onRestoreDone = (card: LoreCard, score: number) => {
    if (!progress) return;
    const next = markRestored(progress, card.id, score, card.learnIds);
    commit(next);
    setPostRestore(true);
    setAcked(false);
    setView('card');
    showToast(`修复完成 · 评价 ${next.artifacts[card.id]?.grade ?? ''}`);
  };

  const onAck = () => {
    if (!progress || !activeId) return;
    commit(markReadCore(progress, activeId));
    setAcked(true);
  };

  const copyTellable = async (text: string) => {
    try {
      await navigator.clipboard.writeText(`「${text}」——《山海拾遗》`);
      showToast('已复制可讲述句');
    } catch {
      showToast('复制失败，请长按文案手动复制');
    }
  };

  const codexList = useMemo(() => {
    const arts = progress?.artifacts ?? {};
    let list = regionArtifacts;
    if (codexFilter === 'todo') list = list.filter((a) => !arts[a.id]?.restored);
    else if (codexFilter === 'done') list = list.filter((a) => arts[a.id]?.restored);
    else if (codexFilter !== 'all') list = list.filter((a) => a.types.includes(codexFilter));
    return list;
  }, [codexFilter, progress?.artifacts, regionArtifacts]);

  const nav = useMemo(
    () =>
      [
        { id: 'home' as ViewId, label: '展厅' },
        { id: 'map' as ViewId, label: `${region.name}路线` },
        { id: 'festival' as ViewId, label: '岁时' },
        { id: 'codex' as ViewId, label: '山海册' },
        { id: 'museum' as ViewId, label: '藏馆' },
        { id: 'about' as ViewId, label: '关于' },
      ] as const,
    [region.name],
  );

  const suggestedFestivals = useMemo(() => suggestFestivalIds(), []);
  const activeFestival = festivalId ? getFestival(festivalId) : null;

  if (!progress) {
    return (
      <GameChrome title="山海拾遗" edition="文化展 · 加载中">
        <div className={styles.root}>
          <div className={styles.shell}>
            <p className={styles.panelLead}>正在展开山海册…</p>
          </div>
        </div>
      </GameChrome>
    );
  }

  const rCount = restoredCount(progress);
  const kCount = readCount(progress);
  const learnDone = region.learnPoints.filter((p) => progress.learnedIds.includes(p.id)).length;
  const regionRestored = regionArtifacts.filter((a) => progress.artifacts[a.id]?.restored).length;

  const regionSwitcher = (
    <div className={styles.nav} style={{ marginTop: 0 }} role="tablist" aria-label="选择展区">
      {REGIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          role="tab"
          aria-selected={region.id === r.id}
          className={`${styles.navBtn} ${region.id === r.id ? styles.navBtnActive : ''}`}
          onClick={() => setRegion(r.id)}
        >
          {r.name}
          <span style={{ opacity: 0.75, marginLeft: 4, fontSize: '0.8em' }}>
            ({listArtifactsByRegion(r.id).filter((a) => progress.artifacts[a.id]?.restored).length}/
            {listArtifactsByRegion(r.id).length})
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <GameChrome title="山海拾遗" edition={`公益文化 · ${ARTIFACTS.length} 卡 · 全图`}>
      <div
        className={styles.root}
        style={{ ['--region-accent' as string]: region.accent }}
      >
        <div className={styles.shell}>
          <nav className={styles.nav} aria-label="山海拾遗导航">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.navBtn} ${view === item.id ? styles.navBtnActive : ''}`}
                onClick={() => {
                  if (item.id === 'map') commit({ ...progress, visitedMap: true });
                  setView(item.id);
                  setActiveId(null);
                  setPostRestore(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {(view === 'home' || view === 'map' || view === 'codex') && regionSwitcher}

          {view === 'home' && (
            <section className={styles.hero}>
              <div>
                <p className={styles.eyebrow}>Shanhai Shiyi · {region.name}</p>
                <h2>修一件器物，读懂一段中国故事</h2>
                <p className={styles.heroLead}>
                  公益 Web 文化互动：无登录、无商城。八大展区共 {ARTIFACTS.length}{' '}
                  张文化卡。当前在「{region.name}」——{region.blurb[0]}
                </p>
                <div className={styles.heroActions}>
                  <button
                    type="button"
                    className="gs-btn gs-btn--primary"
                    onClick={() => {
                      const starters: Record<string, string> = {
                        R01: 'A-R01-SR-001',
                        R02: 'A-R02-SR-001',
                        R03: 'A-R03-SR-001',
                        R04: 'A-R04-SR-001',
                        R05: 'A-R05-SR-001',
                        R06: 'A-R06-SR-001',
                        R07: 'A-R07-SR-001',
                        R08: 'A-R08-SR-001',
                      };
                      openRestore(starters[region.id] ?? 'A-R01-SR-001');
                    }}
                  >
                    {
                      (
                        {
                          R01: '从修鼎开始',
                          R02: '从凤鸟开始',
                          R03: '从纵目开始',
                          R04: '从瓷瓶开始',
                          R05: '从胡马开始',
                          R06: '从昆仑开始',
                          R07: '从春联开始',
                          R08: '从海船开始',
                        } as Record<string, string>
                      )[region.id] ?? '开始拾遗'
                    }
                  </button>
                  <button
                    type="button"
                    className="gs-btn gs-btn--ghost"
                    onClick={() => {
                      setFestivalId(suggestedFestivals[0] ?? 'spring');
                      setView('festival');
                    }}
                  >
                    岁时专题
                  </button>
                  <button
                    type="button"
                    className="gs-btn gs-btn--ghost"
                    onClick={() => {
                      commit({ ...progress, visitedMap: true });
                      setView('map');
                    }}
                  >
                    走{region.name}路线
                  </button>
                  <button
                    type="button"
                    className="gs-btn gs-btn--ghost"
                    onClick={() => setView('codex')}
                  >
                    打开山海册
                  </button>
                </div>
                <div className={styles.stats} aria-label="本地学习进度" style={{ marginTop: '1.1rem' }}>
                  <div className={styles.stat}>
                    <strong>{rCount}</strong>
                    <span>总已修复</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>
                      {regionRestored}/{regionArtifacts.length}
                    </strong>
                    <span>{region.name}进度</span>
                  </div>
                  <div className={styles.stat}>
                    <strong>
                      {learnDone}/{region.learnPoints.length}
                    </strong>
                    <span>本区必学</span>
                  </div>
                </div>
              </div>
              <div className={styles.heroVisual}>
                {region.art ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.heroArt}
                    src={region.art}
                    alt={`${region.name}展区主视觉`}
                    width={480}
                    height={480}
                  />
                ) : (
                  <RegionMotif
                    regionId={region.id}
                    accent={region.accent}
                    className={styles.heroMotif}
                  />
                )}
              </div>
            </section>
          )}

          {view === 'home' && (
            <section className={styles.panel}>
              <h2>{region.name}印象</h2>
              <ul className={styles.blurbList}>
                {region.blurb.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <h2>本区必学点</h2>
              <ul className={styles.learnList}>
                {region.learnPoints.map((lp) => {
                  const done = progress.learnedIds.includes(lp.id);
                  return (
                    <li key={lp.id}>
                      <span className={done ? styles.learnDone : styles.learnTodo} aria-hidden>
                        {done ? '✓' : '○'}
                      </span>
                      <span>{lp.goal}</span>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.panelLead}>
                另有展区：
                {REGIONS.filter((r) => r.id !== region.id).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="gs-btn gs-btn--ghost"
                    style={{ marginRight: 8, marginTop: 8 }}
                    onClick={() => setRegion(r.id)}
                  >
                    前往{r.name}
                  </button>
                ))}
              </p>
            </section>
          )}

          {view === 'map' && (
            <section className={styles.panel}>
              <h2>
                {region.name} · 推荐观展路线
              </h2>
              <p className={styles.panelLead}>
                三条短路线，无体力、无战斗。其余卡片请在「山海册」自由选学。
              </p>
              {region.routes.map((route) => (
                <div key={route.id} style={{ marginBottom: '1.35rem' }}>
                  <h3 style={{ margin: '0 0 0.35rem', fontFamily: 'serif', fontSize: '1.1rem' }}>
                    {route.title}
                  </h3>
                  <p className={styles.panelLead}>{route.intro}</p>
                  <div className={styles.route}>
                    {route.stops.map((stop, i) => {
                      const art = stop.artifactId ? getArtifact(stop.artifactId) : undefined;
                      const done = stop.artifactId
                        ? Boolean(progress.artifacts[stop.artifactId]?.restored)
                        : false;
                      if (stop.kind === 'plaque' || stop.kind === 'summary') {
                        return (
                          <div
                            key={stop.id}
                            className={`${styles.routeItem} ${styles.routeDone}`}
                            style={{ cursor: 'default' }}
                          >
                            <span className={styles.routeIndex}>{i + 1}</span>
                            <div className={styles.routeMeta}>
                              <strong>{stop.title}</strong>
                              <span>{stop.body}</span>
                            </div>
                            <span className={styles.badge}>
                              {stop.kind === 'summary' ? '小结' : '说明'}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={stop.id}
                          type="button"
                          className={`${styles.routeItem} ${done ? styles.routeDone : ''}`}
                          onClick={() => art && openRestore(art.id)}
                        >
                          <span className={styles.routeIndex}>{i + 1}</span>
                          <div className={styles.routeMeta}>
                            <strong>{stop.title}</strong>
                            <span>{art?.oneLiner ?? '互动展点'}</span>
                          </div>
                          <span className={styles.badge}>{done ? '已修' : '可修'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {learnDone >= region.learnPoints.length && (
                <div style={{ marginTop: '0.5rem' }}>
                  <h2>区域小结</h2>
                  <p className={styles.plaque}>{region.summary.join('\n')}</p>
                </div>
              )}
            </section>
          )}

          {view === 'festival' && (
            <section className={styles.panel}>
              <h2>岁时专题</h2>
              <p className={styles.panelLead}>
                按节日学民俗与节气。近期可关注：
                {suggestedFestivals
                  .map((id) => getFestival(id)?.name)
                  .filter(Boolean)
                  .join('、')}
                。也可切换到展区「岁时」走导览路线。
              </p>
              <div className={styles.grid}>
                {FESTIVAL_TOPICS.map((f) => {
                  const done = f.artifactIds.filter((id) => progress.artifacts[id]?.restored).length;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={styles.gridCard}
                      onClick={() => setFestivalId(f.id)}
                    >
                      <strong>{f.name}</strong>
                      <p>{f.oneLiner}</p>
                      <span className={styles.badge}>
                        {f.monthHint} · 进度 {done}/{f.artifactIds.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {activeFestival && (
                <div style={{ marginTop: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'serif' }}>
                    {activeFestival.name} · {activeFestival.learnFocus}
                  </h3>
                  <ul className={styles.blurbList}>
                    {activeFestival.blurb.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className={styles.route}>
                    {activeFestival.artifactIds.map((id, i) => {
                      const art = getArtifact(id);
                      if (!art) return null;
                      const done = Boolean(progress.artifacts[id]?.restored);
                      return (
                        <button
                          key={id}
                          type="button"
                          className={`${styles.routeItem} ${done ? styles.routeDone : ''}`}
                          onClick={() => openRestore(id)}
                        >
                          <span className={styles.routeIndex}>{i + 1}</span>
                          <div className={styles.routeMeta}>
                            <strong>{art.name}</strong>
                            <span>{art.oneLiner}</span>
                          </div>
                          <span className={styles.badge}>{done ? '已修' : '可修'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {view === 'restore' && activeCard && (
            <section className={styles.panel}>
              <div className={styles.restoreHead}>
                <p className={styles.eyebrow}>修复台 · {getRegion(activeCard.region).name}</p>
                <h2>{activeCard.name}</h2>
                <p className={styles.panelLead}>{activeCard.oneLiner}</p>
              </div>
              {activeCard.restore.kind === 'shape' && (
                <ShapePuzzle
                  pieces={activeCard.restore.pieces}
                  board={activeCard.restore.board}
                  guide={progress.hintLevel !== 'self'}
                  accent={getRegion(activeCard.region).accent}
                  onComplete={(score) => onRestoreDone(activeCard, score)}
                />
              )}
              {activeCard.restore.kind === 'quiz' && (
                <QuizRestore
                  prompt={activeCard.restore.prompt}
                  options={activeCard.restore.options}
                  explain={activeCard.restore.explain}
                  onComplete={(score) => onRestoreDone(activeCard, score)}
                />
              )}
              <div className={styles.puzzleActions} style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className="gs-btn gs-btn--ghost"
                  onClick={() => openCard(activeCard.id, false)}
                >
                  先阅读（可跳过动手）
                </button>
                <button type="button" className="gs-btn gs-btn--ghost" onClick={() => setView('map')}>
                  返回路线
                </button>
              </div>
            </section>
          )}

          {view === 'card' && activeCard && (
            <section className={styles.panel}>
              <CultureCardView
                card={activeCard}
                grade={progress.artifacts[activeCard.id]?.grade ?? 'none'}
                accent={getRegion(activeCard.region).accent}
                showActions
                requireAck={postRestore || Boolean(progress.artifacts[activeCard.id]?.restored)}
                acked={acked || Boolean(progress.artifacts[activeCard.id]?.readCore)}
                onAckRead={onAck}
                onToMuseum={() => {
                  if (!progress.artifacts[activeCard.id]?.readCore) onAck();
                  setView('museum');
                  showToast('已在藏馆展出');
                }}
                onShare={() => copyTellable(activeCard.tellable)}
                onBack={() => setView('codex')}
              />
            </section>
          )}

          {view === 'codex' && (
            <section className={styles.panel}>
              <h2>
                山海册 · {region.name}（{codexList.length}/{regionArtifacts.length}）
              </h2>
              <p className={styles.panelLead}>
                图鉴直达。全站共 {ARTIFACTS.length} 张卡；此处显示当前展区。
              </p>
              <div className={styles.nav} style={{ marginTop: 0 }} role="toolbar" aria-label="山海册筛选">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'todo', label: '未修' },
                  { id: 'done', label: '已修' },
                  { id: 'bronze', label: TYPE_LABEL.bronze },
                  { id: 'lacquer', label: TYPE_LABEL.lacquer },
                  { id: 'jade', label: TYPE_LABEL.jade },
                  { id: 'concept', label: TYPE_LABEL.concept },
                  { id: 'pattern', label: TYPE_LABEL.pattern },
                  { id: 'classic', label: TYPE_LABEL.classic },
                  { id: 'musical', label: TYPE_LABEL.musical },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`${styles.navBtn} ${codexFilter === f.id ? styles.navBtnActive : ''}`}
                    onClick={() => setCodexFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className={styles.grid}>
                {codexList.map((card) => {
                  const st = progress.artifacts[card.id];
                  const art = getArtifactArt(card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={styles.gridCard}
                      onClick={() => openRestore(card.id)}
                      style={
                        art
                          ? {
                              backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0.92) 42%, transparent 78%), url(${art})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'right center',
                            }
                          : undefined
                      }
                    >
                      <strong>{card.name}</strong>
                      <p>{card.oneLiner}</p>
                      <span className={styles.badge}>
                        {st?.restored ? `已修 ${st.grade}` : '未修复'}
                        {st?.readCore ? ' · 已读' : ''}
                        {art ? ' · 名物图' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {view === 'museum' && (
            <section className={styles.panel}>
              <h2>我的藏馆</h2>
              <p className={styles.panelLead}>
                本地展览墙（{progress.museumSlots.length} 件）。修过的器物自动入藏，点击可重读。
              </p>
              <div className={styles.museumShelf}>
                {progress.museumSlots.length === 0 && (
                  <div className={`${styles.exhibit} ${styles.exhibitEmpty}`}>
                    还没有展品 · 去修第一件吧
                  </div>
                )}
                {progress.museumSlots.map((id) => {
                  const card = getArtifact(id);
                  if (!card) return null;
                  const reg = getRegion(card.region);
                  const art = getArtifactArt(id) ?? reg.art;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={styles.exhibit}
                      onClick={() => openCard(id)}
                      style={
                        art
                          ? {
                              backgroundImage: `linear-gradient(180deg, transparent 30%, rgba(20,28,20,0.78) 100%), url(${art})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              color: '#f6f1e6',
                            }
                          : undefined
                      }
                    >
                      <strong>{card.name}</strong>
                      <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{reg.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {view === 'about' && (
            <section className={styles.panel}>
              <h2>关于《山海拾遗》</h2>
              <div className={styles.aboutBox}>
                <p>
                  本项目是<strong>公益文化宣传互动</strong>
                  ：在浏览器里通过修复与阅读，了解器物、纹样、礼制、楚辞与区域文化印象。
                </p>
                <ul>
                  <li>无登录、无商城、无广告变现</li>
                  <li>进度保存在本机浏览器（可导出）</li>
                  <li>史证内容为通识再创作展示，不伪称未授权馆藏真品</li>
                  <li>玩是载体，了解文化是目的</li>
                </ul>
                <p>
                  当前内容：中原{listArtifactsByRegion('R01').length} · 楚
                  {listArtifactsByRegion('R02').length} · 巴蜀{listArtifactsByRegion('R03').length} ·
                  江南{listArtifactsByRegion('R04').length} · 塞北
                  {listArtifactsByRegion('R05').length} · 仙山
                  {listArtifactsByRegion('R06').length} · 岁时
                  {listArtifactsByRegion('R07').length} · 海丝
                  {listArtifactsByRegion('R08').length} = <strong>{ARTIFACTS.length}</strong>{' '}
                  张。设计文档见 <code>docs/gdd/</code>。
                </p>
                <div className={styles.heroActions}>
                  <button
                    type="button"
                    className="gs-btn gs-btn--ghost"
                    onClick={() => {
                      const blob = new Blob([exportProgressJson(progress)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'shanhai-shiyi-progress.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast('已导出本地进度');
                    }}
                  >
                    导出进度 JSON
                  </button>
                  <button
                    type="button"
                    className="gs-btn gs-btn--ghost"
                    onClick={() => {
                      if (window.confirm('确定清空本机山海拾遗进度？')) {
                        commit(createInitialProgress());
                        setView('home');
                        showToast('进度已清空');
                      }
                    }}
                  >
                    清空本地进度
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {toast && (
          <div className={styles.toast} role="status">
            {toast}
          </div>
        )}

        <FirstPlayGuide
          storageKey="rex-game:shanhai-shiyi:guide:v1"
          title="欢迎来到山海拾遗"
          description="公益文化互动：动手修器物，读懂一点点中国故事。无需登录，进度保存在本机。"
          steps={[
            '八大展区可切换：中原楚蜀江南塞北仙山岁时海丝。',
            '「岁时」页按节日专题学习；仙山读经载，海丝看互鉴。',
            '修复后请阅读核心知识点；山海册与藏馆可复习。',
          ]}
        />
      </div>
    </GameChrome>
  );
}
