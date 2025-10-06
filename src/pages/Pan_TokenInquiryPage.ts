import { Page, Locator } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import logger from "../utils/LoggerUtil";
import fs from "fs";

export default class Pan_TokenInquiryPage {
  handleMFAIfPresent() {
    throw new Error('Method not implemented.');
  }
  private readonly page: Page;

  // Locators (using role-based selectors for better stability)
  //private readonly usernameInput: Locator;
 
  // Constructor
  constructor(page: Page) {
    this.page = page;
    //this.usernameInput = page.getByRole('textbox', { name: 'ユーザーID' });
    
  }

  // Navigate to login page
  async navigateToLoginPage() {
    logger.info("Navigating to login page...");
    await this.page.goto(`${EnvConfig.baseURL}/login`);
  }
}
