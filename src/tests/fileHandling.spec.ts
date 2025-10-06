import { test as base, expect, Page } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import LoginPage from '../pages/LoginPage';
import fs from "fs";
import { TestConfig } from '../data/test.config';
import path from 'path';

// Extend base test with session fixture
const test = base.extend({
  page: async ({ page }, use) => {
    // Load session data
    const sessionData = JSON.parse(fs.readFileSync("userSession.json", "utf-8"));

    // Go to base URL first (important!)
    await page.goto(`${EnvConfig.baseURL}`);

    // Inject sessionStorage into browser
    await page.evaluate((data) => {
      for (const key in data) {
        sessionStorage.setItem(key, data[key]);
      }
    }, sessionData);

    // Reload page to apply session
    await page.reload();

    // Pass the ready page to the test
    await use(page);
  },
});

// --- Upload CSV file test ---
test('Upload CSV file', async ({ page, }) => {
  // dashboardPage ensures login is done

  await page.goto(`${EnvConfig.baseURL}/upload`);

  // Locate the hidden input inside the dropzone
  const fileInput = page.locator('input[type="file"]');

  // Set the file to upload
  const filePath = path.resolve(__dirname, `../data/${TestConfig.uploadFileName}`);
  await fileInput.setInputFiles(filePath);

  // Click the upload button
  await page.locator('#root div')
    .filter({ hasText: 'アップロード' })
    .nth(4)
    .click();

  // Assertion: check success message
  await page.waitForTimeout(3000);
  const successMsg = page.locator('text=ファイルがアップロードされました。'); // success text
  await expect(successMsg).toBeVisible();

  console.log(' Search uploaded file')
  // --- Search uploaded file ---
  await page.getByRole('button', { name: '検索' }).click();

  // Verify the file appears in the table
  await expect(page.getByRole('cell', { name: '受付ファイル名 [連番][件数]' })).toBeVisible();

  // Click uploaded file
  await page.getByRole('cell', { name: TestConfig.uploadFileName }).first().click();

  // Build expected string dynamically
  const expectedTableEntry = `${TestConfig.uploadFileName} [${TestConfig.fileNumber}][${TestConfig.recordCount}]`;
  await expect(page.locator('tbody')).toContainText(expectedTableEntry);
});
