/**
 * MatchScore Value Object
 *
 * Represents a validated match score between 0-100.
 * Immutable and self-validating domain concept.
 */

export type ScoreCategory = 'poor' | 'fair' | 'good' | 'excellent';

export class MatchScore {
  private constructor(private readonly _value: number) {}

  /**
   * Factory method to create a validated MatchScore
   * @param value - Raw score value (will be rounded to integer)
   * @throws Error if score is outside 0-100 range
   */
  static create(value: number): MatchScore {
    const rounded = Math.round(value);

    if (rounded < 0 || rounded > 100) {
      throw new Error('Score must be between 0 and 100');
    }

    return new MatchScore(rounded);
  }

  /** Get the score value */
  get value(): number {
    return this._value;
  }

  /**
   * Get the category for this score
   * - poor: 0-39
   * - fair: 40-59
   * - good: 60-79
   * - excellent: 80-100
   */
  getCategory(): ScoreCategory {
    if (this._value < 40) return 'poor';
    if (this._value < 60) return 'fair';
    if (this._value < 80) return 'good';
    return 'excellent';
  }

  /** Check equality with another MatchScore */
  equals(other: MatchScore): boolean {
    return this._value === other._value;
  }

  /** String representation */
  toString(): string {
    return `${this._value}`;
  }
}
