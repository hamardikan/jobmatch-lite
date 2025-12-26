'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { Input } from '@/components/ui/input';
import { ScoreBadge } from '@/components/ui/badge';
import { ScoreGauge } from '@/components/score-gauge';
import {
  Search,
  Trash2,
  FileText,
  Clock,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisItem {
  id: string;
  resumeFilename: string;
  jobDescriptionPreview: string;
  score: number;
  explanation: string;
  keyFindings: {
    strengths: string[];
    gaps: string[];
    suggestions: string[];
  };
  processingTime: number;
  createdAt: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    try {
      const response = await fetch(`${apiUrl}/api/history`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      const items = data.data?.items || data.data || [];
      setAnalyses(items);
      setFilteredAnalyses(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredAnalyses(
        analyses.filter(
          (a) =>
            a.jobDescriptionPreview.toLowerCase().includes(query) ||
            a.resumeFilename.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredAnalyses(analyses);
    }
  }, [searchQuery, analyses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    setDeletingId(id);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    try {
      const response = await fetch(`${apiUrl}/api/history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }

      setAnalyses(analyses.filter((a) => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 dark:border-primary-800 rounded-full animate-spin border-t-primary-600 dark:border-t-primary-400" />
          <p className="text-foreground-secondary">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Analysis History
          </h1>
          <p className="text-foreground-secondary mt-1">
            {analyses.length} {analyses.length === 1 ? 'analysis' : 'analyses'} saved
          </p>
        </div>
        <LinkButton href="/analyze" size="md">
          <Plus className="w-5 h-5 mr-2" />
          New Analysis
        </LinkButton>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Input
          placeholder="Search by job description or filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="max-w-md"
        />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-danger-50 dark:bg-danger-700/10 border border-danger-500/50 text-danger-600 dark:text-danger-500 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {filteredAnalyses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card>
            <CardContent className="py-16 text-center" data-testid="empty-state">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-background-secondary flex items-center justify-center">
                <FileText className="w-10 h-10 text-foreground-muted" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? 'No results found' : 'No analyses yet'}
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Start by uploading your resume and a job description to see how well they match.'}
              </p>
              {!searchQuery && (
                <LinkButton href="/analyze">
                  <Plus className="w-4 h-4 mr-2" />
                  Start Your First Analysis
                </LinkButton>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Analysis List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredAnalyses.map((analysis) => (
                <motion.div
                  key={analysis.id}
                  layout
                  variants={fadeInUp}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    variant={selectedAnalysis?.id === analysis.id ? 'elevated' : 'interactive'}
                    className={cn(
                      'cursor-pointer',
                      selectedAnalysis?.id === analysis.id &&
                        'ring-2 ring-accent-500 border-accent-500'
                    )}
                    onClick={() => setSelectedAnalysis(analysis)}
                    data-testid="analysis-item"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ScoreBadge score={analysis.score} size="sm" />
                          </div>
                          <h3 className="font-medium text-foreground truncate">
                            {analysis.resumeFilename}
                          </h3>
                          <p className="text-sm text-foreground-secondary line-clamp-2 mt-1">
                            {analysis.jobDescriptionPreview}...
                          </p>
                          <p className="text-xs text-foreground-muted mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(analysis.id);
                          }}
                          disabled={deletingId === analysis.id}
                          className="p-2 text-foreground-muted hover:text-danger-600 dark:hover:text-danger-500 disabled:opacity-50 transition-colors"
                          data-testid="delete-button"
                        >
                          {deletingId === analysis.id ? (
                            <div className="w-4 h-4 border-2 border-current rounded-full animate-spin border-t-transparent" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Analysis Detail */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              {selectedAnalysis ? (
                <motion.div
                  key={selectedAnalysis.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  data-testid="detail-panel"
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Analysis Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Score */}
                      <div className="flex justify-center">
                        <ScoreGauge score={selectedAnalysis.score} size="lg" />
                      </div>

                      {/* Summary */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Summary</h4>
                        <p className="text-foreground-secondary text-sm">
                          {selectedAnalysis.explanation}
                        </p>
                      </div>

                      {/* Key Findings */}
                      <div className="space-y-4">
                        {/* Strengths */}
                        <div>
                          <h4 className="font-medium text-success-600 dark:text-success-500 mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Strengths
                          </h4>
                          <ul className="space-y-1.5">
                            {selectedAnalysis.keyFindings.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-success-500 rounded-full shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Gaps */}
                        <div>
                          <h4 className="font-medium text-danger-600 dark:text-danger-500 mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Gaps
                          </h4>
                          <ul className="space-y-1.5">
                            {selectedAnalysis.keyFindings.gaps.map((g, i) => (
                              <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full shrink-0" />
                                {g}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Suggestions */}
                        <div>
                          <h4 className="font-medium text-accent-600 dark:text-accent-400 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Suggestions
                          </h4>
                          <ul className="space-y-1.5">
                            {selectedAnalysis.keyFindings.suggestions.map((s, i) => (
                              <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Card>
                    <CardContent className="py-16 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-secondary flex items-center justify-center">
                        <Eye className="w-8 h-8 text-foreground-muted" />
                      </div>
                      <p className="text-foreground-secondary">
                        Select an analysis to view details
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
