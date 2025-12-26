/**
 * Settings Page Object
 *
 * Page object for the user settings page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class SettingsPage extends BasePage {
  // Page header
  readonly pageTitle: Locator;

  // Tab navigation
  readonly profileTab: Locator;
  readonly notificationsTab: Locator;
  readonly accountTab: Locator;

  // Profile tab content
  readonly profileSection: Locator;
  readonly avatarSection: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly saveProfileButton: Locator;

  // Notifications tab content
  readonly notificationsSection: Locator;
  readonly emailNotificationsToggle: Locator;
  readonly weeklySummaryToggle: Locator;
  readonly themeToggle: Locator;
  readonly savePreferencesButton: Locator;

  // Account tab content
  readonly accountSection: Locator;
  readonly changePasswordButton: Locator;
  readonly exportDataButton: Locator;
  readonly signOutButton: Locator;
  readonly deleteAccountButton: Locator;

  constructor(page: Page) {
    super(page);

    // Page header
    this.pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /settings/i });

    // Tab navigation
    this.profileTab = page.getByRole('button', { name: /profile/i });
    this.notificationsTab = page.getByRole('button', { name: /notifications/i });
    this.accountTab = page.getByRole('button', { name: /account/i });

    // Profile tab content
    this.profileSection = page.locator('form, div').filter({ hasText: /profile information/i }).first();
    this.avatarSection = page.locator('div').filter({ hasText: /change photo/i }).first();
    this.nameInput = page.getByLabel(/full name|name/i);
    this.emailInput = page.getByLabel(/email/i);
    this.saveProfileButton = page.getByRole('button', { name: /save changes/i });

    // Notifications tab content
    this.notificationsSection = page.locator('div').filter({ hasText: /notification preferences/i }).first();
    this.emailNotificationsToggle = page.locator('text=Email Notifications').locator('..').locator('input[type="checkbox"]');
    this.weeklySummaryToggle = page.locator('text=Weekly Summary').locator('..').locator('input[type="checkbox"]');
    this.themeToggle = page.getByTestId('theme-toggle');
    this.savePreferencesButton = page.getByRole('button', { name: /save preferences/i });

    // Account tab content
    this.accountSection = page.locator('div').filter({ hasText: /account security/i }).first();
    this.changePasswordButton = page.getByRole('button', { name: /change password/i });
    this.exportDataButton = page.getByRole('button', { name: /export.*data/i });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
    this.deleteAccountButton = page.getByRole('button', { name: /delete account/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }

  async waitForReady(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
  }

  /**
   * Switch to Profile tab
   */
  async switchToProfileTab(): Promise<void> {
    await this.profileTab.click();
    await this.nameInput.waitFor({ state: 'visible' });
  }

  /**
   * Switch to Notifications tab
   */
  async switchToNotificationsTab(): Promise<void> {
    await this.notificationsTab.click();
    await this.savePreferencesButton.waitFor({ state: 'visible' });
  }

  /**
   * Switch to Account tab
   */
  async switchToAccountTab(): Promise<void> {
    await this.accountTab.click();
    await this.changePasswordButton.waitFor({ state: 'visible' });
  }

  /**
   * Update profile name
   */
  async updateName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  /**
   * Save profile changes
   */
  async saveProfile(): Promise<void> {
    await this.saveProfileButton.click();
  }

  /**
   * Get the current name value
   */
  async getCurrentName(): Promise<string> {
    return (await this.nameInput.inputValue()) || '';
  }

  /**
   * Get the current email value
   */
  async getCurrentEmail(): Promise<string> {
    return (await this.emailInput.inputValue()) || '';
  }

  /**
   * Toggle email notifications
   */
  async toggleEmailNotifications(): Promise<void> {
    await this.emailNotificationsToggle.click();
  }

  /**
   * Toggle weekly summary
   */
  async toggleWeeklySummary(): Promise<void> {
    await this.weeklySummaryToggle.click();
  }

  /**
   * Click sign out button in account tab
   */
  async clickSignOut(): Promise<void> {
    await this.switchToAccountTab();
    await this.signOutButton.click();
    await this.page.waitForURL('**/');
  }

  /**
   * Check if profile tab is active
   */
  async isProfileTabActive(): Promise<boolean> {
    return this.nameInput.isVisible();
  }

  /**
   * Check if notifications tab is active
   */
  async isNotificationsTabActive(): Promise<boolean> {
    return this.savePreferencesButton.isVisible();
  }

  /**
   * Check if account tab is active
   */
  async isAccountTabActive(): Promise<boolean> {
    return this.changePasswordButton.isVisible();
  }
}
