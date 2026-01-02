/**
 * E2E Database Helper
 *
 * Uses testcontainers to spin up a PostgreSQL container for E2E tests.
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import postgres from 'postgres';

// Fixed port for E2E database (use 5433 to avoid conflict with local postgres)
const E2E_DB_PORT = 5433;

let container: StartedPostgreSqlContainer | null = null;
let connectionString: string | null = null;

/**
 * Start a PostgreSQL container for E2E tests
 * Uses a fixed port so the webServer config can reference it statically
 */
export async function startE2EDatabase(): Promise<string> {
  if (container && connectionString) {
    return connectionString;
  }

  console.log('[E2E] Starting PostgreSQL container on port ' + E2E_DB_PORT + '...');

  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('jobmatch_e2e')
    .withUsername('e2e')
    .withPassword('e2e')
    .withExposedPorts({ container: 5432, host: E2E_DB_PORT })
    .start();

  // Use fixed port connection string for consistency
  connectionString = `postgresql://e2e:e2e@localhost:${E2E_DB_PORT}/jobmatch_e2e`;
  console.log('[E2E] PostgreSQL container started');

  return connectionString;
}

/**
 * Get the E2E database connection URL
 */
export function getE2EDatabaseUrl(): string {
  if (!connectionString) {
    throw new Error('E2E database not started. Call startE2EDatabase() first.');
  }
  return connectionString;
}

/**
 * Run database migrations for E2E database
 */
export async function migrateE2EDatabase(): Promise<void> {
  const url = getE2EDatabaseUrl();
  const sql = postgres(url, { max: 1 });

  console.log('[E2E] Running migrations...');

  await sql.unsafe(`
    -- Better-Auth tables
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

    -- Application tables
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

  await sql.end();
  console.log('[E2E] Migrations complete');
}

/**
 * Seed a test user for E2E tests
 */
export async function seedTestUser(userData: {
  email: string;
  password: string;
  name: string;
}): Promise<string> {
  const url = getE2EDatabaseUrl();
  const sql = postgres(url, { max: 1 });

  const userId = `user_${Date.now()}`;
  const accountId = `account_${Date.now()}`;

  // Hash the password using Bun.password (bcrypt compatible, same as Better Auth)
  const hashedPassword = await Bun.password.hash(userData.password, {
    algorithm: 'bcrypt',
    cost: 10,
  });

  await sql`
    INSERT INTO "user" (id, name, email, email_verified)
    VALUES (${userId}, ${userData.name}, ${userData.email}, true)
    ON CONFLICT (email) DO NOTHING
  `;

  await sql`
    INSERT INTO "account" (id, account_id, provider_id, user_id, password)
    VALUES (${accountId}, ${userData.email}, 'credential', ${userId}, ${hashedPassword})
    ON CONFLICT DO NOTHING
  `;

  await sql.end();
  console.log(`[E2E] Seeded test user: ${userData.email}`);

  return userId;
}

/**
 * Seed analysis history for a user
 */
export async function seedAnalysisHistory(
  userId: string,
  analyses: Array<{
    resumeFilename: string;
    score: number;
    createdAt?: Date;
  }>
): Promise<void> {
  const url = getE2EDatabaseUrl();
  const sql = postgres(url, { max: 1 });

  for (const analysis of analyses) {
    await sql`
      INSERT INTO "analysis" (
        user_id, resume_filename, job_description_preview, score,
        explanation, key_findings, processing_time, created_at
      )
      VALUES (
        ${userId},
        ${analysis.resumeFilename},
        ${'Sample job description for testing...'},
        ${analysis.score},
        ${'Test analysis explanation'},
        ${JSON.stringify({
          strengths: ['Test strength 1', 'Test strength 2'],
          gaps: ['Test gap 1'],
          suggestions: ['Test suggestion 1'],
        })},
        ${1500},
        ${analysis.createdAt || new Date()}
      )
    `;
  }

  await sql.end();
}

/**
 * Clean up all data in E2E database
 */
export async function cleanupE2EDatabase(): Promise<void> {
  const url = getE2EDatabaseUrl();
  const sql = postgres(url, { max: 1 });

  await sql.unsafe(`
    TRUNCATE "analysis" CASCADE;
    TRUNCATE "session" CASCADE;
    TRUNCATE "account" CASCADE;
    TRUNCATE "verification" CASCADE;
    TRUNCATE "user" CASCADE;
  `);

  await sql.end();
}

/**
 * Stop the E2E database container
 */
export async function stopE2EDatabase(): Promise<void> {
  if (container) {
    console.log('[E2E] Stopping PostgreSQL container...');
    await container.stop();
    container = null;
    connectionString = null;
    console.log('[E2E] PostgreSQL container stopped');
  }
}
