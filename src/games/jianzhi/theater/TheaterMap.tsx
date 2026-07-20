import type { ActState } from './useTheater';

export function TheaterMap({
  acts,
  onEnterAct,
  onOpenCodex,
  onPractice,
  onOpenWorks,
  onOpenSettings,
}: {
  acts: ActState[];
  onEnterAct: (act: ActState) => void;
  onOpenCodex: () => void;
  onPractice: () => void;
  onOpenWorks: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="th-map">
      <header className="th-map-head">
        <p className="th-kicker">纸上剧场</p>
        <h1 className="th-title">纸上生花</h1>
        <p className="th-sub">四幕民俗剧场 · 一折一剪之间,读一纸吉语</p>
      </header>

      <div className="th-curtains">
        {acts.map((act) => (
          <button
            key={act.id}
            type="button"
            className={`th-curtain ${act.lit ? 'is-lit' : ''} ${act.unlocked ? '' : 'is-locked'}`}
            disabled={!act.unlocked}
            onClick={() => onEnterAct(act)}
          >
            <span className="th-curtain-state">
              {act.lit ? '已点亮' : act.unlocked ? '进行中' : '未解锁'}
            </span>
            <span className="th-curtain-no">{act.no}</span>
            <span className="th-curtain-theme">{act.theme}</span>
            <span className="th-curtain-hint">{act.curtainHint}</span>
          </button>
        ))}
      </div>

      <nav className="th-map-nav" aria-label="工坊导航">
        <button type="button" onClick={onOpenCodex}>
          纹样图鉴
        </button>
        <button type="button" onClick={onOpenWorks}>
          民艺馆
        </button>
        <button type="button" onClick={onPractice}>
          练功房
        </button>
        <button type="button" onClick={onOpenSettings}>
          设置
        </button>
      </nav>
    </div>
  );
}
