/**
 * Build + run remaining 名物 arts (N/concept + leftover R/SR).
 * Usage: node scripts/shanhai-artifacts-batch4-remaining.mjs [--dry-run] [--limit=N]
 *
 * Spawns rexai-image.ps1 per card, then compresses PNG → WebP.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  copyFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outRoot = join(root, 'public/assets/shanhai/artifacts');
const artPath = join(root, 'src/games/shanhai-shiyi/content/artifactArt.ts');
const rexScript = join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.claude/skills/rexai-image-generation/scripts/rexai-image.ps1',
);

const dryRun = process.argv.includes('--dry-run');
const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.slice('--limit='.length)) : Infinity;

const STYLE_OBJECT =
  'New Chinese style digital museum object illustration, refined modern Chinese illustration, soft xuan paper texture, elegant muted palette, museum spotlight, single subject centered, clean soft background, no text no watermark no logo, high detail, artistic recreation not a real museum photo';

const STYLE_CONCEPT =
  'New Chinese educational culture card illustration, refined symbolic composition, soft xuan paper texture, elegant muted palette, single clear symbol or vignette centered, clean soft background, no readable Chinese characters no text no watermark no logo, museum quality icon art';

/** English prompt seeds by card id (visual leftovers + distinctive concepts). */
const PROMPT_BY_ID = {
  // leftover R/SR visual
  'A-R01-R-006': `${STYLE_OBJECT}. Ancient Chinese bronze vessel with abstract inscription pattern suggestion, soft gold bronze, blessing of descendants motif without readable characters.`,
  'A-R01-SR-030': `${STYLE_CONCEPT}. Summary card of Zhongyuan ritual bronzes: ding tripod, chime bells, jade bi disc arranged elegantly as a catalog cover.`,
  'A-R02-R-008': `${STYLE_OBJECT}. Elegant fragrant herbs and orchid-like plants of Chu poetry, soft green gold, refined botanical panel.`,
  'A-R02-SR-020': `${STYLE_CONCEPT}. Summary card of Chu culture: phoenix, lacquer red black, silk scroll and river boat vignette as catalog cover.`,
  'A-R03-R-006': `${STYLE_OBJECT}. Ancient Chinese mountain cliff plank road zhandao wooden beams on sheer rock face, misty Bashu mountains refined illustration.`,
  'A-R03-SR-020': `${STYLE_CONCEPT}. Summary card of Bashu: bronze mask eyes, gold face, divine tree and mountain path as catalog cover.`,
  'A-R04-SR-020': `${STYLE_CONCEPT}. Summary card of Jiangnan: celadon vase, garden window, folding fan and tea cup as catalog cover.`,
  'A-R05-SR-003': `${STYLE_OBJECT}. Ancient Chinese frontier gate tower and city wall pass, northern pass architecture silhouette, soft grassland mist.`,
  'A-R05-R-016': `${STYLE_OBJECT}. Poetic impression of Yumen or Yangguan desert pass gate, lonely beacon tower silk road mood refined.`,
  'A-R05-SR-020': `${STYLE_CONCEPT}. Summary card of Saibei: horse, camel, gate tower and desert moon as catalog cover.`,
  'A-R06-SR-020': `${STYLE_CONCEPT}. Summary card of immortal mountains: Kunlun peaks, mythical beast and ancient book as catalog cover.`,
  'A-R07-SR-016': `${STYLE_CONCEPT}. Summary card of Chinese festivals: red couplet blank, lantern, zongzi and mooncake as catalog cover, no readable text.`,
  'A-R08-SR-020': `${STYLE_CONCEPT}. Summary card of maritime silk road: junk ship, compass, porcelain plate and spice pouch as catalog cover.`,
};

/** Fallback English cues from Chinese name keywords. */
function promptFromCard(c) {
  if (PROMPT_BY_ID[c.id]) return PROMPT_BY_ID[c.id];

  const n = c.name + ' ' + (c.one || '');
  const isSpectrum = /小谱/.test(c.name);
  const isKnow = /知一张/.test(c.name);
  const base = isSpectrum || isKnow || c.types.includes('concept') ? STYLE_CONCEPT : STYLE_OBJECT;

  const cues = [];
  if (/礼器|鼎|青铜|范铸/.test(n)) cues.push('bronze ritual vessels silhouette ding and gui');
  if (/玉|比德/.test(n)) cues.push('soft jade disc and tablet glow');
  if (/乐|钟|磬|长调|音乐/.test(n)) cues.push('ritual music chime and soft sound waves motif');
  if (/铭文|字|拓/.test(n)) cues.push('bronze vessel with abstract inscription texture no readable text');
  if (/考古|伦理|证据|边界|勿迷信|再创作/.test(n)) cues.push('open museum handbook and magnifying glass soft scholarly still life');
  if (/山海|经|册|博物/.test(n)) cues.push('ancient classic book page mythical map vignette no readable text');
  if (/中原|在哪里/.test(n)) cues.push('soft map of central plains rivers and fields abstract');
  if (/看展|今日/.test(n)) cues.push('museum gallery spotlight on a single bronze silhouette');
  if (/组合|场景/.test(n)) cues.push('set of ritual bronzes arranged as a group');
  if (/方鼎|圆鼎/.test(n)) cues.push('pair of square and round bronze ding tripods');
  if (/食器|酒器|水器/.test(n)) cues.push('three bronze vessels for food wine and water');
  if (/日用/.test(n)) cues.push('simple pottery bowl next to a ritual bronze contrast');
  if (/楚|凤|漆|江汉|屈原|楚辞|香草|端午/.test(n) && /楚|凤|漆|屈原|楚辞|香草/.test(n))
    cues.push('Chu phoenix feather lacquer red and river mist');
  if (/巴蜀|三星堆|蜀道|栈道|盐|盆地|熊猫/.test(n))
    cues.push('Bashu bronze mask silhouette mountain basin mist');
  if (/江南|瓷|窑|丝|绣|园林|书画|烟雨|市镇|雅集/.test(n))
    cues.push('Jiangnan mist garden lattice and celadon porcelain');
  if (/塞北|丝路|互市|边塞|长城|胡汉|皮毛|玉门|阳关|粟特|关隘/.test(n))
    cues.push('northern grassland silk road gate and soft desert wind');
  if (/仙山|昆仑|西王母|精卫|夸父|异兽|神话|山经|海经/.test(n))
    cues.push('mythic mountain clouds and classical beast silhouette');
  if (/岁时|春节|元宵|端午|中秋|清明|七夕|重阳|冬至|节气|灯|月/.test(n))
    cues.push('seasonal festival vignette lantern moon and soft red gold');
  if (/海丝|港|郑和|季风|沉船|茶瓷丝|侨批|通事|互鉴/.test(n))
    cues.push('maritime junk sail horizon and porcelain crate soft sea');
  if (/栈道/.test(n)) cues.push('cliff plank road on mountain wall');
  if (/关隘|城楼|长城/.test(n)) cues.push('frontier city gate tower');
  if (/熊猫/.test(n)) cues.push('gentle panda silhouette educational card not equating to bronze');
  if (/精卫/.test(n)) cues.push('small bird carrying pebble over sea mythic');
  if (/夸父/.test(n)) cues.push('giant figure reaching toward sun mythic silhouette refined');
  if (/西王母/.test(n)) cues.push('mythic queen figure among Kunlun peaks elegant not scary');
  if (/长调|音乐/.test(n)) cues.push('steppe musician silhouette long melody waves');
  if (/皮毛/.test(n)) cues.push('warm fur craft materials northern still life');
  if (/盐/.test(n)) cues.push('salt crystals and mountain path trade');
  if (/侨批|家书/.test(n)) cues.push('old letter envelope and coin soft overseas Chinese memory');
  if (/沉船/.test(n)) cues.push('underwater shipwreck porcelain shards soft blue');
  if (/罗盘|针/.test(n)) cues.push('compass dial');
  if (/翻译|通事|语词/.test(n)) cues.push('two open books and soft dialogue symbols no text');
  if (/宗教建筑/.test(n)) cues.push('harbor skyline with mixed roof silhouettes soft dusk');
  if (/风险|勇气|风暴/.test(n)) cues.push('ship facing storm clouds refined dramatic calm');
  if (/合图|对照|五区|四区|七区/.test(n))
    cues.push('eight soft cultural symbols arranged in a balanced circle catalog');
  if (/节气/.test(n)) cues.push('circular seasonal wheel of nature motifs no text');
  if (/元宵|灯谜/.test(n)) cues.push('festival lanterns and sweet rice balls soft glow');
  if (/清明|踏青/.test(n)) cues.push('spring willow path and distant memorial mood gentle');
  if (/七夕/.test(n)) cues.push('two stars across milky way soft romantic classical');
  if (/重阳|登高/.test(n)) cues.push('autumn mountain climb chrysanthemum soft');
  if (/冬至/.test(n)) cues.push('winter solstice returning light over quiet courtyard');
  if (/中秋|赏月/.test(n)) cues.push('full moon over quiet pavilion');
  if (/春节|扫尘/.test(n)) cues.push('spring festival door with blank red papers soft gold');
  if (/端午/.test(n)) cues.push('dragon boat and reed leaf dumpling soft festival');
  if (/窑火|分工/.test(n)) cues.push('porcelain kiln fire and clay tools soft craft');
  if (/丝与绣|绣/.test(n)) cues.push('silk embroidery hoop colorful thread Jiangnan');
  if (/书画|笔墨纸砚/.test(n)) cues.push('four treasures of study brush ink paper inkstone still life');
  if (/雅集/.test(n)) cues.push('scholars gathering tea scroll garden soft');
  if (/工艺传承|手艺/.test(n)) cues.push('artisan hands and traditional tool soft respectful');
  if (/烟雨/.test(n)) cues.push('misty rain over Jiangnan bridge refined');
  if (/市镇|商贸/.test(n)) cues.push('canal town market bridge soft life');
  if (/园林|盆景/.test(n)) cues.push('classical garden corner respect nature soft');
  if (/互市|交换/.test(n)) cues.push('border market scales and goods soft peaceful');
  if (/边塞诗|诗/.test(n) && /塞|边|诗/.test(n)) cues.push('frontier moon and beacon tower poetic');
  if (/生态|敬畏/.test(n)) cues.push('fragile grassland and gentle hand protecting plant');
  if (/粟特|中介/.test(n)) cues.push('caravan trader silhouette oasis soft');
  if (/看展|边地文物/.test(n)) cues.push('museum case with hybrid pattern vessel soft light');
  if (/季风/.test(n)) cues.push('seasonal wind over ocean waves and sail');
  if (/港口|港/.test(n)) cues.push('busy ancient harbor ships and warehouses soft');
  if (/郑和/.test(n)) cues.push('grand treasure ship fleet silhouette horizon refined');
  if (/茶瓷丝/.test(n)) cues.push('tea leaves porcelain and silk bolt export goods still life');
  if (/互鉴/.test(n)) cues.push('two cultural motifs meeting on a bridge soft exchange');
  if (/巫祀|伦理/.test(n)) cues.push('calm scholarly warning card open book and soft barrier line elegant');
  if (/范铸|工艺|craft/.test(n)) cues.push('bronze casting molds and molten metal glow soft educational');
  if (/经载|史证|角标/.test(n)) cues.push('two labels myth and history side by side book and bronze');
  if (/海外传播|异兽图像/.test(n)) cues.push('mythic chinese beast icon becoming modern cultural card soft');
  if (/读经三法/.test(n)) cues.push('three open book marks curiosity compare caution soft icons');
  if (/山经与海经/.test(n)) cues.push('mountain gate and sea gate twin doors of a classic book');
  if (/名物与图像/.test(n)) cues.push('classic text page transforming into a painted mythical creature soft');
  if (/方言|地名/.test(n)) cues.push('soft map pins and sound waves cultural geography');
  if (/金与铜/.test(n)) cues.push('gold foil and bronze side by side metal glow');
  if (/盆地与山脉/.test(n)) cues.push('basin plain surrounded by mountains soft map art');
  if (/与中原交流/.test(n)) cues.push('two cultural motifs bronze ding and bashu mask exchanging soft');
  if (/中原与楚地|庄严与浪漫/.test(n)) cues.push('bronze solemn ding and elegant phoenix contrast pair');
  if (/漆：木与光|大漆/.test(n)) cues.push('lacquer wood tray glossy red black soft light');
  if (/江汉与物产/.test(n)) cues.push('river network trees minerals soft landscape resources');
  if (/屈原/.test(n)) cues.push('poet silhouette by river with orchid soft classical');
  if (/蜀道难|诗句/.test(n)) cues.push('steep mountain path poem mood misty cliffs');
  if (/三星堆印象/.test(n)) cues.push('iconic bronze mask silhouette soft museum glow');
  if (/想象与证据/.test(n)) cues.push('myth cloud dissolving into archaeological tools soft truth');
  if (/礼乐一字/.test(n)) cues.push('ritual bronze and music chime paired symbols');
  if (/君子比德/.test(n)) cues.push('jade bi disc reflecting soft human virtue metaphor');
  if (/组合与场景/.test(n)) cues.push('ritual bronze set on altar soft group');
  if (/铭文为什么/.test(n)) cues.push('inscription rubbing abstract texture educational');
  if (/考古与盗掘/.test(n)) cues.push('protected museum relic versus broken lock warning soft ethical card');

  if (!cues.length) {
    cues.push('elegant Chinese cultural symbol abstract refined educational card');
  }

  return `${base}. Theme: ${cues.slice(0, 3).join('; ')}. Inspired by: ${c.name}.`;
}

function loadCards() {
  const dir = join(root, 'src/games/shanhai-shiyi/content');
  const files = readdirSync(dir).filter((f) => f.startsWith('artifacts') && f.endsWith('.ts'));
  const cards = [];
  for (const f of files) {
    const t = readFileSync(join(dir, f), 'utf8');
    for (const b of t.split(/\{\s*\n\s*id:/).slice(1)) {
      const id = b.match(/^\s*'([^']+)'/)?.[1];
      const name = b.match(/name:\s*'([^']+)'/)?.[1];
      const rarity = b.match(/rarity:\s*'([^']+)'/)?.[1];
      const one = b.match(/oneLiner:\s*'([^']+)'/)?.[1];
      const types = b.match(/types:\s*\[([^\]]+)\]/)?.[1] || '';
      const region = b.match(/region:\s*'([^']+)'/)?.[1];
      if (id && name) cards.push({ id, name, rarity, one, types, region });
    }
  }
  return cards;
}

function loadExistingArtIds() {
  const artSrc = readFileSync(artPath, 'utf8');
  return new Set([...artSrc.matchAll(/'(A-R[^']+)':/g)].map((m) => m[1]));
}

function getApiKey() {
  // Prefer Machine env on Windows via powershell
  const ps = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      "[Environment]::GetEnvironmentVariable('REXAI_API_KEY','Machine')",
    ],
    { encoding: 'utf8' },
  );
  const machine = (ps.stdout || '').trim();
  return machine || process.env.REXAI_API_KEY || '';
}

function genOne(id, prompt, apiKey) {
  const finalWebp = join(outRoot, `${id}.webp`);
  if (existsSync(finalWebp)) {
    console.log(`SKIP ${id}`);
    return true;
  }
  const dir = join(outRoot, id);
  const finalPng = join(outRoot, `${id}.png`);
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) {
    try {
      rmSync(join(dir, f), { force: true });
    } catch {
      /* ignore */
    }
  }

  for (let tryN = 1; tryN <= 4; tryN++) {
    console.log(`\n=== ${id} try ${tryN} ===`);
    const r = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        rexScript,
        '-Model',
        'gpt-image-2',
        '-Size',
        '1024x1024',
        '-OutputDir',
        dir,
        '-Prompt',
        prompt,
        '-ApiKey',
        apiKey,
        '-TimeoutMs',
        '300000',
      ],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
    );
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);

    const files = existsSync(dir)
      ? readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
          if (d.isFile() && /\.(png|jpg|webp)$/i.test(d.name)) return [join(dir, d.name)];
          if (d.isDirectory()) {
            return readdirSync(join(dir, d.name))
              .filter((n) => /\.(png|jpg|webp)$/i.test(n))
              .map((n) => join(dir, d.name, n));
          }
          return [];
        })
      : [];
    if (files.length) {
      // pick newest by mtime via order - readdir order ok; prefer any
      const img = files[files.length - 1];
      copyFileSync(img, finalPng);
      console.log(`OK ${finalPng}`);
      return true;
    }
    console.log(`fail try ${tryN}: no file (status ${r.status})`);
    spawnSync('powershell', ['-Command', 'Start-Sleep -Seconds 6']);
  }
  console.log(`FAILED ${id}`);
  return false;
}

function writeArtifactArtTs(allIds) {
  // Group by region prefix
  const byRegion = {};
  for (const id of allIds.sort()) {
    const reg = id.match(/A-(R\d+)/)?.[1] || 'RX';
    if (!byRegion[reg]) byRegion[reg] = [];
    byRegion[reg].push(id);
  }
  const labels = {
    R01: '中原',
    R02: '楚地',
    R03: '巴蜀',
    R04: '江南',
    R05: '塞北',
    R06: '仙山',
    R07: '岁时',
    R08: '海丝',
  };
  let body = `/**
 * 名物级插画映射（RexAI 生成 → WebP）
 * 路径：public/assets/shanhai/artifacts/{id}.webp
 * 自动维护：scripts/shanhai-artifacts-batch4-remaining.mjs
 */

export const ARTIFACT_ART: Record<string, string> = {\n`;
  for (const reg of Object.keys(byRegion).sort()) {
    body += `  // ${reg} ${labels[reg] || ''}\n`;
    for (const id of byRegion[reg]) {
      body += `  '${id}': '/assets/shanhai/artifacts/${id}.webp',\n`;
    }
  }
  body += `};

export function getArtifactArt(id: string): string | undefined {
  return ARTIFACT_ART[id];
}

export function artifactArtCount(): number {
  return Object.keys(ARTIFACT_ART).length;
}
`;
  writeFileSync(artPath, body, 'utf8');
  console.log(`Wrote ${artPath} with ${allIds.length} entries`);
}

function main() {
  mkdirSync(outRoot, { recursive: true });
  if (!existsSync(rexScript)) throw new Error(`rexai-image.ps1 not found: ${rexScript}`);

  const cards = loadCards();
  const existingMap = loadExistingArtIds();
  const need = cards.filter((c) => !existsSync(join(outRoot, `${c.id}.webp`)));
  // also include mapped-but-missing
  console.log(`total cards=${cards.length} on-disk webp missing=${need.length}`);

  const jobs = need.map((c) => ({ ...c, prompt: promptFromCard(c) })).slice(0, limit);
  console.log(`jobs this run=${jobs.length}`);
  if (dryRun) {
    for (const j of jobs) console.log(`${j.id}\t${j.name}\t${j.prompt.slice(0, 100)}...`);
    // still expand map for all cards
    writeArtifactArtTs(cards.map((c) => c.id));
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('REXAI_API_KEY missing (Machine or env)');

  // Expand art map to full atlas upfront so UI paths exist once files land
  writeArtifactArtTs(cards.map((c) => c.id));

  let ok = 0;
  let fail = 0;
  const failed = [];
  for (const j of jobs) {
    if (genOne(j.id, j.prompt, apiKey)) ok++;
    else {
      fail++;
      failed.push(j.id);
    }
  }
  console.log(`\nGEN SUMMARY ok=${ok} fail=${fail}`);
  if (failed.length) console.log('FAILED_IDS:', failed.join(', '));

  // compress any leftover png
  const compress = spawnSync('node', [join(root, 'scripts/shanhai-compress-webp.mjs'), '--delete-png'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (compress.stdout) process.stdout.write(compress.stdout);
  if (compress.stderr) process.stderr.write(compress.stderr);

  // cleanup temp dirs
  for (const d of readdirSync(outRoot, { withFileTypes: true })) {
    if (d.isDirectory()) {
      rmSync(join(outRoot, d.name), { recursive: true, force: true });
    }
  }

  const missing = cards.filter((c) => !existsSync(join(outRoot, `${c.id}.webp`))).map((c) => c.id);
  console.log(`FINAL missing_webp=${missing.length}`);
  if (missing.length) console.log(missing.join(', '));
  process.exit(missing.length ? 1 : 0);
}

main();
