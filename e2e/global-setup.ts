/**
 * Playwright Global Setup
 *
 * Runs before all tests:
 * 1. Start PostgreSQL container
 * 2. Run migrations
 * 3. Seed test user
 *
 * Note: Authentication is handled per-test via the auth fixture.
 * This avoids timing issues with webServer startup.
 */

import { FullConfig } from '@playwright/test';
import { startE2EDatabase, migrateE2EDatabase, seedTestUser } from './utils/db-helper';

// Test user credentials - exported for use in fixtures
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
  console.log('✅ Database started:', connectionString, '\n');

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

  console.log('✅ Global setup complete!\n');
}

export default globalSetup;
