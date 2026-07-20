import type { ReactNode } from 'react';
import type { ActState } from './useTheater';
import { SceneArt, type SceneArtKind } from './SceneArt';

type SceneConfig = {
  art?: SceneArtKind | string;
  caption?: string;
  /** C：有大图优先用图 */
  image?: string;
};

type ActLike = Pick<ActState, 'no' | 'theme'> & {
  scene: SceneConfig;
};

export function ActShell({
  act,
  lessonIndex,
  lessonCount,
  onBack,
  children,
}: {
  act: ActLike;
  lessonIndex: number; // 1-based
  lessonCount: number;
  onBack: () => void;
  children: ReactNode;
}) {
  const image = act.scene.image?.trim() || '';
  const art = (act.scene.art || '') as SceneArtKind | '';
  // C 有图 → B 有 art → A 皆无则不渲染场景区
  const showScene = Boolean(image) || Boolean(art);
  const isPractice = act.no === '练功房' || lessonCount <= 0;
  const showProgress = !isPractice && lessonCount > 1;

  return (
    <div className="th-act">
      <header className="th-act-top">
        <button type="button" className="th-back" onClick={onBack} aria-label="返回幕布地图">
          ← 幕布
        </button>
        <span className="th-act-name">
          {act.no} · {act.theme}
        </span>
        {showProgress ? (
          <span className="th-act-progress" aria-label={`第 ${lessonIndex} 课,共 ${lessonCount} 课`}>
            {Array.from({ length: lessonCount }, (_, i) => (
              <i key={i} className={i < lessonIndex ? 'on' : ''} />
            ))}
          </span>
        ) : (
          <span className="th-act-badge" aria-label="自习模式">
            自习
          </span>
        )}
      </header>
      {showScene && (
        <div className="th-scene">
          {image ? (
            <img className="th-scene-img" src={image} alt="" />
          ) : (
            <SceneArt art={art as SceneArtKind} />
          )}
          {act.scene.caption ? <span className="th-scene-cap">{act.scene.caption}</span> : null}
        </div>
      )}
      {children}
    </div>
  );
}
