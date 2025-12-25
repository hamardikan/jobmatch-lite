'use client';

import type { AnalysisResult, GeneratePdfRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/score-gauge';
import { downloadPdfReport } from '@/lib/api-client';
import { useState } from 'react';

interface MatchResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function MatchResultCard({ result, onReset }: MatchResultCardProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const request: GeneratePdfRequest = {
        score: result.score,
        explanation: result.explanation,
        keyFindings: result.keyFindings,
        analyzedAt: new Date().toISOString(),
      };

      // Get PDF blob from server
      const pdfBlob = await downloadPdfReport(request);

      // Create download link and trigger download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `JobMatch-Report-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="result-card">
      {/* Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <ScoreGauge score={result.score} size="lg" data-testid="score-display" />
            <p className="mt-4 text-center text-slate-600 max-w-md">
              {result.explanation}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Analyzed in {(result.processingTime / 1000).toFixed(1)}s
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-green-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.keyFindings.strengths.length > 0 ? (
              <ul className="space-y-2" data-testid="strengths-list">
                {result.keyFindings.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No specific strengths identified</p>
            )}
          </CardContent>
        </Card>

        {/* Gaps */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.keyFindings.gaps.length > 0 ? (
              <ul className="space-y-2" data-testid="gaps-list">
                {result.keyFindings.gaps.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No gaps identified</p>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.keyFindings.suggestions.length > 0 ? (
              <ul className="space-y-2" data-testid="suggestions-list">
                {result.keyFindings.suggestions.map((item, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No suggestions at this time</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button onClick={onReset} variant="secondary">
          Try Another
        </Button>
        <Button onClick={handleDownloadPdf} isLoading={isGeneratingPdf}>
          Download Report
        </Button>
      </div>
    </div>
  );
}
