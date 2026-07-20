import type { ReactNode } from 'react';
import type { ActState } from './useTheater';
import { SceneArt } from './SceneArt';

export function ActShell({
  act,
  lessonIndex,
  lessonCount,
  onBack,
  children,
}: {
  act: ActState;
  lessonIndex: number; // 1-based
  lessonCount: number;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div className="th-act">
      <header className="th-act-top">
        <button type="button" className="th-back" onClick={onBack} aria-label="返回幕布地图">
          ← 幕布
        </button>
        <span className="th-act-name">
          {act.no} · {act.theme}
        </span>
        <span className="th-act-progress" aria-label={`第 ${lessonIndex} 课,共 ${lessonCount} 课`}>
          {Array.from({ length: lessonCount }, (_, i) => (
            <i key={i} className={i < lessonIndex ? 'on' : ''} />
          ))}
        </span>
      </header>
      <div className="th-scene">
        {act.scene.image ? (
          <img className="th-scene-img" src={act.scene.image} alt="" />
        ) : (
          <SceneArt art={act.scene.art} />
        )}
        <span className="th-scene-cap">{act.scene.caption}</span>
      </div>
      {children}
    </div>
  );
}
