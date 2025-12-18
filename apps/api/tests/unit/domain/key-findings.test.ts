import { describe, expect, it } from 'bun:test';
import { KeyFindingsVO } from '@/domain/analysis/value-objects/key-findings';

describe('KeyFindingsVO', () => {
  describe('create', () => {
    it('should create valid key findings', () => {
      const findings = KeyFindingsVO.create({
        strengths: ['React experience', 'Team leadership'],
        gaps: ['No GraphQL experience'],
        suggestions: ['Learn GraphQL'],
      });

      expect(findings.strengths).toEqual(['React experience', 'Team leadership']);
      expect(findings.gaps).toEqual(['No GraphQL experience']);
      expect(findings.suggestions).toEqual(['Learn GraphQL']);
    });

    it('should handle empty arrays', () => {
      const findings = KeyFindingsVO.create({
        strengths: [],
        gaps: [],
        suggestions: [],
      });

      expect(findings.strengths).toEqual([]);
      expect(findings.gaps).toEqual([]);
      expect(findings.suggestions).toEqual([]);
    });

    it('should trim whitespace from items', () => {
      const findings = KeyFindingsVO.create({
        strengths: ['  React experience  ', 'Team leadership '],
        gaps: [' No GraphQL '],
        suggestions: [' Learn GraphQL  '],
      });

      expect(findings.strengths).toEqual(['React experience', 'Team leadership']);
      expect(findings.gaps).toEqual(['No GraphQL']);
      expect(findings.suggestions).toEqual(['Learn GraphQL']);
    });

    it('should filter out empty strings', () => {
      const findings = KeyFindingsVO.create({
        strengths: ['React experience', '', '  ', 'Team leadership'],
        gaps: ['No GraphQL', ''],
        suggestions: [''],
      });

      expect(findings.strengths).toEqual(['React experience', 'Team leadership']);
      expect(findings.gaps).toEqual(['No GraphQL']);
      expect(findings.suggestions).toEqual([]);
    });
  });

  describe('hasFindings', () => {
    it('should return true if any array has items', () => {
      const findings = KeyFindingsVO.create({
        strengths: ['React'],
        gaps: [],
        suggestions: [],
      });
      expect(findings.hasFindings()).toBe(true);
    });

    it('should return false if all arrays are empty', () => {
      const findings = KeyFindingsVO.create({
        strengths: [],
        gaps: [],
        suggestions: [],
      });
      expect(findings.hasFindings()).toBe(false);
    });
  });

  describe('toPlainObject', () => {
    it('should return a plain object representation', () => {
      const findings = KeyFindingsVO.create({
        strengths: ['React'],
        gaps: ['GraphQL'],
        suggestions: ['Learn GraphQL'],
      });

      expect(findings.toPlainObject()).toEqual({
        strengths: ['React'],
        gaps: ['GraphQL'],
        suggestions: ['Learn GraphQL'],
      });
    });
  });

  describe('immutability', () => {
    it('should not allow modification of internal arrays', () => {
      const findings = KeyFindingsVO.create({
        strengths: ['React'],
        gaps: ['GraphQL'],
        suggestions: ['Learn GraphQL'],
      });

      // Attempt to modify (should not affect internal state)
      const strengths = findings.strengths;
      strengths.push('New Item');

      expect(findings.strengths).toEqual(['React']);
    });
  });
});
