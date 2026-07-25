import type { QuizItem } from '../core/types.ts';
import { SOLAR_TERMS } from './terms.ts';

/** 固定题库 + 由节气自动生成的配对题 */
const HANDCRAFTED: QuizItem[] = [
  {
    id: 'q-first',
    prompt: '二十四节气的起点是哪一个？',
    options: ['立春', '雨水', '冬至', '大寒'],
    answer: 0,
    explain: '立春是二十四节气之首，也是春季的开始。',
    termId: 'lichun',
  },
  {
    id: 'q-equinox',
    prompt: '昼夜大致等长、春半而至的节气是？',
    options: ['惊蛰', '春分', '清明', '谷雨'],
    answer: 1,
    explain: '春分太阳直射赤道，昼夜大致均分。',
    termId: 'chunfen',
  },
  {
    id: 'q-longest-day',
    prompt: '北半球白昼最长的节气是？',
    options: ['小满', '芒种', '夏至', '大暑'],
    answer: 2,
    explain: '夏至时北半球白昼最长，此后夜渐长。',
    termId: 'xiazhi',
  },
  {
    id: 'q-shortest-day',
    prompt: '「一阳来复」、白昼最短的节气是？',
    options: ['立冬', '大雪', '冬至', '小寒'],
    answer: 2,
    explain: '冬至阴极而阳生，白昼最短后光开始回来。',
    termId: 'dongzhi',
  },
  {
    id: 'q-busy',
    prompt: '「忙种」谐音最贴切、抢收抢种的节气是？',
    options: ['小满', '芒种', '小暑', '立秋'],
    answer: 1,
    explain: '芒种既要收麦又要插秧，是典型的农忙节点。',
    termId: 'mangzhong',
  },
  {
    id: 'q-end-heat',
    prompt: '名字带「暑气到此为止」之意的节气是？',
    options: ['小暑', '大暑', '处暑', '白露'],
    answer: 2,
    explain: '「处」有终止意，处暑即暑气将止。',
    termId: 'chushu',
  },
  {
    id: 'q-qingming',
    prompt: '既是节气又是节日、常与踏青祭扫相连的是？',
    options: ['谷雨', '清明', '寒露', '霜降'],
    answer: 1,
    explain: '清明兼具节气与节日双重身份。',
    termId: 'qingming',
  },
  {
    id: 'q-last',
    prompt: '二十四节气中的最后一个是？',
    options: ['冬至', '小寒', '大寒', '立春'],
    answer: 2,
    explain: '大寒是岁终之寒，之后便迎来新一轮立春。',
    termId: 'dahan',
  },
  {
    id: 'q-count',
    prompt: '一年共有多少个节气？',
    options: ['12', '18', '24', '36'],
    answer: 2,
    explain: '二十四节气把太阳年大致均分为 24 段。',
  },
  {
    id: 'q-season-size',
    prompt: '每个季节通常包含几个节气？',
    options: ['4', '5', '6', '8'],
    answer: 2,
    explain: '春夏秋冬各 6 个节气，合为 24。',
  },
  {
    id: 'q-grain-rain',
    prompt: '「雨生百谷」对应哪个节气？',
    options: ['雨水', '谷雨', '小满', '白露'],
    answer: 1,
    explain: '谷雨之名正来自「雨生百谷」。',
    termId: 'guyu',
  },
  {
    id: 'q-full-not-ripe',
    prompt: '麦粒渐满却未大熟，对应？',
    options: ['立夏', '小满', '芒种', '夏至'],
    answer: 1,
    explain: '小满强调「满而未熟」的分寸感。',
    termId: 'xiaoman',
  },
];

function generatedFromTerms(): QuizItem[] {
  const items: QuizItem[] = [];
  for (const term of SOLAR_TERMS) {
    // 物候题
    const distractors = SOLAR_TERMS.filter((t) => t.id !== term.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((t) => t.phenology);
    const options = [...distractors, term.phenology].sort(() => Math.random() - 0.5);
    items.push({
      id: `q-ph-${term.id}`,
      prompt: `「${term.name}」对应的代表物候是？`,
      options,
      answer: options.indexOf(term.phenology),
      explain: `${term.name}：${term.phenology}。${term.oneLiner}`,
      termId: term.id,
    });

    // 农事题
    const farmDist = SOLAR_TERMS.filter((t) => t.id !== term.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((t) => t.farming);
    const farmOpts = [...farmDist, term.farming].sort(() => Math.random() - 0.5);
    items.push({
      id: `q-fm-${term.id}`,
      prompt: `「${term.name}」常见农事提示更接近哪一项？`,
      options: farmOpts,
      answer: farmOpts.indexOf(term.farming),
      explain: `${term.name}时节：${term.farming}。`,
      termId: term.id,
    });
  }
  return items;
}

export function buildQuizDeck(count = 8): QuizItem[] {
  // 手写题优先保证质量；生成题补量并每局 shuffle
  const pool = [...HANDCRAFTED, ...generatedFromTerms()];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  // 去重 prompt，避免同局撞题
  const seen = new Set<string>();
  const picked: QuizItem[] = [];
  for (const item of shuffled) {
    if (seen.has(item.prompt)) continue;
    seen.add(item.prompt);
    picked.push(item);
    if (picked.length >= count) break;
  }
  return picked;
}
