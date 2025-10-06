import { test, expect, Page } from '@playwright/test';
import LoginPage from "../pages/LoginPage";
import logger from "../utils/LoggerUtil";
import { EnvConfig } from "../config/viriableConstant";
<<<<<<< HEAD
import fs from "fs";

// This test will always run in headed mode
test.use({ headless: false });
test("Verify Successful Login with Valid Credentials", async ({ page }) => {
  logger.info("Starting: Login with valid credentials");
  const loginPage = new LoginPage(page);
  await page.goto(`${EnvConfig.baseURL}/login`);

  await loginPage.fillUsername(EnvConfig.email);
  logger.info('Login email entered successfully');

  await loginPage.fillPassword(EnvConfig.password);
  logger.info('Login password entered successfully');

  await loginPage.clickLoginButton();
  logger.info('Click on Login button successfully');

  console.log('!!! MANUAL ACTION REQUIRED !!!');
  console.log('The browser will now PAUSE. Please enter the 6-digit MFA code manually in the browser and click "送信" (Send).');
  console.log('After entering the code, press F8 or click the "Resume" button in the Playwright UI (inspector) to continue.');

  // Pause for MFA manual entry
  await page.pause();
  logger.info('The browser will now PAUSE for MFA.');

  // Submit MFA
  await page.getByRole('button', { name: '送信' }).click();
  logger.info('Click on Verify Button successfully');

  await expect(page).toHaveURL(`${EnvConfig.baseURL}/screenSelection`);
  logger.info('✅ Login completed');

  // Save sessionStorage to file
  const sessionStorage = await page.evaluate(() => {
    let store: Record<string, string> = {};
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)!;
      store[key] = window.sessionStorage.getItem(key)!;
    }
    return store;
  });

  fs.writeFileSync("userSession.json", JSON.stringify(sessionStorage));
  console.log("✅ Session storage saved to userSession.json");
});


test('dashborad Access', async ({ browser }) => {
  const context = await browser.newContext({ storageState: "userSession.json" })
  const page = await context.newPage()
  await page.goto(`${EnvConfig.baseURL}/screenSelection`);

})
=======
import { authenticator } from 'otplib'; // ✅ Import otplib's authenticator
>>>>>>> 3fe918ee394065f9cc7e172980cd9524b3bdcf6e
