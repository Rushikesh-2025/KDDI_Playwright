import { test as base, expect } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import { TestConfig } from '../data/test.config';
import fs from "fs";

// Extend base test with session fixture
const test = base.extend({
    page: async ({ page }, use) => {
        const sessionData = JSON.parse(fs.readFileSync("userSession.json", "utf-8"));

        await page.goto(`${EnvConfig.baseURL}/screenSelection`);
        await page.evaluate((data) => {
            for (const key in data) {
                sessionStorage.setItem(key, data[key]);
            }
        }, sessionData);
        await page.reload();

        await use(page);
    },
});
// -------------------- TEST --------------------
// Verify that user selects today, yesterday, this week, last week, this month, last month from dropdown - dates should be correct (JST)
test('Verify that user selects today, yesterday, this week, last week, this month, last month from dropdown - dates should be correct (JST)', async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Click on '操作履歴' link
    await page.getByRole('link', { name: '操作履歴' }).click();

    // ---------- TODAY ----------
    const nowUTC = new Date();
    const todayJST = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const formattedToday = `${todayJST.getFullYear()}/${String(todayJST.getMonth() + 1).padStart(2, '0')}/${String(todayJST.getDate()).padStart(2, '0')}`;

    const startDateInput = page.getByRole('textbox', { name: 'YYYY/MM/DD HH:MM:SS' }).first();
    const endDateInput = page.getByRole('textbox', { name: 'YYYY/MM/DD HH:MM:SS' }).nth(1);

    const startValue = (await startDateInput.inputValue()).substring(0, 10);
    const endValue = (await endDateInput.inputValue()).substring(0, 10);

    expect(startValue).toBe(formattedToday);
    expect(endValue).toBe(formattedToday);
    console.log(`Today - Start Date: ${startValue}, End Date: ${endValue}`);
    await page.waitForTimeout(2000);

    // ---------- YESTERDAY (前日) ----------
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ })
        .getByRole('combobox')
        .selectOption('前日');

    const yesterdayJST = new Date(todayJST);
    yesterdayJST.setDate(yesterdayJST.getDate() - 1);
    const formattedYesterday = `${yesterdayJST.getFullYear()}/${String(yesterdayJST.getMonth() + 1).padStart(2, '0')}/${String(yesterdayJST.getDate()).padStart(2, '0')}`;

    const startYesterdayValue = (await startDateInput.inputValue()).substring(0, 10);
    const endYesterdayValue = (await endDateInput.inputValue()).substring(0, 10);

    expect(startYesterdayValue).toBe(formattedYesterday);
    expect(endYesterdayValue).toBe(formattedYesterday);
    console.log(`Yesterday - Start Date: ${startYesterdayValue}, End Date: ${endYesterdayValue}`);

    // ---------- LAST WEEK (先週) ----------
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('先週');

    // Compute last week's Sunday in JST
    const dayOfWeekLastWeek = todayJST.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const lastSundayJST = new Date(todayJST);
    lastSundayJST.setDate(todayJST.getDate() - dayOfWeekLastWeek - 7); // go back to previous week's Sunday

    const yyyyLastSunday = lastSundayJST.getFullYear();
    const mmLastSunday = String(lastSundayJST.getMonth() + 1).padStart(2, '0');
    const ddLastSunday = String(lastSundayJST.getDate()).padStart(2, '0');
    const formattedLastSunday = `${yyyyLastSunday}/${mmLastSunday}/${ddLastSunday}`;

    // End of last week = Saturday
    const lastSaturdayJST = new Date(lastSundayJST);
    lastSaturdayJST.setDate(lastSundayJST.getDate() + 6);

    const yyyyLastSaturday = lastSaturdayJST.getFullYear();
    const mmLastSaturday = String(lastSaturdayJST.getMonth() + 1).padStart(2, '0');
    const ddLastSaturday = String(lastSaturdayJST.getDate()).padStart(2, '0');
    const formattedLastSaturday = `${yyyyLastSaturday}/${mmLastSaturday}/${ddLastSaturday}`;

    // Get current values from inputs
    const startLastWeekValue = await startDateInput.inputValue();
    const endLastWeekValue = await endDateInput.inputValue();

    // Assert start = last week's Sunday, end = last week's Saturday
    expect(startLastWeekValue.startsWith(formattedLastSunday)).toBeTruthy();
    expect(endLastWeekValue.startsWith(formattedLastSaturday)).toBeTruthy();

    console.log(`Last Week - Start Date (Sunday): ${startLastWeekValue}, End Date (Saturday): ${endLastWeekValue}`);
    await page.waitForTimeout(2000);

    // ---------- THIS MONTH (今月) ----------
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('今月');

    // Compute first day of the month in JST
    const firstDayOfMonth = new Date(todayJST.getFullYear(), todayJST.getMonth(), 1);
    const yyyyFirst = firstDayOfMonth.getFullYear();
    const mmFirst = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
    const ddFirst = String(firstDayOfMonth.getDate()).padStart(2, '0');
    const formattedFirstDay = `${yyyyFirst}/${mmFirst}/${ddFirst}`;

    // Compute last day of current month in JST
    const lastDayOfMonth = new Date(todayJST.getFullYear(), todayJST.getMonth() + 1, 0); // day 0 = last day of current month
    const yyyyLast = lastDayOfMonth.getFullYear();
    const mmLast = String(lastDayOfMonth.getMonth() + 1).padStart(2, '0');
    const ddLast = String(lastDayOfMonth.getDate()).padStart(2, '0');
    const formattedLastDay = `${yyyyLast}/${mmLast}/${ddLast}`;

    // Get current values from inputs
    const startMonthValue = await startDateInput.inputValue();
    const endMonthValue = await endDateInput.inputValue();

    // Assert start = 1st of month, end = last day of month
    expect(startMonthValue.startsWith(formattedFirstDay)).toBeTruthy();
    expect(endMonthValue.startsWith(formattedLastDay)).toBeTruthy();

    console.log(`This Month - Start Date (1st): ${startMonthValue}, End Date (Last Day): ${endMonthValue}`);

    // ---------- LAST MONTH (先月) ----------
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ })
        .getByRole('combobox')
        .selectOption('先月');

    // Compute first day of last month in JST
    const firstDayLastMonth = new Date(todayJST.getFullYear(), todayJST.getMonth() - 1, 1);
    const yyyyLastMonthStart = firstDayLastMonth.getFullYear();
    const mmLastMonthStart = String(firstDayLastMonth.getMonth() + 1).padStart(2, '0');
    const ddLastMonthStart = String(firstDayLastMonth.getDate()).padStart(2, '0');
    const formattedLastMonthStart = `${yyyyLastMonthStart}/${mmLastMonthStart}/${ddLastMonthStart}`;

    // Compute last day of last month in JST
    const lastDayLastMonth = new Date(todayJST.getFullYear(), todayJST.getMonth(), 0); // day 0 = last day of previous month
    const yyyyLastMonthEnd = lastDayLastMonth.getFullYear();
    const mmLastMonthEnd = String(lastDayLastMonth.getMonth() + 1).padStart(2, '0');
    const ddLastMonthEnd = String(lastDayLastMonth.getDate()).padStart(2, '0');
    const formattedLastMonthEnd = `${yyyyLastMonthEnd}/${mmLastMonthEnd}/${ddLastMonthEnd}`;

    // Get current values from inputs
    const startLastMonthValue = await startDateInput.inputValue();
    const endLastMonthValue = await endDateInput.inputValue();

    // Assert start = first day of last month, end = last day of last month
    expect(startLastMonthValue.startsWith(formattedLastMonthStart)).toBeTruthy();
    expect(endLastMonthValue.startsWith(formattedLastMonthEnd)).toBeTruthy();

    console.log(`Last Month - Start Date: ${startLastMonthValue}, End Date: ${endLastMonthValue}`);
    await page.waitForTimeout(2000);

});

// Verify data fetch for with comman operation screen checkBox selected
test('Verify data fetch for with comman operation screen checkBox selected', async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Click on Clear button
    await page.getByRole('button', { name: 'クリア' }).click();

    // Select dropdown with "Not specified" option
    await page.locator('div')
        .filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ })
        .getByRole('combobox')
        .selectOption('指定なし');

    // Click on Common Operation screen checkbox
    await page.getByRole('checkbox', { name: '共通' }).check();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCellAuthCode = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCellAuthCode).toBeVisible();

    // ---------- Loop through 7th column and assert all entries are same ----------
    const columnCells = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCells.length).toBeGreaterThan(0);

    // Get the first entry to compare
    const firstEntry = columnCells[0];

    // Loop and assert all entries are equal to firstEntry
    for (const entry of columnCells) {
        expect(entry).toBe(firstEntry);
    }
    console.log(`All ${columnCells.length} rows in 7th column have the same entry: "${firstEntry}"`);

});

// Verify data fetch for with Authorization Code Entry operation screen checkBox selected
test("Verify data fetch for with Authorization Code Entry operation screen checkBox selected", async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);
    // Click on clear filter button
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Check the checkBox for Authorization Code Entry operation screen
    await page.getByRole('checkbox', { name: '認可コード入力' }).check();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 7th column and assert all entries are same ----------
    const columnCellsAuth = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsAuth.length).toBeGreaterThan(0);

    // Get the first entry to compare
    const firstEntryAuth = columnCellsAuth[0];

    // Loop and assert all entries are equal to firstEntry
    for (const entry of columnCellsAuth) {
        expect(entry).toBe(firstEntryAuth);
    }
    console.log(`All ${columnCellsAuth.length} rows in 7th column have the same entry: "${firstEntryAuth}"`);
})

// Verify data fetch for with Pan Token Inquiry operation screen checkBox selected
test("Verify data fetch for with Pan Token Inquiry operation screen checkBox selected", async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);
    // Click on clear filter button
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Check the checkBox for Pan Token Inquiry Entry operation screen
    await page.getByRole('checkbox', { name: 'PAN/トークン照会' }).check();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 7th column and assert all entries are same ----------
    const columnCellsPanTok = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsPanTok.length).toBeGreaterThan(0);

    // Get the first entry to compare
    const firstEntryPanTok = columnCellsPanTok[0];

    // Loop and assert all entries are equal to firstEntry
    // Assertion for Pan Token Inquiry Entry
    for (const entry of columnCellsPanTok) {
        expect(entry).toBe(firstEntryPanTok);
    }
    console.log(`All ${columnCellsPanTok.length} rows in 7th column have the same entry: "${firstEntryPanTok}"`);
})

// Verify data fetch for with File Handling operation screen checkBox selected
test("Verify data fetch for with File Handling operation screen checkBox selected", async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);
    // Click on clear operation date an time ,select not specify
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Check the checkBox for File Hnadling Entry operation screen
    await page.getByRole('checkbox', { name: 'ファイル処理' }).check();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 7th column and assert all entries are same ----------
    const columnCellsFile = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsFile.length).toBeGreaterThan(0);

    // Get the first entry to compare
    const firstEntryFile = columnCellsFile[0];

    // Loop and assert all entries are equal to firstEntry
    // Assertion for Pan Token Inquiry Entry
    for (const entry of columnCellsFile) {
        expect(entry).toBe(firstEntryFile);
    }
    console.log(`All ${columnCellsFile.length} rows in 7th column have the same entry: "${firstEntryFile}"`);
})

// Verify data fetch for with Password Updated operation screen checkBox selected
test("Verify data fetch for with Password Update operation screen checkBox selected", async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);
    // Click on clear operation date an time ,select not specify
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Check the checkBox for pasword update operation screen
    await page.getByRole('checkbox', { name: 'パスワード更新' }).check();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 7th column and assert all entries are same ----------
    const columnCellsPass = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsPass.length).toBeGreaterThan(0);

    // Get the first entry to compare
    const firstEntryPass = columnCellsPass[0];

    // Loop and assert all entries are equal to firstEntry
    // Assertion for Pan Token Inquiry Entry
    for (const entry of columnCellsPass) {
        expect(entry).toBe(firstEntryPass);
    }
    console.log(`All ${columnCellsPass.length} rows in 7th column have the same entry: "${firstEntryPass}"`);
})

// Verify data fetch for with User Management operation screen checkBox selected
test("Verify data fetch for with User Management operation screen checkBox selected", async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);
    // Click on clear operation date an time ,select not specify
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Check the checkBox for User Management operation screen
    await page.getByRole('checkbox', { name: 'ユーザー管理' }).check();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 7th column and assert all entries are same ----------
    const columnCellsUser = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsUser.length).toBeGreaterThan(0);

    // Get the first entry to compare
    const firstEntryUser = columnCellsUser[0];

    // Loop and assert all entries are equal to firstEntry
    // Assertion for Pan Token Inquiry Entry
    for (const entry of columnCellsUser) {
        expect(entry).toBe(firstEntryUser);
    }
    console.log(`All ${columnCellsUser.length} rows in 7th column have the same entry: "${firstEntryUser}"`);
})

// Verify data fetch for with All operation screen checkBox selected
test("Verify data fetch for with All operation screen checkBox selected", async ({ page }) => {
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified"
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Click on All opeartion screen
    await page.getByRole('button', { name: '全選択' }).click();

    // Click on Search Button
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '操作画面' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 7th column ----------
    const columnCellsAll = await page.locator('td:nth-child(7)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsAll.length).toBeGreaterThan(0);

    // Optional: check that multiple expected operation screens are present
    const expectedScreens = ["共通", "認可コード入力", "PAN => トークン", "トークン => PAN"]; // Add all possible operation screens
    const foundScreens = Array.from(new Set(columnCellsAll));

    expectedScreens.forEach(screen => {
        if (foundScreens.includes(screen)) {
            console.log(`✅ Found expected screen: "${screen}"`);
        } else {
            console.warn(`⚠️ Expected screen not found: "${screen}"`);
        }
    });

    console.log(`All 7th column entries: ${columnCellsAll.join(", ")}`);
});

// Verify data fetch for Success Results for operation history
test("Verify data fetch for Success Results for operation history", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Select success from Result Dropdown (操作結果)
    // Assuming '1' is the value for "成功"
    await page.locator('div').filter({ hasText: /^操作結果すべて成功失敗$/ }).getByRole('combobox').selectOption('1');

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    // Assert that the table content is visible by checking for the '操作結果' cell
    const tableCell = page.getByRole('cell', { name: '操作結果' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 8th column (操作結果) and assert all are "成功" ----------
    const columnCellsSuccess = await page.locator('td:nth-child(9)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsSuccess.length).toBeGreaterThan(0);

    // Assert all rows show "成功"
    for (const result of columnCellsSuccess) {
        expect(result).toBe("成功");
    }
    console.log(`All ${columnCellsSuccess.length} rows in 操作結果 column are "成功"`);

    // Optional: Log unique operation screens in 7th column (操作画面)
    const columnCellsScreens = await page.locator('td:nth-child(7)').allTextContents();
    const uniqueScreens = Array.from(new Set(columnCellsScreens));
    console.log(`Operation screens found in results: ${uniqueScreens.join(", ")}`);
});

// Verify data fetch for Success Results for operation history
test("Verify data fetch for failure Results for operation history", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Select success from Result Dropdown (操作結果)
    // Assuming '1' is the value for "失敗"
    await page.locator('div').filter({ hasText: /^操作結果すべて成功失敗$/ }).getByRole('combobox').selectOption('0');

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    // Assert that the table content is visible by checking for the '操作結果' cell
    const tableCell = page.getByRole('cell', { name: '操作結果' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 8th column (操作結果) and assert all are "成功" ----------
    const columnCellsFailure = await page.locator('td:nth-child(9)').allTextContents();

    // Ensure there is at least one row
    expect(columnCellsFailure.length).toBeGreaterThan(0);

    // Assert all rows show "失敗"
    for (const result of columnCellsFailure) {
        expect(result).toBe("失敗");
    }
    console.log(`All ${columnCellsFailure.length} rows in 操作結果 column are "失敗"`);

    // Optional: Log unique operation screens in 7th column (操作画面)
    const columnCellsScreens = await page.locator('td:nth-child(7)').allTextContents();
    const uniqueScreens = Array.from(new Set(columnCellsScreens));
    console.log(`Operation screens found in results: ${uniqueScreens.join(", ")}`);
});

// Verify data fetch for User ID to search operation history
test("Verify data fetch for User ID to search operation history", async ({ page }) => {
    // Navigate to operation history
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Fill User ID to search operational history
    await page.getByRole('textbox', { name: 'ユーザーIDを入力' }).fill(TestConfig.userId);

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // Wait for either table or error message to appear
    const tableSelector = page.getByRole('cell', { name: 'ユーザーID' });
    const errorSelector = page.getByText('該当データが存在しませんでした。', { exact: true });

    try {
        // Wait for either success or failure within 5 seconds
        await Promise.race([
            tableSelector.waitFor({ state: 'visible', timeout: 5000 }),
            errorSelector.waitFor({ state: 'visible', timeout: 5000 })
        ]);

        // Check which one appeared
        if (await errorSelector.isVisible()) {
            console.warn("⚠️ No data found for provided User ID");
            await expect(errorSelector).toHaveText('該当データが存在しませんでした。');
        } else {
            console.log("✅ Data table appeared — verifying User ID column...");

            // ---------- Loop through 2nd column (ユーザーID) ----------
            const userIdCells = page.locator('td:nth-child(2)');
            const rowCount = await userIdCells.count();

            expect(rowCount).toBeGreaterThan(0);

            // Create expected array of same User IDs
            const expectedUserIds = Array(rowCount).fill(TestConfig.userId);

            // Assert all user IDs match
            await expect(userIdCells).toHaveText(expectedUserIds);

            console.log(`✅ Verified all ${rowCount} rows match User ID: ${TestConfig.userId}`);
        }
    } catch (err) {
        // If neither appeared (timeout or page issue)
        console.error("❌ Neither table nor error message appeared within timeout:", err);
        throw err;
    }
});


// Verify data fetch for Username to search operation history
test("Verify data fetch for Username to search operation history", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Fill Username to search operational history
    await page.getByRole('textbox', { name: 'ユーザー名を入力' }).fill(TestConfig.username);

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    // Assert that the table content is visible by checking for the 'ユーザー名' cell
    const tableCell = page.getByRole('cell', { name: 'ユーザー名' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 3th column (ユーザー名) and assert 
    const columnCellsUsername = await page.locator('td:nth-child(3)').allTextContents();
    // ---------- Assert all rows match the search username using Playwright's assertion ----------

    const usernameCells = page.locator('td:nth-child(3)');
    const rowCount = await usernameCells.count();

    // Ensure there is at least one row
    expect(rowCount).toBeGreaterThan(0);

    // Create an array of the target User ID repeated 'rowCount' times
    const expectedUsername = Array(rowCount).fill(TestConfig.username);

    // Assert that every cell in the 2nd column matches the target ID
    await expect(usernameCells).toHaveText(expectedUsername);
});

// Verify data fetch for Affiliation- k&K contract to search operation history
test("Verify data fetch for Affiliation- k&K contract to search operation history", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Select checkbox of Affiliation
    await page.locator('#affiliationCheckbox').check();
    await page.waitForTimeout(200)

    // defult k&K and e-BIS Contract selected, we uncheck e-bis checkBox
    await page.getByRole('checkbox', { name: 'e-BIS' }).uncheck();

    // Click on Search Button (検索)

    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    // Assert that the table content is visible by checking for the '契約' cell
    const tableCell = page.getByRole('cell', { name: '契約' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 4th column (契約) and assert 
    const columnCellsUsername = await page.locator('td:nth-child(4)').allTextContents();
    // ---------- Assert all rows match the search username using Playwright's assertion ----------

    const usernameCells = page.locator('td:nth-child(4)');
    const rowCount = await usernameCells.count();

    // Ensure there is at least one row
    expect(rowCount).toBeGreaterThan(0);

    // Create an array of the target k&k contract repeated 'rowCount' times
    const expectedUsername = Array(rowCount).fill(TestConfig.contract1);

    // Assert that every cell in the 4nd column matches the target ID
    await expect(usernameCells).toHaveText(expectedUsername);
});

// Verify data fetch for Affiliation- e-BIS contract to search operation history
test("Verify data fetch for Affiliation- e-BIS contract to search operation history", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Select checkbox of Affiliation
    await page.locator('#affiliationCheckbox').check();
    await page.waitForTimeout(200)

    // defult k&K and e-BIS Contract selected, we uncheck K&K checkBox
    await page.getByRole('checkbox', { name: 'K&K' }).uncheck();

    // Click on Search Button (検索)

    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    // Assert that the table content is visible by checking for the '契約' cell
    const tableCell = page.getByRole('cell', { name: '契約' });
    await expect(tableCell).toBeVisible();

    // ---------- Loop through 4th column (契約) and assert 
    const columnCellsUsername = await page.locator('td:nth-child(4)').allTextContents();
    // ---------- Assert all rows match the search username using Playwright's assertion ----------

    const usernameCells = page.locator('td:nth-child(4)');
    const rowCount = await usernameCells.count();

    // Ensure there is at least one row
    expect(rowCount).toBeGreaterThan(0);

    // Create an array of the target e-BIS contract repeated 'rowCount' times
    const expectedUsername = Array(rowCount).fill(TestConfig.contract2);

    // Assert that every cell in the 4nd column matches the target ID
    await expect(usernameCells).toHaveText(expectedUsername);
});

// Verify data fetch for both Affiliation k&k, e-BIS contract to search operation history
test("Verify data fetch for both Affiliation k&k, e-BIS contract to search operation history", async ({ page }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Select checkbox of Affiliation
    await page.locator('#affiliationCheckbox').check();
    await page.waitForTimeout(200);

    // default k&K and e-BIS Contract selected

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Table visible ----------
    const tableCell = page.getByRole('cell', { name: '契約' });
    await expect(tableCell).toBeVisible();

    // ---------- Fetch all rows of 4th column (契約) ----------
    const contractCells = page.locator('td:nth-child(4)');
    const rowCount = await contractCells.count();

    expect(rowCount).toBeGreaterThan(0);

    // Collect all text values in 4th column
    const contractValues = await contractCells.allTextContents();

    // Expected contracts (from config)
    const expectedContracts = [TestConfig.contract1, TestConfig.contract2]; // e.g. ["k&k", "e-BIS"]

    // Assert at least one of each expected contract is present
    for (const contract of expectedContracts) {
        expect(contractValues).toContain(contract);
        console.log(`✅ Found contract: ${contract}`);
    }
    // Optional: assert no unexpected contracts are present
    const unexpected = contractValues.filter(c => !expectedContracts.includes(c));
    if (unexpected.length > 0) {
        console.warn(`⚠️ Unexpected contracts found: ${unexpected.join(", ")}`);
    }
});

// Verify error message fetch for invalid User ID to search operation history
test("Verify error message fetch for invalid User ID to search operation history", async ({ page }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Fill User ID with an invalid one
    await page.getByRole('textbox', { name: 'ユーザーIDを入力' }).fill("invalid.userId@test.com");

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Error message ----------
    const errorMessage = page.getByText('該当データが存在しませんでした。', { exact: true });

    // Ensure the error message is visible
    await expect(errorMessage).toBeVisible();

    // Extra safety: assert the full text match
    await expect(errorMessage).toHaveText('該当データが存在しませんでした。');
    console.log("✅ Verified: Error message displayed correctly for invalid User ID");
});

// Verify Error message for invalid Username to search operation history
test("Verify Error message for invalid Username to search operation history", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Fill Username to search operational history
    await page.getByRole('textbox', { name: 'ユーザー名を入力' }).fill("InvalidUser");

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Error message ----------
    const errorMessage = page.getByText('該当データが存在しませんでした。', { exact: true });

    // Ensure the error message is visible
    await expect(errorMessage).toBeVisible();

    // Extra safety: assert the full text match
    await expect(errorMessage).toHaveText('該当データが存在しませんでした。');

});

// Verify that entering unregistered user ID gives an appropriate error message
test("Verify that entering unregistered user ID gives an appropriate error message", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Fill Username to search operational history
    await page.getByRole('textbox', { name: 'ユーザー名を入力' }).fill(TestConfig.unregistered_userId);

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Error message ----------
    const errorMessage = page.getByText('該当データが存在しませんでした。', { exact: true });

    // Ensure the error message is visible
    await expect(errorMessage).toBeVisible();

    // Extra safety: assert the full text match
    await expect(errorMessage).toHaveText('該当データが存在しませんでした。');

});

// Verify that entering unregistered User name give an appropriate error message
test("Verify that entering unregistered User name give an appropriate error message", async ({ page, /* Add EnvConfig to destructuring if needed */ }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Fill Username to search operational history
    await page.getByRole('textbox', { name: 'ユーザー名を入力' }).fill("UnknowUser");

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Error message ----------
    const errorMessage = page.getByText('該当データが存在しませんでした。', { exact: true });

    // Ensure the error message is visible
    await expect(errorMessage).toBeVisible();

    // Extra safety: assert the full text match
    await expect(errorMessage).toHaveText('該当データが存在しませんでした。');
});

// Verify that if no search result is available an appropriate message is shown on the screen.
test("Verify that if no search result is available an appropriate message is shown on the screen.", async ({ page, }) => {
    // Navigate and set filters
    await page.goto(`${EnvConfig.baseURL}/operation-history`);

    // Clear operation date/time, select "Not specified" (指定なし)
    await page.locator('div').filter({ hasText: /^指定なし本日前日今週先週今月先月～$/ }).getByRole('combobox').selectOption('指定なし');

    // Fill Username to search operational history
    await page.getByRole('textbox', { name: 'ユーザー名を入力' }).fill("UnknowUser");

    // Click on Search Button (検索)
    await page.getByRole('button', { name: '検索' }).click();

    // ---------- Assertion: Error message ----------
    const errorMessage = page.getByText('該当データが存在しませんでした。', { exact: true });

    // Ensure the error message is visible
    await expect(errorMessage).toBeVisible();

    // Extra safety: assert the full text match
    
    await expect(errorMessage).toHaveText('該当データが存在しませんでした。');

});
