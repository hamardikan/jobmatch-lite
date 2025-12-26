/**
 * Landing Page E2E Tests
 *
 * Tests for the public landing page.
 */

import { test, expect } from '@playwright/test';
import { LandingPage, LoginPage, RegisterPage } from '../pages';

test.describe('Landing Page', () => {
  test.describe('Unauthenticated User', () => {
    test('should display hero section with title', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      expect(await landingPage.isHeroVisible()).toBe(true);
      const title = await landingPage.heroTitle.textContent();
      expect(title?.toLowerCase()).toContain('resume');
    });

    test('should display Get Started button', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      await expect(landingPage.getStartedButton).toBeVisible();
    });

    test('should navigate to register when clicking Get Started', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      await landingPage.clickGetStarted();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should display Login link', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      await expect(landingPage.loginLink).toBeVisible();
    });

    test('should navigate to login when clicking Login link', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      await landingPage.clickLogin();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should display features section', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      // Scroll to features section
      await landingPage.featuresSection.scrollIntoViewIfNeeded();
      expect(await landingPage.isFeaturesVisible()).toBe(true);
    });

    test('should display how it works section', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      // Scroll to how it works section
      await landingPage.howItWorksSection.scrollIntoViewIfNeeded();
      expect(await landingPage.isHowItWorksVisible()).toBe(true);
    });

    test('should display CTA section at the bottom', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      // Scroll to CTA section
      await landingPage.ctaSection.scrollIntoViewIfNeeded();
      await expect(landingPage.ctaButton).toBeVisible();
    });

    test('should navigate to register from CTA section', async ({ page }) => {
      const landingPage = new LandingPage(page);
      await landingPage.goto();
      await landingPage.waitForReady();

      await landingPage.ctaSection.scrollIntoViewIfNeeded();
      await landingPage.clickCtaButton();
      await expect(page).toHaveURL(/\/register/);
    });
  });
});
