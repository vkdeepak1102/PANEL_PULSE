import React from 'react';
import { ExportButton } from './ExportButton';

interface Props {
  jobId: string;
  date?: string;
}

export function EvaluationHeader({ jobId, date }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">Evaluation Results</h2>
        <p className="text-xs text-text-muted">Job ID: {jobId} {date && <span>· {date}</span>}</p>
      </div>

      <div>
        <ExportButton jobId={jobId} />
      </div>
    </div>
  );
}
