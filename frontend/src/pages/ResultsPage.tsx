import { AppShell } from '@/components/layout/AppShell';
import { SettingsModal } from '@/components/features/modals/SettingsModal';
import { EvaluationHeader } from '@/components/features/evaluation/EvaluationHeader';
import { ScoreCard } from '@/components/features/evaluation/ScoreCard';
import DimensionGrid from '@/components/features/evaluation/DimensionGrid';
import { EvidenceSection } from '@/components/features/evaluation/EvidenceSection';
import { ExportButton } from '@/components/features/evaluation/ExportButton';
import { L2ValidatorCard } from '@/components/features/l2-validation/L2ValidatorCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useEvaluationStore } from '@/lib/stores/evaluation.store';
import { dashboardApi } from '@/lib/api/dashboard.api';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { id: evaluationId } = useParams<{ id: string }>();
  const [cachedEvaluation, setCachedEvaluation] = useState<any>(null);
  const [loadingCached, setLoadingCached] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const jobId = useEvaluationStore((s) => s.jobId);
  const panelScore = useEvaluationStore((s) => s.panelScore);
  const dimensions = useEvaluationStore((s) => s.dimensions);
  const evidence = useEvaluationStore((s) => s.evidence);
  const scoreCategory = useEvaluationStore((s) => s.scoreCategory);
  const isLoading = useEvaluationStore((s) => s.isLoading);
  const timestamp = useEvaluationStore((s) => s.timestamp);
  const l1Transcript = useEvaluationStore((s) => s.l1Transcript);
  const l2RejectionReason = useEvaluationStore((s) => s.l2RejectionReason);

  const liveRef = useRef<HTMLDivElement | null>(null);

  // Load cached evaluation if evaluationId is provided (from dashboard link)
  useEffect(() => {
    if (evaluationId && !panelScore) {
      setLoadingCached(true);
      setFetchError(null);
      dashboardApi.fetchCachedEvaluation(evaluationId)
        .then(data => {
          setCachedEvaluation(data);
          setLoadingCached(false);
        })
        .catch(error => {
          console.error('Failed to load cached evaluation:', error);
          setFetchError(error?.response?.data?.error || error?.message || 'Failed to load evaluation details');
          setLoadingCached(false);
        });
    }
  }, [evaluationId, panelScore]);

  useEffect(() => {
    if (panelScore !== null && liveRef.current) {
      liveRef.current.textContent = `Evaluation complete: score ${typeof panelScore === 'number' ? panelScore.toFixed(1) : panelScore}`;
    }
  }, [panelScore]);

  // Use cached evaluation if available
  const displayData = cachedEvaluation || {
    jobId,
    score: panelScore,
    categories: dimensions,
    evidence,
    scoreCategory,
    timestamp
  };

  const displayScore = cachedEvaluation?.score ?? panelScore;
  const displayDimensions = cachedEvaluation?.categories ?? dimensions;
  const displayEvidence = cachedEvaluation?.evidence ?? evidence;
  const displayScoreCategory = cachedEvaluation?.scoreCategory ?? scoreCategory;
  const displayTimestamp = cachedEvaluation?.evaluatedAt ?? timestamp;
  const displayJobId = cachedEvaluation?.jobId ?? jobId;

  // Show error if fetch failed
  if (fetchError) {
    return (
      <AppShell>
        <SettingsModal />
        <div className="flex-1 p-6">
          <EmptyState
            title="Failed to load evaluation"
            description={fetchError}
            action={<button onClick={() => navigate('/dashboard')} className="inline-block px-4 py-2 bg-primary text-white rounded">Back to dashboard</button>}
          />
        </div>
      </AppShell>
    );
  }

  if (displayScore === null && !isLoading && !loadingCached) {
    return (
      <AppShell>
        <SettingsModal />
        <div className="flex-1 p-6">
          <EmptyState
            title="No evaluation found"
            description="Run an evaluation first or open a saved result."
            action={<button onClick={() => navigate('/evaluate')} className="inline-block px-4 py-2 bg-primary text-white rounded">Evaluate panel</button>}
          />
        </div>
      </AppShell>
    );
  }

  if (loadingCached) {
    return (
      <AppShell>
        <SettingsModal />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-text-secondary">Loading evaluation details...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SettingsModal />
      <div className="flex-1 overflow-y-auto bg-bg-base p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div aria-live="polite" aria-atomic="true" className="sr-only" ref={liveRef} />
          <EvaluationHeader jobId={displayJobId} date={displayTimestamp} />

          {/* Main Panel Efficiency Score */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ScoreCard score={displayScore ?? 0} category={displayScoreCategory} subtitle="Overall panel efficiency" />
              <div className="mt-4">
                <ExportButton jobId={displayJobId} evaluationId={evaluationId || ''} />
              </div>
            </div>

            {/* Dimension Grid */}
            <div className="lg:col-span-3">
              <DimensionGrid dimensions={displayDimensions} evidence={displayEvidence} />
            </div>
          </section>

          {/* Evidence Section */}
          <section>
            <EvidenceSection evidence={displayEvidence} />
          </section>

          {/* L2 Validation Section */}
          {l1Transcript && l2RejectionReason && (
            <section>
              <L2ValidatorCard l1Transcript={l1Transcript} l2RejectionReason={l2RejectionReason} autoValidate={true} />
            </section>
          )}
        </div>
      </div>
    </AppShell>
  );
}
