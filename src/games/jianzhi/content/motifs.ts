import type { MotifDef } from '../core/types';

/**
 * 中国剪纸常见纹样库。
 * 每个 draw(ctx) 在「以 (0,0) 为中心、跨度约 [-0.5,0.5] 的单位坐标系」内画出剪影。
 * 引擎会以 destination-out 方式把这些剪影从红纸中「镂空」，得到剪纸效果。
 */

const IH_CHINA = 'https://www.ihchina.cn/';

function fish(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(-0.04, 0, 0.3, 0.17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.22, 0);
  ctx.lineTo(0.47, -0.19);
  ctx.lineTo(0.4, 0);
  ctx.lineTo(0.47, 0.19);
  ctx.closePath();
  ctx.fill();
}

function lotus(ctx: CanvasRenderingContext2D) {
  const petal = (ang: number, len: number, wid: number) => {
    ctx.save();
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, -len / 2, wid, len / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  petal(0, 0.72, 0.13);
  petal(-0.52, 0.56, 0.11);
  petal(0.52, 0.56, 0.11);
  petal(-1.05, 0.4, 0.09);
  petal(1.05, 0.4, 0.09);
}

function bat(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, 0.06, 0.08, 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  const wing = (dir: 1 | -1) => {
    ctx.beginPath();
    ctx.moveTo(0, -0.02);
    ctx.quadraticCurveTo(dir * 0.24, -0.22, dir * 0.48, -0.12);
    ctx.quadraticCurveTo(dir * 0.42, 0.0, dir * 0.4, 0.14);
    ctx.quadraticCurveTo(dir * 0.24, 0.06, 0, 0.12);
    ctx.closePath();
    ctx.fill();
  };
  wing(1);
  wing(-1);
  ctx.beginPath();
  ctx.arc(-0.05, -0.11, 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0.05, -0.11, 0.045, 0, Math.PI * 2);
  ctx.fill();
}

function peony(ctx: CanvasRenderingContext2D) {
  const ring = (count: number, r: number, len: number, wid: number, off: number) => {
    for (let i = 0; i < count; i += 1) {
      const a = off + (i * 2 * Math.PI) / count;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(0, -r, wid, len, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };
  ring(8, 0.17, 0.18, 0.085, 0);
  ring(6, 0.09, 0.13, 0.065, Math.PI / 6);
  ctx.beginPath();
  ctx.arc(0, 0, 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function plum(ctx: CanvasRenderingContext2D) {
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, 0.09, 0, Math.PI * 2);
  ctx.fill();
}

function peach(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(-0.12, -0.04, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0.12, -0.04, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.rotate(0.6);
  ctx.beginPath();
  ctx.ellipse(0.3, -0.3, 0.11, 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function pomegranate(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, 0.03, 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-0.1, -0.2);
  ctx.lineTo(-0.12, -0.35);
  ctx.lineTo(-0.04, -0.24);
  ctx.lineTo(0, -0.39);
  ctx.lineTo(0.04, -0.24);
  ctx.lineTo(0.12, -0.35);
  ctx.lineTo(0.1, -0.2);
  ctx.closePath();
  ctx.fill();
}

function gourd(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(0, 0.16, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -0.16, 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function coin(ctx: CanvasRenderingContext2D) {
  ctx.lineWidth = 0.12;
  ctx.beginPath();
  ctx.arc(0, 0, 0.33, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-0.11, -0.11, 0.22, 0.22);
  ctx.fill();
}

function butterfly(ctx: CanvasRenderingContext2D) {
  const wing = (dir: 1 | -1) => {
    ctx.beginPath();
    ctx.ellipse(dir * 0.22, -0.1, 0.18, 0.14, dir * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dir * 0.17, 0.14, 0.13, 0.11, -dir * 0.3, 0, Math.PI * 2);
    ctx.fill();
  };
  wing(1);
  wing(-1);
  ctx.beginPath();
  ctx.ellipse(0, 0, 0.04, 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rabbit(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(-0.1, -0.3, 0.06, 0.22, 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.1, -0.3, 0.06, 0.22, -0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -0.05, 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0.18, 0.2, 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function magpie(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.ellipse(0, 0.02, 0.16, 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-0.14, -0.06, 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-0.22, -0.06);
  ctx.lineTo(-0.35, -0.02);
  ctx.lineTo(-0.22, 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.12, 0.06);
  ctx.lineTo(0.42, 0.22);
  ctx.lineTo(0.42, 0.1);
  ctx.lineTo(0.14, 0.0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0.02, -0.02, 0.12, 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function characterGlyph(glyph: string) {
  return (ctx: CanvasRenderingContext2D) => {
    ctx.font = '700 0.82px "Noto Serif SC", "Songti SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyph, 0, 0.02);
  };
}

export const MOTIFS: MotifDef[] = [
  {
    id: 'fish',
    name: '鱼',
    pinyin: 'yú',
    meaning: '年年有余',
    lesson:
      '鱼与「余」同音，是剪纸里最常见的吉祥符号。鱼戏莲、鱼吐水，寄托五谷丰登、生活富足的愿望。北方窗花里常剪一对鱼，寓意连年有余。',
    region: '全国 · 尤以北方窗花为盛',
    category: 'animal',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: fish,
  },
  {
    id: 'lotus',
    name: '莲',
    pinyin: 'lián',
    meaning: '连生贵子 · 纯净',
    lesson:
      '莲谐音「连」，与鱼组合成「连年有余」；莲子多房，又象征多子。佛教中莲代表清净，民间则用以祈求家族绵延、品性高洁。',
    region: '江南及全国',
    category: 'plant',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: lotus,
  },
  {
    id: 'bat',
    name: '蝙蝠',
    pinyin: 'biān fú',
    meaning: '福气临门',
    lesson:
      '蝙蝠的「蝠」谐音「福」。五只蝙蝠环绕，称「五福临门」，代表寿、富、康宁、好德、善终。古人把避邪的蝙蝠纹样贴在门楣窗上迎福。',
    region: '全国 · 宫廷与民间通用',
    category: 'animal',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: bat,
  },
  {
    id: 'peony',
    name: '牡丹',
    pinyin: 'mǔ dān',
    meaning: '富贵荣华',
    lesson:
      '牡丹是「花中之王」，自唐代起便是富贵的象征。扬州、南京的细刻剪纸常用套色表现牡丹，婚嫁喜花中也常见，寓意荣华美满。',
    region: '江南细刻 · 唐宋贵族审美延续',
    category: 'plant',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: peony,
  },
  {
    id: 'plum',
    name: '梅花',
    pinyin: 'méi huā',
    meaning: '五福 · 坚韧',
    lesson:
      '梅花五瓣，民间喻「五福」；它凌寒独开，象征坚韧与报春。剪纸里常与喜鹊同构「喜上眉梢」，也独立成团花装点窗心。',
    region: '全国',
    category: 'plant',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: plum,
  },
  {
    id: 'peach',
    name: '桃',
    pinyin: 'táo',
    meaning: '长寿安康',
    lesson:
      '神话里西王母的蟠桃三千年一熟，食之长生。寿礼与年画中常见桃，赠长辈寓意健康长寿；也与石榴、佛手合称「三多」。',
    region: '全国 · 寿礼题材',
    category: 'plant',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: peach,
  },
  {
    id: 'pomegranate',
    name: '石榴',
    pinyin: 'shí liu',
    meaning: '多子多福',
    lesson:
      '石榴籽实繁多，自唐代由丝路传入后便成为「多子」的吉祥物。婚俗与新居剪纸常用石榴，祈愿子孙繁衍、家族兴旺。',
    region: '丝路传入 · 全国婚俗',
    category: 'plant',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: pomegranate,
  },
  {
    id: 'gourd',
    name: '葫芦',
    pinyin: 'hú lu',
    meaning: '福禄 · 辟邪',
    lesson:
      '葫芦谐音「福禄」，肚大口小能「收气」。道家视其为法器，民间挂在门前驱邪纳福，也是很多地方剪纸里招财保平安的常客。',
    region: '全国 · 道家与民间共奉',
    category: 'object',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: gourd,
  },
  {
    id: 'coin',
    name: '铜钱',
    pinyin: 'tóng qián',
    meaning: '招财进宝',
    lesson:
      '外圆内方的古钱是财富的象征，常与蝙蝠、喜字搭配。剪纸里剪铜钱，多用于商铺与新春，寓意财源广进、生活殷实。',
    region: '全国 · 招财题材',
    category: 'object',
    evidence: 'game-interpretation',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: coin,
  },
  {
    id: 'butterfly',
    name: '蝴蝶',
    pinyin: 'hú dié',
    meaning: '蝶恋花 · 爱情',
    lesson:
      '蝴蝶成双，常配花而成「蝶恋花」，喻美好爱情与春光。剪纸里蝴蝶轻盈灵动，是少女帐帘、嫁衣花样上的常客。',
    region: '全国 · 婚恋题材',
    category: 'animal',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: butterfly,
  },
  {
    id: 'rabbit',
    name: '兔',
    pinyin: 'tù',
    meaning: '玉兔 · 团圆',
    lesson:
      '月宫玉兔捣药，是中秋与月亮的化身。兔年窗花尤为流行，寓意平安团圆；也与嫦娥、桂树同入剪纸，讲一段古老的神话。',
    region: '全国 · 中秋 / 生肖',
    category: 'animal',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: rabbit,
  },
  {
    id: 'magpie',
    name: '喜鹊',
    pinyin: 'xǐ què',
    meaning: '喜上眉梢',
    lesson:
      '喜鹊登梅，是剪纸里最经典的「报喜」构图。民间相信喜鹊叫声带来好消息，故而婚庆、新春都爱剪喜鹊，兆头喜庆。',
    region: '全国 · 报喜题材',
    category: 'animal',
    evidence: 'oral-tradition',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: magpie,
  },
  {
    id: 'fu',
    name: '福',
    pinyin: 'fú',
    meaning: '福气临门',
    lesson:
      '「福」字剪纸是春节的灵魂。倒贴福字取「福到了」的谐音彩头。一个福字，承载了古人对安康、富足、顺遂的全部祈愿。',
    region: '全国 · 春节必备',
    category: 'character',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: characterGlyph('福'),
  },
  {
    id: 'double-happy',
    name: '囍',
    pinyin: 'shuāng xǐ',
    meaning: '双喜临门',
    lesson:
      '「囍」为婚嫁专属，传为王安石双喜巧合所创。婚礼窗花、喜字、枕头花皆用囍，象征两姓联姻、成双成对、百年好合。',
    region: '全国 · 婚俗喜花',
    category: 'character',
    evidence: 'recorded',
    sourceLabel: '中国非物质文化遗产网',
    sourceUrl: IH_CHINA,
    draw: characterGlyph('囍'),
  },
];

export const MOTIF_MAP: Record<string, MotifDef> = Object.fromEntries(
  MOTIFS.map((m) => [m.id, m]),
);

export function getMotif(id: string): MotifDef | undefined {
  return MOTIF_MAP[id];
}
