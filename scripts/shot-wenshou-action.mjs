/**
 * 动作版视觉验收截图脚本（本地专用）。
 * 驱动 out/ 静态站：《山海问兽》标题→序章→山野世界→战斗/移动实测。
 * 用法：node scripts/shot-wenshou-action.mjs
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const OUT = 'resources/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}
${(e.stack||'').slice(0,800)}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text().slice(0, 200)}`);
});

const shot = async (name) => {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`saved ${name}`);
};

await page.goto('http://localhost:3040/games/shanhai-wenshou/', { waitUntil: 'networkidle' });
await shot('wa-guide');
const guideOk = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await guideOk.count()) {
  await guideOk.click();
  await page.waitForTimeout(300);
}
await shot('wa-title');

// 踏入图志 → 序章剧情连点 → 进入动作世界
await page.getByRole('button', { name: '踏入图志' }).click();
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(350);
  const next = page.locator('button', { hasText: /继续|合上这一页/ }).first();
  if (!(await next.count())) break;
  await next.click();
}
await page.waitForTimeout(2500);
await shot('wa-world-spawn');

// 走几步 + 跳跃
await page.keyboard.down('KeyD');
await page.waitForTimeout(900);
await page.keyboard.up('KeyD');
await page.keyboard.press('Space');
await page.waitForTimeout(500);
await shot('wa-world-move');

// 继续向右，靠近 NPC 触发对话
await page.keyboard.down('KeyD');
await page.waitForTimeout(2200);
await page.keyboard.up('KeyD');
await page.waitForTimeout(800);
await shot('wa-dialog-or-path');
// 若对话浮层出现，关闭
const cont = page.locator('button', { hasText: '继续' }).first();
if (await cont.count()) {
  await cont.click();
  await page.waitForTimeout(400);
}

// 轻攻三连 + 蓄力
await page.keyboard.press('KeyJ');
await page.waitForTimeout(150);
await page.keyboard.press('KeyJ');
await page.waitForTimeout(150);
await page.keyboard.press('KeyJ');
await page.waitForTimeout(400);
await shot('wa-attack');

await page.keyboard.down('KeyK');
await page.waitForTimeout(900);
await page.keyboard.up('KeyK');
await page.waitForTimeout(300);

// 翻滚与弹反
await page.keyboard.press('KeyL');
await page.waitForTimeout(400);
await page.keyboard.press('KeyI');
await page.waitForTimeout(300);

// 长途右行（跑图）：平台跳跃段 + 知识门（祝余）
await page.keyboard.down('KeyD');
await page.waitForTimeout(2600);
await page.keyboard.up('KeyD');
await page.keyboard.press('Space');
await page.waitForTimeout(500);
await shot('wa-mid-level');
// 继续跑到知识门（seg3 尾 ≈3140）
await page.keyboard.down('KeyD');
await page.waitForTimeout(5200);
await page.keyboard.up('KeyD');
await page.waitForTimeout(900);
await shot('wa-gate');

// 全页截图（HUD 完整）
await page.screenshot({ path: `${OUT}/wa-full.png`, fullPage: true });
console.log('saved wa-full');

console.log('ERRORS:', errors.length ? errors.slice(0, 12).join('\n') : 'none');
await browser.close();
