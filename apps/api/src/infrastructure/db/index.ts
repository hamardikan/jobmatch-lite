/**
 * Database Client
 *
 * Environment-aware database connection:
 * - Production: Neon serverless (HTTP)
 * - Development: Local PostgreSQL (postgres.js)
 */

import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { neon } from '@neondatabase/serverless';
import postgres from 'postgres';
import * as schema from './schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create database client based on environment
 */
function createDbClient() {
  if (isProduction) {
    // Neon serverless (HTTP-based, best for Vercel Edge/Serverless)
    const sql = neon(DATABASE_URL!);
    return drizzleNeon(sql, { schema });
  } else {
    // Local PostgreSQL (connection pooling with postgres.js)
    const client = postgres(DATABASE_URL!, { max: 10 });
    return drizzlePostgres(client, { schema });
  }
}

export const db = createDbClient();

// Re-export schema for convenience
export * from './schema';
