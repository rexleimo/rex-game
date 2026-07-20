'use client';

import { useEffect, useState } from 'react';

export function UnfoldCeremony({
  image,
  phrase,
  principle,
  reducedMotion,
  onClose,
}: {
  image: string; // exportPNG(2) dataURL
  phrase: string | null; // 拼出的吉语,无则 null
  principle: string | null; // 吉语释义
  reducedMotion: boolean;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<'zoom' | 'phrase' | 'done'>(reducedMotion ? 'done' : 'zoom');

  useEffect(() => {
    if (reducedMotion) return;
    const t1 = window.setTimeout(() => setStage('phrase'), 1200);
    const t2 = window.setTimeout(() => setStage('done'), phrase ? 2200 : 1600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reducedMotion, phrase]);

  return (
    <div className={`th-ceremony stage-${stage}`} role="dialog" aria-label="展开揭晓">
      <div className="th-ceremony-glow" aria-hidden="true" />
      <div className="th-ceremony-particles" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ ['--p' as string]: i }} />
        ))}
      </div>
      <img className="th-ceremony-img" src={image} alt="展开的剪纸作品" />
      {phrase ? (
        <div className="th-ceremony-phrase">
          <p className="th-ceremony-rebus">{phrase}</p>
          {principle ? <p className="th-ceremony-principle">{principle}</p> : null}
        </div>
      ) : null}
      <button type="button" className="th-ceremony-skip" onClick={onClose}>
        {stage === 'done' ? '收下作品 →' : '跳过 ▸'}
      </button>
    </div>
  );
}
