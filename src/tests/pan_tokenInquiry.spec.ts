import { test as base, expect } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import { TestConfig } from '../data/test.config';
import fs from "fs";

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


// ============================================================
// TEST SUITE: PAN → TOKEN
// ============================================================


// Validate that PAN and expiry date input returns correct Token
test('Validate that PAN and expiry date input returns correct Token @master', async ({ page }) => {
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // Card number field only accepts nubmers.
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.panNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.panNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.panNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.panNumber[3]);
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.expiry);

  await page.getByRole('button', { name: '送信' }).click();
  // Assertion for excepted token (トークン)
  await expect(page.getByRole('rowgroup')).toContainText(TestConfig.token);
  // Assertion for excepted token Acquiring Company Code (アクワイアラ会社コード)
  await expect(page.getByRole('rowgroup')).toContainText(TestConfig.companyCode);
  // Assertion for excepted card identification number (カード識別番号)
  await expect(page.getByRole('rowgroup')).toContainText(TestConfig.cardIdentificationNumber);
});

// Verify that entering an invalid PAN number with a valid expiry date displays the correct error message
test('Verify that entering an invalid PAN number with a valid expiry date displays the correct error message @master', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // Card number field only accepts nubmers.
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.invalidPanNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.invalidPanNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.invalidPanNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.invalidPanNumber[3]);
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.expiry);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  const expectedErrorMessage = 'レスポンスエラーが発生しました。[NS02]';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that entering an Valid PAN number with a Invalid expiry date(older) displays the correct error message
test('Verify that entering an Valid PAN number with a Invalid expiry date(older) displays the correct error message', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // Card number field only accepts nubmers.
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.panNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.panNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.panNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.panNumber[3]);
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.invalidExpiry);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('レスポンスエラーが発生しました。[NS03]');
  const expectedErrorMessage = 'レスポンスエラーが発生しました。[NS03]';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that entering an Invalid PAN number with a Invalid expiry date(older) displays the correct error message
test('Verify that entering an Invalid PAN number with a Invalid expiry date(older) displays the correct error message.', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // Card number field only accepts nubmers.
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.invalidPanNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.invalidPanNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.invalidPanNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.invalidPanNumber[3]);
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.invalidExpiry);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('レスポンスエラーが発生しました。[NS03]');
  const expectedErrorMessage = 'レスポンスエラーが発生しました。[NS03]';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that entering an Valid PAN number without expiry date displays the correct error message
test('Verify that entering an Valid PAN number without expiry date displays the correct error message.', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // Card number field only accepts nubmers.
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.panNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.panNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.panNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.panNumber[3]);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('有効期限を入力してください。');
  const expectedErrorMessage = '有効期限を入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that the correct error message is displayed when the PAN number is not entered but a valid expiry date is provided
test('Verify that the correct error message is displayed when the PAN number is not entered but a valid expiry date is provided.', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // without fill Card number field
 
  // Fill card expire date
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.invalidExpiry);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('カード番号は半角数字13-16桁で入力してください。');
  const expectedErrorMessage = 'カード番号は半角数字13-16桁で入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that the correct error message is displayed when both PAN number and expiry date are not entered
test('Verify that the correct error message is displayed when both PAN number and expiry date are not entered.', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // without fill Card number field
 
  // without Fill card expire date
  

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('カード番号は半角数字13-16桁で入力してください。');
  const expectedErrorMessage = 'カード番号は半角数字13-16桁で入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that the correct error message is displayed when incomplite the PAN number entered but a valid expiry date is provided
test('Verify that the correct error message is displayed when incomplite the PAN number entered but a valid expiry date is provided.', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // fill incomplite Pan number field
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.panNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.panNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.panNumber[2]);
 
  // Fill card expire date
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.expiry);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('半角数字1-4桁で入力してください。');
  const expectedErrorMessage = '半角数字1-4桁で入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that the correct error message is displayed when an incomplete expiry date is provided with a valid PAN number
test('Verify that the correct error message is displayed when an incomplete expiry date is provided with a valid PAN number.', async ({ page, })=>{
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'PAN => トークン' }).check();

  // fill incomplite Pan number field
  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.panNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.panNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.panNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.panNumber[3]);
 
  // Fill card expire date
  await page.getByRole('textbox', { name: '半角数字 MMYY' }).fill(TestConfig.incompliteExpiryDate);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  // await expect(page.getByRole('main')).toContainText('有効期限は4桁（MMYY形式）で入力してください。');
  const expectedErrorMessage = '有効期限は4桁（MMYY形式）で入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// ============================================================
// TEST SUITE: TOKEN → PAN
// ============================================================

// Validate that Token input returns correct Pan
test('Validate that Token input returns correct Pan', async ({ page }) => {
  await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'トークン => PAN' }).check();

  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.tokenNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.tokenNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.tokenNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.tokenNumber[3]);

  await page.getByRole('button', { name: '送信' }).click();
  // Assertion for expected card number 
  await expect(page.locator('td')).toContainText(TestConfig.expectedCardNumber);
});

// Verify that the correct error message is displayed when an invalid token number is entered
test.skip("Verify that the correct error message is displayed when an invalid token number is entered", async ({page, })=>{

    await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'トークン => PAN' }).check();

  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.invalidTokenNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.invalidTokenNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.invalidTokenNumber[2]);
  await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.invalidTokenNumber[3]);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  const expectedErrorMessage = 'レスポンスエラーが発生しました。[NS02]';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

// Verify that the correct error message is displayed when an incomplete token number is entered
test("Verify that the correct error message is displayed when an incomplete token number is entered.", async ({page, })=>{

    await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'トークン => PAN' }).check();

  await page.getByRole('textbox', { name: '桁' }).first().fill(TestConfig.tokenNumber[0]);
  await page.getByRole('textbox', { name: '桁' }).nth(1).fill(TestConfig.tokenNumber[1]);
  await page.getByRole('textbox', { name: '桁' }).nth(2).fill(TestConfig.tokenNumber[2]);
 // await page.getByRole('textbox', { name: '-4桁' }).fill(TestConfig.tokenNumber[3]);

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  const expectedErrorMessage = '半角数字1-4桁で入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});


// Verify that the correct error message is displayed when no token number is entered
test("Verify that the correct error message is displayed when no token number is entered.", async ({page, })=>{

    await page.goto(`${EnvConfig.baseURL}/pan`);

  await page.getByRole('radio', { name: 'トークン => PAN' }).check();

 // Without enter token number

  await page.getByRole('button', { name: '送信' }).click();

  // Assertion: Verify the main area contains the expected error message
  const expectedErrorMessage = 'トークン番号は半角数字13-16桁で入力してください。';
  await expect(page.getByRole('main')).toContainText(expectedErrorMessage);
  
  // Optional: If you want to log success
  console.log(`Successfully asserted error message: ${expectedErrorMessage}`);
});

