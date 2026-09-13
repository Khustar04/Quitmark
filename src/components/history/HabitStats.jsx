import { Flame, Award, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

export default function HabitStats({
  currentStreak,
  longestStreak,
  completedCount,
  missedCount,
  consistencyPct,
}) {
  const stats = [
    {
      id: 'current-streak',
      label: 'Current Streak',
      value: `${currentStreak}`,
      unit: currentStreak === 1 ? 'day' : 'days',
      icon: Flame,
      highlight: currentStreak > 0,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Consecutive completed days',
    },
    {
      id: 'longest-streak',
      label: 'Longest Streak',
      value: `${longestStreak}`,
      unit: longestStreak === 1 ? 'day' : 'days',
      icon: Award,
      highlight: false,
      color: 'text-zinc-600 dark:text-zinc-300',
      bgColor: 'bg-zinc-100 dark:bg-[#131722] border-zinc-200 dark:border-[#232936]',
      description: 'Personal best all-time',
    },
    {
      id: 'total-completed',
      label: 'Total Completed',
      value: `${completedCount}`,
      unit: completedCount === 1 ? 'day' : 'days',
      icon: CheckCircle2,
      highlight: false,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Total successful check-ins',
    },
    {
      id: 'total-missed',
      label: 'Total Missed',
      value: `${missedCount}`,
      unit: missedCount === 1 ? 'day' : 'days',
      icon: XCircle,
      highlight: false,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/20',
      description: 'Missed daily commitments',
    },
    {
      id: 'consistency',
      label: 'Consistency',
      value: consistencyPct,
      unit: consistencyPct === '—' ? '' : 'rate',
      icon: TrendingUp,
      highlight: false,
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Completed vs total checked',
    },
  ];

  return (
    <div className="habit-stats-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className={`stat-card rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all ${
              stat.highlight
                ? 'bg-white dark:bg-[#0D0F17] border-emerald-500/30 dark:border-emerald-500/30 dark:shadow-[0_0_20px_-8px_rgba(16,185,129,0.15)]'
                : 'bg-white dark:bg-[#0D0F17] border-zinc-200 dark:border-[#232936]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${stat.bgColor}`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-zinc-900 dark:text-white">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.unit}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500 leading-tight">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
