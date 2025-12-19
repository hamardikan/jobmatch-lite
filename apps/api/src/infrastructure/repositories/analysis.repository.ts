/**
 * Analysis Repository
 *
 * Database operations for analysis history.
 */

import { eq, desc } from 'drizzle-orm';
import { db } from '@/infrastructure/db';
import { analysis, type Analysis, type NewAnalysis } from '@/infrastructure/db/schema';

export class AnalysisRepository {
  /**
   * Save a new analysis result
   */
  async save(data: NewAnalysis): Promise<Analysis> {
    const [result] = await db.insert(analysis).values(data).returning();
    return result;
  }

  /**
   * Find all analyses for a user, ordered by most recent first
   */
  async findByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Analysis[]> {
    const { limit = 20, offset = 0 } = options;

    return db
      .select()
      .from(analysis)
      .where(eq(analysis.userId, userId))
      .orderBy(desc(analysis.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find a single analysis by ID
   */
  async findById(id: string): Promise<Analysis | undefined> {
    const [result] = await db
      .select()
      .from(analysis)
      .where(eq(analysis.id, id))
      .limit(1);

    return result;
  }

  /**
   * Find a single analysis by ID for a specific user
   */
  async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<Analysis | undefined> {
    const [result] = await db
      .select()
      .from(analysis)
      .where(eq(analysis.id, id))
      .limit(1);

    // Verify ownership
    if (result && result.userId !== userId) {
      return undefined;
    }

    return result;
  }

  /**
   * Delete an analysis by ID (with ownership check)
   */
  async deleteByIdAndUserId(id: string, userId: string): Promise<boolean> {
    // First verify ownership
    const existing = await this.findByIdAndUserId(id, userId);
    if (!existing) {
      return false;
    }

    await db.delete(analysis).where(eq(analysis.id, id));
    return true;
  }

  /**
   * Count total analyses for a user
   */
  async countByUserId(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(analysis)
      .where(eq(analysis.userId, userId));

    return result.length;
  }
}

// Export singleton instance
export const analysisRepository = new AnalysisRepository();
