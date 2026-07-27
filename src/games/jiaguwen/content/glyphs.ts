import type { OracleGlyph, GlyphEvolution } from '../core/types.ts';

/**
 * V1 60 字甲骨字库。
 * 字形图为 AI 生成的骨片刻痕风格；SVG 仅作为 fallback 占位，线上优先用图片。
 * 字段按内容卡规格，按主题分组，便于后续关卡与 passport 卡设计。
 */

const GLYPH_META: OracleGlyph[] = [
  // ===== 天象 (8) =====
  { id: 'ri', modern: '日', gloss: '太阳、白天', shapeHint: '外圈像太阳的轮廓，中间一点或一横表示太阳黑子或光芒', lore: '甲骨文中常见的日字，轮廓接近圆形，中间一点或一横，像正午的太阳。', tier: 1, tags: ['nature', 'sky'], image: '/glyphs/ri.png', svgPath: 'M10,25 Q10,5 35,5 Q60,5 60,25 Q60,45 35,45 Q10,45 10,25 M32,22 L38,22', viewBox: '0 0 70 50' , evolution: { kaishu: '日' } },
  { id: 'yue', modern: '月', gloss: '月亮', shapeHint: '弯弯的月牙，缺一笔就是新月', lore: '月字取新月之形，轮廓向内弯，像一弯钩。', tier: 1, tags: ['nature', 'sky'], image: '/glyphs/yue.png', svgPath: 'M20,45 Q5,25 20,8 Q28,5 32,10 Q25,25 32,40 Q28,45 20,45', viewBox: '0 0 45 50' , evolution: { kaishu: '月' } },
  { id: 'yun', modern: '云', gloss: '云、云层', shapeHint: '天空卷曲的云气，横折如层叠', lore: '云字像卷曲的云气，是天气卜辞里常见的主语。', tier: 1, tags: ['nature', 'sky'], image: '/glyphs/yun.png', svgPath: 'M10,30 Q15,15 25,20 Q35,10 45,20 Q55,15 50,30 Q45,40 30,35 Q20,45 10,40 Z', viewBox: '0 0 60 50' , evolution: { kaishu: '云' } },
  { id: 'xing', modern: '星', gloss: '星星', shapeHint: '三星并列，下象生形，表示星辰', lore: '星字由三星并列，下加生形，表示夜空中发光的星。', tier: 1, tags: ['nature', 'sky'], image: '/glyphs/xing.png', svgPath: 'M15,15 L12,8 L18,8 L15,15 M30,15 L27,8 L33,8 L30,15 M45,15 L42,8 L48,8 L45,15 M20,35 L15,25 L25,25 Z M40,35 L35,25 L45,25 Z', viewBox: '0 0 60 50' , evolution: { kaishu: '星' } },
  { id: 'feng', modern: '风', gloss: '风', shapeHint: '凤鸟展翅之形，风借凤音', lore: '风字早期常以凤鸟之形表示，因凤与风音近。', tier: 2, tags: ['nature', 'sky'], image: '/glyphs/feng.png', svgPath: 'M20,40 Q10,30 15,20 Q20,10 35,15 Q50,20 45,35 Q40,45 30,42 M25,25 Q35,20 45,25', viewBox: '0 0 60 50' , evolution: { kaishu: '风' } },
  { id: 'lei', modern: '雷', gloss: '雷', shapeHint: '闪电从云层中伸出，加声符表示轰鸣', lore: '雷字像闪电之形，常表示打雷。', tier: 2, tags: ['nature', 'sky'], image: '/glyphs/lei.png', svgPath: 'M25,5 L35,25 L30,25 L45,45 L25,30 L30,30 L20,15 L28,15 Z', viewBox: '0 0 50 50' , evolution: { kaishu: '雷' } },
  { id: 'yu-rain', modern: '雨', gloss: '雨、下雨', shapeHint: '天穹之下落下数滴雨水', lore: '雨字像云层之下落下数点雨滴，是最具象的自然现象字之一。', tier: 1, tags: ['nature', 'sky'], image: '/glyphs/yu-rain.png', svgPath: 'M10,15 Q25,5 40,15 L40,22 Q25,18 10,22 Z M15,28 L15,35 M25,28 L25,40 M35,28 L35,35', viewBox: '0 0 50 50' , evolution: { kaishu: '雨' } },
  { id: 'dan', modern: '旦', gloss: '旦、早晨', shapeHint: '日出于地平线，表示天明', lore: '旦字像太阳从地面升起，表示早晨。', tier: 2, tags: ['nature', 'sky'], image: '/glyphs/dan.png', svgPath: 'M15,20 Q25,10 35,20 Q45,30 35,40 Q25,45 15,40 Q10,30 15,20 M5,45 L45,45', viewBox: '0 0 50 50' , evolution: { kaishu: '旦' } },

  // ===== 山川 (8) =====
  { id: 'shan', modern: '山', gloss: '山峰、山岳', shapeHint: '三座起伏的山峰，中峰最高', lore: '山字以三峰象形，表示峰峦起伏。', tier: 1, tags: ['nature', 'land'], image: '/glyphs/shan.png', svgPath: 'M5,45 L25,10 L45,45 M25,10 L25,45', viewBox: '0 0 50 50' , evolution: { kaishu: '山' } },
  { id: 'shui', modern: '水', gloss: '水流、河', shapeHint: '中间一道主流，两侧溅出水点', lore: '水字像一条河的主流，两侧点表示水波或支流。', tier: 1, tags: ['nature', 'land'], image: '/glyphs/shui.png', svgPath: 'M25,5 L25,40 M15,15 L10,25 M15,30 L8,35 M35,15 L40,25 M35,30 L42,35 M20,45 L25,40 L30,45', viewBox: '0 0 50 50' , evolution: { kaishu: '水' } },
  { id: 'qiu', modern: '丘', gloss: '小丘、丘陵', shapeHint: '两座小山相连，表示低矮土丘', lore: '丘字像两丘相连，表示小山或丘陵。', tier: 2, tags: ['nature', 'land'], image: '/glyphs/qiu.png', svgPath: 'M10,45 L20,20 L30,45 M30,45 L40,25 L50,45', viewBox: '0 0 60 50' , evolution: { kaishu: '丘' } },
  { id: 'gu', modern: '谷', gloss: '山谷、河谷', shapeHint: '两山夹一水，表示深谷', lore: '谷字像两山夹水，表示山谷或河谷。', tier: 2, tags: ['nature', 'land'], image: '/glyphs/gu.png', svgPath: 'M15,10 L15,40 M45,10 L45,40 M25,45 Q25,25 30,20 Q35,25 35,45', viewBox: '0 0 60 50' , evolution: { kaishu: '谷' } },
  { id: 'shi-stone', modern: '石', gloss: '石头', shapeHint: '山崖下有石块崩落', lore: '石字像山崖下有石，表示石头。', tier: 2, tags: ['nature', 'land'], image: '/glyphs/shi-stone.png', svgPath: 'M10,20 L20,10 L40,10 L45,25 L35,40 L15,40 Z M25,25 L30,30 L25,35', viewBox: '0 0 55 50' , evolution: { kaishu: '石' } },
  { id: 'quan-spring', modern: '泉', gloss: '泉水', shapeHint: '石洞中有水流出', lore: '泉字像山石间有水流涌出，表示泉源。', tier: 2, tags: ['nature', 'land'], image: '/glyphs/quan-spring.png', svgPath: 'M20,10 L30,10 L30,25 Q40,25 40,35 Q40,45 30,45 Q20,45 20,35 Q20,25 30,25', viewBox: '0 0 50 50' , evolution: { kaishu: '泉' } },
  { id: 'lin', modern: '林', gloss: '树林', shapeHint: '两棵木并立，表示成林', lore: '林字是两木并列，表示树木众多。', tier: 1, tags: ['nature', 'land'], image: '/glyphs/lin.png', svgPath: 'M15,45 L20,15 L10,5 M20,15 L30,5 M25,45 L30,15 L20,5 M30,15 L40,5', viewBox: '0 0 50 50' , evolution: { kaishu: '林' } },
  { id: 'mu', modern: '木', gloss: '树木', shapeHint: '一竖是树干，上面分叉是枝，下面是根', lore: '木字上枝、中干、下根，像一棵树的侧面剪影。', tier: 1, tags: ['nature', 'land'], image: '/glyphs/mu.png', svgPath: 'M25,5 L25,45 M25,15 L10,5 M25,15 L40,5 M25,30 L10,42 M25,30 L40,42', viewBox: '0 0 50 50' , evolution: { kaishu: '木' } },

  // ===== 人体 / 姿态 (8) =====
  { id: 'ren', modern: '人', gloss: '人、人体', shapeHint: '侧身站立，垂臂而立', lore: '人字像侧身垂臂而立之形，是常用偏旁。', tier: 1, tags: ['body'], image: '/glyphs/ren.png', svgPath: 'M20,50 L28,15 L40,50 M28,15 Q32,5 38,5', viewBox: '0 0 50 55' , evolution: { kaishu: '人' } },
  { id: 'nv', modern: '女', gloss: '女子', shapeHint: '跪坐的人形，双臂交叠于前', lore: '女字取跪坐敛手之形，反映古代坐姿礼仪。', tier: 1, tags: ['body'], image: '/glyphs/nv.png', svgPath: 'M15,45 Q15,25 25,15 Q30,10 38,10 M25,15 L25,45 M15,30 L38,30', viewBox: '0 0 50 50' , evolution: { kaishu: '女' } },
  { id: 'shou', modern: '手', gloss: '手', shapeHint: '五指张开的手掌', lore: '手字像张开的手掌，五指可见。', tier: 1, tags: ['body'], image: '/glyphs/shou.png', svgPath: 'M10,30 L15,15 L20,30 M25,30 L25,15 L30,15 L30,30 M35,30 L40,15 L45,30', viewBox: '0 0 55 50' , evolution: { kaishu: '手' } },
  { id: 'zu', modern: '足', gloss: '足、脚', shapeHint: '小腿与脚掌，下面像脚趾', lore: '足字像小腿连脚掌，下部分出脚趾。', tier: 1, tags: ['body'], image: '/glyphs/zu.png', svgPath: 'M15,10 L25,10 L25,35 Q35,35 35,42 Q35,48 25,48 Q15,48 15,42', viewBox: '0 0 50 50' , evolution: { kaishu: '足' } },
  { id: 'er', modern: '耳', gloss: '耳朵', shapeHint: '外耳轮廓与耳道', lore: '耳字像人耳的侧面轮廓，是常见部首。', tier: 1, tags: ['body'], image: '/glyphs/er.png', svgPath: 'M15,15 Q25,5 35,15 Q40,25 35,35 Q25,45 15,35 Q10,25 15,15 M20,20 Q25,25 20,30', viewBox: '0 0 50 50' , evolution: { kaishu: '耳' } },
  { id: 'kou', modern: '口', gloss: '口、嘴', shapeHint: '一张嘴的轮廓，上宽下窄', lore: '口字像人嘴之形，是常见部首。', tier: 1, tags: ['body'], image: '/glyphs/kou.png', svgPath: 'M15,20 Q25,10 35,20 Q38,30 35,40 Q25,45 15,40 Q12,30 15,20', viewBox: '0 0 50 50' , evolution: { kaishu: '口' } },
  { id: 'jian', modern: '见', gloss: '看见', shapeHint: '人上有目，表示看见', lore: '见字像一个人睁大眼睛，上有目，表示看见。', tier: 2, tags: ['body', 'action'], image: '/glyphs/jian.png', svgPath: 'M15,40 L20,20 L30,20 L35,40 M20,20 L15,10 M30,20 L35,10', viewBox: '0 0 50 50' , evolution: { kaishu: '见' } },
  { id: 'wang-look', modern: '望', gloss: '远望', shapeHint: '人立土丘上举目，表示远望', lore: '望字像人站在高处举目远望，表示远望。', tier: 2, tags: ['body', 'action'], image: '/glyphs/wang-look.png', svgPath: 'M20,45 L25,25 L35,25 L40,45 M25,25 L20,15 M35,25 L40,15', viewBox: '0 0 60 50' , evolution: { kaishu: '望' } },
  { id: 'zou', modern: '走', gloss: '走、跑', shapeHint: '人摆动双臂，跨步前行', lore: '走字像一个人摆动双臂大步向前，表示奔跑或行走。', tier: 2, tags: ['body', 'action'], image: '/glyphs/zou.png', svgPath: 'M15,45 L25,20 L35,20 L40,35 M25,20 L20,10 M35,20 L40,10', viewBox: '0 0 55 50' , evolution: { kaishu: '走' } },

  // ===== 动物 (8) =====
  { id: 'quan', modern: '犬', gloss: '狗', shapeHint: '侧身竖耳、长尾上翘', lore: '犬字像侧立的狗形，耳尖、尾上卷。', tier: 1, tags: ['animal'], image: '/glyphs/quan.png', svgPath: 'M10,35 Q8,20 20,15 Q25,10 35,15 Q42,18 42,30 Q42,40 35,42 Q38,35 32,35 L25,35 L18,35 Q12,35 10,45 L10,35', viewBox: '0 0 50 50' , evolution: { kaishu: '犬' } },
  { id: 'niu', modern: '牛', gloss: '牛', shapeHint: '牛头正面，两角上弯', lore: '牛字突出两角向上弯的正面牛头形象。', tier: 1, tags: ['animal'], image: '/glyphs/niu.png', svgPath: 'M20,15 Q25,5 30,15 L35,30 L35,45 L15,45 L15,30 Z M15,25 L10,35 M35,25 L40,35', viewBox: '0 0 50 50' , evolution: { kaishu: '牛' } },
  { id: 'ma', modern: '马', gloss: '马', shapeHint: '马侧立，头、鬣、尾、足俱全', lore: '马字像侧立的马，有鬃毛、长尾和四足。', tier: 2, tags: ['animal'], image: '/glyphs/ma.png', svgPath: 'M10,40 L15,25 L20,25 L25,15 L30,15 L35,25 L40,25 L45,40 L35,40 L35,48 L30,48 L30,40 Z', viewBox: '0 0 60 50' , evolution: { kaishu: '马' } },
  { id: 'lu', modern: '鹿', gloss: '鹿', shapeHint: '鹿头有角，身侧有斑纹', lore: '鹿字像鹿的侧面，头上有角，身上有斑纹。', tier: 2, tags: ['animal'], image: '/glyphs/lu.png', svgPath: 'M15,35 L20,20 L30,15 L35,20 L40,35 L35,42 L30,35 L25,42 L20,35 Z', viewBox: '0 0 55 50' , evolution: { kaishu: '鹿' } },
  { id: 'xiang', modern: '象', gloss: '象', shapeHint: '长鼻、巨耳、四肢粗壮', lore: '象字像大象，长鼻下垂，大耳扇张。', tier: 2, tags: ['animal'], image: '/glyphs/xiang.png', svgPath: 'M15,40 L15,25 L25,20 L30,30 L30,45 L20,45 L20,40 Z M25,20 L35,15 L40,25 L30,30', viewBox: '0 0 55 50' , evolution: { kaishu: '象' } },
  { id: 'hu', modern: '虎', gloss: '虎', shapeHint: '虎头斑纹、张口露齿', lore: '虎字像虎的侧面，头部有斑纹，张口露齿。', tier: 2, tags: ['animal'], image: '/glyphs/hu.png', svgPath: 'M15,30 L20,15 L35,15 L40,30 L35,45 L20,45 Z M25,25 L30,30 L25,35 M30,20 L40,20', viewBox: '0 0 55 50' , evolution: { kaishu: '虎' } },
  { id: 'yu-fish', modern: '鱼', gloss: '鱼', shapeHint: '鱼头、鱼身、鱼尾与鳍', lore: '鱼字像鱼的侧面，头、身、尾、鳍俱全。', tier: 1, tags: ['animal'], image: '/glyphs/yu-fish.png', svgPath: 'M10,25 Q20,15 30,20 L45,25 L30,30 Q20,35 10,25 M30,20 L35,15 M30,30 L35,35', viewBox: '0 0 55 50' , evolution: { kaishu: '鱼' } },
  { id: 'niao', modern: '鸟', gloss: '鸟', shapeHint: '鸟侧立，有头、身、羽、爪', lore: '鸟字像鸟侧立，头上有羽，身下有爪。', tier: 1, tags: ['animal'], image: '/glyphs/niao.png', svgPath: 'M15,35 L20,20 L30,20 L35,35 L30,45 L20,45 Z M25,20 L30,10 M20,35 L10,30', viewBox: '0 0 50 50' , evolution: { kaishu: '鸟' } },

  // ===== 器物/建筑 (8) =====
  { id: 'shang', modern: '上', gloss: '上方、上面', shapeHint: '一长横作基准，短竖指向上方', lore: '上以短划在上的指示符号表示方位。', tier: 1, tags: ['object', 'direction'], image: '/glyphs/shang.png', svgPath: 'M5,35 L45,35 M25,35 L25,10 M20,15 L25,10 L30,15', viewBox: '0 0 50 45' , evolution: { kaishu: '上' } },
  { id: 'xia', modern: '下', gloss: '下方、下面', shapeHint: '一长横作基准，短竖指向下方', lore: '下与上相对，短划在基准线之下。', tier: 1, tags: ['object', 'direction'], image: '/glyphs/xia.png', svgPath: 'M5,15 L45,15 M25,15 L25,40 M20,35 L25,40 L30,35', viewBox: '0 0 50 45' , evolution: { kaishu: '下' } },
  { id: 'da', modern: '大', gloss: '大、人张开四肢', shapeHint: '正面伸臂张腿的人形', lore: '大字像一个正面伸臂而立的人，表示大。', tier: 1, tags: ['body'], image: '/glyphs/da.png', svgPath: 'M25,5 L25,45 M25,15 L5,25 M25,15 L45,25 M25,35 L10,45 M25,35 L40,45', viewBox: '0 0 50 50' , evolution: { kaishu: '大' } },
  { id: 'zhong', modern: '中', gloss: '中间、中央', shapeHint: '旗帜之形，中央有旌旒', lore: '中字像旗旒飘扬之形，中间一竖贯穿，表示中央、中间。', tier: 2, tags: ['object', 'direction'], image: '/glyphs/zhong.png', svgPath: 'M22,5 L28,5 L28,45 L22,45 M10,15 Q28,15 45,15 M10,25 Q28,25 45,25', viewBox: '0 0 50 50' , evolution: { kaishu: '中' } },
  { id: 'tian', modern: '田', gloss: '田地', shapeHint: '方格划分的田垄', lore: '田字像阡陌纵横的农田，象征耕作之地。', tier: 1, tags: ['nature', 'land'], image: '/glyphs/tian.png', svgPath: 'M10,10 L40,10 L40,40 L10,40 Z M10,20 L40,20 M10,30 L40,30 M25,10 L25,40', viewBox: '0 0 50 50' , evolution: { kaishu: '田' } },
  { id: 'mu-eye', modern: '目', gloss: '眼睛', shapeHint: '一只竖立的眼睛，外框是眼眶，中间是瞳仁', lore: '目字像人眼的侧视轮廓，后多为偏旁。', tier: 1, tags: ['body'], image: '/glyphs/mu-eye.png', svgPath: 'M15,15 Q25,5 35,15 Q40,25 35,35 Q25,45 15,35 Q10,25 15,15 M25,20 Q28,25 25,30 Q22,25 25,20', viewBox: '0 0 50 50' , evolution: { kaishu: '目' } },
  { id: 'huo', modern: '火', gloss: '火、火焰', shapeHint: '向上窜起的火苗，分叉如焰', lore: '火字像火焰上腾之形，两边分岔表示火舌。', tier: 1, tags: ['nature'], image: '/glyphs/huo.png', svgPath: 'M25,45 L25,15 M15,35 L22,20 M35,35 L28,20 M10,45 Q18,30 25,15 Q32,30 40,45 M20,45 L25,35 L30,45', viewBox: '0 0 50 50' , evolution: { kaishu: '火' } },
  { id: 'dao', modern: '刀', gloss: '刀', shapeHint: '刀身与刀柄，刃部弯曲', lore: '刀字像刀的形状，刃部朝下。', tier: 2, tags: ['object', 'tool'], image: '/glyphs/dao.png', svgPath: 'M15,10 L35,10 L40,30 L35,45 L25,45 L25,25 Z', viewBox: '0 0 55 50' , evolution: { kaishu: '刀' } },
  { id: 'gong', modern: '弓', gloss: '弓', shapeHint: '弓身弯曲，两端有弦', lore: '弓字像弓的形状，弯背张弦。', tier: 2, tags: ['object', 'tool'], image: '/glyphs/gong.png', svgPath: 'M10,25 Q10,5 25,5 Q40,5 40,25 Q40,45 25,45 Q10,45 10,25 M15,15 L35,35', viewBox: '0 0 50 50' , evolution: { kaishu: '弓' } },
  { id: 'men', modern: '门', gloss: '门', shapeHint: '两扇门扇相对', lore: '门字像两扇门相对，表示房屋的出入口。', tier: 2, tags: ['object', 'building'], image: '/glyphs/men.png', svgPath: 'M10,10 L20,10 L20,45 L10,45 Z M30,10 L40,10 L40,45 L30,45 Z', viewBox: '0 0 50 50' , evolution: { kaishu: '门' } },
  { id: 'hu-door', modern: '户', gloss: '门扇', shapeHint: '单扇门扇', lore: '户字像单扇门，是门的半边。', tier: 2, tags: ['object', 'building'], image: '/glyphs/hu-door.png', svgPath: 'M10,10 L30,10 L30,45 L10,45 Z', viewBox: '0 0 40 50' , evolution: { kaishu: '户' } },
  { id: 'yi', modern: '衣', gloss: '衣服', shapeHint: '上衣领口、两袖与下摆', lore: '衣字像上衣之形，有领、袖和下摆。', tier: 2, tags: ['object', 'cloth'], image: '/glyphs/yi.png', svgPath: 'M20,10 L30,10 L35,25 L35,45 L15,45 L15,25 Z M25,10 L25,25', viewBox: '0 0 50 50' , evolution: { kaishu: '衣' } },
  { id: 'zhou', modern: '舟', gloss: '舟、船', shapeHint: '舟身与船首船尾翘起', lore: '舟字像小船的侧面，首尾上翘。', tier: 2, tags: ['object', 'vehicle'], image: '/glyphs/zhou.png', svgPath: 'M10,30 Q20,20 30,22 L45,25 Q45,40 30,42 Q15,45 10,35 Z', viewBox: '0 0 55 50' , evolution: { kaishu: '舟' } },
  { id: 'che', modern: '车', gloss: '车、战车', shapeHint: '车厢、两轮与车轴', lore: '车字像车厢、两轮与轴的组合，反映商代战车形象。', tier: 2, tags: ['object', 'vehicle'], image: '/glyphs/che.png', svgPath: 'M10,20 L40,20 M10,35 L40,35 M15,20 L15,35 M35,20 L35,35 M5,35 Q5,45 15,45 Q25,45 25,35 M25,35 Q25,45 35,45 Q45,45 45,35 M25,10 L35,5', viewBox: '0 0 50 50' , evolution: { kaishu: '车' } },
  { id: 'ding', modern: '鼎', gloss: '鼎', shapeHint: '三足圆腹，两耳', lore: '鼎字像三足圆腹的鼎，是商周重要礼器。', tier: 2, tags: ['object', 'ritual'], image: '/glyphs/ding.png', svgPath: 'M15,15 L35,15 L38,30 L35,45 L15,45 L12,30 Z M18,15 L25,25 L32,15 M20,30 L30,30', viewBox: '0 0 50 50' , evolution: { kaishu: '鼎' } },

  // ===== 祭祀/权力 (8) =====
  { id: 'bu', modern: '卜', gloss: '占卜、裂纹', shapeHint: '兆纹：一条竖线，旁有斜裂纹', lore: '卜字像龟甲灼烤后出现的裂纹，是甲骨占卜的直接来源。', tier: 2, tags: ['ritual'], image: '/glyphs/bu.png', svgPath: 'M25,5 L25,45 M25,20 L15,35 M25,25 L35,35', viewBox: '0 0 50 50' , evolution: { kaishu: '卜' } },
  { id: 'zhen', modern: '贞', gloss: '贞问、卜问', shapeHint: '鼎形，古借鼎为贞', lore: '贞字本像鼎形，商代常以「贞」引出卜辞问句。', tier: 2, tags: ['ritual'], image: '/glyphs/zhen.png', svgPath: 'M15,15 Q25,8 35,15 L38,30 Q38,40 25,42 Q12,40 12,30 Z M18,15 L25,25 L32,15 M20,30 L30,30', viewBox: '0 0 50 50' , evolution: { kaishu: '贞' } },
  { id: 'wang', modern: '王', gloss: '王、君主', shapeHint: '斧钺之形，象征权力', lore: '王字像斧钺之形，是商周权力的象征，后指最高统治者。', tier: 2, tags: ['power'], image: '/glyphs/wang.png', svgPath: 'M10,15 L40,15 M25,15 L25,45 M15,25 L35,25 M12,35 L38,35', viewBox: '0 0 50 50' , evolution: { kaishu: '王' } },
  { id: 'zu-ancestor', modern: '祖', gloss: '祖先、宗庙', shapeHint: '神主牌位之形', lore: '祖字像宗庙中的神主，表示祖先。', tier: 3, tags: ['ritual', 'power'], image: '/glyphs/zu-ancestor.png', svgPath: 'M15,10 L35,10 L35,45 L15,45 Z M20,15 L20,30 M30,15 L30,30', viewBox: '0 0 50 50' , evolution: { kaishu: '祖' } },
  { id: 'di', modern: '帝', gloss: '帝、上帝', shapeHint: '花蒂之形，引申为至高神', lore: '帝字本像花蒂，后引申为商人心中的至高神。', tier: 3, tags: ['ritual', 'power'], image: '/glyphs/di.png', svgPath: 'M25,5 L25,25 M15,15 Q25,5 35,15 M15,25 L35,25 M15,35 L35,35', viewBox: '0 0 50 50' , evolution: { kaishu: '帝' } },
  { id: 'zong', modern: '宗', gloss: '宗庙', shapeHint: '屋宇下置神主', lore: '宗字像屋宇之下有神主，表示宗庙。', tier: 3, tags: ['ritual', 'building'], image: '/glyphs/zong.png', svgPath: 'M10,20 L25,10 L40,20 L40,45 L10,45 Z M20,25 L30,25 L30,40 L20,40 Z', viewBox: '0 0 50 50' , evolution: { kaishu: '宗' } },
  { id: 'zhu', modern: '祝', gloss: '祝祷', shapeHint: '人跪于神主前祷告', lore: '祝字像人在神主前跪祷，表示祈求祝告。', tier: 3, tags: ['ritual', 'action'], image: '/glyphs/zhu.png', svgPath: 'M15,45 L20,25 L30,25 L35,45 M20,25 L15,15 M30,25 L35,15', viewBox: '0 0 50 50' , evolution: { kaishu: '祝' } },
  { id: 'shi', modern: '史', gloss: '史官、记事', shapeHint: '手持简册记录', lore: '史字像人手持简册，表示记录史事。', tier: 3, tags: ['ritual', 'action'], image: '/glyphs/shi-stone.png', svgPath: 'M15,45 L20,25 L30,25 L35,45 M25,25 L25,15 L35,15 M20,15 L10,15', viewBox: '0 0 50 50' , evolution: { kaishu: '史' } },
  { id: 'ling', modern: '令', gloss: '命令', shapeHint: '人跪于屋下受命', lore: '令字像人在屋下跪受命，表示命令。', tier: 3, tags: ['power', 'action'], image: '/glyphs/ling.png', svgPath: 'M10,20 L25,10 L40,20 L35,35 L15,35 Z M25,20 L25,45', viewBox: '0 0 50 50' , evolution: { kaishu: '令' } },

  // ===== 农牧 (8) =====
  { id: 'he', modern: '禾', gloss: '禾、谷物', shapeHint: '下垂的谷穗与茎秆', lore: '禾字像谷类作物，穗垂于上，叶与根在下，是农业社会的核心字。', tier: 2, tags: ['nature', 'farm'], image: '/glyphs/he.png', svgPath: 'M25,5 Q28,15 30,25 Q32,35 35,42 M25,15 L15,25 M25,15 L35,25 M25,30 L10,35 M25,30 L40,35', viewBox: '0 0 50 50' , evolution: { kaishu: '禾' } },
  { id: 'yang', modern: '羊', gloss: '羊', shapeHint: '弯角、头部正面轮廓', lore: '羊字突出弯角与头部轮廓，是常见祭祀牺牲。', tier: 1, tags: ['animal', 'farm'], image: '/glyphs/yang.png', svgPath: 'M18,25 Q10,20 12,10 Q18,5 22,12 M32,25 Q40,20 38,10 Q32,5 28,12 M20,25 L25,45 L30,25 M15,30 L35,30', viewBox: '0 0 50 50' , evolution: { kaishu: '羊' } },
  { id: 'lai', modern: '来', gloss: '来、麦', shapeHint: '麦穗下垂之形', lore: '来字像麦穗下垂，本义为麦，后借为往来之来。', tier: 3, tags: ['nature', 'farm'], image: '/glyphs/lai.png', svgPath: 'M25,5 L25,45 M25,15 L15,10 M25,15 L35,10 M25,25 L10,25 M25,25 L40,25', viewBox: '0 0 50 50' , evolution: { kaishu: '来' } },
  { id: 'nian', modern: '年', gloss: '年、谷物成熟', shapeHint: '人负禾，表示年成', lore: '年字像人背负禾谷，表示谷物成熟一次，即一年。', tier: 3, tags: ['farm'], image: '/glyphs/nian.png', svgPath: 'M15,30 L20,15 L30,15 L35,30 M25,15 L25,35 L35,45 M25,35 L15,45', viewBox: '0 0 50 50' , evolution: { kaishu: '年' } },
  { id: 'se', modern: '啬', gloss: '啬、收获', shapeHint: '粮仓内堆禾，表示收藏', lore: '啬字像仓廪中堆禾，表示收获收藏。', tier: 3, tags: ['farm'], image: '/glyphs/se.png', svgPath: 'M10,15 L40,15 L40,45 L10,45 Z M15,25 L35,25 M15,35 L35,35 M25,15 L25,45', viewBox: '0 0 50 50' , evolution: { kaishu: '啬' } },
  { id: 'cang', modern: '仓', gloss: '仓库', shapeHint: '粮仓，上盖下储', lore: '仓字像粮仓，上有顶盖，下有储粮之所。', tier: 3, tags: ['farm', 'building'], image: '/glyphs/cang.png', svgPath: 'M10,20 L25,10 L40,20 L40,45 L10,45 Z M15,30 L35,30', viewBox: '0 0 50 50' , evolution: { kaishu: '仓' } },
  { id: 'jiu', modern: '酒', gloss: '酒', shapeHint: '酒器之形，表示酒', lore: '酒字像酒器，表示用谷物酿造的酒。', tier: 3, tags: ['farm', 'ritual'], image: '/glyphs/jiu.png', svgPath: 'M15,15 L35,15 L35,35 L30,45 L20,45 L15,35 Z M20,15 L20,25 M30,15 L30,25', viewBox: '0 0 50 50' , evolution: { kaishu: '酒' } },
  { id: 'chang', modern: '鬯', gloss: '鬯酒、香酒', shapeHint: '盛香酒的器，中有黍穗', lore: '鬯字像器中盛香酒，并加黍穗，是祭祀用的高级酒。', tier: 3, tags: ['farm', 'ritual'], image: '/glyphs/chang.png', svgPath: 'M15,15 L35,15 L35,40 L30,45 L20,45 L15,40 Z M25,5 L25,15 M20,25 L30,25', viewBox: '0 0 50 50' , evolution: { kaishu: '鬯' } },
  { id: 'shou-hunt', modern: '狩', gloss: '狩猎', shapeHint: '猎犬追逐野兽，常从犬从兽', lore: '狩表示打猎活动。甲骨文中多与田猎、捕获有关。', tier: 3, tags: ['action'], image: '/glyphs/shou-hunt.png', svgPath: 'M10,35 Q8,20 20,15 Q25,10 35,15 M32,35 Q42,35 45,25 M15,40 L25,30 L35,42', viewBox: '0 0 50 50' , evolution: { kaishu: '狩' } },
];

const EVOLUTIONS: Partial<Record<string, GlyphEvolution>> = {
  'ri': { oracle: '/glyphs/ri.png', jinwen: 'glyphs/evolution/ri-jinwen.png', xiaozhuan: 'glyphs/evolution/ri-xiaozhuan.png', kaishu: '日' },
  'yue': { oracle: '/glyphs/yue.png', jinwen: 'glyphs/evolution/yue-jinwen.png', xiaozhuan: 'glyphs/evolution/yue-xiaozhuan.png', kaishu: '月' },
  'shan': { oracle: '/glyphs/shan.png', jinwen: 'glyphs/evolution/shan-jinwen.png', xiaozhuan: 'glyphs/evolution/shan-xiaozhuan.png', kaishu: '山' },
  'shui': { oracle: '/glyphs/shui.png', jinwen: 'glyphs/evolution/shui-jinwen.png', xiaozhuan: 'glyphs/evolution/shui-xiaozhuan.png', kaishu: '水' },
  'mu': { oracle: '/glyphs/mu.png', jinwen: 'glyphs/evolution/mu-jinwen.png', xiaozhuan: 'glyphs/evolution/mu-xiaozhuan.png', kaishu: '木' },
  'ren': { oracle: '/glyphs/ren.png', jinwen: 'glyphs/evolution/ren-jinwen.png', xiaozhuan: 'glyphs/evolution/ren-xiaozhuan.png', kaishu: '人' },
  'nv': { oracle: '/glyphs/nv.png', jinwen: 'glyphs/evolution/nv-jinwen.png', xiaozhuan: 'glyphs/evolution/nv-xiaozhuan.png', kaishu: '女' },
  'quan': { oracle: '/glyphs/quan.png', jinwen: 'glyphs/evolution/quan-jinwen.png', xiaozhuan: 'glyphs/evolution/quan-xiaozhuan.png', kaishu: '犬' },
  'yu-rain': { oracle: '/glyphs/yu-rain.png', jinwen: 'glyphs/evolution/yu-rain-jinwen.png', xiaozhuan: 'glyphs/evolution/yu-rain-xiaozhuan.png', kaishu: '雨' },
  'kou': { oracle: '/glyphs/kou.png', jinwen: 'glyphs/evolution/kou-jinwen.png', xiaozhuan: 'glyphs/evolution/kou-xiaozhuan.png', kaishu: '口' },
};

export const GLYPHS: OracleGlyph[] = GLYPH_META.map((g) => ({
  ...g,
  evolution: EVOLUTIONS[g.id] ?? null,
}));

export const GLYPH_BY_ID: Record<string, OracleGlyph> = Object.fromEntries(
  GLYPHS.map((g) => [g.id, g]),
);

export function listGlyphsByTier(tier: 1 | 2 | 3): OracleGlyph[] {
  return GLYPHS.filter((g) => g.tier === tier);
}

export function getGlyph(id: string): OracleGlyph | undefined {
  return GLYPH_BY_ID[id];
}

export function listGlyphIdsByTag(tag: string): string[] {
  return GLYPHS.filter((g) => (g.tags as string[]).includes(tag)).map((g) => g.id);
}

export const SOURCES_NOTE = '字形为根据公开甲骨文字形图录与教材归纳的教学示意，非博物馆拓片摹本。';