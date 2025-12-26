'use client';

import { motion } from 'framer-motion';
import type { AnalysisResult, GeneratePdfRequest } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/score-gauge';
import { downloadPdfReport } from '@/lib/api-client';
import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, Download, RotateCcw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export function MatchResultCard({ result, onReset }: MatchResultCardProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!result.id) {
      alert('Unable to generate PDF. Analysis ID not available.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await downloadPdfReport({ analysisId: result.id });

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
      data-testid="result-card"
    >
      {/* Score Card */}
      <motion.div variants={fadeInUp}>
        <Card variant="elevated">
          <CardContent className="py-8">
            <div className="flex flex-col items-center">
              <ScoreGauge score={result.score} size="xl" />
              <p className="mt-6 text-center text-foreground-secondary max-w-lg text-lg">
                {result.explanation}
              </p>
              <p className="mt-3 text-sm text-foreground-muted flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Analyzed in {(result.processingTime / 1000).toFixed(1)}s
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Key Findings */}
      <motion.div variants={fadeInUp} className="grid gap-4 md:grid-cols-3">
        {/* Strengths */}
        <Card className="border-l-4 border-l-success-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-success-600 dark:text-success-500 flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {result.keyFindings.strengths.length > 0 ? (
              <ul className="space-y-2.5" data-testid="strengths-list">
                {result.keyFindings.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-success-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground-muted">No specific strengths identified</p>
            )}
          </CardContent>
        </Card>

        {/* Gaps */}
        <Card className="border-l-4 border-l-danger-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-danger-600 dark:text-danger-500 flex items-center gap-2 text-base">
              <XCircle className="w-5 h-5" />
              Gaps to Address
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {result.keyFindings.gaps.length > 0 ? (
              <ul className="space-y-2.5" data-testid="gaps-list">
                {result.keyFindings.gaps.map((item, i) => (
                  <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground-muted">No gaps identified</p>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="border-l-4 border-l-accent-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-accent-600 dark:text-accent-400 flex items-center gap-2 text-base">
              <Lightbulb className="w-5 h-5" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {result.keyFindings.suggestions.length > 0 ? (
              <ul className="space-y-2.5" data-testid="suggestions-list">
                {result.keyFindings.suggestions.map((item, i) => (
                  <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground-muted">No suggestions at this time</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={fadeInUp} className="flex justify-center gap-4">
        <Button onClick={onReset} variant="secondary" size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Another
        </Button>
        <Button onClick={handleDownloadPdf} isLoading={isGeneratingPdf} size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </motion.div>
    </motion.div>
  );
}
