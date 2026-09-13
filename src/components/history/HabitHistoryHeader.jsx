import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Award, CheckCircle2, Percent } from 'lucide-react';

export default function HabitHistoryHeader({
  habit,
  currentStreak,
  longestStreak,
  completedCount,
  consistencyPct,
}) {
  return (
    <div className="space-y-6 pb-6 border-b border-zinc-200 dark:border-[#232936]">
      {/* Back to Dashboard Navigation */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg px-1 py-0.5 -ml-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Habit Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            Quit Goal History
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white break-words">
            {habit.name}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Your progress, one day at a time.
          </p>
        </div>

        {/* Quick Highlights Pill Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-500" />
            <span>{currentStreak} Day Streak</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#131722] border border-zinc-200 dark:border-[#232936] text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Best: {longestStreak}d</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#131722] border border-zinc-200 dark:border-[#232936] text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{completedCount} Completed</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-[#131722] border border-zinc-200 dark:border-[#232936] text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
            <Percent className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>{consistencyPct}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
