/**
 * Playwright Global Setup
 *
 * Runs before all tests:
 * 1. Start PostgreSQL container
 * 2. Run migrations
 * 3. Seed test user
 * 4. Login and save auth state
 */

import { chromium, FullConfig } from '@playwright/test';
import { startE2EDatabase, migrateE2EDatabase, seedTestUser } from './utils/db-helper';
import * as fs from 'fs';
import * as path from 'path';

// Test user credentials
export const TEST_USER = {
  name: 'Test User',
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
};

async function globalSetup(config: FullConfig): Promise<void> {
  console.log('\n🚀 Starting E2E global setup...\n');

  // Step 1: Start database container
  console.log('📦 Starting PostgreSQL container...');
  const connectionString = await startE2EDatabase();
  console.log('✅ Database started\n');

  // Store connection string for API to use
  process.env.DATABASE_URL = connectionString;

  // Step 2: Run migrations
  console.log('🔄 Running database migrations...');
  await migrateE2EDatabase();
  console.log('✅ Migrations complete\n');

  // Step 3: Seed test user
  console.log('👤 Seeding test user...');
  await seedTestUser(TEST_USER);
  console.log('✅ Test user created\n');

  // Step 4: Login and save auth state
  console.log('🔐 Logging in and saving auth state...');

  // Ensure .auth directory exists
  const authDir = path.join(__dirname, '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Launch browser and login
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to login page
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
    await page.goto(`${baseURL}/login`);

    // Fill in login form
    await page.getByLabel('Email').fill(TEST_USER.email);
    await page.getByLabel('Password').fill(TEST_USER.password);

    // Submit and wait for redirect to dashboard
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('**/dashboard');

    // Save auth state
    const authFile = path.join(authDir, 'user.json');
    await context.storageState({ path: authFile });
    console.log('✅ Auth state saved\n');
  } catch (error) {
    console.error('❌ Failed to setup auth state:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup complete!\n');
}

export default globalSetup;
