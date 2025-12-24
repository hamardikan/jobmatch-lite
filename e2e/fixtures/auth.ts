/**
 * Auth Fixtures
 *
 * Test fixtures for authenticated sessions.
 */

import { test as base } from '@playwright/test';
import * as path from 'path';

// Test user credentials (same as global-setup.ts)
export const TEST_USER = {
  name: 'Test User',
  email: 'e2e-test@example.com',
  password: 'TestPassword123!',
};

// Auth state file path
export const AUTH_FILE = path.join(__dirname, '..', '.auth', 'user.json');

/**
 * Extended test with authenticated user context
 */
export const test = base.extend({
  // Use stored authentication state
  storageState: AUTH_FILE,
});

export { expect } from '@playwright/test';
