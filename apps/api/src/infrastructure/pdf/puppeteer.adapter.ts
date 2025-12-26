/**
 * Puppeteer PDF Generator Adapter
 *
 * Generates PDF reports from analysis results using Puppeteer.
 * Uses @sparticuz/chromium for Vercel serverless compatibility.
 */

import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import type { AnalysisResult } from '../../types';

export interface PdfGeneratorPort {
  generateReport(analysis: AnalysisResult): Promise<Buffer>;
}

export class PuppeteerPdfAdapter implements PdfGeneratorPort {
  private async getBrowser(): Promise<Browser> {
    // In development, use local Chrome
    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) {
      // Try common Chrome paths for development
      const possiblePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      ];

      for (const executablePath of possiblePaths) {
        try {
          return await puppeteer.launch({
            executablePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });
        } catch {
          continue;
        }
      }
      throw new Error('Chrome not found for development. Install Chrome or set CHROME_PATH.');
    }

    // In production (Vercel), use @sparticuz/chromium
    return await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 720 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  async generateReport(analysis: AnalysisResult): Promise<Buffer> {
    const html = this.generateHtml(analysis);
    const browser = await this.getBrowser();

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '15mm',
          right: '15mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private getScoreColor(score: number): string {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  private getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Good Match';
    if (score >= 60) return 'Moderate Match';
    if (score >= 40) return 'Weak Match';
    return 'Poor Match';
  }

  private generateHtml(analysis: AnalysisResult): string {
    const { score, explanation, keyFindings } = analysis;
    const scoreColor = this.getScoreColor(score);
    const scoreLabel = this.getScoreLabel(score);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume Analysis Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #fff;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }

    .logo {
      font-size: 24px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 14px;
    }

    .score-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 8px solid ${scoreColor};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      margin-bottom: 16px;
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
      color: ${scoreColor};
    }

    .score-label {
      font-size: 14px;
      color: ${scoreColor};
      font-weight: 600;
    }

    .score-title {
      font-size: 20px;
      color: #374151;
      margin-top: 8px;
    }

    .explanation {
      background: #f9fafb;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }

    .explanation h2 {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 12px;
    }

    .explanation p {
      color: #4b5563;
      font-size: 14px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h2 {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section h2::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 20px;
      border-radius: 2px;
    }

    .strengths h2::before {
      background: #10b981;
    }

    .gaps h2::before {
      background: #ef4444;
    }

    .suggestions h2::before {
      background: #3b82f6;
    }

    .list {
      list-style: none;
    }

    .list li {
      padding: 12px 16px;
      background: #f9fafb;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      color: #374151;
      position: relative;
      padding-left: 32px;
    }

    .list li::before {
      content: '';
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .strengths .list li::before {
      background: #10b981;
    }

    .gaps .list li::before {
      background: #ef4444;
    }

    .suggestions .list li::before {
      background: #3b82f6;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }

    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">JobMatch Lite</div>
      <div class="subtitle">Resume Analysis Report</div>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <span class="score-value">${score}</span>
        <span class="score-label">/100</span>
      </div>
      <div class="score-title">${scoreLabel}</div>
    </div>

    <div class="explanation">
      <h2>Summary</h2>
      <p>${explanation}</p>
    </div>

    <div class="section strengths">
      <h2>Key Strengths</h2>
      <ul class="list">
        ${keyFindings.strengths.map((s: string) => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div class="section gaps">
      <h2>Areas for Improvement</h2>
      <ul class="list">
        ${keyFindings.gaps.map((g: string) => `<li>${g}</li>`).join('')}
      </ul>
    </div>

    <div class="section suggestions">
      <h2>Suggestions</h2>
      <ul class="list">
        ${keyFindings.suggestions.map((s: string) => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      <p>Generated by <a href="https://jobmatch-web-mauve.vercel.app">JobMatch Lite</a> on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export const pdfGenerator = new PuppeteerPdfAdapter();
