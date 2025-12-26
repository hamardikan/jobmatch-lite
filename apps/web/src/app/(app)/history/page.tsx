'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';
import { Input } from '@/components/ui/input';
import { ScoreBadge, StatusBadge } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/components/ui/badge';
import { StatusSelector } from '@/components/status-selector';
import { ScoreGauge } from '@/components/score-gauge';
import { EditableField } from '@/components/editable-field';
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
  Building2,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getHistory,
  updateApplication,
  type HistoryItem,
  type ApplicationStatus as ApiApplicationStatus,
} from '@/lib/api-client';

const statusTabs: { value: ApiApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'offer', label: 'Offer' },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<HistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApiApplicationStatus | 'all'>('all');
  const [total, setTotal] = useState(0);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getHistory({
        q: debouncedQuery || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setAnalyses(result.items);
      setTotal(result.total);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === 'Authentication required') {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, statusFilter, router]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateApplication(id, { status: newStatus as ApiApplicationStatus });
      setAnalyses((prev) =>
        prev.map((a) => (a.id === id ? updated : a))
      );
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFieldUpdate = async (
    id: string,
    field: 'jobTitle' | 'companyName' | 'location',
    value: string | null
  ) => {
    const updated = await updateApplication(id, { [field]: value });
    setAnalyses((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    );
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis(updated);
    }
  };

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

      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && analyses.length === 0) {
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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Job Applications
          </h1>
          <p className="text-foreground-secondary mt-1">
            {total} {total === 1 ? 'application' : 'applications'} tracked
          </p>
        </div>
        <LinkButton href="/analyze" size="md">
          <Plus className="w-5 h-5 mr-2" />
          New Analysis
        </LinkButton>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-6"
      >
        {/* Search */}
        <Input
          placeholder="Search by job title, company, or resume..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="max-w-md"
        />

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                statusFilter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-background-secondary text-foreground-secondary hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      {analyses.length === 0 ? (
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
                {searchQuery || statusFilter !== 'all' ? 'No results found' : 'No applications yet'}
              </h3>
              <p className="text-foreground-secondary mb-6 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start by uploading your resume and a job description to track your applications.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
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
              {analyses.map((analysis) => (
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
                          {/* Job Title and Company */}
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={analysis.applicationStatus as ApplicationStatus} />
                            <ScoreBadge score={analysis.score} size="sm" showLabel={false} />
                          </div>
                          <h3 className="font-semibold text-foreground truncate">
                            {analysis.jobTitle || 'Untitled Position'}
                          </h3>
                          {analysis.companyName && (
                            <p className="text-sm text-foreground-secondary flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3.5 h-3.5" />
                              {analysis.companyName}
                              {analysis.location && (
                                <>
                                  <span className="text-foreground-muted mx-1">·</span>
                                  <MapPin className="w-3.5 h-3.5" />
                                  {analysis.location}
                                </>
                              )}
                            </p>
                          )}
                          {!analysis.companyName && (
                            <p className="text-sm text-foreground-secondary truncate mt-0.5">
                              {analysis.jobDescriptionPreview}...
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-foreground-muted mt-2">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {analysis.resumeFilename}
                            </span>
                            {analysis.dateApplied && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Applied {formatDate(analysis.dateApplied)}
                              </span>
                            )}
                            {!analysis.dateApplied && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(analysis.createdAt)}
                              </span>
                            )}
                          </div>
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Editable Job Title */}
                          <EditableField
                            value={selectedAnalysis.jobTitle}
                            placeholder="Add job title..."
                            onSave={(value) => handleFieldUpdate(selectedAnalysis.id, 'jobTitle', value)}
                            icon={<Briefcase className="w-5 h-5" />}
                            className="font-semibold text-lg text-foreground"
                          />
                          {/* Editable Company */}
                          <EditableField
                            value={selectedAnalysis.companyName}
                            placeholder="Add company..."
                            onSave={(value) => handleFieldUpdate(selectedAnalysis.id, 'companyName', value)}
                            icon={<Building2 className="w-4 h-4" />}
                            className="text-sm text-foreground-secondary"
                          />
                          {/* Editable Location */}
                          <EditableField
                            value={selectedAnalysis.location}
                            placeholder="Add location..."
                            onSave={(value) => handleFieldUpdate(selectedAnalysis.id, 'location', value)}
                            icon={<MapPin className="w-4 h-4" />}
                            className="text-sm text-foreground-secondary"
                          />
                        </div>
                        <StatusSelector
                          value={selectedAnalysis.applicationStatus as ApplicationStatus}
                          onChange={(status) => handleStatusChange(selectedAnalysis.id, status)}
                          disabled={updatingId === selectedAnalysis.id}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Score */}
                      <div className="flex justify-center">
                        <ScoreGauge score={selectedAnalysis.score} size="lg" />
                      </div>

                      {/* Dates */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-foreground-secondary">
                          <Clock className="w-4 h-4" />
                          Analyzed: {formatDate(selectedAnalysis.createdAt)}
                        </div>
                        {selectedAnalysis.dateApplied && (
                          <div className="flex items-center gap-2 text-foreground-secondary">
                            <Calendar className="w-4 h-4" />
                            Applied: {formatDate(selectedAnalysis.dateApplied)}
                          </div>
                        )}
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
                        Select an application to view details
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
