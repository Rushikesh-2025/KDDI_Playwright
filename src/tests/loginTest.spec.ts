import { test, expect, Page } from '@playwright/test';
import LoginPage from "../pages/LoginPage";
import logger from "../utils/LoggerUtil";
import { EnvConfig } from "../config/viriableConstant";
import { authenticator } from 'otplib'; // ✅ Import otplib's authenticator


// **IMPORTANT:** Replace with your test account's MFA secret key
// This key is static and should be managed securely (e.g., from EnvConfig)
const mfaSecretKey = "JBSWY3DPEHPK3PXP";

async function getLoginPage(page: Page) {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLoginPage();
  return loginPage;
}

test.only("Verify Successful Login with Valid Credentials", async ({ page }) => {
  logger.info("Starting: Login with valid credentials");
  const loginPage = await getLoginPage(page);

  await loginPage.fillUsername(EnvConfig.email);
  await loginPage.fillPassword(EnvConfig.password);
  await loginPage.clickLoginButton();

  // Wait for MFA screen (your selector may vary)
  await page.waitForSelector('input[name="mfaCode[0]"]', { timeout: 15000 });

  // ✅ Generate the MFA code using the static secret key
  const code = authenticator.generate(mfaSecretKey);
  console.log(`Generated MFA code: ${code}`);

  // Fill code digits into inputs
  for (let i = 0; i < code.length; i++) {
    await page.locator(`input[name="mfaCode[${i}]"]`).fill(code[i]);
  }

  // Submit MFA
  await page.getByRole('button', { name: '送信' }).click();

  // Verify successful login
  await expect(page).toHaveURL(/dashboard/);
});