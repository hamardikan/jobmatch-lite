/**
 * Analysis Repository
 *
 * Database operations for analysis history.
 */

import { eq, desc, and, or, ilike, sql } from 'drizzle-orm';
import { db } from '../db';
import { analysis, type Analysis, type NewAnalysis } from '../db/schema';
import type { SearchOptions, UpdateStatusData } from '../../application/ports/repository.port';

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

  /**
   * Search analyses for a user with filters
   */
  async searchByUserId(
    userId: string,
    options: SearchOptions = {}
  ): Promise<Analysis[]> {
    const { q, status, limit = 20, offset = 0 } = options;

    const conditions = [eq(analysis.userId, userId)];

    // Add status filter
    if (status) {
      conditions.push(eq(analysis.applicationStatus, status));
    }

    // Add search filter (search across multiple fields)
    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(analysis.jobTitle, searchTerm),
          ilike(analysis.companyName, searchTerm),
          ilike(analysis.resumeFilename, searchTerm),
          ilike(analysis.fullJobDescription, searchTerm)
        )!
      );
    }

    return db
      .select()
      .from(analysis)
      .where(and(...conditions))
      .orderBy(desc(analysis.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Update an analysis by ID for a specific user
   */
  async updateByIdAndUserId(
    id: string,
    userId: string,
    data: UpdateStatusData
  ): Promise<Analysis | undefined> {
    // Verify ownership first
    const existing = await this.findByIdAndUserId(id, userId);
    if (!existing) {
      return undefined;
    }

    const [result] = await db
      .update(analysis)
      .set({
        applicationStatus: data.applicationStatus,
        dateApplied: data.dateApplied,
        followUpDate: data.followUpDate,
        updatedAt: new Date(),
      })
      .where(eq(analysis.id, id))
      .returning();

    return result;
  }

  /**
   * Count analyses for a user with optional filters
   */
  async countByUserIdWithFilters(
    userId: string,
    options: SearchOptions = {}
  ): Promise<number> {
    const { q, status } = options;

    const conditions = [eq(analysis.userId, userId)];

    if (status) {
      conditions.push(eq(analysis.applicationStatus, status));
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(analysis.jobTitle, searchTerm),
          ilike(analysis.companyName, searchTerm),
          ilike(analysis.resumeFilename, searchTerm),
          ilike(analysis.fullJobDescription, searchTerm)
        )!
      );
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(analysis)
      .where(and(...conditions));

    return Number(result[0]?.count || 0);
  }
}

// Export singleton instance
export const analysisRepository = new AnalysisRepository();
