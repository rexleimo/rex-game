import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`${e.message}\n${(e.stack||'').slice(0,500)}`));
await page.goto('http://localhost:3040/games/shanhai-wenshou/', { waitUntil: 'networkidle' });
const g = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await g.count()) await g.click();
await page.evaluate(() => localStorage.removeItem('rex-game:shanhai-wenshou:save:v1'));
await page.reload({ waitUntil: 'networkidle' });
await page.getByRole('button', { name: '踏入图志' }).click();
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(300);
  const next = page.locator('button', { hasText: /继续|合上这一页/ }).first();
  if (!(await next.count())) break;
  await next.click();
}
await page.waitForTimeout(1500);
// 直奔第一只野外兽（seg2 +420 ≈ 1570）
await page.keyboard.down('KeyD');
await page.waitForTimeout(7000);
await page.keyboard.up('KeyD');
await page.waitForTimeout(400);
await page.screenshot({ path: 'resources/shots/wc-0-approach.png' });
// 站桩挨打 1.2s：等兽出招
await page.waitForTimeout(1200);
await page.screenshot({ path: 'resources/shots/wc-1-telegraph.png' });
await page.waitForTimeout(800);
await page.screenshot({ path: 'resources/shots/wc-2-hit.png' });
// 反击三连
for (let i = 0; i < 3; i++) { await page.keyboard.press('KeyJ'); await page.waitForTimeout(200); }
await page.waitForTimeout(200);
await page.screenshot({ path: 'resources/shots/wc-3-counter.png' });
// 蓄力重击
await page.keyboard.down('KeyK'); await page.waitForTimeout(600); await page.keyboard.up('KeyK');
await page.waitForTimeout(300);
await page.screenshot({ path: 'resources/shots/wc-4-heavy.png' });
// 读 HUD 血条宽度
const hp = await page.locator('._hpTrack_1qg8f_262 .hpFill').first ? null : null;
console.log('ERRORS:', errors.length ? errors.join('\n---\n') : 'none');
await browser.close();
