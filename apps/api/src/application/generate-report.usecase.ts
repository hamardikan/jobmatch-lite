/**
 * Generate Report Use Case
 *
 * Generates an HTML report from analysis results that can be converted to PDF.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { GeneratePdfRequest } from '@jobmatch/shared';

export class GenerateReportUseCase {
  private template: string;

  constructor() {
    // Load template at construction time
    const templatePath = join(import.meta.dir, '../templates/report.html');
    this.template = readFileSync(templatePath, 'utf-8');
  }

  execute(input: GeneratePdfRequest): string {
    const scoreCategory = this.getScoreCategory(input.score);
    const scoreClass = this.getScoreClass(input.score);

    let html = this.template
      .replace('{{candidateName}}', input.candidateName || 'Not specified')
      .replace('{{jobTitle}}', input.jobTitle || 'Not specified')
      .replace('{{companyName}}', input.companyName || 'Not specified')
      .replace(/{{analyzedAt}}/g, this.formatDate(input.analyzedAt))
      .replace('{{score}}', String(input.score))
      .replace('{{scoreClass}}', scoreClass)
      .replace('{{scoreCategory}}', scoreCategory)
      .replace('{{explanation}}', this.escapeHtml(input.explanation));

    // Handle strengths
    html = this.replaceList(html, 'strengths', input.keyFindings.strengths);
    html = this.replaceList(html, 'gaps', input.keyFindings.gaps);
    html = this.replaceList(html, 'suggestions', input.keyFindings.suggestions);

    return html;
  }

  private getScoreCategory(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-fair';
    return 'score-poor';
  }

  private formatDate(dateStr?: string): string {
    const date = dateStr ? new Date(dateStr) : new Date();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private replaceList(html: string, name: string, items: string[]): string {
    const regex = new RegExp(`{{#${name}}}([\\s\\S]*?){{/${name}}}`, 'g');
    const match = html.match(regex);

    if (!match) return html;

    const template = match[0]
      .replace(`{{#${name}}}`, '')
      .replace(`{{/${name}}}`, '');

    const rendered = items.length > 0
      ? items.map(item => template.replace('{{.}}', this.escapeHtml(item))).join('')
      : `<li class="finding-item" style="color: #9ca3af;">No ${name} identified</li>`;

    return html.replace(regex, rendered);
  }
}
