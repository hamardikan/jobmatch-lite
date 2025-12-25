/**
 * KeyFindingsVO Value Object
 *
 * Represents the key findings from a resume analysis.
 * Immutable container for strengths, gaps, and suggestions.
 */

import type { KeyFindings } from '../../../types';

export interface KeyFindingsInput {
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

export class KeyFindingsVO {
  private readonly _strengths: readonly string[];
  private readonly _gaps: readonly string[];
  private readonly _suggestions: readonly string[];

  private constructor(strengths: string[], gaps: string[], suggestions: string[]) {
    this._strengths = Object.freeze([...strengths]);
    this._gaps = Object.freeze([...gaps]);
    this._suggestions = Object.freeze([...suggestions]);
  }

  /**
   * Factory method to create KeyFindingsVO
   * Trims whitespace and filters empty strings
   */
  static create(input: KeyFindingsInput): KeyFindingsVO {
    const normalize = (arr: string[]): string[] =>
      arr.map((s) => s.trim()).filter((s) => s.length > 0);

    return new KeyFindingsVO(
      normalize(input.strengths),
      normalize(input.gaps),
      normalize(input.suggestions)
    );
  }

  /** Get strengths (returns a copy to maintain immutability) */
  get strengths(): string[] {
    return [...this._strengths];
  }

  /** Get gaps (returns a copy to maintain immutability) */
  get gaps(): string[] {
    return [...this._gaps];
  }

  /** Get suggestions (returns a copy to maintain immutability) */
  get suggestions(): string[] {
    return [...this._suggestions];
  }

  /** Check if there are any findings */
  hasFindings(): boolean {
    return (
      this._strengths.length > 0 ||
      this._gaps.length > 0 ||
      this._suggestions.length > 0
    );
  }

  /** Convert to plain object (compatible with shared KeyFindings type) */
  toPlainObject(): KeyFindings {
    return {
      strengths: this.strengths,
      gaps: this.gaps,
      suggestions: this.suggestions,
    };
  }
}
