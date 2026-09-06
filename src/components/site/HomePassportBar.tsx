'use client';

/**
 * 首页护照条。
 *
 * 站点的留存问题是「玩完一个没理由玩第二个」。这条 bar 把跨展品进度提到首屏
 * 之下第一眼的位置：没玩过的人看到一句邀请，玩过的人看到自己缺哪几张。
 *
 * 水合前渲染邀请文案而非骨架屏——静态导出的 HTML 会被爬虫和首屏看到，
 * 那份文案本身就该是有意义的内容。
 */

import Link from 'next/link';

import { usePassport } from '@/core/passport';

export function HomePassportBar() {
  const { passport, hydrated } = usePassport();
  const started = hydrated && passport.earnedCount > 0;
  const pct = passport.totalCount
    ? Math.round((passport.earnedCount / passport.totalCount) * 100)
    : 0;

  return (
    <section className="g-section g-container hpb" aria-labelledby="passport-bar-title">
      <div className="hpb__inner">
        <div className="hpb__copy">
          <p className="g-label">文化护照</p>
          <h2 id="passport-bar-title" className="hpb__title">
            {started
              ? `已集 ${passport.earnedCount} / ${passport.totalCount} 张文化卡`
              : `${passport.sections.length} 件展品，${passport.totalCount} 张文化卡`}
          </h2>
          <p className="hpb__text">
            {started
              ? `走过 ${passport.visitedGames} / ${passport.sections.length} 件展品。护照记的是你亲手做过的事。`
              : '每件展品都会留下几张卡：掷出的杯象、剪出的吉语、修复的器物。进度只存在这台设备。'}
          </p>
        </div>

        <div className="hpb__side">
          {started && (
            <div className="hpb__meter" role="img" aria-label={`已集 ${pct}%`}>
              <div className="hpb__meterFill" style={{ width: `${pct}%` }} />
            </div>
          )}
          <Link className="g-btn g-btn--primary" href="/passport/">
            {started ? '查看护照' : '了解护照'} →
          </Link>
        </div>
      </div>
    </section>
  );
}
