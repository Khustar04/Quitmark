import { Check, X, Clock } from 'lucide-react';
import { formatFullDisplayDate } from '../../utils/streaks/dateUtils';

export default function RecentActivity({ checkins = [] }) {
  // Sort descending by date and take the first 10
  const recentCheckins = [...checkins]
    .filter((c) => Boolean(c?.check_in_date))
    .sort((a, b) => (b.check_in_date || '').localeCompare(a.check_in_date || ''))
    .slice(0, 10);

  if (recentCheckins.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] p-5 sm:p-7 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#232936]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
          Last {recentCheckins.length} check-ins
        </span>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-[#232936]/60">
        {recentCheckins.map((checkin) => {
          const isCompleted = checkin.status === 'completed';
          return (
            <div
              key={checkin.id || `${checkin.habit_id}-${checkin.check_in_date}`}
              className="py-3 sm:py-3.5 flex items-center justify-between gap-3 text-sm first:pt-1 last:pb-1"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <X className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {isCompleted ? 'Completed' : 'Missed'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    {formatFullDisplayDate(checkin.check_in_date)}
                  </p>
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-medium ${
                  isCompleted
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                {isCompleted ? '✓ Kept' : '✕ Missed'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
