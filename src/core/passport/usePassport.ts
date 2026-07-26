'use client';

/**
 * 护照读取 hook。
 *
 * 静态导出站的关键约束：服务端渲染时读不到 localStorage，若首帧直接渲染真实
 * 进度会造成 hydration mismatch。因此首帧一律渲染空护照，挂载后再替换成真实
 * 数据——这也让未玩过的访客看到的静态 HTML 是完整的（对 SEO 友好）。
 */

import { useEffect, useState } from 'react';

import { buildPassport, emptyPassport, readSnapshot } from './store.ts';
import type { PassportState } from './types.ts';

export function usePassport(): { passport: PassportState; hydrated: boolean } {
  const [passport, setPassport] = useState<PassportState>(emptyPassport);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setPassport(buildPassport(readSnapshot()));
      setHydrated(true);
    };

    refresh();

    // 其它标签页改了存档时同步；同页从游戏返回一般会整页重挂，不依赖这个
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('rex-game:')) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return { passport, hydrated };
}
