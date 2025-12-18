import { describe, expect, it } from 'bun:test';
import { MatchScore } from '@/domain/analysis/value-objects/match-score';

describe('MatchScore', () => {
  describe('create', () => {
    it('should create a valid score between 0 and 100', () => {
      const score = MatchScore.create(85);
      expect(score.value).toBe(85);
    });

    it('should accept score of 0', () => {
      const score = MatchScore.create(0);
      expect(score.value).toBe(0);
    });

    it('should accept score of 100', () => {
      const score = MatchScore.create(100);
      expect(score.value).toBe(100);
    });

    it('should throw error for score below 0', () => {
      expect(() => MatchScore.create(-1)).toThrow('Score must be between 0 and 100');
    });

    it('should throw error for score above 100', () => {
      expect(() => MatchScore.create(101)).toThrow('Score must be between 0 and 100');
    });

    it('should round decimal scores to integers', () => {
      const score = MatchScore.create(85.7);
      expect(score.value).toBe(86);
    });
  });

  describe('getCategory', () => {
    it('should return "poor" for scores 0-39', () => {
      expect(MatchScore.create(0).getCategory()).toBe('poor');
      expect(MatchScore.create(39).getCategory()).toBe('poor');
    });

    it('should return "fair" for scores 40-59', () => {
      expect(MatchScore.create(40).getCategory()).toBe('fair');
      expect(MatchScore.create(59).getCategory()).toBe('fair');
    });

    it('should return "good" for scores 60-79', () => {
      expect(MatchScore.create(60).getCategory()).toBe('good');
      expect(MatchScore.create(79).getCategory()).toBe('good');
    });

    it('should return "excellent" for scores 80-100', () => {
      expect(MatchScore.create(80).getCategory()).toBe('excellent');
      expect(MatchScore.create(100).getCategory()).toBe('excellent');
    });
  });

  describe('equals', () => {
    it('should return true for equal scores', () => {
      const score1 = MatchScore.create(75);
      const score2 = MatchScore.create(75);
      expect(score1.equals(score2)).toBe(true);
    });

    it('should return false for different scores', () => {
      const score1 = MatchScore.create(75);
      const score2 = MatchScore.create(80);
      expect(score1.equals(score2)).toBe(false);
    });
  });
});
