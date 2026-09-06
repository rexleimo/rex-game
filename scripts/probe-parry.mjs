import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
await page.goto('http://localhost:3040/games/shanhai-wenshou/', { waitUntil: 'networkidle' });
const g = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await g.count()) await g.click();
await page.evaluate(() => localStorage.removeItem('rex-game:shanhai-wenshou:save:v1'));
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: /^简明/ }).click();
await page.getByRole('button', { name: '踏入图志' }).click();
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(300);
  const next = page.locator('button', { hasText: /继续|合上这一页/ }).first();
  if (!(await next.count())) break;
  await next.click();
}
await page.waitForTimeout(1200);
// 原地连按弹反，观察姿态变化（对空按也应有姿态）
for (let k = 0; k < 3; k++) {
  await page.keyboard.press('KeyI');
  await page.waitForTimeout(90);
  await page.screenshot({ path: `resources/shots/wp-parry-${k}.png`, clip: { x: 500, y: 300, width: 500, height: 380 } });
  await page.waitForTimeout(500);
}
await browser.close();
console.log('done');
