/**
 * Port for file parsing
 */

export interface ParsedFile {
  /** Extracted text content */
  text: string;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
}

export interface FileParserPort {
  /**
   * Parse a file and extract text content
   * @param file - File to parse
   * @returns Parsed file with extracted text
   * @throws AppError if parsing fails
   */
  parse(file: File): Promise<ParsedFile>;

  /**
   * Check if the parser supports this file type
   */
  supports(mimeType: string): boolean;
}
