/**
 * Register Page Object
 *
 * Page object for the registration page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByLabel('Name');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password', { exact: true });
    this.confirmPasswordInput = page.getByLabel(/confirm password/i);
    this.submitButton = page.getByRole('button', { name: /sign up|register|create account/i });
    this.errorMessage = page.locator('[role="alert"]');
    this.loginLink = page.getByRole('link', { name: /sign in|login/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async waitForReady(): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /**
   * Fill in the registration form
   */
  async fillForm(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<void> {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (await this.confirmPasswordInput.isVisible()) {
      await this.confirmPasswordInput.fill(confirmPassword ?? password);
    }
  }

  /**
   * Submit the registration form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Register with the given credentials
   */
  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<void> {
    await this.fillForm(name, email, password, confirmPassword);
    await this.submit();
  }

  /**
   * Register and wait for successful redirect to home or login
   */
  async registerAndWaitForRedirect(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.register(name, email, password);
    // Wait for redirect to either home (auto-login) or login page
    await this.page.waitForURL(/\/(login)?$/);
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }

  /**
   * Navigate to the login page
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
    await this.page.waitForURL('**/login');
  }
}
