import { Page, Locator } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import logger from "../utils/LoggerUtil";

export default class DashbordPage {
  handleMFAIfPresent() {
    throw new Error('Method not implemented.');
  }
  private readonly page: Page;

  // Locators (using role-based selectors for better stability)



  // Constructor
  constructor(page: Page) {
    this.page = page;
  
  }

  // Actions
  // Navigate to login page
  async navigateToLoginPage() {
    logger.info("Navigating to login page...");
    await this.page.goto(`${EnvConfig.baseURL}/login`);
  }
}
