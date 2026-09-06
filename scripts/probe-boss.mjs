import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`${e.message}\n${(e.stack||'').slice(0,300)}`));
await page.goto('http://localhost:3040/games/shanhai-wenshou/', { waitUntil: 'networkidle' });
let b = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await b.count()) await b.click();
await page.evaluate(() => localStorage.removeItem('rex-game:shanhai-wenshou:save:v1'));
await page.reload({ waitUntil: 'networkidle' });
b = page.getByRole('button', { name: /我知道了，开始游戏|跳过引导/ }).first();
if (await b.count()) await b.click();
await page.getByRole('button', { name: /^简明/ }).click();
await page.getByRole('button', { name: '踏入图志' }).click();
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(300);
  const next = page.locator('button', { hasText: /继续|合上这一页/ }).first();
  if (!(await next.count())) break;
  await next.click();
}
await page.waitForTimeout(1200);

const tap = async (key, hold = 80) => { await page.keyboard.down(key); await page.waitForTimeout(hold); await page.keyboard.up(key); };
const bossTitle = async () => (await page.locator('[class*="bossBarTitle"]').textContent().catch(() => '')).trim();

let done = false;
let dlgClicks = 0;
const t0 = Date.now();
for (let round = 0; round < 150 && !done; round++) {
  if (round % 10 === 0) {
    const bt0 = await bossTitle();
    const hp0 = await page.locator('[class*="hpFill"]').first().evaluate((el) => el.style.width).catch(() => '?');
    console.log(`r${round} bar="${bt0}" php=${hp0} dlg=${dlgClicks} t=${((Date.now()-t0)/1000)|0}s`);
  }
  // 1) 对话浮层
  const dlg = page.locator('button', { hasText: /^继续$/ }).first();
  if (await dlg.count()) { dlgClicks += 1; console.log('dialog click', dlgClicks); await dlg.click({ force: true, timeout: 4000 }).catch((e) => console.log('dlg fail', e.message.slice(0, 80))); await page.waitForTimeout(500); continue; }
  // 2) 结算浮层
  const riteBtn = page.locator('button', { hasText: /行祭山之礼/ }).first();
  const contBtn = page.locator('button', { hasText: /继续行脚/ }).first();
  if (await riteBtn.count()) {
    await page.screenshot({ path: 'resources/shots/wb-1-boss-outcome.png' });
    await riteBtn.click({ force: true, timeout: 4000 }).catch((e) => console.log('rite fail', e.message.slice(0, 80)));
    await page.waitForTimeout(800);
    // 祭礼卡
    const riteDone = page.locator('button', { hasText: /礼成|卷终/ }).first();
    if (await riteDone.count()) {
      await page.screenshot({ path: 'resources/shots/wb-2-rite.png' });
      await riteDone.click({ force: true, timeout: 4000 }).catch((e) => console.log('riteDone fail', e.message.slice(0, 80)));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'resources/shots/wb-3-map.png' });
      console.log('BOSS FLOW COMPLETE');
      done = true;
    }
    break;
  }
  if (await contBtn.count()) {
    console.log('continue click at r' + round);
    await contBtn.click({ force: true, timeout: 4000 }).catch((e) => console.log('cont fail', e.message.slice(0, 80)));
    await page.waitForTimeout(600);
    continue;
  }
  // 3) boss 战：站定连打；否则向右赶路
  const bt = await bossTitle();
  if (bt.includes('山主')) {
    const hp = await page.locator('[class*="hpFill"]').first().evaluate((el) => parseFloat(el.style.width)).catch(() => 100);
    if (hp < 50) { await tap('KeyH'); }
    await tap('KeyJ', 70);
    await page.waitForTimeout(330);
  } else {
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(600);
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(120);
    // 被野兽缠住就打两下
    if (bt.includes('野')) { await tap('KeyJ', 70); await page.waitForTimeout(280); await tap('KeyJ', 70); await page.waitForTimeout(300); }
  }
  if (round === 149) await page.screenshot({ path: 'resources/shots/wb-timeout.png' });
}
console.log('DONE:', done);
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
