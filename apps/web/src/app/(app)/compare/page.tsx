'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LinkButton } from '@/components/ui/link-button';
import { GitCompare, Clock, Plus } from 'lucide-react';

export default function ComparePage() {
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
          Compare multiple job analyses side by side.
        </p>
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card>
          <CardContent className="py-20 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 dark:bg-primary-800/30 flex items-center justify-center">
              <GitCompare className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Coming Soon
            </h2>
            <p className="text-foreground-secondary mb-2 max-w-md mx-auto">
              Compare multiple job analyses side by side to find your best match.
              See how your resume stacks up against different positions.
            </p>
            <div className="flex items-center justify-center gap-2 text-foreground-muted mb-8">
              <Clock className="w-4 h-4" />
              <span className="text-sm">This feature is under development</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LinkButton href="/analyze" variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create New Analysis
              </LinkButton>
              <LinkButton href="/history" variant="secondary">
                View History
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview of what's coming */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid md:grid-cols-3 gap-4"
      >
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-50">
            <CardContent className="p-6">
              <div className="h-24 rounded-lg bg-background-secondary border-2 border-dashed border-border flex items-center justify-center">
                <Plus className="w-8 h-8 text-foreground-muted" />
              </div>
              <div className="mt-4 text-center text-sm text-foreground-muted">
                Add Job #{i}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}
