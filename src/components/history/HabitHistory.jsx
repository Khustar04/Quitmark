import { Target, Check, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import HabitHistoryHeader from './HabitHistoryHeader';
import HabitStats from './HabitStats';
import CheckinCalendar from './CheckinCalendar';
import RecentActivity from './RecentActivity';
import { calculateCurrentStreak } from '../../utils/streaks/calculateCurrentStreak';
import { calculateLongestStreak } from '../../utils/streaks/calculateLongestStreak';
import { getLocalDateString } from '../../utils/streaks/dateUtils';

export default function HabitHistory({
  habit,
  checkins = [],
  onCheckin,
  isCheckingIn = false,
}) {
  const todayStr = getLocalDateString();

  // Metrics calculation
  const currentStreak = calculateCurrentStreak(checkins, todayStr);
  const longestStreak = calculateLongestStreak(checkins);

  const completedCount = checkins.filter((c) => c.status === 'completed').length;
  const missedCount = checkins.filter((c) => c.status === 'missed').length;
  const totalTracked = completedCount + missedCount;

  const consistencyPct =
    totalTracked === 0
      ? '—'
      : `${Math.round((completedCount / totalTracked) * 100)}%`;

  // Today check-in record
  const todayRecord = checkins.find((c) => c.check_in_date === todayStr);
  const todayStatus = todayRecord ? todayRecord.status : 'pending';

  return (
    <div className="space-y-8">
      {/* 1. Header with back link & overview badges */}
      <HabitHistoryHeader
        habit={habit}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        completedCount={completedCount}
        consistencyPct={consistencyPct}
      />

      {/* 2. Today's Quick Check-in Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            Today's Check-in
          </span>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {todayStatus === 'completed'
              ? '✓ You have marked today as completed.'
              : todayStatus === 'missed'
              ? '✕ You marked today as missed.'
              : 'Have you stayed consistent with this habit today?'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={isCheckingIn || todayStatus === 'completed'}
            onClick={() => onCheckin && onCheckin(habit.id, 'completed')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              todayStatus === 'completed'
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
            } disabled:opacity-50`}
          >
            {isCheckingIn && todayStatus !== 'completed' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>Completed</span>
          </button>

          <button
            type="button"
            disabled={isCheckingIn || todayStatus === 'missed'}
            onClick={() => onCheckin && onCheckin(habit.id, 'missed')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all inline-flex items-center gap-1.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 ${
              todayStatus === 'missed'
                ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 cursor-default'
                : 'border border-zinc-200 dark:border-[#232936] bg-zinc-50 dark:bg-[#131722] text-zinc-700 dark:text-zinc-300 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30'
            } disabled:opacity-50`}
          >
            {isCheckingIn && todayStatus !== 'missed' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            <span>Missed</span>
          </button>
        </div>
      </div>

      {/* 3. Stats Grid */}
      <HabitStats
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        completedCount={completedCount}
        missedCount={missedCount}
        consistencyPct={consistencyPct}
      />

      {/* 4. Check-in History Calendar / Empty State */}
      {checkins.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-zinc-300 dark:border-[#232936] bg-zinc-50/50 dark:bg-[#0D0F17]/60 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Your history starts today.
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Complete your first check-in and your daily progress will appear here.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => onCheckin && onCheckin(habit.id, 'completed')}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
            >
              Mark Today Completed
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Calendar View */}
          <CheckinCalendar checkins={checkins} />

          {/* Recent Activity List */}
          <RecentActivity checkins={checkins} />
        </>
      )}
    </div>
  );
}
