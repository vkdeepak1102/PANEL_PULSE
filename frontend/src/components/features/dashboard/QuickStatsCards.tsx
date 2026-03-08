import { BarChart3, TrendingUp, CalendarDays, Zap } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
  iconColor?: string;
}

function StatCard({ icon, label, value, loading = false, iconColor = 'text-accent-primary' }: StatCardProps) {
  return (
    <div 
      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-slate-600/70 transition-all duration-300 group backdrop-blur-sm" 
      role="region" 
      aria-label={label}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg flex-shrink-0 group-hover:from-orange-500/30 group-hover:to-orange-600/20 transition-all" aria-hidden="true">
          <div className={`w-6 h-6 text-orange-400 ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold text-white" aria-live="polite" aria-atomic="true">
            {loading ? '—' : value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface QuickStatsCardsProps {
  totalEvaluations?: number;
  averageScore?: number;
  lastEvaluationDate?: string;
  evaluationsThisWeek?: number;
  loading?: boolean;
}

export function QuickStatsCards({
  totalEvaluations = 0,
  averageScore = 0,
  lastEvaluationDate = 'N/A',
  evaluationsThisWeek = 0,
  loading = false,
}: QuickStatsCardsProps) {
  return (
    <>
      <StatCard 
        icon={<BarChart3 className="w-6 h-6" />} 
        label="Total Evaluations" 
        value={totalEvaluations} 
        loading={loading}
        iconColor="text-accent-primary"
      />
      <StatCard 
        icon={<TrendingUp className="w-6 h-6" />} 
        label="Average Score" 
        value={averageScore.toFixed(1)} 
        loading={loading}
        iconColor="text-accent-success"
      />
      <StatCard 
        icon={<CalendarDays className="w-6 h-6" />} 
        label="Last Evaluation" 
        value={lastEvaluationDate} 
        loading={loading}
        iconColor="text-accent-primary"
      />
      <StatCard 
        icon={<Zap className="w-6 h-6" />} 
        label="This Week" 
        value={evaluationsThisWeek} 
        loading={loading}
        iconColor="text-accent-secondary"
      />
    </>
  );
}

export default QuickStatsCards;
