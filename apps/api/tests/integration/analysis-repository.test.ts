/**
 * Analysis Repository Integration Tests
 *
 * Tests the analysis repository against a real PostgreSQL database.
 */

import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'bun:test';
import {
  startTestDatabase,
  migrateTestDatabase,
  cleanupTestDatabase,
  stopTestDatabase,
  createTestUser,
  getTestDb,
} from './db-setup';
import { AnalysisRepository } from '../../src/infrastructure/repositories/analysis.repository';
import type { NewAnalysis } from '../../src/infrastructure/db/schema';

describe('AnalysisRepository Integration', () => {
  let repository: AnalysisRepository;
  let testUserId: string;

  beforeAll(async () => {
    await startTestDatabase();
    await migrateTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();

    // Create a test user
    const db = await getTestDb();
    const user = await createTestUser(db);
    testUserId = user.id;

    // Create fresh repository instance
    repository = new AnalysisRepository();
  });

  const createTestAnalysis = (overrides?: Partial<NewAnalysis>): NewAnalysis => ({
    userId: testUserId,
    resumeFilename: 'resume.pdf',
    jobDescriptionPreview: 'Looking for a software engineer...',
    score: 85,
    explanation: 'Good match overall',
    keyFindings: {
      strengths: ['Strong technical skills'],
      gaps: ['Missing leadership experience'],
      suggestions: ['Add more project examples'],
    },
    processingTime: 1500,
    ...overrides,
  });

  describe('save', () => {
    it('should save a new analysis', async () => {
      const analysisData = createTestAnalysis();

      const result = await repository.save(analysisData);

      expect(result.id).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.score).toBe(85);
      expect(result.resumeFilename).toBe('resume.pdf');
    });

    it('should assign a UUID to new analysis', async () => {
      const analysisData = createTestAnalysis();

      const result = await repository.save(analysisData);

      // Check UUID format
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('findByUserId', () => {
    it('should return analyses for a user', async () => {
      // Create multiple analyses
      await repository.save(createTestAnalysis({ score: 90 }));
      await repository.save(createTestAnalysis({ score: 75 }));
      await repository.save(createTestAnalysis({ score: 60 }));

      const results = await repository.findByUserId(testUserId);

      expect(results).toHaveLength(3);
    });

    it('should return analyses ordered by most recent first', async () => {
      await repository.save(createTestAnalysis({ score: 90 }));
      await new Promise((r) => setTimeout(r, 10)); // Small delay
      await repository.save(createTestAnalysis({ score: 75 }));

      const results = await repository.findByUserId(testUserId);

      expect(results[0].score).toBe(75); // Most recent
      expect(results[1].score).toBe(90);
    });

    it('should support pagination with limit and offset', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.save(createTestAnalysis({ score: i * 10 }));
      }

      const page1 = await repository.findByUserId(testUserId, { limit: 2, offset: 0 });
      const page2 = await repository.findByUserId(testUserId, { limit: 2, offset: 2 });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
    });

    it('should return empty array for user with no analyses', async () => {
      const results = await repository.findByUserId('non-existent-user');

      expect(results).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should find analysis by ID', async () => {
      const saved = await repository.save(createTestAnalysis());

      const found = await repository.findById(saved.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(saved.id);
      expect(found?.score).toBe(saved.score);
    });

    it('should return undefined for non-existent ID', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeUndefined();
    });
  });

  describe('findByIdAndUserId', () => {
    it('should find analysis for correct user', async () => {
      const saved = await repository.save(createTestAnalysis());

      const found = await repository.findByIdAndUserId(saved.id, testUserId);

      expect(found).toBeDefined();
      expect(found?.id).toBe(saved.id);
    });

    it('should return undefined for wrong user', async () => {
      const saved = await repository.save(createTestAnalysis());

      const found = await repository.findByIdAndUserId(saved.id, 'wrong-user-id');

      expect(found).toBeUndefined();
    });
  });

  describe('deleteByIdAndUserId', () => {
    it('should delete analysis for correct user', async () => {
      const saved = await repository.save(createTestAnalysis());

      const deleted = await repository.deleteByIdAndUserId(saved.id, testUserId);

      expect(deleted).toBe(true);

      const found = await repository.findById(saved.id);
      expect(found).toBeUndefined();
    });

    it('should return false for wrong user', async () => {
      const saved = await repository.save(createTestAnalysis());

      const deleted = await repository.deleteByIdAndUserId(saved.id, 'wrong-user-id');

      expect(deleted).toBe(false);

      // Analysis should still exist
      const found = await repository.findById(saved.id);
      expect(found).toBeDefined();
    });
  });

  describe('countByUserId', () => {
    it('should count analyses for a user', async () => {
      await repository.save(createTestAnalysis());
      await repository.save(createTestAnalysis());
      await repository.save(createTestAnalysis());

      const count = await repository.countByUserId(testUserId);

      expect(count).toBe(3);
    });

    it('should return 0 for user with no analyses', async () => {
      const count = await repository.countByUserId('non-existent-user');

      expect(count).toBe(0);
    });
  });
});
