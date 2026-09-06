/**
 * 生成二十四节气公历日期表。
 *
 * 数据源：香港天文台《公历与农历对照表》纯文本（resources/solar-terms/T{year}e.txt），
 * 每行形如 `2026/8/23  7th Lunar Month  Sunday  End of Heat`。
 *
 * 生成 `src/core/daily/solarTermDates.generated.ts`。超出覆盖年份时运行时不展示
 * 「今日节气」，而不是给错日期。新增年份 = 下载对应 T{year}e.txt 后重跑本脚本。
 *
 * 用法：node scripts/generate-solar-terms.mjs
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'resources', 'solar-terms');
const outFile = join(root, 'src', 'core', 'daily', 'solarTermDates.generated.ts');

/** 香港天文台英文名 → 节气 id（与 src/games/ershisi-jieqi/content/terms.ts 对齐）。 */
const NAME_TO_ID = new Map([
  ['Spring Commences', 'lichun'],
  ['Spring Showers', 'yushui'],
  ['Insects Waken', 'jingzhe'],
  ['Vernal Equinox', 'chunfen'],
  ['Bright & Clear', 'qingming'],
  ['Corn Rain', 'guyu'],
  ['Summer Commences', 'lixia'],
  ['Corn Forms', 'xiaoman'],
  ['Corn on Ear', 'mangzhong'],
  ['Summer Solstice', 'xiazhi'],
  ['Moderate Heat', 'xiaoshu'],
  ['Great Heat', 'dashu'],
  ['Autumn Commences', 'liqiu'],
  ['End of Heat', 'chushu'],
  ['White Dew', 'bailu'],
  ['Autumnal Equinox', 'qiufen'],
  ['Cold Dew', 'hanlu'],
  ['Frost', 'shuangjiang'],
  ['Winter Commences', 'lidong'],
  ['Light Snow', 'xiaoxue'],
  ['Heavy Snow', 'daxue'],
  ['Winter Solstice', 'dongzhi'],
  ['Moderate Cold', 'xiaohan'],
  ['Severe Cold', 'dahan'],
]);

/** 节气按太阳黄经排序（一年内的出现顺序；小寒/大寒在前半年初出现）。 */
const YEAR_ORDER = [
  'xiaohan',
  'dahan',
  'lichun',
  'yushui',
  'jingzhe',
  'chunfen',
  'qingming',
  'guyu',
  'lixia',
  'xiaoman',
  'mangzhong',
  'xiazhi',
  'xiaoshu',
  'dashu',
  'liqiu',
  'chushu',
  'bailu',
  'qiufen',
  'hanlu',
  'shuangjiang',
  'lidong',
  'xiaoxue',
  'daxue',
  'dongzhi',
];

const pad = (n) => String(n).padStart(2, '0');

const years = readdirSync(sourceDir)
  .filter((f) => /^T\d{4}\.txt$/.test(f))
  .map((f) => Number(f.slice(1, 5)))
  .sort((a, b) => a - b);

if (years.length === 0) {
  console.error('resources/solar-terms/ 下没有 T{year}.txt，先下载香港天文台对照表。');
  process.exit(1);
}

const table = {};

for (const year of years) {
  const raw = readFileSync(join(sourceDir, `T${year}.txt`), 'utf8');
  const dates = {};
  for (const line of raw.split(/\r?\n/)) {
    const dateMatch = line.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s/);
    if (!dateMatch) continue;
    for (const [name, id] of NAME_TO_ID) {
      if (line.includes(name)) {
        if (dates[id]) throw new Error(`${year} 年 ${id} 出现两次：${line}`);
        dates[id] = `${pad(Number(dateMatch[2]))}-${pad(Number(dateMatch[3]))}`;
      }
    }
  }
  const missing = YEAR_ORDER.filter((id) => !dates[id]);
  if (missing.length > 0) throw new Error(`${year} 年缺节气：${missing.join(', ')}`);
  const extra = Object.keys(dates).filter((id) => !YEAR_ORDER.includes(id));
  if (extra.length > 0) throw new Error(`${year} 年出现未知节气：${extra.join(', ')}`);
  table[year] = Object.fromEntries(YEAR_ORDER.map((id) => [id, dates[id]]));
}

const header = `\
/**
 * 二十四节气公历日期表（月-日），由 scripts/generate-solar-terms.mjs 生成。
 * 数据源：香港天文台《公历与农历对照表》 resources/solar-terms/T{year}.txt。
 * 覆盖 ${years[0]}–${years[years.length - 1]} 年；超出范围时调用方应隐藏「今日节气」而非猜测。
 * 手改无效——请更新资源文件后重新运行生成脚本。
 */

export const SOLAR_TERM_COVERAGE = { firstYear: ${years[0]}, lastYear: ${years[years.length - 1]} } as const;

export const SOLAR_TERM_DATES: Record<number, Record<string, string>> = ${JSON.stringify(table, null, 2)};
`;

writeFileSync(outFile, header);
console.log(`已生成 ${outFile}（${years[0]}–${years[years.length - 1]}，共 ${years.length * 24} 条日期）`);

/** 校验：抽样与已公开发布的日期对照（bmcx 2026 全表 + 大暑 2022–2031 锚点）。 */
const anchors = [
  [2026, 'lichun', '02-04'], [2026, 'yushui', '02-18'], [2026, 'jingzhe', '03-05'],
  [2026, 'chunfen', '03-20'], [2026, 'qingming', '04-05'], [2026, 'guyu', '04-20'],
  [2026, 'lixia', '05-05'], [2026, 'xiaoman', '05-21'], [2026, 'mangzhong', '06-05'],
  [2026, 'xiazhi', '06-21'], [2026, 'xiaoshu', '07-07'], [2026, 'dashu', '07-23'],
  [2026, 'liqiu', '08-07'], [2026, 'chushu', '08-23'], [2026, 'bailu', '09-07'],
  [2026, 'qiufen', '09-23'], [2026, 'hanlu', '10-08'], [2026, 'shuangjiang', '10-23'],
  [2026, 'lidong', '11-07'], [2026, 'xiaoxue', '11-22'], [2026, 'daxue', '12-07'],
  [2026, 'dongzhi', '12-22'], [2026, 'xiaohan', '01-05'], [2026, 'dahan', '01-20'],
  [2024, 'dashu', '07-22'], [2025, 'dashu', '07-22'], [2027, 'dashu', '07-23'],
  [2028, 'dashu', '07-22'], [2029, 'dashu', '07-22'], [2030, 'dashu', '07-23'],
  [2025, 'lichun', '02-03'], [2025, 'dongzhi', '12-21'], [2024, 'dongzhi', '12-21'],
];
let bad = 0;
for (const [year, id, expected] of anchors) {
  const actual = table[year]?.[id];
  if (actual !== expected) {
    console.error(`校验失败：${year} ${id} = ${actual}，期望 ${expected}`);
    bad += 1;
  }
}
if (bad > 0) process.exit(1);
console.log(`校验通过：${anchors.length} 个锚点日期全部吻合。`);
