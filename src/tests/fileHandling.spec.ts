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
    await page.goto(`${EnvConfig.baseURL}/login`);

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

// --- Upload Search CSV file test ---

// Validate file processing workflow — upload a file and verify it appears in search results after successful upload
test('Validate file processing workflow — upload a file and verify it appears in search results after successful upload', async ({ page, }) => {
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

  // Assertion the file appears in the table 
  await expect(page.getByRole('cell', { name: '受付ファイル名 [連番][件数]' })).toBeVisible();

  // Click uploaded file
  await page.getByRole('cell', { name: TestConfig.uploadFileName }).first().click();

  // Build expected string dynamically
  const expectedTableEntry = `${TestConfig.uploadFileName} [${TestConfig.fileNumber}][${TestConfig.recordCount}]`;
  await expect(page.locator('tbody')).toContainText(expectedTableEntry);
});

// Verify error message when uploading an invalid file exceeding the maximum record limit (15,000)
test("Verify error message when uploading an invalid file exceeding the maximum record limit (15,000)", async ({ page, }) => {
  // dashboardPage ensures login is done

  await page.goto(`${EnvConfig.baseURL}/upload`);

  // Locate the hidden input inside the dropzone
  const fileInput = page.locator('input[type="file"]');

  // Set the file to upload
  const filePath = path.resolve(__dirname, `../data/${TestConfig.invalidFile_3}`);
  await fileInput.setInputFiles(filePath);

  // Click the upload button
  await page.locator('#root div')
    .filter({ hasText: 'アップロード' })
    .nth(4)
    .click();

  // Assertion: check success message
  // Wait for possible message to appear
  await page.waitForTimeout(3000);

  // Get the dynamic file name from test data
  const fileName = TestConfig.invalidFile_3;

  // Build the expected error message dynamically
  const expectedErrorMsg = `${fileName} 最大レコード件数[15,000]を超えています。`;

  // Assertion: verify correct error message is visible
  const errorMessageLocator = page.locator(`text=${expectedErrorMsg}`);
  await expect(errorMessageLocator).toBeVisible();

})


// Verify uploading a file with invalid or unsupported encoding displays the correct error message
test("Verify uploading a file with invalid or unsupported encoding displays the correct error message", async ({ page, }) => {
  // dashboardPage ensures login is done

  await page.goto(`${EnvConfig.baseURL}/upload`);

  // Locate the hidden input inside the dropzone
  const fileInput = page.locator('input[type="file"]');

  // Set the file to upload
  const filePath = path.resolve(__dirname, `../data/${TestConfig.invalidFile_1}`);
  await fileInput.setInputFiles(filePath);

  // Click the upload button
  await page.locator('#root div')
    .filter({ hasText: 'アップロード' })
    .nth(4)
    .click();

  // Assertion: check success message
  // Wait for possible message to appear
  await page.waitForTimeout(3000);

  // Get the dynamic file name from test data
  const fileName = TestConfig.invalidFile_1;

  // Build the expected error message dynamically
  const expectedErrorMsg = `${fileName} ファイルの文字コードはUTF-8にしてください。`;

  // Assertion: verify correct error message is visible
  const errorMessageLocator = page.locator(`text=${expectedErrorMsg}`);
  await expect(errorMessageLocator).toBeVisible();
})

// Verify error message when uploading a file with an invalid format (non-.csv file)
test("Verify error message when uploading a file with an invalid format (non-.csv file)", async ({ page, }) => {
  // dashboardPage ensures login is done

  await page.goto(`${EnvConfig.baseURL}/upload`);

  // Locate the hidden input inside the dropzone
  const fileInput = page.locator('input[type="file"]');

  // Set the file to upload
  const filePath = path.resolve(__dirname, `../data/${TestConfig.invalidFile_4}`);
  await fileInput.setInputFiles(filePath);

  // Click the upload button
  await page.locator('#root div')
    .filter({ hasText: 'アップロード' })
    .nth(4)
    .click();

  // Assertion: check success message
  // Wait for possible message to appear
  await page.waitForTimeout(3000);

  // Get the dynamic file name from test data
  const fileName = TestConfig.invalidFile_4;

  // Build the expected error message dynamically
  const expectedErrorMsg = `${fileName} ファイルの拡張子は.csvにしてください。`;

  // Assertion: verify correct error message is visible
  const errorMessageLocator = page.locator(`text=${expectedErrorMsg}`);
  await expect(errorMessageLocator).toBeVisible();

})

// Verify error message when uploading an empty file
test("Verify error message when uploading an empty file.", async ({ page, }) => {
  // dashboardPage ensures login is done

  await page.goto(`${EnvConfig.baseURL}/upload`);

  // Locate the hidden input inside the dropzone
  const fileInput = page.locator('input[type="file"]');

  // Set the file to upload
  const filePath = path.resolve(__dirname, `../data/${TestConfig.invalidFile_5}`);
  await fileInput.setInputFiles(filePath);

  // Click the upload button
  await page.locator('#root div')
    .filter({ hasText: 'アップロード' })
    .nth(4)
    .click();

  // Assertion: check success message
  // Wait for possible message to appear
  await page.waitForTimeout(3000);

  // Get the dynamic file name from test data
  const fileName = TestConfig.invalidFile_5;

  // Build the expected error message dynamically
  const expectedErrorMsg = `${fileName} ファイルの文字コードはUTF-8にしてください。`;

  // Assertion: verify correct error message is visible
  const errorMessageLocator = page.locator(`text=${expectedErrorMsg}`);
  await expect(errorMessageLocator).toBeVisible();

})

test.only("Verify success and error messages when uploading one valid and one invalid file simultaneously", async ({ page }) => {
  await page.goto(`${EnvConfig.baseURL}/upload`);

  const fileInput = page.locator('input[type="file"]');
  // ----------------- Upload valid file -----------------
  // dashboardPage ensures login is done

  await page.goto(`${EnvConfig.baseURL}/upload`);

  // Locate the hidden input inside the dropzone


  // Set the file to upload
  const filePath = path.resolve(__dirname, `../data/${TestConfig.uploadFileName}`);
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(5000)
  await page.getByRole('link', { name: '選択されたファイル名を表示' }).click();
  // Assertion for file
  await expect(page.getByRole('listitem')).toContainText(TestConfig.uploadFileName);
  await page.waitForTimeout(5000)
  // ----------------- Upload invalid file first -----------------
  await fileInput.setInputFiles(path.resolve(__dirname, `../data/${TestConfig.invalidFile_5}`));

  // Assert error message for invalid file
  await expect(page.getByText(TestConfig.invalidFile_5)).toBeVisible();
  
});
