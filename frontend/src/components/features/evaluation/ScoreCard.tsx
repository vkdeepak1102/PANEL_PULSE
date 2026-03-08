import React from 'react';
import { ProgressRing } from './ProgressRing';
import { ScoreCategoryBadge } from './ScoreCategoryBadge';

interface Props {
  score: number; // 0-10 scale expected
  category: 'Poor' | 'Moderate' | 'Good' | null;
  subtitle?: string;
}

export function ScoreCard({ score, category, subtitle }: Props) {
  const percent = Math.max(0, Math.min(100, (score / 10) * 100));

  return (
    <div className="bg-bg-card rounded-lg border border-white/[0.06] p-4 flex items-center gap-4">
      <div className="w-20 h-20 flex-none">
        <ProgressRing size={72} stroke={8} progress={percent} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text-primary">Panel Efficiency</h3>
          <ScoreCategoryBadge category={category} />
        </div>

        <p className="text-3xl font-bold text-text-primary mt-2">{score.toFixed(1)}</p>
        {subtitle && <p className="text-sm text-text-muted mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
