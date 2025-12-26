'use client';

import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animated?: boolean;
}

function getScoreInfo(score: number) {
  if (score >= 90) return { label: 'Excellent', colorClass: 'text-success-600 dark:text-success-500' };
  if (score >= 75) return { label: 'Good', colorClass: 'text-accent-600 dark:text-accent-400' };
  if (score >= 60) return { label: 'Moderate', colorClass: 'text-warning-600 dark:text-warning-500' };
  if (score >= 40) return { label: 'Needs Work', colorClass: 'text-warning-600 dark:text-warning-500' };
  return { label: 'Poor', colorClass: 'text-danger-600 dark:text-danger-500' };
}

function getStrokeColor(score: number) {
  if (score >= 90) return '#10b981'; // success-500
  if (score >= 75) return '#0066ff'; // accent-500
  if (score >= 60) return '#f59e0b'; // warning-500
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // danger-500
}

export function ScoreGauge({ score, size = 'md', showLabel = true, animated = true }: ScoreGaugeProps) {
  const { label, colorClass } = getScoreInfo(score);
  const strokeColor = getStrokeColor(score);

  const sizes = {
    sm: { width: 80, stroke: 6, fontSize: 'text-xl', labelSize: 'text-xs' },
    md: { width: 120, stroke: 8, fontSize: 'text-3xl', labelSize: 'text-sm' },
    lg: { width: 160, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
    xl: { width: 200, stroke: 12, fontSize: 'text-5xl', labelSize: 'text-base' },
  };

  const { width, stroke, fontSize, labelSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={width} height={width}>
          <circle
            className="text-border"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={width / 2}
            cy={width / 2}
          />
          {/* Progress circle */}
          <motion.circle
            initial={animated ? { strokeDashoffset: circumference } : false}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={strokeColor}
            fill="transparent"
            r={radius}
            cx={width / 2}
            cy={width / 2}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={animated ? { opacity: 0, scale: 0.5 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`${fontSize} font-bold ${colorClass}`}
            data-testid="score-display"
          >
            {score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <motion.span
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className={`mt-2 ${labelSize} font-medium ${colorClass}`}
        >
          {label} Match
        </motion.span>
      )}
    </div>
  );
}
