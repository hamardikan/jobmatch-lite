/**
 * Puppeteer PDF Generator Adapter
 *
 * Generates PDF files from HTML using Puppeteer with @sparticuz/chromium
 * for serverless compatibility (Vercel, AWS Lambda, etc.)
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Configure chromium for serverless environments
chromium.setHeadlessMode = 'shell';
chromium.setGraphicsMode = false;

/**
 * Generate a PDF from HTML content
 *
 * @param html - The HTML string to render as PDF
 * @returns Promise<Buffer> - The PDF file as a Buffer
 */
export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const isLocal = process.env.NODE_ENV !== 'production';

  // Launch browser with appropriate settings for environment
  const browser = await puppeteer.launch({
    args: isLocal
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : chromium.args,
    executablePath: isLocal
      ? await getLocalChromePath()
      : await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF with A4 format
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Get local Chrome/Chromium executable path for development
 */
async function getLocalChromePath(): Promise<string> {
  // Common paths for Chrome on different platforms
  const paths = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  // Try to find an existing browser
  for (const path of paths) {
    try {
      const file = Bun.file(path);
      if (await file.exists()) {
        return path;
      }
    } catch {
      continue;
    }
  }

  throw new Error(
    'Could not find Chrome/Chromium. Please install Chrome or set CHROME_PATH environment variable.'
  );
}

export default { generatePdfFromHtml };
