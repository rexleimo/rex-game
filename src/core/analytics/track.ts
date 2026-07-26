/**
 * 埋点分发器 —— 全站唯一的事件出口。
 *
 * 设计约束：
 *   1. 绝不抛错。埋点失败是可接受的；因为埋点让玩家卡在半路不可接受。
 *   2. SSR 安全。静态导出期间没有 window，调用直接返回。
 *   3. 尊重 Do Not Track / 全局隐私控制，命中即彻底静默。
 *   4. 脚本未就绪时先入队。玩家在脚本加载完前的首个动作是最有价值的
 *      漏斗信号，丢掉它等于漏掉最陡的一段流失。
 */

import { analyticsConfig, analyticsEnabled } from './config.ts';
import type { AnalyticsEvent, AnalyticsProps, EventPropsMap } from './types.ts';

interface UmamiApi {
  track: (name: string, data?: AnalyticsProps) => void;
}
type PlausibleApi = (name: string, options?: { props?: AnalyticsProps }) => void;
type GtagApi = (command: 'event' | 'js' | 'config', target: unknown, params?: unknown) => void;

declare global {
  interface Window {
    umami?: UmamiApi;
    plausible?: PlausibleApi;
    gtag?: GtagApi;
    dataLayer?: unknown[];
  }
}

interface QueuedEvent {
  name: AnalyticsEvent;
  props: AnalyticsProps;
}

/** 队列上限：脚本被墙/被拦截时不至于无限堆积。 */
const MAX_QUEUE = 50;
const queue: QueuedEvent[] = [];

function privacyOptOut(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { msDoNotTrack?: string; globalPrivacyControl?: boolean };
  const win = typeof window === 'undefined' ? undefined : (window as Window & { doNotTrack?: string });
  return (
    nav.doNotTrack === '1' ||
    nav.msDoNotTrack === '1' ||
    win?.doNotTrack === '1' ||
    nav.globalPrivacyControl === true
  );
}

/** 返回已就绪的发送函数；脚本还没加载完则返回 null。 */
function resolveSink(): ((name: string, props: AnalyticsProps) => void) | null {
  if (typeof window === 'undefined') return null;
  if (analyticsConfig.provider === 'ga4' && window.gtag) {
    const gtag = window.gtag;
    return (name, props) => gtag('event', name, props);
  }
  if (analyticsConfig.provider === 'umami' && window.umami) {
    const umami = window.umami;
    return (name, props) => umami.track(name, props);
  }
  if (analyticsConfig.provider === 'plausible' && window.plausible) {
    const plausible = window.plausible;
    return (name, props) => plausible(name, { props });
  }
  return null;
}

function flush() {
  const sink = resolveSink();
  if (!sink) return;
  while (queue.length) {
    const event = queue.shift();
    if (!event) break;
    try {
      sink(event.name, event.props);
    } catch {
      /* 单条事件发送失败即丢弃，不重试、不冒泡 */
    }
  }
}

/** 统计脚本 onLoad 后调用，把排队事件补发出去。 */
export function flushAnalyticsQueue() {
  flush();
}

export function track<E extends AnalyticsEvent>(name: E, props: EventPropsMap[E]): void {
  if (typeof window === 'undefined') return;
  if (privacyOptOut()) return;

  if (!analyticsEnabled) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics:noop]', name, props);
    }
    return;
  }

  const sink = resolveSink();
  if (sink) {
    try {
      sink(name, props);
    } catch {
      /* 忽略 */
    }
    return;
  }

  if (queue.length < MAX_QUEUE) queue.push({ name, props });
}

/** 仅供测试用：清空队列，避免用例互相污染。 */
export function __resetAnalyticsQueue() {
  queue.length = 0;
}

/** 仅供测试用：观察排队深度。 */
export function __queueSize() {
  return queue.length;
}
