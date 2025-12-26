/**
 * Landing Page Object
 *
 * Page object for the public landing page.
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LandingPage extends BasePage {
  // Hero section
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly getStartedButton: Locator;
  readonly loginLink: Locator;

  // Features section
  readonly featuresSection: Locator;
  readonly featureCards: Locator;

  // How it works section
  readonly howItWorksSection: Locator;
  readonly stepCards: Locator;

  // Stats section
  readonly statsSection: Locator;

  // CTA section
  readonly ctaSection: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page) {
    super(page);

    // Hero section
    this.heroSection = page.locator('section').filter({ hasText: /AI-Powered Resume Matching/i }).first();
    this.heroTitle = page.getByRole('heading', { level: 1 });
    this.heroSubtitle = page.locator('p').filter({ hasText: /match score/i }).first();
    this.getStartedButton = page.getByRole('link', { name: /get started/i });
    this.loginLink = page.getByRole('link', { name: /^sign in$|^login$/i });

    // Features section
    this.featuresSection = page.locator('section').filter({ hasText: /Why Choose JobMatch/i });
    this.featureCards = page.locator('[class*="grid"]').first().locator('> div');

    // How it works section
    this.howItWorksSection = page.locator('section').filter({ hasText: /How It Works/i });
    this.stepCards = this.howItWorksSection.locator('[class*="grid"] > div');

    // Stats section
    this.statsSection = page.locator('section').filter({ hasText: /Trusted by Job Seekers/i });

    // CTA section
    this.ctaSection = page.locator('section').filter({ hasText: /Ready to land your dream job/i });
    this.ctaButton = this.ctaSection.getByRole('link', { name: /create.*account|get started/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async waitForReady(): Promise<void> {
    await this.heroTitle.waitFor({ state: 'visible' });
  }

  /**
   * Click the Get Started button
   */
  async clickGetStarted(): Promise<void> {
    await this.getStartedButton.click();
  }

  /**
   * Click the Login link
   */
  async clickLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Check if hero section is visible
   */
  async isHeroVisible(): Promise<boolean> {
    return this.heroTitle.isVisible();
  }

  /**
   * Check if features section is visible
   */
  async isFeaturesVisible(): Promise<boolean> {
    return this.featuresSection.isVisible();
  }

  /**
   * Get the number of feature cards
   */
  async getFeatureCardsCount(): Promise<number> {
    return this.featureCards.count();
  }

  /**
   * Check if how it works section is visible
   */
  async isHowItWorksVisible(): Promise<boolean> {
    return this.howItWorksSection.isVisible();
  }

  /**
   * Get the number of step cards
   */
  async getStepCardsCount(): Promise<number> {
    return this.stepCards.count();
  }

  /**
   * Check if stats section is visible
   */
  async isStatsVisible(): Promise<boolean> {
    return this.statsSection.isVisible();
  }

  /**
   * Click the CTA button at the bottom
   */
  async clickCtaButton(): Promise<void> {
    await this.ctaButton.click();
  }
}
