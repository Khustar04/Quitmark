import { useState, useMemo } from 'react';
import { Search, Check, ArrowLeft, ArrowRight, Sparkles, Activity } from 'lucide-react';
import { getHabitCategory } from '../../utils/habitCategoryUtils';

export default function GoalHabitSelectorStep({
  habits = [],
  formData,
  selectedHabitIds: propSelectedHabitIds,
  onChange,
  onNext,
  onBack,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedHabitIds = useMemo(() => {
    let raw = propSelectedHabitIds;
    if (!raw && formData?.habit_ids) raw = formData.habit_ids;
    if (raw instanceof Set) return raw;
    if (Array.isArray(raw)) return new Set(raw);
    if (raw && typeof raw === 'object' && Array.isArray(raw.habit_ids)) {
      return new Set(raw.habit_ids);
    }
    return new Set();
  }, [formData?.habit_ids, propSelectedHabitIds]);

  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habits;
    const q = searchQuery.toLowerCase();
    return habits.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.category && h.category.toLowerCase().includes(q))
    );
  }, [habits, searchQuery]);

  const toggleHabit = (habitId) => {
    const nextSet = new Set(selectedHabitIds);
    if (nextSet.has(habitId)) {
      nextSet.delete(habitId);
    } else {
      nextSet.add(habitId);
    }
    const nextArray = Array.from(nextSet);
    onChange({ habit_ids: nextArray });
  };

  const handleSelectAll = () => {
    if (selectedHabitIds.size === habits.length) {
      onChange({ habit_ids: [] });
    } else {
      onChange({ habit_ids: habits.map((h) => h.id) });
    }
  };

  return (
    <div className="flex flex-col text-left">
      {/* 1. Header (H1) */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Connect your habits
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85948b]">
          Select the habits that will help you achieve this goal.
        </p>
      </div>

      {/* 2. Search & Select All Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-[#85948b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your habits..."
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#111417] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#85948b] text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition-all shadow-2xs"
          />
        </div>

        {habits.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-[#5af0b3] transition-colors shrink-0 cursor-pointer"
          >
            {selectedHabitIds.size === habits.length ? 'Deselect All' : 'Select All'}
          </button>
        )}
      </div>

      {/* 3. Habit List (Constrained max height, scrollbar hidden via no-scrollbar) */}
      <div className="flex flex-col gap-2 max-h-[200px] sm:max-h-[240px] overflow-y-auto no-scrollbar pr-1 mb-4">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-slate-50/70 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/[0.08]">
            <Sparkles className="w-6 h-6 text-emerald-400 mb-1.5 opacity-60" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              No habits created yet
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-[#85948b] mt-0.5 max-w-xs leading-relaxed">
              Goals require at least one active habit to track your progress. Please create a habit first.
            </p>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-[#85948b]">
            No habits match &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredHabits.map((habit) => {
            const isSelected = selectedHabitIds.has(habit.id);
            const categoryMeta = getHabitCategory(habit.name, habit.category);
            const CategoryIcon = categoryMeta.icon || Activity;

            return (
              <div
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-emerald-500/80 dark:border-[#5af0b3]/80 bg-emerald-500/[0.08] dark:bg-[#5af0b3]/10 shadow-2xs'
                    : 'border-slate-200/90 dark:border-white/[0.06] bg-slate-50/60 dark:bg-[#111417] hover:border-slate-300 dark:hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-lg flex items-center justify-center ${categoryMeta.color || 'bg-emerald-500/10 text-emerald-500'}`}
                  >
                    <CategoryIcon className="w-3.5 h-3.5 stroke-[2]" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-[#85948b] truncate">
                      {habit.category || categoryMeta.name}
                    </span>
                  </div>
                </div>

                {/* Checkbox Icon */}
                <div
                  className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 dark:bg-[#5af0b3] border-emerald-500 dark:border-[#5af0b3] text-slate-950 dark:text-[#003825]'
                      : 'border-slate-300 dark:border-white/20 bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Footer & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161a1f] text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:border-slate-300 dark:hover:border-white/[0.2] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back</span>
          </button>

          {selectedHabitIds.size === 0 ? (
            <span className="text-xs font-semibold text-rose-500 dark:text-rose-400 ml-1">
              Select at least 1 habit
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-600 dark:text-[#5af0b3] ml-1">
              {selectedHabitIds.size} {selectedHabitIds.size === 1 ? 'habit' : 'habits'} selected
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={selectedHabitIds.size === 0}
          onClick={() => {
            if (selectedHabitIds.size > 0) {
              onNext();
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-[#5af0b3] dark:hover:bg-[#4de1a5] text-slate-950 dark:text-[#003825] font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 dark:disabled:hover:bg-[#5af0b3] disabled:active:scale-100 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
