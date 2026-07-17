import type { BeatEvent, ChapterDefinition, CultureEntry, NoteKind, YinggeChapterId } from '../core/types';

const OFFICIAL_ICH_URL = 'https://www.ihchina.cn/';
const GUANGDONG_CULTURE_URL = 'https://whly.gd.gov.cn/';

function buildBeatMap(bpm: number, bars: number, pattern: NoteKind[]): ChapterDefinition['beatMap'] {
  const beat = 60 / bpm;
  const leadIn = 2.4;
  const events: BeatEvent[] = [];
  const count = bars * 4;

  for (let index = 0; index < count; index += 1) {
    const kind = pattern[index % pattern.length];
    events.push({
      id: `beat-${index}`,
      at: leadIn + index * beat,
      kind,
      label: kind === 'formation' ? '变阵' : kind === 'left' ? '左槌' : '右槌',
    });
  }

  return {
    bpm,
    leadIn,
    duration: leadIn + count * beat + 1.8,
    events,
  };
}

export const YINGGE_CULTURE_ENTRIES: CultureEntry[] = [
  {
    id: 'collective-dance',
    title: '合槌而舞，成队而行',
    region: '广东潮汕地区',
    category: 'history',
    summary: '英歌以群体配合、强烈节奏和队形变化形成鲜明的表演气势。',
    detail: '游戏把个人击槌准确度与全队整齐度分开计分，强调英歌不是独舞，而是共同完成的群体表演。不同地区的队伍规模、速度与表演结构并不完全相同。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: OFFICIAL_ICH_URL,
  },
  {
    id: 'hero-faces',
    title: '英雄脸谱不是通用面具',
    region: '潮阳、普宁等地',
    category: 'face-paint',
    summary: '脸谱与角色表达相连，各地队伍在人物、色彩和画法上存在差异。',
    detail: '游戏只展示经过资料核对的地方版本。关于梁山英雄的民间叙事会明确标注为流传说法，不把它写成唯一、确定的历史起源。',
    evidence: 'oral-tradition',
    sourceLabel: '广东省文化和旅游厅',
    sourceUrl: GUANGDONG_CULTURE_URL,
  },
  {
    id: 'drum-language',
    title: '先听锣鼓，再看槌步',
    region: '潮汕地区',
    category: 'music',
    summary: '锣鼓既提供节拍，也组织队伍动作和情绪推进。',
    detail: '本作使用由慢到快的节奏教学，让玩家先识别重拍，再完成左右击槌和变阵。正式发布音频必须使用原创、委托或取得明确授权的录音。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: OFFICIAL_ICH_URL,
  },
  {
    id: 'regional-tempo',
    title: '快、中、慢，各有气韵',
    region: '普宁及周边地区',
    category: 'formation',
    summary: '英歌存在不同速度和风格，不能用一套节奏代表全部地方传统。',
    detail: '五章谱面通过不同 BPM 表现学习层次，但游戏 BPM 是交互化处理，不冒充真实演出谱。后续与当地表演者合作后再替换为经审核的动作与鼓谱。',
    evidence: 'game-interpretation',
    sourceLabel: '广东省文化和旅游厅',
    sourceUrl: GUANGDONG_CULTURE_URL,
  },
  {
    id: 'living-heritage',
    title: '非遗仍在当下发生',
    region: '广东潮汕地区',
    category: 'heritage',
    summary: '英歌通过社区队伍、节庆巡游、训练和代际传承持续存在。',
    detail: '最终章不是打败怪物，而是完成一次会演。文化档案将真实传承人与队伍故事作为后续授权内容接入点。',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: OFFICIAL_ICH_URL,
  },
];

export const YINGGE_CHAPTERS: ChapterDefinition[] = [
  {
    id: 'drum-basics', order: 1, title: '锣鼓初习', subtitle: '听见重拍，落下第一槌',
    region: '潮汕 · 入门演绎', tempoLabel: '稳板 · 92 BPM', culturalFocus: '节拍、合槌与群体表演',
    cultureEntryIds: ['collective-dance', 'drum-language'], palette: ['#d8c7a4', '#8c1d18', '#171411'],
    beatMap: buildBeatMap(92, 5, ['left', 'right', 'left', 'right', 'formation']),
  },
  {
    id: 'heroes-enter', order: 2, title: '英雄入阵', subtitle: '认清角色，也认清地方差异',
    region: '潮阳 / 普宁', tempoLabel: '中板 · 106 BPM', culturalFocus: '脸谱、人物与民间叙事',
    cultureEntryIds: ['hero-faces'], palette: ['#e2b85c', '#9f251d', '#13272a'],
    beatMap: buildBeatMap(106, 6, ['left', 'right', 'left', 'left', 'right', 'formation']),
  },
  {
    id: 'formation', order: 3, title: '合槌成阵', subtitle: '一人准，众人齐',
    region: '潮汕 · 队形演绎', tempoLabel: '中快板 · 116 BPM', culturalFocus: '队形、换位与协作',
    cultureEntryIds: ['collective-dance', 'regional-tempo'], palette: ['#c7a45a', '#6d1714', '#17211c'],
    beatMap: buildBeatMap(116, 7, ['left', 'right', 'formation', 'left', 'right', 'right']),
  },
  {
    id: 'village-parade', order: 4, title: '乡里巡游', subtitle: '街巷转身，鼓点不断',
    region: '潮汕 · 节庆巡游', tempoLabel: '快板 · 126 BPM', culturalFocus: '社区、巡游与节庆空间',
    cultureEntryIds: ['living-heritage', 'drum-language'], palette: ['#ead9b7', '#b52b1f', '#13262b'],
    beatMap: buildBeatMap(126, 8, ['left', 'right', 'left', 'formation', 'right', 'left', 'right']),
  },
  {
    id: 'grand-performance', order: 5, title: '英歌会演', subtitle: '鼓声合处，整队如一',
    region: '潮汕 · 舞台化会演', tempoLabel: '高潮快板 · 136 BPM', culturalFocus: '综合演出与活态传承',
    cultureEntryIds: ['regional-tempo', 'living-heritage', 'hero-faces'], palette: ['#e4bd62', '#b42018', '#101716'],
    beatMap: buildBeatMap(136, 9, ['left', 'right', 'left', 'right', 'formation', 'left', 'right', 'formation']),
  },
] satisfies ChapterDefinition[];

export function getChapter(id: YinggeChapterId): ChapterDefinition {
  const chapter = YINGGE_CHAPTERS.find((item) => item.id === id);
  if (!chapter) throw new Error(`Unknown Yingge chapter: ${id}`);
  return chapter;
}
