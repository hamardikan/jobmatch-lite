/**
 * Database Integration Test Setup
 *
 * Uses testcontainers to spin up a PostgreSQL container for integration tests.
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../src/infrastructure/db/schema';

let container: StartedPostgreSqlContainer | null = null;
let client: ReturnType<typeof postgres> | null = null;

/**
 * Start a PostgreSQL container for testing
 */
export async function startTestDatabase() {
  if (container) {
    return getTestDatabaseUrl();
  }

  console.log('Starting PostgreSQL container for tests...');

  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('jobmatch_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const connectionString = container.getConnectionUri();
  process.env.DATABASE_URL = connectionString;

  console.log('PostgreSQL container started');
  return connectionString;
}

/**
 * Get the test database connection URL
 */
export function getTestDatabaseUrl(): string {
  if (!container) {
    throw new Error('Test database not started. Call startTestDatabase() first.');
  }
  return container.getConnectionUri();
}

/**
 * Get a Drizzle client for the test database
 */
export async function getTestDb() {
  const connectionString = await startTestDatabase();

  if (!client) {
    client = postgres(connectionString, { max: 1 });
  }

  return drizzle(client, { schema });
}

/**
 * Run database migrations for test database
 */
export async function migrateTestDatabase() {
  const db = await getTestDb();

  // Create tables manually since we're not using migrations in tests
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "email_verified" BOOLEAN NOT NULL DEFAULT FALSE,
      "image" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "id" TEXT PRIMARY KEY,
      "expires_at" TIMESTAMP NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ip_address" TEXT,
      "user_agent" TEXT,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "account" (
      "id" TEXT PRIMARY KEY,
      "account_id" TEXT NOT NULL,
      "provider_id" TEXT NOT NULL,
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "access_token" TEXT,
      "refresh_token" TEXT,
      "id_token" TEXT,
      "access_token_expires_at" TIMESTAMP,
      "refresh_token_expires_at" TIMESTAMP,
      "scope" TEXT,
      "password" TEXT,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      "expires_at" TIMESTAMP NOT NULL,
      "created_at" TIMESTAMP DEFAULT NOW(),
      "updated_at" TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS "analysis" (
      "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "resume_filename" TEXT NOT NULL,
      "job_description_preview" TEXT NOT NULL,
      "score" INTEGER NOT NULL,
      "explanation" TEXT NOT NULL,
      "key_findings" JSONB NOT NULL,
      "processing_time" INTEGER NOT NULL,
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  console.log('Test database migrated');
  return db;
}

/**
 * Clean up test database tables
 */
export async function cleanupTestDatabase() {
  const db = await getTestDb();

  await db.execute(`
    TRUNCATE "analysis" CASCADE;
    TRUNCATE "session" CASCADE;
    TRUNCATE "account" CASCADE;
    TRUNCATE "verification" CASCADE;
    TRUNCATE "user" CASCADE;
  `);
}

/**
 * Stop the test database container
 */
export async function stopTestDatabase() {
  if (client) {
    await client.end();
    client = null;
  }

  if (container) {
    console.log('Stopping PostgreSQL container...');
    await container.stop();
    container = null;
    console.log('PostgreSQL container stopped');
  }
}

/**
 * Create a test user for integration tests
 */
export async function createTestUser(db: ReturnType<typeof drizzle>, userData?: Partial<typeof schema.user.$inferInsert>) {
  const defaultUser = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    emailVerified: true,
    ...userData,
  };

  const [user] = await db.insert(schema.user).values(defaultUser).returning();
  return user;
}
