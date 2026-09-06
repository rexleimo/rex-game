import type { MountainId, WenshouSave } from '../core/types.ts';
import { BEASTS } from './beasts.ts';
import { MOUNTAINS } from './mountains.ts';

/**
 * 引文拓印（GDD §2.2 收集完成度）：把《南山经》原文逐条「点亮」。
 * 语料 = 13 兽句 + 10 山段 + 10 祠礼 + 1 卷首总述，共 34 条。
 * 点亮规则：兽句=收服；山段=祭礼礼成；祠礼=祭礼礼成；总述=通卷。
 */

export interface QuoteEntry {
  id: string;
  label: string;
  text: string;
  lit: (save: WenshouSave) => boolean;
}

export function quoteCorpus(): QuoteEntry[] {
  const entries: QuoteEntry[] = [];

  for (const b of BEASTS) {
    entries.push({
      id: `q-beast-${b.id}`,
      label: `兽句 · ${b.name}`,
      text: b.quote,
      lit: (save) => (save.beasts[b.id] ?? 0) > 0,
    });
  }

  for (const m of MOUNTAINS) {
    entries.push({
      id: `q-mtn-${m.id}`,
      label: `山段 · ${m.name}`,
      text: m.quote,
      lit: (save) => Boolean(save.mountains[m.id]?.cleared),
    });
    entries.push({
      id: `q-god-${m.id}`,
      label: `祠礼 · ${m.name}`,
      text: m.god.desc,
      lit: (save) => Boolean(save.mountains[m.id]?.cleared),
    });
  }

  entries.push({
    id: 'q-colophon',
    label: '卷首 · 凡十山',
    text: '「凡䧿山之首，自招摇之山以至箕尾之山，凡十山，二千九百五十里，其神状皆鸟身而龙首。其祠之礼：毛用一璋玉瘗，糈用稌米，一璧稻米、白菅为席。」',
    lit: (save) => save.chapterDone,
  });

  return entries;
}

/** 点亮数（UI/完成度用）。 */
export function litCount(save: WenshouSave): number {
  return quoteCorpus().filter((q) => q.lit(save)).length;
}

/** 供测试：语料规模锚定。 */
export function corpusSize(): number {
  return quoteCorpus().length;
}
