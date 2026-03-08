import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ScoreDistribution } from '@/types/chart.types';

interface ScoreDistributionProps {
  data?: ScoreDistribution[];
  loading?: boolean;
}

export function ScoreDistribution({ data = [], loading = false }: ScoreDistributionProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center" role="status" aria-label="Loading score distribution">
        <p className="text-text-muted">Loading chart...</p>
      </div>
    );
  }

  const chartData = data.length
    ? data
    : [
        { range: '0-2', count: 0 },
        { range: '2-4', count: 0 },
        { range: '4-6', count: 0 },
        { range: '6-8', count: 0 },
        { range: '8-10', count: 0 },
      ];

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Score distribution analysis">
      <h3 className="text-heading text-text-primary font-semibold mb-6">Score Distribution</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            aria-label="Bar chart showing distribution of evaluation scores across score ranges"
            role="img"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" aria-hidden="true" />
            <XAxis dataKey="range" stroke="#9ca3af" aria-label="Score range" />
            <YAxis stroke="#9ca3af" aria-label="Number of evaluations" />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#1f2937' }}
              formatter={(value) => [value, 'Count']}
              aria-label="Score distribution details"
            />
            <Legend aria-label="Chart legend" />
            <Bar dataKey="count" fill="url(#colorGradient)" name="Evaluations" />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#E84C3D" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ScoreDistribution;
