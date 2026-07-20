import Link from 'next/link';
import type { GameMeta } from '@/core/gamesRegistry';
import { Reveal } from './Reveal';

const EXHIBIT_META: Record<
  string,
  { no: string; tags: string; playLabel: string; cultureLabel: string }
> = {
  'shantou-jiaobei': {
    no: 'No.01',
    tags: '3D 物理 · 手势可选',
    playLabel: '开始占卜',
    cultureLabel: '掷筊怎么看',
  },
  'chaoshan-yingge': {
    no: 'No.02',
    tags: '节奏判定 · 横版动作',
    playLabel: '加入巡游',
    cultureLabel: '英歌的脸谱与角色',
  },
  jianzhi: {
    no: 'No.03',
    tags: '折剪展开 · 图鉴收集',
    playLabel: '开始创作',
    cultureLabel: '纹样里的吉祥话',
  },
};

function ExhibitGlyph({ id }: { id: string }) {
  if (id === 'shantou-jiaobei') {
    return (
      <svg viewBox="0 0 70 46" role="img" aria-label="筊杯">
        <path d="M14 4 a26 26 0 0 0 0 38 a20 20 0 0 1 0 -38z" fill="#C9A24B" />
        <path d="M56 4 a26 26 0 0 1 0 38 a20 20 0 0 0 0 -38z" fill="#C9A24B" opacity="0.85" />
      </svg>
    );
  }
  if (id === 'chaoshan-yingge') {
    return (
      <svg viewBox="0 0 80 56" role="img" aria-label="英歌双槌与鼓">
        <rect x="8" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(18 11 27)" />
        <rect x="65" y="4" width="7" height="46" rx="3.5" fill="#E8CF9A" transform="rotate(-18 68 27)" />
        <circle cx="40" cy="34" r="16" fill="none" stroke="#C82E21" strokeWidth="4" />
        <circle cx="40" cy="34" r="5" fill="#C9A24B" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="剪纸红菱">
      <polygon points="32,2 62,32 32,62 2,32" fill="#C82E21" />
      <polygon points="32,14 50,32 32,50 14,32" fill="#150C07" />
      <polygon points="32,22 42,32 32,42 22,32" fill="#D23627" />
    </svg>
  );
}

export function ExhibitSection({
  game,
  index,
  cultureHref,
}: {
  game: GameMeta;
  index: number;
  cultureHref: string;
}) {
  const meta = EXHIBIT_META[game.id] ?? {
    no: `No.0${index + 1}`,
    tags: '',
    playLabel: '开始游玩',
    cultureLabel: '文化导读',
  };

  return (
    <Reveal className={`exhibit ${index % 2 === 1 ? 'exhibit--rev' : ''}`}>
      <div className={`exhibit__visual exhibit__visual--${game.id}`}>
        <ExhibitGlyph id={game.id} />
      </div>
      <div className="exhibit__copy">
        <p className="exhibit__no">
          展品 {meta.no}
          {meta.tags ? ` · ${meta.tags}` : ''}
        </p>
        <h3 className="exhibit__name">{game.name}</h3>
        <p className="exhibit__tagline">{game.tagline}</p>
        <p className="exhibit__links">
          <Link className="exhibit__play" href={game.href}>
            {meta.playLabel} →
          </Link>
          <Link className="exhibit__culture" href={cultureHref}>
            文化导读:{meta.cultureLabel}
          </Link>
        </p>
      </div>
    </Reveal>
  );
}
