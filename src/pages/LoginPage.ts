import { Page, Locator } from '@playwright/test';
import { EnvConfig } from "../config/viriableConstant";
import logger from "../utils/LoggerUtil";

export default class LoginPage {
  handleMFAIfPresent() {
    throw new Error('Method not implemented.');
  }
  private readonly page: Page;

  // Locators (using role-based selectors for better stability)
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  // Constructor
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'ユーザーID' });
    this.passwordInput = page.getByRole('textbox', { name: 'パスワード' });
    this.loginButton = page.getByRole('button', { name: 'ログイン' });
  }

  // Navigate to login page
  async navigateToLoginPage() {
    logger.info("Navigating to login page...");
    await this.page.goto('https://external.dev.kddi-fs.veritrans.jp/portal/login');
  }

  // Actions
  async fillUsername(username: string) {
    logger.info(`Filling username: ${username}`);
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    logger.info("Filling password...");
    await this.passwordInput.fill(password);
  }

  async clickLoginButton() {
    logger.info("Clicking login button...");
    await this.loginButton.click();
  }

  // Quick Login wrapper (using EnvConfig values by default)
  async quickLogin() {
    await this.navigateToLoginPage();
    await this.fillUsername(EnvConfig.email);
    await this.fillPassword(EnvConfig.password);
    await this.clickLoginButton();
  }
}
