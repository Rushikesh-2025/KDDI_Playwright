import { Page, Locator, expect } from "@playwright/test";
import logger from "./LoggerUtil";


export default async function findValidElement(
  page: Page,
  locators: string[]
): Promise<Locator | null> {
  let validElement: Locator | null = null;
  const TIMEOUT_MS = 5000;

  for (const locator of locators) {
    try {
      const element = page.locator(locator);
      await element.waitFor({ state: "attached", timeout: TIMEOUT_MS });
      validElement = element;
      logger.info(`Found valid element with locator: ${locator}`);
      break; // Exit loop if valid element found
    } catch (error) {
      logger.error(` Invalid locator: ${locator}`);
    }
  }

  if (!validElement) {
    logger.error("All locators are invalid");
  }

  return validElement;
}

// // Usage example:
// async function exampleUsage(page: Page) {
//     const locators = ["#selector1", "#selector2", "#selector3"];
//     const validElement = await findValidElement(page, locators);
//     if (validElement) {
//         // Perform actions on validElement
//     }
// }



export async function verifyLoginAlert(page: Page) {
  const alertLocator = page.getByRole('alert'); // create locator

  // Wait until alert is visible
  await expect(alertLocator).toBeVisible({ timeout: 5000 });

  // Get the alert text
  const actualText = (await alertLocator.textContent())?.trim() || "";

  // Patterns to match dynamic messages
  const patterns = [
    /^Something went wrong!!!$/, 
    /^Invalid credentials\. You have \d+ attempt\(s\) left\. Please use forgot password functionality\.$/,
    /^Account is locked due to 5 failed attempts\. Try again after 60 minutes or reset your password\.$/,
  ];

  // Check if actual text matches any of the patterns
  const matchedPattern = patterns.find(p => p.test(actualText));

  if (!matchedPattern) {
    throw new Error(`Unexpected alert message: "${actualText}"`);
  }

  console.log(`[selfHandling] Matched alert pattern: ${matchedPattern}`);
}
