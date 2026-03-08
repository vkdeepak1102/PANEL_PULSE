import React from 'react';

interface Props {
  name: string;
  score: number; // 0-10
  evidence?: string[];
}

export function DimensionCard({ name, score, evidence = [] }: Props) {
  const percent = Math.max(0, Math.min(100, (score / 10) * 100));

  return (
    <div className="bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary truncate">{name}</p>
          <p className="text-xs text-text-muted">{score.toFixed(1)} / 10</p>
        </div>
        <div className="w-20">
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      {evidence.length > 0 && (
        <div className="mt-3 text-xs text-text-muted">
          <p className="font-medium text-text-primary">Evidence</p>
          <ul className="list-disc ml-4 mt-1">
            {evidence.slice(0, 3).map((e, i) => (
              <li key={i} className="truncate">{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
