import { Reveal } from './Reveal';

const CLAIMS = [
  {
    n: '壹',
    t: '在地线索',
    d: '以潮汕掷筊、英歌与通行剪纸吉语为线索,保留地区差异,不编「标准答案」。',
  },
  {
    n: '贰',
    t: '可玩展品',
    d: '3D 筊杯、节奏合槌、折剪展读——用交互建立记忆,而不是只读长文。',
  },
  {
    n: '叁',
    t: '可核来源',
    d: '每篇导读附快速回答、FAQ 与外链来源,区分常见说法与游戏设计。',
  },
];

export function HomeClaims() {
  return (
    <div className="claims">
      {CLAIMS.map((c, i) => (
        <Reveal key={c.t} className="claims__item" delay={i * 90}>
          <span className="claims__n">{c.n}</span>
          <h3>{c.t}</h3>
          <p>{c.d}</p>
        </Reveal>
      ))}
    </div>
  );
}
