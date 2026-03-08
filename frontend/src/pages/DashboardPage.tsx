import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/lib/stores/dashboard.store';
import dashboardApi from '@/lib/api/dashboard.api';
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader';
import { QuickStatsCards } from '@/components/features/dashboard/QuickStatsCards';
import { RecentEvaluations } from '@/components/features/dashboard/RecentEvaluations';
import { ScoreDistribution } from '@/components/features/dashboard/ScoreDistribution';
import { PanelEfficiency } from '@/components/features/dashboard/PanelEfficiency';
import { SearchFilter, type SearchFilters } from '@/components/features/dashboard/SearchFilter';
import { EvaluationsList } from '@/components/features/dashboard/EvaluationsList';
import { AppShell } from '@/components/layout/AppShell';
import type { SearchResponse, DashboardEvaluation } from '@/types/dashboard.types';

export default function DashboardPage() {
  const { stats, loading, error, fetchStats } = useDashboardStore();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchStats();
    // Load all evaluations by default
    loadAllEvaluations();
  }, [fetchStats]);

  const loadAllEvaluations = async () => {
    setSearchLoading(true);
    try {
      const results = await dashboardApi.searchEvaluations();
      setSearchResults(results);
      setHasSearched(false); // Don't mark as "searched", just showing default list
    } catch (err) {
      console.error('Failed to load evaluations:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setSearchLoading(true);
    try {
      const results = await dashboardApi.searchEvaluations(
        filters.jobInterviewId || undefined,
        filters.panelName || undefined,
        filters.candidateName || undefined
      );
      setSearchResults(results);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReset = () => {
    setSearchResults(null);
    setHasSearched(false);
    fetchStats();
  };

  // Determine which evaluations to display
  const displayEvaluations = searchResults ? searchResults.evaluations : [];
  const displayStats = hasSearched && searchResults ? 
    {
      totalEvaluations: searchResults.totalEvaluations,
      averageScore: searchResults.averageScore,
      scoreDistribution: searchResults.scoreDistribution,
      lastEvaluationDate: stats?.lastEvaluationDate || new Date().toISOString().split('T')[0],
      evaluationsThisWeek: stats?.evaluationsThisWeek || 0
    }
    : stats;

  return (
    <AppShell>
      <main className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" role="main" aria-label="Dashboard">
        {/* Header */}
        <div className="bg-slate-800/40 border-b border-slate-700/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-10">
            <DashboardHeader />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-lg backdrop-blur-sm" role="alert">
              <p className="font-bold">Error loading dashboard</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          )}

          {/* Quick Stats Grid - 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickStatsCards
              totalEvaluations={displayStats?.totalEvaluations}
              averageScore={displayStats?.averageScore}
              lastEvaluationDate={displayStats?.lastEvaluationDate}
              evaluationsThisWeek={displayStats?.evaluationsThisWeek}
              loading={loading || searchLoading}
            />
          </div>

          {/* Main Content Grid - 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel Efficiency Card */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-slate-600/70 transition-all duration-300 backdrop-blur-sm">
              <PanelEfficiency />
            </div>

            {/* Score Distribution Card */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-slate-600/70 transition-all duration-300 backdrop-blur-sm">
              <ScoreDistribution data={displayStats?.scoreDistribution} loading={loading || searchLoading} />
            </div>
          </div>

          {/* Search and Filter Card */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-slate-600/70 transition-all duration-300 backdrop-blur-sm">
            <SearchFilter onSearch={handleSearch} onReset={handleReset} loading={searchLoading} />
          </div>

          {/* Evaluations List Card */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-slate-600/70 transition-all duration-300 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-heading text-text-primary font-semibold">
                {hasSearched ? 'Search Results' : 'All Evaluations'}
              </h3>
              <p className="text-text-secondary text-sm mt-1">
                {displayEvaluations.length} evaluation{displayEvaluations.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <EvaluationsList 
              evaluations={displayEvaluations}
              loading={searchLoading}
              pagination={hasSearched && searchResults ? searchResults.pagination : undefined}
            />
          </div>

          {/* Recent Evaluations */}
          {!hasSearched && stats?.recentEvaluations && stats.recentEvaluations.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:border-slate-600/70 transition-all duration-300 backdrop-blur-sm">
              <RecentEvaluations evaluations={stats.recentEvaluations} loading={loading} />
            </div>
          )}
        </div>

        {/* Footer Spacing */}
        <div className="h-8"></div>
      </main>
    </AppShell>
  );
}
