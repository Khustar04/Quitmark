import { memo } from 'react';
import { Plus } from 'lucide-react';
import GoalCard from './GoalCard';

function GoalsList({
  goals = [],
  habits = [],
  checkinsByHabit = {},
  todayDateStr,
  onCreateGoal,
  onSelectGoal,
  onRequestDelete,
}) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 animate-in fade-in duration-300 text-left">
      {/* 1. Header Section (Matching Reference 7) */}
      <div className="flex flex-col mb-8">
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-500 dark:text-[#5af0b3] mb-1">
          GOALS
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Goals
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#85948b] mt-1">
              Turn your habits into progress.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateGoal}
            className="goal-button-primary self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Another Goal</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            habits={habits}
            checkinsByHabit={checkinsByHabit}
            todayDateStr={todayDateStr}
            onSelectGoal={onSelectGoal}
          onRequestDelete={onRequestDelete}
          />
        ))}

        {/* 3. "Create Another Goal" Dashed Card (Matching Reference 7) */}
        <button
          type="button"
          onClick={onCreateGoal}
          className="goal-button-secondary min-h-[220px] flex-col border-dashed p-8 text-center group hover:border-emerald-500/50 dark:hover:border-emerald-500/40"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-700 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] group-hover:scale-110 transition-transform mb-3">
            <Plus className="w-8 h-8 stroke-[1.75]" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] transition-colors">
            Create Another Goal
          </span>
          <span className="text-xs text-slate-500 dark:text-[#85948b] mt-1">
            Set new goals and keep growing.
          </span>
        </button>
      </div>
    </div>
  );
}

export default memo(GoalsList);
