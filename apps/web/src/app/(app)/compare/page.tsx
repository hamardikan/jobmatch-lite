'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { ScoreGauge } from '@/components/score-gauge';
import { getHistory, type HistoryItem } from '@/lib/api-client';
import {
  GitCompare,
  Plus,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectedAnalysis extends HistoryItem {
  slot: number;
}

export default function ComparePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnalyses, setSelectedAnalyses] = useState<SelectedAnalysis[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory(50, 0);
        setHistory(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Get available analyses (not already selected)
  const availableAnalyses = useMemo(() => {
    const selectedIds = new Set(selectedAnalyses.map((a) => a.id));
    return history.filter((a) => !selectedIds.has(a.id));
  }, [history, selectedAnalyses]);

  // Add analysis to comparison
  const addAnalysis = (item: HistoryItem, slot: number) => {
    setSelectedAnalyses((prev) => {
      // Remove existing at this slot
      const filtered = prev.filter((a) => a.slot !== slot);
      return [...filtered, { ...item, slot }].sort((a, b) => a.slot - b.slot);
    });
    setOpenDropdown(null);
  };

  // Remove analysis from comparison
  const removeAnalysis = (slot: number) => {
    setSelectedAnalyses((prev) => prev.filter((a) => a.slot !== slot));
  };

  // Get analysis for a specific slot
  const getAnalysisForSlot = (slot: number) => {
    return selectedAnalyses.find((a) => a.slot === slot);
  };

  // Find common items across all analyses
  const findCommonItems = (items: string[][]): string[] => {
    if (items.length === 0) return [];
    return items[0].filter((item) => items.every((list) => list.includes(item)));
  };

  // Find unique items for each analysis
  const findUniqueItems = (items: string[][], index: number): string[] => {
    const otherItems = items.filter((_, i) => i !== index).flat();
    return items[index].filter((item) => !otherItems.includes(item));
  };

  // Comparison insights
  const insights = useMemo(() => {
    if (selectedAnalyses.length < 2) return null;

    const scores = selectedAnalyses.map((a) => a.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const bestMatch = selectedAnalyses.reduce((a, b) => (a.score > b.score ? a : b));
    const worstMatch = selectedAnalyses.reduce((a, b) => (a.score < b.score ? a : b));

    const allStrengths = selectedAnalyses.map((a) => a.keyFindings.strengths);
    const allGaps = selectedAnalyses.map((a) => a.keyFindings.gaps);

    const commonStrengths = findCommonItems(allStrengths);
    const commonGaps = findCommonItems(allGaps);

    return {
      avgScore: Math.round(avgScore),
      bestMatch,
      worstMatch,
      scoreDiff: bestMatch.score - worstMatch.score,
      commonStrengths,
      commonGaps,
    };
  }, [selectedAnalyses]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-danger-500 mb-4" />
            <p className="text-danger-600 dark:text-danger-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (history.length < 2) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Compare Jobs
          </h1>
          <p className="text-foreground-secondary mt-1">
            Compare multiple job analyses side by side.
          </p>
        </motion.div>

        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-800/30 flex items-center justify-center">
              <GitCompare className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Need More Analyses
            </h2>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              You need at least 2 analyses to compare. Create more analyses to start comparing.
            </p>
            <LinkButton href="/analyze">
              <Plus className="w-4 h-4 mr-2" />
              Create Analysis
            </LinkButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Compare Jobs
        </h1>
        <p className="text-foreground-secondary mt-1">
          Select up to 3 analyses to compare side by side.
        </p>
      </motion.div>

      {/* Selection Slots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-4 mb-8"
      >
        {[1, 2, 3].map((slot) => {
          const selected = getAnalysisForSlot(slot);
          const isOpen = openDropdown === slot;

          return (
            <div key={slot} className="relative">
              {selected ? (
                <Card className="border-primary-500/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                            selected.score >= 75 ? 'bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-400' :
                            selected.score >= 60 ? 'bg-accent-100 text-accent-700 dark:bg-accent-700/30 dark:text-accent-400' :
                            'bg-warning-100 text-warning-700 dark:bg-warning-700/30 dark:text-warning-400'
                          )}>
                            {selected.score}
                          </div>
                          <span className="text-xs text-foreground-muted">Match Score</span>
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {selected.resumeFilename}
                        </p>
                        <p className="text-xs text-foreground-secondary mt-1 line-clamp-2">
                          {selected.jobDescriptionPreview}
                        </p>
                      </div>
                      <button
                        onClick={() => removeAnalysis(slot)}
                        className="p-1 hover:bg-background-secondary rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-foreground-muted" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  <button
                    onClick={() => setOpenDropdown(isOpen ? null : slot)}
                    disabled={availableAnalyses.length === 0}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 border-dashed transition-all',
                      'flex flex-col items-center justify-center gap-2 min-h-[120px]',
                      availableAnalyses.length === 0
                        ? 'border-border bg-background-secondary cursor-not-allowed opacity-50'
                        : 'border-border hover:border-primary-500/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 cursor-pointer'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-background-secondary flex items-center justify-center">
                      <Plus className="w-5 h-5 text-foreground-muted" />
                    </div>
                    <span className="text-sm text-foreground-muted">
                      {availableAnalyses.length === 0 ? 'No more analyses' : `Add Job #${slot}`}
                    </span>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-strong max-h-64 overflow-y-auto"
                      >
                        {availableAnalyses.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => addAnalysis(item, slot)}
                            className="w-full p-3 text-left hover:bg-background-secondary transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                                item.score >= 75 ? 'bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-400' :
                                item.score >= 60 ? 'bg-accent-100 text-accent-700 dark:bg-accent-700/30 dark:text-accent-400' :
                                'bg-warning-100 text-warning-700 dark:bg-warning-700/30 dark:text-warning-400'
                              )}>
                                {item.score}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {item.resumeFilename}
                                </p>
                                <p className="text-xs text-foreground-muted truncate">
                                  {item.jobDescriptionPreview}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Comparison Results */}
      <AnimatePresence>
        {selectedAnalyses.length >= 2 && insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-foreground-secondary mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-foreground">{insights.avgScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground-secondary mb-1">Best Match</p>
                    <p className="text-lg font-semibold text-success-600 dark:text-success-400 truncate">
                      {insights.bestMatch.resumeFilename}
                    </p>
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                      {insights.bestMatch.score}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-foreground-secondary mb-1">Score Range</p>
                    <p className="text-3xl font-bold text-foreground">
                      {insights.scoreDiff > 0 ? `${insights.scoreDiff}pts` : 'Same'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Score Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedAnalyses.map((analysis, index) => {
                    const isHighest = analysis.score === insights.bestMatch.score;
                    const isLowest = analysis.score === insights.worstMatch.score && selectedAnalyses.length > 1;

                    return (
                      <div key={analysis.id} className="flex items-center gap-4">
                        <div className="w-32 truncate text-sm font-medium text-foreground">
                          {analysis.resumeFilename}
                        </div>
                        <div className="flex-1 h-8 bg-background-secondary rounded-full overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.score}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(
                              'h-full rounded-full',
                              analysis.score >= 75 ? 'bg-success-500' :
                              analysis.score >= 60 ? 'bg-accent-500' :
                              analysis.score >= 40 ? 'bg-warning-500' :
                              'bg-danger-500'
                            )}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-foreground">
                            {analysis.score}%
                          </span>
                        </div>
                        <div className="w-20 flex items-center gap-1">
                          {isHighest && selectedAnalyses.length > 1 && (
                            <span className="text-xs text-success-600 dark:text-success-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> Best
                            </span>
                          )}
                          {isLowest && insights.scoreDiff > 0 && (
                            <span className="text-xs text-danger-600 dark:text-danger-400 flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" /> -{insights.scoreDiff}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Common Findings */}
            {(insights.commonStrengths.length > 0 || insights.commonGaps.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {insights.commonStrengths.length > 0 && (
                  <Card className="border-l-4 border-l-success-500">
                    <CardHeader>
                      <CardTitle className="text-success-600 dark:text-success-400 flex items-center gap-2 text-base">
                        <CheckCircle className="w-5 h-5" />
                        Common Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {insights.commonStrengths.map((item, i) => (
                          <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-success-500 rounded-full shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.commonGaps.length > 0 && (
                  <Card className="border-l-4 border-l-danger-500">
                    <CardHeader>
                      <CardTitle className="text-danger-600 dark:text-danger-400 flex items-center gap-2 text-base">
                        <XCircle className="w-5 h-5" />
                        Common Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {insights.commonGaps.map((item, i) => (
                          <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Detailed Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-foreground-secondary">Category</th>
                      {selectedAnalyses.map((analysis) => (
                        <th key={analysis.id} className="text-left py-3 px-4 font-medium text-foreground truncate max-w-[200px]">
                          {analysis.resumeFilename}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-foreground-secondary">Match Score</td>
                      {selectedAnalyses.map((analysis) => (
                        <td key={analysis.id} className="py-3 px-4">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                            analysis.score >= 75 ? 'bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-400' :
                            analysis.score >= 60 ? 'bg-accent-100 text-accent-700 dark:bg-accent-700/30 dark:text-accent-400' :
                            'bg-warning-100 text-warning-700 dark:bg-warning-700/30 dark:text-warning-400'
                          )}>
                            {analysis.score}%
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-foreground-secondary align-top">Strengths</td>
                      {selectedAnalyses.map((analysis) => (
                        <td key={analysis.id} className="py-3 px-4 align-top">
                          <ul className="space-y-1">
                            {analysis.keyFindings.strengths.slice(0, 3).map((s, i) => (
                              <li key={i} className="text-xs text-foreground-secondary flex items-start gap-1.5">
                                <CheckCircle className="w-3 h-3 text-success-500 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{s}</span>
                              </li>
                            ))}
                            {analysis.keyFindings.strengths.length > 3 && (
                              <li className="text-xs text-foreground-muted">
                                +{analysis.keyFindings.strengths.length - 3} more
                              </li>
                            )}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-foreground-secondary align-top">Gaps</td>
                      {selectedAnalyses.map((analysis) => (
                        <td key={analysis.id} className="py-3 px-4 align-top">
                          <ul className="space-y-1">
                            {analysis.keyFindings.gaps.slice(0, 3).map((g, i) => (
                              <li key={i} className="text-xs text-foreground-secondary flex items-start gap-1.5">
                                <XCircle className="w-3 h-3 text-danger-500 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{g}</span>
                              </li>
                            ))}
                            {analysis.keyFindings.gaps.length > 3 && (
                              <li className="text-xs text-foreground-muted">
                                +{analysis.keyFindings.gaps.length - 3} more
                              </li>
                            )}
                          </ul>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-foreground-secondary align-top">Suggestions</td>
                      {selectedAnalyses.map((analysis) => (
                        <td key={analysis.id} className="py-3 px-4 align-top">
                          <ul className="space-y-1">
                            {analysis.keyFindings.suggestions.slice(0, 2).map((s, i) => (
                              <li key={i} className="text-xs text-foreground-secondary flex items-start gap-1.5">
                                <Lightbulb className="w-3 h-3 text-accent-500 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{s}</span>
                              </li>
                            ))}
                            {analysis.keyFindings.suggestions.length > 2 && (
                              <li className="text-xs text-foreground-muted">
                                +{analysis.keyFindings.suggestions.length - 2} more
                              </li>
                            )}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when less than 2 selected */}
      {selectedAnalyses.length < 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardContent className="py-12 text-center">
              <GitCompare className="w-12 h-12 mx-auto text-foreground-muted mb-4" />
              <p className="text-foreground-secondary">
                Select at least 2 analyses above to compare them side by side.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
