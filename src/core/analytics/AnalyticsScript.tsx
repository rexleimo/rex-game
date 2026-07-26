'use client';

/**
 * 统计脚本注入点。挂在 RootLayout，全站一份。
 *
 * 未配置 provider 时渲染 null —— 本地开发与未接入环境完全不加载任何三方脚本。
 * 脚本用 afterInteractive 策略：不阻塞首屏，玩家在脚本就绪前的动作由
 * track() 的队列兜住，onLoad 时补发。
 */

import Script from 'next/script';

import { analyticsConfig } from './config.ts';
import { flushAnalyticsQueue } from './track.ts';

/**
 * GA4 需要两段脚本：gtag.js 加载器，外加一段建立 dataLayer 的引导。
 * 引导必须内联且先于事件执行，所以用 beforeInteractive 之外的最早时机
 * （afterInteractive + 同步内联）保证 window.gtag 在 onLoad 回调前已存在。
 *
 * 注意：GA4 默认写 first-party cookie（_ga），与站内其他 provider 的
 * 无 cookie 行为不同；隐私说明需相应描述。
 */
function Ga4Scripts({ src, siteId }: { src: string; siteId: string }) {
  const bootstrap = [
    'window.dataLayer = window.dataLayer || [];',
    'function gtag(){window.dataLayer.push(arguments);}',
    'window.gtag = window.gtag || gtag;',
    'gtag("js", new Date());',
    // send_page_view 交给 GA 默认行为；自定义事件走 track()
    `gtag("config", ${JSON.stringify(siteId)}, { anonymize_ip: true });`,
  ].join('\n');

  return (
    <>
      <Script id="ga4-bootstrap" strategy="afterInteractive">
        {bootstrap}
      </Script>
      <Script id="ga4-loader" src={src} strategy="afterInteractive" onLoad={flushAnalyticsQueue} />
    </>
  );
}

export function AnalyticsScript() {
  const { provider, src, siteId } = analyticsConfig;
  if (provider === 'none') return null;

  if (provider === 'ga4') return <Ga4Scripts src={src} siteId={siteId} />;

  const providerAttrs =
    provider === 'umami' ? { 'data-website-id': siteId } : { 'data-domain': siteId };

  return (
    <Script
      src={src}
      strategy="afterInteractive"
      defer
      onLoad={flushAnalyticsQueue}
      {...providerAttrs}
    />
  );
}
