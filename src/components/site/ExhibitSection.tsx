import Link from 'next/link';
import type { GameMeta } from '@/core/gamesRegistry';
import { ExhibitProgress } from './ExhibitProgress';
import { Reveal } from './Reveal';

const EXHIBIT_META: Record<
  string,
  { no: string; tags: string; playLabel: string; cultureLabel: string }
> = {
  'shanhai-shiyi': {
    no: 'No.01',
    tags: '修复互动 · 文化卡片',
    playLabel: '开始拾遗',
    cultureLabel: '修器物读典故',
  },
  'shantou-jiaobei': {
    no: 'No.02',
    tags: '3D 物理 · 手势可选',
    playLabel: '开始占卜',
    cultureLabel: '掷筊怎么看',
  },
  'chaoshan-yingge': {
    no: 'No.03',
    tags: '节奏判定 · 横版动作',
    playLabel: '加入巡游',
    cultureLabel: '英歌的脸谱与角色',
  },
  jianzhi: {
    no: 'No.04',
    tags: '折剪展开 · 图鉴收集',
    playLabel: '开始创作',
    cultureLabel: '纹样里的吉祥话',
  },
  // 馆藏号按入馆先后固定，新展品排新号，不重排既有展品
  'ershisi-jieqi': {
    no: 'No.05',
    tags: '排序配对 · 节气图鉴',
    playLabel: '开始拼时',
    cultureLabel: '一年如何分成 24 段',
  },
  jiaguwen: {
    no: 'No.06',
    tags: '象形认字 · 卜辞填空',
    playLabel: '开始契字',
    cultureLabel: '字从象出，事因卜存',
  },
};

function ExhibitGlyph({ id }: { id: string }) {
  if (id === 'shanhai-shiyi') {
    return (
      <svg viewBox="0 0 72 64" role="img" aria-label="青铜鼎">
        <path
          d="M18 14 L28 4 L34 10 M54 14 L44 4 L38 10"
          fill="none"
          stroke="#C9A24B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M14 18 Q10 36 20 48 L52 48 Q62 36 58 18 Q40 8 14 18 Z"
          fill="#6B7F6A"
          stroke="#C9A24B"
          strokeWidth="2"
        />
        <path d="M24 48 L20 60 M36 48 L36 62 M48 48 L52 60" stroke="#C9A24B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
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
  if (id === 'ershisi-jieqi') {
    return (
      <svg viewBox="0 0 72 72" role="img" aria-label="二十四节气圆盘">
        <circle cx="36" cy="36" r="28" fill="none" stroke="#C9A24B" strokeWidth="2.5" />
        <circle cx="36" cy="36" r="3" fill="#C9A24B" />
        {/* 四立二分：十字刻度 */}
        <path
          d="M36 10 V18 M36 54 V62 M10 36 H18 M54 36 H62"
          stroke="#C82E21"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* 八节小刻 */}
        <path
          d="M18.5 18.5 L23 23 M49 23 L53.5 18.5 M53.5 53.5 L49 49 M23 49 L18.5 53.5"
          stroke="#E8CF9A"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === 'jiaguwen') {
    return (
      <svg viewBox="0 0 72 72" role="img" aria-label="甲骨与刻辞">
        <path
          d="M12 18 Q6 36 14 56 Q36 62 58 56 Q66 36 60 18 Q36 8 12 18 Z"
          fill="none"
          stroke="#C9A24B"
          strokeWidth="2.5"
        />
        <path
          d="M24 22 Q26 16 30 20 M40 22 L40 34 M48 24 L52 30 M30 36 Q34 30 38 36 M26 44 L34 48 M44 42 L50 50"
          fill="none"
          stroke="#C82E21"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
          <ExhibitProgress game={game.id} />
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
