import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`${e.message}\n${(e.stack||'').slice(0,300)}`));
page.on('console', (m) => { if (m.text().includes('wenshou-')) console.log('CONSOLE:', m.text()); });
await page.goto('http://localhost:3040/games/shanhai-wenshou/', { waitUntil: 'networkidle' });
const g = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await g.count()) await g.click();
await page.evaluate(() => localStorage.removeItem('rex-game:shanhai-wenshou:save:v1'));
await page.reload({ waitUntil: 'networkidle' });
const guide2 = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await guide2.count()) await guide2.click();
await page.getByRole('button', { name: /^简明/ }).click();
await page.getByRole('button', { name: '踏入图志' }).click();
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(300);
  const next = page.locator('button', { hasText: /继续|合上这一页/ }).first();
  if (!(await next.count())) break;
  await next.click();
}
await page.waitForTimeout(1500);
await page.keyboard.down('KeyD');
await page.waitForTimeout(6800);
await page.keyboard.up('KeyD');
await page.waitForTimeout(600);

const seals = async () => page.locator('[class*="sealOn"]').count();
const php = async () => page.locator('[class*="hpFill"]').first().evaluate((el) => parseFloat(el.style.width)).catch(() => 100);
const tap = async (key, hold = 100) => { await page.keyboard.down(key); await page.waitForTimeout(hold); await page.keyboard.up(key); };

let tamed = false;
for (let round = 0; round < 90 && !tamed; round++) {
  const ask = page.locator('button', { hasText: '问名' }).first();
  if (await ask.count()) {
    console.log('ASK visible at round', round);
    await page.screenshot({ path: 'resources/shots/wt-ask.png' });
    await ask.click({ force: true });
    await page.waitForTimeout(2400);
    const outcome = page.locator('button', { hasText: /继续行脚/ }).first();
    if (await outcome.count()) {
      await page.screenshot({ path: 'resources/shots/wt-1-outcome.png' });
      await outcome.click();
      tamed = true;
    }
    break;
  }
  const killOutcome = page.locator('button', { hasText: /继续行脚/ }).first();
  if (await killOutcome.count()) {
    const otitle = await page.locator('[class*="outcomeTitle"]').textContent().catch(() => '?');
    console.log('outcome at round', round, 'title:', otitle);
    await page.screenshot({ path: `resources/shots/wt-overlay-r${round}.png` });
    await killOutcome.click();
    await page.waitForTimeout(600);
    await page.keyboard.down('KeyD'); await page.waitForTimeout(1500); await page.keyboard.up('KeyD');
    await page.waitForTimeout(300);
    continue;
  }
  const n = await seals();
  const hp = await php();
  if (hp < 55) { await tap('KeyH'); await page.waitForTimeout(250); }
  if (n >= 2) {
    await tap('KeyJ', 70);
    await page.waitForTimeout(380);
  } else {
    await tap('KeyI', 100);
    await page.waitForTimeout(400);
  }
  if (round % 10 === 0) {
    const hpw = await page.locator('[class*="bossFill"]').first().evaluate((el) => el.style.width).catch(() => '?');
    console.log(`r${round} seals=${n} playerHp=${hp.toFixed(0)}% beastHp=${hpw}`);
  }
}
await page.waitForTimeout(600);
await page.screenshot({ path: 'resources/shots/wt-final.png' });
console.log('TAMED:', tamed);
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
