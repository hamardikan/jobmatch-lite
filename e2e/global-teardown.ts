/**
 * Playwright Global Teardown
 *
 * Runs after all tests:
 * 1. Stop PostgreSQL container
 * 2. Clean up auth state
 */

import { FullConfig } from '@playwright/test';
import { stopE2EDatabase } from './utils/db-helper';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 Starting E2E global teardown...\n');

  // Stop database container
  console.log('📦 Stopping PostgreSQL container...');
  await stopE2EDatabase();
  console.log('✅ Database stopped\n');

  // Clean up auth state (optional - can be kept for debugging)
  const authFile = path.join(__dirname, '.auth', 'user.json');
  if (fs.existsSync(authFile)) {
    fs.unlinkSync(authFile);
    console.log('✅ Auth state cleaned up\n');
  }

  console.log('✅ Global teardown complete!\n');
}

export default globalTeardown;
