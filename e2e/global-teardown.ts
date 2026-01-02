/**
 * Playwright Global Teardown
 *
 * Runs after all tests:
 * 1. Stop PostgreSQL container
 */

import { FullConfig } from '@playwright/test';
import { stopE2EDatabase } from './utils/db-helper';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 Starting E2E global teardown...\n');

  // Stop database container
  console.log('📦 Stopping PostgreSQL container...');
  await stopE2EDatabase();
  console.log('✅ Database stopped\n');

  console.log('✅ Global teardown complete!\n');
}

export default globalTeardown;
