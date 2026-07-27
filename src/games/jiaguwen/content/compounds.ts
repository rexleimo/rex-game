import type { CompoundRecipe } from '../core/types.ts';

/**
 * 部件造字题库。
 * 每个 recipe 是会意/合体字，由字库中已有的甲骨部件拼成目标字。
 */
export const COMPOUNDS: CompoundRecipe[] = [
  {
    id: 'compound-xiu',
    result: '休',
    parts: ['ren', 'mu'],
    hint: '一个人靠在树旁歇息。',
    lore: '「休」由「人」和「木」组成，表示人靠在树下休息。',
  },
  {
    id: 'compound-ming',
    result: '明',
    parts: ['ri', 'yue'],
    hint: '太阳和月亮同时照亮。',
    lore: '「明」由「日」和「月」组成，日月齐照即为明。',
  },
  {
    id: 'compound-lin',
    result: '林',
    parts: ['mu', 'mu'],
    hint: '两棵树并立。',
    lore: '「林」由两个「木」组成，表示树木成片。',
  },
  {
    id: 'compound-xian',
    result: '仙',
    parts: ['ren', 'shan'],
    hint: '人在山中修炼。',
    lore: '「仙」由「人」和「山」组成，会意山中之人即为仙。',
  },
  {
    id: 'compound-qiu',
    result: '囚',
    parts: ['ren', 'kou'],
    hint: '人被框在口内。',
    lore: '「囚」由「人」在「口」中，会意被拘禁。',
  },
  {
    id: 'compound-wang',
    result: '旺',
    parts: ['ri', 'wang'],
    hint: '太阳照耀君王，光明盛大。',
    lore: '「旺」由「日」与「王」组成，会意光明盛大。',
  },
  {
    id: 'compound-xian2',
    result: '闲',
    parts: ['men', 'mu'],
    hint: '门中有木，门闩之闲。',
    lore: '「闲」由「门」内加「木」，本义与门闩、间隙有关，后引申为清闲。',
  },
  {
    id: 'compound-xiang',
    result: '香',
    parts: ['he', 'ri'],
    hint: '禾谷在阳光下散发出香气。',
    lore: '「香」由「禾」和「日」组成，会意谷物受热散发的香气。',
  },
  {
    id: 'compound-qiu2',
    result: '秋',
    parts: ['he', 'huo'],
    hint: '禾谷经火，丰收在秋季。',
    lore: '「秋」由「禾」和「火」组成，会意秋收时节禾谷成熟。',
  },
  {
    id: 'compound-fei',
    result: '吠',
    parts: ['quan', 'kou'],
    hint: '犬张口发声。',
    lore: '「吠」由「犬」和「口」组成，会意狗叫。',
  },
];

export function getCompoundById(id: string): CompoundRecipe | undefined {
  return COMPOUNDS.find((c) => c.id === id);
}
