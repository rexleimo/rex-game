import Link from 'next/link';
import type { CulturePage } from '@/content/culture/types';

const CTA_VERB: Record<string, string> = {
  jiaobei: '读完,不如亲手掷一次',
  yingge: '读完,不如亲自上阵打一局',
  jianzhi: '读完,不如动手剪一张',
};

export function CultureCtaBanner({ page }: { page: CulturePage }) {
  return (
    <div className="ccta">
      <div className="g-container ccta__inner">
        <p className="ccta__text">{CTA_VERB[page.hub] ?? '读完,不如亲手试一次'}</p>
        <Link className="ccta__btn" href={page.gameHref}>
          现在体验:{page.gameName} →
        </Link>
      </div>
    </div>
  );
}
