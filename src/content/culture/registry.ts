import type { CulturePage } from './types.ts';
import { JIAOBEI_PAGES } from './jiaobei.ts';
import { YINGGE_PAGES } from './yingge.ts';
import { JIANZHI_PAGES } from './jianzhi.ts';

const CULTURE_PAGES: CulturePage[] = [...JIAOBEI_PAGES, ...YINGGE_PAGES, ...JIANZHI_PAGES];

export function listCulturePages(): CulturePage[] {
  return CULTURE_PAGES;
}

export function listCultureHubs(): CulturePage[] {
  return CULTURE_PAGES.filter((p) => p.kind === 'hub');
}

export function getCulturePage(hub: string, topic?: string): CulturePage | undefined {
  if (!topic) {
    return CULTURE_PAGES.find((p) => p.kind === 'hub' && p.hub === hub);
  }
  return CULTURE_PAGES.find((p) => p.hub === hub && p.slug === topic && p.kind === 'topic');
}

export function getCulturePageByPath(path: string): CulturePage | undefined {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  return CULTURE_PAGES.find((p) => p.path === normalized);
}

export type { CulturePage, CultureHubId } from './types';
