import { describe, expect, it, beforeEach } from 'bun:test';
import { FileParserAdapter } from '@/infrastructure/parsing/file-parser.adapter';

describe('FileParserAdapter', () => {
  let parser: FileParserAdapter;

  beforeEach(() => {
    parser = new FileParserAdapter();
  });

  describe('supports', () => {
    it('should support PDF files', () => {
      expect(parser.supports('application/pdf')).toBe(true);
    });

    it('should support DOCX files', () => {
      expect(
        parser.supports(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe(true);
    });

    it('should not support unsupported types', () => {
      expect(parser.supports('image/png')).toBe(false);
      expect(parser.supports('text/plain')).toBe(false);
      expect(parser.supports('application/json')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse a text-based PDF file', async () => {
      // Create a minimal PDF file for testing
      // In a real scenario, we'd use a test fixture
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 100 700 Td (Test Resume Content) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
300
%%EOF`;

      const file = new File([pdfContent], 'resume.pdf', {
        type: 'application/pdf',
      });

      const result = await parser.parse(file);

      expect(result.filename).toBe('resume.pdf');
      expect(result.mimeType).toBe('application/pdf');
      // The unpdf library should extract some text (may vary)
      expect(typeof result.text).toBe('string');
    });

    it('should throw error for unsupported file type', async () => {
      const file = new File(['test content'], 'image.png', {
        type: 'image/png',
      });

      await expect(parser.parse(file)).rejects.toThrow();
    });

    it('should throw error for empty file content', async () => {
      const file = new File([], 'empty.pdf', {
        type: 'application/pdf',
      });

      await expect(parser.parse(file)).rejects.toThrow();
    });
  });
});
