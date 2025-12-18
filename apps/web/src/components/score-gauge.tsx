'use client';

import { getScoreCategory } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreGauge({ score, size = 'md' }: ScoreGaugeProps) {
  const { label, color } = getScoreCategory(score);

  const sizes = {
    sm: { width: 80, stroke: 6, fontSize: 'text-xl' },
    md: { width: 120, stroke: 8, fontSize: 'text-3xl' },
    lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const strokeColor =
    score >= 80
      ? '#10b981'
      : score >= 60
      ? '#3b82f6'
      : score >= 40
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={width} height={width}>
          <circle
            className="text-slate-100"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={width / 2}
            cy={width / 2}
          />
          {/* Progress circle */}
          <circle
            className="score-circle transition-all duration-1000 ease-out"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={strokeColor}
            fill="transparent"
            r={radius}
            cx={width / 2}
            cy={width / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${fontSize} font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <span className={`mt-2 text-sm font-medium ${color}`}>{label} Match</span>
    </div>
  );
}
