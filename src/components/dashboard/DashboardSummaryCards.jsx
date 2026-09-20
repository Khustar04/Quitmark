import { Check, Flame, Activity } from 'lucide-react';

export default function DashboardSummaryCards({ dashboardSummary, globalActivity }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Highest Streak */}
      <div className="px-5 py-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
          <Flame className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Highest Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            {dashboardSummary.bestCurrentStreak}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            {dashboardSummary.bestCurrentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Card 2: Total Check-ins / Completed */}
      <div className="px-5 py-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Completed</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-zinc-900 dark:text-white">
            {dashboardSummary.totalCompleted}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            {dashboardSummary.totalCompleted === 1 ? 'check-in' : 'check-ins'}
          </span>
        </div>
      </div>

      {/* Card 3: 7-Day Activity Matrix (GitHub Style) */}
      <div className="px-5 py-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider font-mono">Last 7 Days</span>
        </div>
        <div className="flex items-end gap-1.5 h-full">
          {globalActivity.map((day, i) => {
            let colorClass = 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-[#232936]';
            
            if (day.status === 'completed') {
              colorClass = 'bg-emerald-500 border border-emerald-400 shadow-sm';
            } else if (day.status === 'missed') {
              colorClass = 'bg-red-500/70 border border-red-500/80';
            } else if (day.status === 'pending') {
              colorClass = 'bg-emerald-500/10 border border-emerald-500/30';
            }

            return (
              <div
                key={i}
                className={`w-6 h-6 rounded-sm ${colorClass}`}
                title={day.dateStr}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
