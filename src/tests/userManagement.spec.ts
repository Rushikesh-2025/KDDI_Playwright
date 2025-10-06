import { test as base, expect, Page } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import LoginPage from '../pages/LoginPage';
import DashbordPage from '../pages/DashbordPage';
import { faker } from '@faker-js/faker';
import fs from "fs";

const randomFirstName = faker.person.firstName();
const randomLastName = faker.person.lastName();
const standardEmail = `${randomFirstName}.${randomLastName}.${Date.now()}@example.com`.toLowerCase();

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

// Example test
test('Create Admin user', async ({ page, }) => {
  await page.goto(`${EnvConfig.baseURL}/user-management`);

  await page.getByRole('button', { name: 'ユーザー登録' }).click();
  await page.getByRole('textbox', { name: 'ユーザーID' }).click();
  await page.getByRole('textbox', { name: 'ユーザーID' }).fill(standardEmail);
  await page.getByRole('textbox', { name: '姓' }).fill(randomFirstName);
  await page.getByRole('textbox', { name: '名' }).fill(randomLastName);
  await page.locator('div').filter({ hasText: /^PAN\/トークン照会ファイル処理$/ }).getByRole('checkbox').first().check();
  await page.locator('div').filter({ hasText: /^有$/ }).getByRole('checkbox').check();
  await page.getByText('使用（仮パスワードをメールで送信します。)').click();
  await page.locator('div').filter({ hasText: /^使用（仮パスワードをメールで送信します。\)$/ }).getByRole('checkbox').check();


  await page.waitForTimeout(3000)
  await page.getByRole('button', { name: '登録' }).click();
  await page.waitForTimeout(3000)
  await page.getByRole('button', { name: 'はい' }).click();

  await page.waitForTimeout(5000)
  // Assertion
  // Locate success message
  const successMsg = page.locator('text=ユーザーが登録されました。');

  // Wait until the message is visible
  await expect(successMsg).toBeVisible();

  // Get the actual text
  const msgText = await successMsg.textContent();

  // Assertion with if/else
  if (msgText?.includes('リンクメールをユーザーID')) {
    await expect(successMsg).toContainText('ユーザーが登録されました。 リンクメールをユーザーID');
  } else if (msgText?.includes('仮パスワードメールをユーザーIDに送信しました。')) {
    await expect(successMsg).toContainText('ユーザーが登録されました。 仮パスワードメールをユーザーIDに送信しました。');
  } else {
    throw new Error(`Unexpected success message: ${msgText}`);
  }

  // Wait and navigate back to user search
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: '戻る' }).click();

  console.log('Search using the registered email')
  // Search using the registered email (standardEmail)
  const searchName = `${standardEmail}`; // or whatever the app expects
  await page.getByRole('textbox', { name: 'ユーザーIDを入力' }).fill(standardEmail);
  await page.getByRole('button', { name: '検索' }).click();

  // Assertions: verify user appears in the table
  await expect(page.getByRole('cell', { name: 'ユーザーID' })).toBeVisible();
  await expect(page.getByRole('link', { name: standardEmail })).toBeVisible();

});

