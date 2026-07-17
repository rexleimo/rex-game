import assert from 'node:assert/strict';
import { join } from 'node:path';

import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: true,
  args: [
    '--use-angle=swiftshader',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
  ],
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  const failedResources = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
  });

  await page.goto('http://localhost:3030/games/chaoshan-yingge/', { waitUntil: 'networkidle' });
  await page.locator('.yg-start-menu button').nth(2).click();
  assert.equal(await page.locator('.yg-guide-card').count(), 6, 'The illustrated guide should show all six obstacles');
  assert.equal(await page.locator('.yg-guide-card img').count(), 6, 'Every obstacle guide should use its in-game art');
  await page.screenshot({ path: join(process.env.TEMP ?? '.', 'yingge-guide-smoke.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.yg-guide-card').first().waitFor({ state: 'visible' });
  await page.screenshot({ path: join(process.env.TEMP ?? '.', 'yingge-guide-mobile-smoke.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.yg-guide-head-actions button').first().click();
  await page.getByRole('button', { name: /主线演出/ }).click();
  await page.waitForTimeout(3_000);
  assert.equal(
    await page.locator('canvas').count(),
    1,
    `${await page.locator('body').innerText()}\nBROWSER ERRORS:\n${consoleErrors.join('\n')}\nFAILED RESOURCES:\n${failedResources.join('\n')}`,
  );
  assert.equal(await page.locator('.yg-runtime-error:visible').count(), 0, await page.locator('body').innerText());

  const canvas = page.locator('canvas');
  const bounds = await canvas.boundingBox();
  assert.ok(bounds && bounds.width >= 900 && bounds.height >= 500, 'Phaser canvas should fill the combat stage');
  await page.waitForTimeout(9_000);
  await page.screenshot({ path: join(process.env.TEMP ?? '.', 'yingge-combat-smoke.png') });

  await page.keyboard.press('j');
  await page.keyboard.press('k');
  await page.keyboard.press('l');
  await page.keyboard.press('Shift');
  await page.keyboard.press('u');
  await page.keyboard.press('Space');

  await page.getByRole('button', { name: '暂停' }).click();
  await page.waitForTimeout(150);
  await page.getByRole('button', { name: '暂停' }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  const hint = page.getByText('请将手机横过来继续英歌巡游');
  await hint.waitFor({ state: 'visible' });

  await page.setViewportSize({ width: 844, height: 390 });
  await canvas.waitFor({ state: 'visible' });

  const relevantErrors = consoleErrors.filter((message) => !message.includes('favicon') && !message.includes('googleapis'));
  assert.deepEqual(relevantErrors, [], `Unexpected browser errors: ${relevantErrors.join('\n')}`);
} finally {
  await browser.close();
}
