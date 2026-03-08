import { useEffect, useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { dashboardApi, type PanelEfficiency as PanelEfficiencyType, type PanelEfficiencyResponse } from '@/lib/api/dashboard.api';

export function PanelEfficiency() {
  const [data, setData] = useState<PanelEfficiencyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEfficiency() {
      setLoading(true);
      const response = await dashboardApi.fetchPanelEfficiency();
      setData(response);
      setLoading(false);
    }

    loadEfficiency();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-border-primary rounded-card h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.panels.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Overall Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-card">
        <div className="bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 border border-border-primary rounded-card p-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-metric-label text-text-secondary uppercase tracking-widest mb-2">Overall Average Score</p>
              <p className="text-metric-value text-text-primary font-bold">{data.overallAverage}</p>
              <p className="text-text-secondary text-sm mt-2">{data.totalPanels} panels evaluated</p>
            </div>
            <div className="bg-accent-primary/10 rounded-card-lg p-3 flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-accent-primary" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent-success/5 to-accent-primary/5 border border-border-primary rounded-card p-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-metric-label text-text-secondary uppercase tracking-widest mb-2">Total Evaluations</p>
              <p className="text-metric-value text-text-primary font-bold">{data.totalEvaluations}</p>
              <p className="text-text-secondary text-sm mt-2">Across all panels</p>
            </div>
            <div className="bg-accent-success/10 rounded-card-lg p-3 flex-shrink-0">
              <Users className="w-6 h-6 text-accent-success" />
            </div>
          </div>
        </div>
      </div>

      {/* Panel Details Table */}
      <div className="border border-border-primary rounded-card overflow-hidden">
        <div className="p-card border-b border-border-primary bg-bg-surface">
          <h3 className="text-heading text-text-primary font-semibold">Panel Efficiency Breakdown</h3>
        </div>
        
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border-primary bg-bg-base">
                <th className="px-card py-4 text-left font-semibold text-text-primary">Panel Name</th>
                <th className="px-card py-4 text-right font-semibold text-text-primary">Avg Score</th>
                <th className="px-card py-4 text-right font-semibold text-text-primary">Evaluations</th>
                <th className="px-card py-4 text-right font-semibold text-text-primary">Score Range</th>
              </tr>
            </thead>
            <tbody>
              {data.panels.map((panel, index) => (
                <tr 
                  key={index} 
                  className="border-b border-border-primary hover:bg-bg-base transition-colors last:border-b-0"
                >
                  <td className="px-card py-4 font-medium text-text-primary">{panel.panelName}</td>
                  <td className="px-card py-4 text-right">
                    <span className={`font-bold ${getScoreColor(panel.averageScore)}`}>
                      {panel.averageScore}
                    </span>
                  </td>
                  <td className="px-card py-4 text-right text-text-secondary">{panel.evaluationCount}</td>
                  <td className="px-card py-4 text-right text-text-muted text-xs">{panel.scoreRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-accent-success';
  if (score >= 6) return 'text-accent-primary';
  return 'text-accent-error';
}
