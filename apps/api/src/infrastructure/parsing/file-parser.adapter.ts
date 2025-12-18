/**
 * File Parser Adapter
 *
 * Implements FileParserPort using unpdf for PDF and mammoth for DOCX
 */

import { extractText } from 'unpdf';
import mammoth from 'mammoth';
import { FILE_CONSTRAINTS } from '@jobmatch/shared';
import { AppError } from '@/shared/errors';
import type { FileParserPort, ParsedFile } from '@/application/ports/file-parser.port';

export class FileParserAdapter implements FileParserPort {
  private readonly supportedTypes = new Set(FILE_CONSTRAINTS.ALLOWED_TYPES);

  supports(mimeType: string): boolean {
    return this.supportedTypes.has(mimeType as typeof FILE_CONSTRAINTS.ALLOWED_TYPES[number]);
  }

  async parse(file: File): Promise<ParsedFile> {
    if (!this.supports(file.type)) {
      throw AppError.invalidFileType({
        allowedTypes: [...FILE_CONSTRAINTS.ALLOWED_TYPES],
        receivedType: file.type,
      });
    }

    const buffer = await file.arrayBuffer();

    if (buffer.byteLength === 0) {
      throw AppError.emptyContent();
    }

    let text: string;

    try {
      if (file.type === 'application/pdf') {
        text = await this.parsePdf(buffer);
      } else {
        text = await this.parseDocx(buffer);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.fileParseError({
        reason: error instanceof Error ? error.message : 'Unknown parse error',
      });
    }

    // Clean up the extracted text
    text = this.cleanText(text);

    if (!text || text.trim().length === 0) {
      throw AppError.emptyContent();
    }

    return {
      text,
      filename: file.name,
      mimeType: file.type,
    };
  }

  private async parsePdf(buffer: ArrayBuffer): Promise<string> {
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);

    if (typeof result === 'string') {
      return result;
    }

    // Handle structured result from unpdf
    if (result && typeof result === 'object') {
      // Check for 'text' property
      if ('text' in result && typeof result.text === 'string') {
        return result.text;
      }
      // Check for 'pages' array
      if ('pages' in result && Array.isArray(result.pages)) {
        return result.pages.join('\n');
      }
      // Try to stringify if it's some other object
      return JSON.stringify(result);
    }

    return '';
  }

  private async parseDocx(buffer: ArrayBuffer): Promise<string> {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer),
    });
    return result.value;
  }

  private cleanText(text: unknown): string {
    // Handle non-string inputs defensively
    if (typeof text !== 'string') {
      if (text && typeof text === 'object' && 'toString' in text) {
        text = String(text);
      } else {
        return '';
      }
    }

    return (text as string)
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();
  }
}
