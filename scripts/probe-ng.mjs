/**
 * 二周目 + 委托板 + 引文拓印 探针（本地验收）。
 * 注入半成品存档直达「通关后」状态，验证 NG+ 入口/委托交割/引文点亮/营地三槽。
 */
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`${e.message}\n${(e.stack || '').slice(0, 300)}`));

const SAVE = {
  version: 1,
  level: 18,
  exp: 0,
  hp: 400,
  qi: 60,
  skills: ['strike', 'lingxi', 'lieshi', 'wenxin'],
  party: ['baiyuan', 'lushu'],
  beasts: { xingxing: 2, baiyuan: 1, lushu: 1 },
  encountered: ['xingxing', 'baiyuan', 'lushu'],
  items: { zhuyu: 3, yanmu_shi: 5, yupai: 4, migu_pei: 1, lushu_pi: 1, zhuyu_cao: 6, migu_zhi: 6, yupei_yuan: 6 },
  jade: 120,
  mountainIndex: 0,
  mountains: { zhaoyao: { cleared: true, gathered: [], npcs: [], gatePassed: true, bossDefeated: true, eliteDefeated: true } },
  seenStory: [],
  favor: { zhaoyao: 4 },
  ngPlus: 0,
  charms: ['lushu_pi'],
  claimedCommissions: {},
  commissionProgress: { 'cull:zhaoyao:xingxing': 3, 'cull:zhaoyao:baiyuan': 3 },
  stelesRead: { zhaoyao: 1 },
  hidden: {},
  shrine: { qi: 1, satchel: 1, tame: 0, blessing: 0 },
  stats: { playtimeMs: 3_600_000, battlesWon: 12, tamedCount: 4, questionsCorrect: 0, startedAt: Date.now() },
  chapterDone: true,
};

await page.goto('http://localhost:3040/games/shanhai-wenshou/', { waitUntil: 'networkidle' });
let g = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await g.count()) await g.click();
await page.evaluate((s) => localStorage.setItem('rex-game:shanhai-wenshou:save:v1', JSON.stringify(s)), SAVE);
await page.reload({ waitUntil: 'networkidle' });
g = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await g.count()) await g.click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'resources/shots/ng-0-title.png' });
console.log('NG button:', await page.getByRole('button', { name: /二周目/ }).count());

// 1) 营地：委托板交割 + 佩饰三槽
await page.getByRole('button', { name: '藏馆（家）' }).click();
await page.waitForTimeout(500);
await page.getByRole('tab', { name: '委托板' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'resources/shots/ng-1-board.png' });
const claim = page.locator('button', { hasText: '交割' }).first();
console.log('claimable:', await claim.count());
const jadeBefore = await page.locator('[class*="campMeta"]').textContent();
await claim.click({ force: true });
await page.waitForTimeout(500);
const jadeAfter = await page.locator('[class*="campMeta"]').textContent();
console.log('jade before/after:', jadeBefore?.slice(0, 12), '|', jadeAfter?.slice(0, 12));

// 佩饰三槽
await page.getByRole('tab', { name: '佩饰' }).click();
await page.waitForTimeout(300);
const wearBtn = page.locator('button', { hasText: '佩戴' }).first();
if (await wearBtn.count()) { await wearBtn.click({ force: true }); await page.waitForTimeout(300); }
await page.screenshot({ path: 'resources/shots/ng-2-charms.png' });
console.log('slots visible:', await page.locator('button', { hasText: '摘下' }).count());

// 2) 图志引文 tab
await page.getByRole('button', { name: /回到山海|回到山野/ }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: '图志 · 兽栏' }).click();
await page.waitForTimeout(400);
await page.getByRole('tab', { name: '引文拓印' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'resources/shots/ng-3-quotes.png' });
console.log('rubbings lit text:', (await page.locator('[class*="codexMeta"]').textContent())?.slice(0, 40));

// 3) 二周目入口
await page.getByRole('button', { name: /合上图志/ }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: '卷首' }).click();
await page.waitForTimeout(400);
const ngBtn = page.getByRole('button', { name: /二周目 · 重问十山/ });
console.log('NG+ button count:', await ngBtn.count());
await page.screenshot({ path: 'resources/shots/ng-4-title-ng.png' });
await ngBtn.click();
await page.waitForTimeout(600);
// NG 开场节拍连点
for (let i = 0; i < 6; i++) {
  const next = page.locator('button', { hasText: /继续|合上这一页/ }).first();
  if (!(await next.count())) break;
  await next.click();
  await page.waitForTimeout(250);
}
await page.waitForTimeout(2500);
await page.screenshot({ path: 'resources/shots/ng-5-world.png' });
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
