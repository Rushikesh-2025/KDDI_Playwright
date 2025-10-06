import { test, expect } from '@playwright/test';
import { EnvConfig } from '../config/viriableConstant';
import AxeBuilder from '@axe-core/playwright';
import { json } from 'stream/consumers';

test.beforeEach('lunching app', async ({ page }) => {
  // You can add setup steps here, e.g. navigating to a base URL or logging in
});

test('has title', async ({ page }) => {
  await page.goto(EnvConfig.baseURL);

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/NESTA 加盟店ポータル/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('accessiblity testing ', async ({ page }, testInfo) => {
  await page.goto(EnvConfig.baseURL);
// Scanning detect all type of WCAG Web Content Accessibility Guidelines Violations.all page
  const accessiblityScanResult = await new AxeBuilder({page}).analyze();
  console.log("Number of violation =",accessiblityScanResult.violations.length);

  // 1 expect assertion - violation
  expect(accessiblityScanResult.violations.length).toEqual(4);

  // 2 scanning for few WCAG  Vailation
  const accessibilityScanResult = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();
  console.log('number of vailation =',accessiblityScanResult.violations.length);
  expect(accessiblityScanResult.violations.length).toEqual(4);
  testInfo.attach('accessbility results',{
                                          body: JSON.stringify(accessibilityScanResult,null,2),
                                          contentType: "application/json"
                                          })

console.log('scanning for few WCAG  Vailation =',accessibilityScanResult.violations.length)
});

test('Screenshort Compare Assertion', async ({ page }) => {
  await page.goto(EnvConfig.baseURL);
  await page.waitForTimeout(1000);
  //Assertion for screenshot 
  // 1st approch
  expect(await page.screenshot()).toMatchSnapshot('login-chromium-win32.png');
  // 2nd approch
  //await expect(page).toHaveScreenshot('login-chromium-win32.png');

  // Capture screenshort of element
});


function async(arg0: { page: any; }): (args: import("playwright/test").PlaywrightTestArgs & import("playwright/test").PlaywrightTestOptions & import("playwright/test").PlaywrightWorkerArgs & import("playwright/test").PlaywrightWorkerOptions, testInfo: import("playwright/test").TestInfo) => Promise<any> | any {
  throw new Error('Function not implemented.');
}
