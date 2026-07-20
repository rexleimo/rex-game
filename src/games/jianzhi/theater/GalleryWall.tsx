import type { SavedWork } from '../core/types';

export function GalleryWall({
  works,
  phraseOf,
  onShare,
  onPreview,
}: {
  works: SavedWork[];
  phraseOf: (work: SavedWork) => string | null;
  onShare: (work: SavedWork) => void;
  onPreview?: (work: SavedWork) => void;
}) {
  if (!works.length) {
    return (
      <div className="th-wall-empty">
        <p>剪完第一课,这里会亮起第一盏灯。</p>
      </div>
    );
  }
  return (
    <div className="th-wall">
      {works.map((work) => (
        <figure key={work.id} className="th-frame">
          <span className="th-spot" aria-hidden="true" />
          {onPreview ? (
            <button type="button" className="th-frame-view" onClick={() => onPreview(work)}>
              <img src={work.dataUrl} alt={work.name} />
            </button>
          ) : (
            <img src={work.dataUrl} alt={work.name} />
          )}
          <figcaption>
            <span className="th-frame-title">{work.name}</span>
            {phraseOf(work) ? <span className="th-frame-phrase">{phraseOf(work)}</span> : null}
            <button type="button" onClick={() => onShare(work)}>
              分享卡 ↓
            </button>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
