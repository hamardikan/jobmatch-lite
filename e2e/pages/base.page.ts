/**
 * Base Page Object
 *
 * Common functionality shared across all page objects.
 */

import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page URL
   */
  abstract goto(): Promise<void>;

  /**
   * Wait for the page to be fully loaded
   */
  abstract waitForReady(): Promise<void>;

  /**
   * Get the current page URL
   */
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if an element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  /**
   * Wait for an element to be visible
   */
  async waitForVisible(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get the user menu component (available on authenticated pages)
   */
  get userMenu(): Locator {
    return this.page.getByTestId('user-menu');
  }

  /**
   * Get the user menu button
   */
  get userMenuButton(): Locator {
    return this.page.getByTestId('user-menu-button');
  }

  /**
   * Get the sign out button
   */
  get signOutButton(): Locator {
    return this.page.getByTestId('sign-out-button');
  }

  /**
   * Sign out from the current session
   */
  async signOut(): Promise<void> {
    await this.userMenuButton.click();
    await this.signOutButton.click();
    await this.page.waitForURL('**/login');
  }
}
