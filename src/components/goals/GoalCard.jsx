import { useMemo, useState, memo } from 'react';
import { MoreVertical, Trash2, Calendar, Users } from 'lucide-react';
import { getGoalIcon } from '../../utils/goalIcons';
import { calculateGoalStats, formatGoalDateRange } from '../../services/goalService';

function GoalCard({
  goal,
  habits = [],
  checkinsByHabit = {},
  todayDateStr,
  onSelectGoal,
  onRequestDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const iconMeta = getGoalIcon(goal.icon);
  const IconComponent = iconMeta.icon;

  const stats = useMemo(
    () => calculateGoalStats(goal, habits, checkinsByHabit, todayDateStr),
    [goal, habits, checkinsByHabit, todayDateStr]
  );

  const duration = Number(goal.duration_days) || 60;
  const dateRange = formatGoalDateRange(goal.start_date, goal.target_date);
  const habitsCount = useMemo(() => {
    const activeHabitIds = new Set(habits.map((habit) => habit.id));
    return (goal.habit_ids || []).filter((id) => activeHabitIds.has(id)).length;
  }, [goal.habit_ids, habits]);

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onRequestDelete(goal);
  };

  return (
    <div
      onClick={() => onSelectGoal(goal)}
      className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-200 shadow-xs hover:shadow-lg cursor-pointer text-left"
    >
      {/* 1. Header: Icon, Title, More Options */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-[#5af0b3] flex items-center justify-center shadow-xs">
            <IconComponent className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] transition-colors">
            {goal.name}
          </h3>
        </div>

        {/* Options Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="goal-button-quiet min-h-8 min-w-8 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            aria-label="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 py-1 rounded-xl bg-white dark:bg-[#1e2329] border border-slate-200 dark:border-white/[0.1] shadow-xl z-20">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex min-h-9 items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Progress Bar and Percentage on the same line */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-[#20252b] overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 dark:bg-[#5af0b3] transition-all duration-500 shadow-sm shadow-emerald-500/30"
            style={{ width: `${stats?.progressPercentage || 0}%` }}
          />
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-mono shrink-0">
          {stats?.progressPercentage || 0}%
        </span>
      </div>

      {/* 3. Days elapsed / duration */}
      <div className="text-xs text-slate-400 dark:text-[#85948b] mb-3">
        {stats?.completedDaysCount || 0} / {duration} days
      </div>

      {/* 4. Date Range */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#85948b] mb-4">
        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-[#85948b]" />
        <span>{dateRange}</span>
      </div>

      {/* 5. Bottom Row: Habits Count + Active Badge */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#85948b]">
          <Users className="w-3.5 h-3.5" />
          <span>{habitsCount} {habitsCount === 1 ? 'habit' : 'habits'}</span>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#0d281e] text-[#5af0b3] border border-emerald-500/25">
          Active
        </span>
      </div>
    </div>
  );
}

export default memo(GoalCard);
