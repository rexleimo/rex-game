'use client';

/**
 * 会上报 culture_click 的站内链接。
 *
 * 文化页是这个站的 SEO/GEO 主体，但没人知道玩家玩完到底愿不愿意点进去读。
 * 所有指向 /culture/ 的入口统一走这个组件，才能拿到可比的转化率——
 * 散落各处手写 <Link> 是量不出来的。
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

import { trackCultureClick } from '@/core/analytics';

export interface CultureLinkProps {
  /** 目标文化页路径。 */
  href: string;
  /** 来源标识：游戏 id、'home'、'culture-hub' 等。 */
  from: string;
  className?: string;
  children: ReactNode;
}

export function CultureLink({ href, from, className, children }: CultureLinkProps) {
  return (
    <Link className={className} href={href} onClick={() => trackCultureClick(from, href)}>
      {children}
    </Link>
  );
}
