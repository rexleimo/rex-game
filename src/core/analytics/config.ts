/**
 * 埋点配置 —— provider 无关。
 *
 * 静态导出站没有服务端，所有配置在构建期由 NEXT_PUBLIC_* 注入。
 * 未配置 provider 时全站埋点自动降级为 no-op（本地开发默认如此），
 * 因此缺失配置永远不会让页面报错或阻塞渲染。
 */

export type AnalyticsProvider = 'ga4' | 'umami' | 'plausible' | 'none';

export interface AnalyticsConfig {
  provider: AnalyticsProvider;
  /** 统计脚本地址。ga4 留空，由 siteId 推导。 */
  src: string;
  /** ga4: measurement id (G-XXXXXXX)；umami: website id；plausible: data-domain。 */
  siteId: string;
}

const PROVIDERS: AnalyticsProvider[] = ['ga4', 'umami', 'plausible'];

function normalizeProvider(raw: string | undefined): AnalyticsProvider {
  return PROVIDERS.includes(raw as AnalyticsProvider) ? (raw as AnalyticsProvider) : 'none';
}

/** GA4 的加载地址完全由 measurement id 决定，不必让使用者手写。 */
function ga4Src(measurementId: string) {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
}

export function readAnalyticsConfig(): AnalyticsConfig {
  const provider = normalizeProvider(process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER);
  const siteId = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? '';
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC ?? '';

  if (provider === 'none' || !siteId) return { provider: 'none', src: '', siteId: '' };

  if (provider === 'ga4') return { provider, src: src || ga4Src(siteId), siteId };

  // umami / plausible 必须显式给出脚本地址，否则视为未接入，
  // 避免注入一个半截配置的脚本、白白拖慢首屏又收不到数据。
  if (!src) return { provider: 'none', src: '', siteId: '' };
  return { provider, src, siteId };
}

export const analyticsConfig = readAnalyticsConfig();
export const analyticsEnabled = analyticsConfig.provider !== 'none';
