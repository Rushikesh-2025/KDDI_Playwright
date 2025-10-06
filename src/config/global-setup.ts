// global-setup.ts
/* import { chromium, expect } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import fs from 'fs';

async function globalSetup() {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();

  // Go to login
  await page.goto(`${EnvConfig.baseURL}/login`);

  // Fill credentials
  await page.fill('input[name="email"]', EnvConfig.email);
  await page.fill('input[name="password"]', EnvConfig.password);
  await page.click('button[type="submit"]');

  // --- ⚠️ If you need OTP or manual click, pause once ---
  console.log('!!! MANUAL ACTION REQUIRED for OTP / Captcha !!!');
  await page.pause();
  await page.getByRole('button', { name: '送信' }).click();

  // ✅ Save sessionStorage into file
  const sessionData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) data[key] = sessionStorage.getItem(key)!;
    }
    return data;
  });

  fs.writeFileSync('userSession.json', JSON.stringify(sessionData, null, 2));

  await browser.close();
}
export default globalSetup; */

// global-setup.ts
import { chromium } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import fs from 'fs';

async function saveSession(page: any) {
  // Extract sessionStorage
  const sessionData = await page.evaluate(() => {
    const data: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) data[key] = sessionStorage.getItem(key)!;
    }
    return data;
  });

  fs.writeFileSync('userSession.json', JSON.stringify(sessionData, null, 2));
  console.log('✅ Session stored in userSession.json');
}

async function performLogin(page: any) {
  // Go to login
  await page.goto(`${EnvConfig.baseURL}/login`);

  // Fill credentials
  await page.fill('input[name="email"]', EnvConfig.email);
  await page.fill('input[name="password"]', EnvConfig.password);
  await page.click('button[type="submit"]');

  // Pause for OTP / MFA manually
  console.log('!!! MANUAL ACTION REQUIRED for OTP / Captcha !!!');
  await page.pause();
  await page.getByRole('button', { name: '送信' }).click();

  // Save session
  await saveSession(page);
}

async function globalSetup() {
  const maxRetries = 2; // retry count in case of session issue
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      // Try using existing session
      if (fs.existsSync('userSession.json')) {
        const sessionData = JSON.parse(fs.readFileSync('userSession.json', 'utf-8'));
        await page.goto(`${EnvConfig.baseURL}/screenSelection`);
        await page.evaluate((data) => {
          for (const key in data) sessionStorage.setItem(key, data[key]);
        }, sessionData);
        await page.reload();

        // Test if session is still valid
        if (!(await page.url()).includes('screenSelection')) {
          throw new Error('Session expired, need to login again');
        }
        console.log('✅ Existing session is valid');
      } else {
        throw new Error('No session file found, need to login');
      }

      await browser.close();
      break; // exit loop if session works

    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : String(err);
      console.warn(`⚠️ Attempt ${attempt}: ${errorMessage}`);
      console.log('Re-running login to refresh session...');
      await performLogin(page);
      await browser.close();
    }
  }
}

export default globalSetup;

