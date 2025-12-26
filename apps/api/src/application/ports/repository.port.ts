/**
 * Repository Ports
 *
 * Interfaces for data persistence operations.
 */

import type { Analysis, NewAnalysis } from '../../infrastructure/db/schema';

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'offer';

export interface SearchOptions {
  q?: string;
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
}

export interface UpdateStatusData {
  applicationStatus: ApplicationStatus;
  dateApplied?: Date | null;
  followUpDate?: Date | null;
}

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
   * Search analyses for a user with filters
   */
  searchByUserId(userId: string, options?: SearchOptions): Promise<Analysis[]>;

  /**
   * Find a single analysis by ID
   */
  findById(id: string): Promise<Analysis | undefined>;

  /**
   * Find a single analysis by ID for a specific user
   */
  findByIdAndUserId(id: string, userId: string): Promise<Analysis | undefined>;

  /**
   * Update an analysis by ID for a specific user
   */
  updateByIdAndUserId(
    id: string,
    userId: string,
    data: UpdateStatusData
  ): Promise<Analysis | undefined>;

  /**
   * Delete an analysis by ID (with ownership check)
   */
  deleteByIdAndUserId(id: string, userId: string): Promise<boolean>;

  /**
   * Count total analyses for a user
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Count analyses for a user with optional filters
   */
  countByUserIdWithFilters(userId: string, options?: SearchOptions): Promise<number>;
}
