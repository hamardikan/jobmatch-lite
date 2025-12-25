/**
 * Repository Ports
 *
 * Interfaces for data persistence operations.
 */

import type { Analysis, NewAnalysis } from '../../infrastructure/db/schema';

/**
 * Analysis repository port for persisting analysis history
 */
export interface AnalysisRepositoryPort {
  /**
   * Save a new analysis result
   */
  save(data: NewAnalysis): Promise<Analysis>;

  /**
   * Find all analyses for a user
   */
  findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Analysis[]>;

  /**
   * Find a single analysis by ID
   */
  findById(id: string): Promise<Analysis | undefined>;

  /**
   * Find a single analysis by ID for a specific user
   */
  findByIdAndUserId(id: string, userId: string): Promise<Analysis | undefined>;

  /**
   * Delete an analysis by ID (with ownership check)
   */
  deleteByIdAndUserId(id: string, userId: string): Promise<boolean>;

  /**
   * Count total analyses for a user
   */
  countByUserId(userId: string): Promise<number>;
}
