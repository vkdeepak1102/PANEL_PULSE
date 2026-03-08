import React from 'react';
import { DimensionCard } from './DimensionCard';
import { DIMENSIONS } from '@/types/evaluation.types';
import type { DimensionScores } from '@/types/evaluation.types';

interface Props {
  dimensions: DimensionScores | null;
  evidence?: Record<string, string[]> | null;
}

export function DimensionGrid({ dimensions, evidence }: Props) {
  const keys = Object.keys(DIMENSIONS) as Array<keyof DimensionScores>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {keys.map((key) => {
        const def = DIMENSIONS[key];
        const score = dimensions ? (dimensions as any)[key] ?? 0 : 0;
        // Fallback to 'general' evidence if dimension-specific evidence doesn't exist
        const ev = evidence ? (evidence[key] ?? evidence['general'] ?? []) : [];

        return (
          <DimensionCard key={key} name={def.name} score={score} evidence={ev} />
        );
      })}
    </div>
  );
}

export default DimensionGrid;
