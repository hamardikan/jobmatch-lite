'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';
import { ScoreBadge } from '@/components/ui/badge';
import {
  FileText,
  Target,
  Trophy,
  GitCompare,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Analysis {
  id: string;
  jobDescriptionPreview: string;
  score: number;
  createdAt: string;
}

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  bestMatch: { score: number; preview: string } | null;
  recentAnalyses: Analysis[];
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/history`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const analyses: Analysis[] = Array.isArray(data.data) ? data.data : [];

          // Calculate stats from analyses
          const totalAnalyses = analyses.length;
          const averageScore = analyses.length > 0
            ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
            : 0;
          const bestMatch = analyses.length > 0
            ? analyses.reduce((best, a) => a.score > best.score ? a : best, analyses[0])
            : null;

          setStats({
            totalAnalyses,
            averageScore,
            bestMatch: bestMatch ? { score: bestMatch.score, preview: bestMatch.jobDescriptionPreview } : null,
            recentAnalyses: analyses.slice(0, 5),
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'there';

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
            Welcome back, {firstName}
          </h1>
          <p className="text-foreground-secondary mt-1">
            Here's an overview of your resume matching journey.
          </p>
        </div>
        <LinkButton href="/analyze" size="lg">
          <Plus className="w-5 h-5 mr-2" />
          New Analysis
        </LinkButton>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
      >
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Total Analyses</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {isLoading ? '-' : stats?.totalAnalyses || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Average Score</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {isLoading ? '-' : `${stats?.averageScore || 0}%`}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Best Match</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {isLoading ? '-' : stats?.bestMatch ? `${stats.bestMatch.score}%` : '-'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-700/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-success-600 dark:text-success-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground-secondary">Compare Jobs</p>
                  <p className="text-lg font-medium text-foreground mt-2">
                    Coming soon
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-700/20 flex items-center justify-center">
                  <GitCompare className="w-6 h-6 text-warning-600 dark:text-warning-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Analyses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Analyses</CardTitle>
              <Link
                href="/history"
                className="text-sm text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center text-foreground-secondary">
                  Loading...
                </div>
              ) : stats?.recentAnalyses && stats.recentAnalyses.length > 0 ? (
                <div className="divide-y divide-border">
                  {stats.recentAnalyses.map((analysis, index) => (
                    <Link
                      key={analysis.id}
                      href={`/history/${analysis.id}`}
                      className="flex items-center justify-between p-4 hover:bg-background-secondary transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm font-medium text-foreground truncate">
                          {analysis.jobDescriptionPreview}
                        </p>
                        <p className="text-xs text-foreground-muted flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ScoreBadge score={analysis.score} showLabel={false} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background-secondary flex items-center justify-center">
                    <FileText className="w-8 h-8 text-foreground-muted" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">No analyses yet</h3>
                  <p className="text-sm text-foreground-secondary mb-4">
                    Start by analyzing your first resume match.
                  </p>
                  <LinkButton href="/analyze" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Analysis
                  </LinkButton>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/analyze"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'bg-primary-50 dark:bg-primary-900/20',
                  'hover:bg-primary-100 dark:hover:bg-primary-900/30',
                  'transition-colors'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <p className="font-medium text-foreground">New Analysis</p>
                  <p className="text-xs text-foreground-secondary">Upload resume & job description</p>
                </div>
              </Link>

              <Link
                href="/history"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'bg-background-secondary',
                  'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                  'transition-colors'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                  <Clock className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">View History</p>
                  <p className="text-xs text-foreground-secondary">See past analyses</p>
                </div>
              </Link>

              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  'bg-background-secondary opacity-60 cursor-not-allowed'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center">
                  <GitCompare className="w-5 h-5 text-foreground-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Compare Jobs</p>
                  <p className="text-xs text-foreground-secondary">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success-500" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-0.5">•</span>
                  Include the full job description for better matching
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-0.5">•</span>
                  Update your resume based on the gap analysis
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success-500 mt-0.5">•</span>
                  Compare multiple jobs to find the best fit
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
