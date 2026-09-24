import { ArrowLeft, Check, Edit3, Lightbulb, Loader2 } from 'lucide-react';
import { getGoalIcon } from '../../utils/goalIcons';
import { formatGoalDateRange } from '../../services/goalService';

export default function GoalReviewStep({
  formData,
  habits = [],
  onBack,
  onEdit,
  onSubmit,
  isSubmitting = false,
}) {
  const iconMeta = getGoalIcon(formData.icon);
  const IconComponent = iconMeta.icon;

  const habitIdsList = Array.isArray(formData.habit_ids)
    ? formData.habit_ids
    : Array.isArray(formData.habit_ids?.habit_ids)
    ? formData.habit_ids.habit_ids
    : [];
  const linkedHabits = habits.filter((h) => habitIdsList.includes(h.id));

  // Date formatted display
  const duration = Number(formData.duration_days) || 60;
  const dateRange = formatGoalDateRange(formData.start_date, formData.target_date);

  return (
    <div className="flex flex-col text-left">
      {/* 1. Header (H1) */}
      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
          Review your goal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85948b]">
          Make sure everything looks good.
        </p>
      </div>

      {/* 2. Structured Summary Card (Compact) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] shadow-2xs mb-3.5">
        {/* Goal Title Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-white/[0.06] mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${iconMeta.color}`}>
              <IconComponent className="w-4 h-4 stroke-[2]" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {formData.name || 'Untitled Goal'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-600 dark:text-[#5af0b3] hover:bg-emerald-500/10 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Key-Value Details */}
        <div className="flex flex-col gap-2 text-xs sm:text-sm">
          {/* Category */}
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#85948b]">Category</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formData.category || 'Personal'}
            </span>
          </div>

          {/* Timeline */}
          <div className="flex items-start justify-between">
            <span className="text-slate-500 dark:text-[#85948b]">Timeline</span>
            <div className="flex flex-col items-end">
              <span className="font-semibold text-slate-900 dark:text-white">
                {duration} days
              </span>
              <span className="text-[11px] text-slate-400 dark:text-[#85948b]">
                {dateRange}
              </span>
            </div>
          </div>

          {/* Connected Habits */}
          <div className="flex items-start justify-between">
            <span className="text-slate-500 dark:text-[#85948b]">Habits</span>
            <div className="flex flex-col items-end max-w-[65%] text-right">
              <span className={`font-semibold ${linkedHabits.length === 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                {linkedHabits.length} {linkedHabits.length === 1 ? 'habit' : 'habits'}
              </span>
              {linkedHabits.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-1 mt-1">
                  {linkedHabits.map((h) => (
                    <span
                      key={h.id}
                      className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/[0.06] text-[10px] sm:text-[11px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      {h.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-rose-500 dark:text-rose-400 font-medium">
                  None connected (Required)
                </span>
              )}
            </div>
          </div>

          {/* Description (Only show if user entered one) */}
          {Boolean(formData.description?.trim()) && (
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50 dark:border-white/[0.04]">
              <span className="text-slate-500 dark:text-[#85948b]">Description</span>
              <span className="font-normal text-slate-700 dark:text-slate-300 text-xs max-w-[65%] text-right truncate">
                {formData.description}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Tip Card or Validation Warning */}
      {linkedHabits.length === 0 ? (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-2.5 mb-4 text-xs text-rose-600 dark:text-rose-400">
          <span className="font-medium">You must connect at least 1 habit to create this goal.</span>
          <button
            type="button"
            onClick={onBack}
            className="font-bold underline hover:no-underline shrink-0 cursor-pointer"
          >
            Connect Habits
          </button>
        </div>
      ) : (
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 mb-4">
          <div className="w-5 h-5 shrink-0 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center mt-0.5">
            <Lightbulb className="w-3.5 h-3.5 fill-amber-500/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Tip
            </span>
            <p className="text-[11px] text-slate-600 dark:text-[#c5cad3] leading-tight">
              You can edit all these details later from the goal settings.
            </p>
          </div>
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#161a1f] text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:border-slate-300 dark:hover:border-white/[0.2] transition-all cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || linkedHabits.length === 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-[#5af0b3] dark:hover:bg-[#4de1a5] text-slate-950 dark:text-[#003825] font-bold text-sm shadow-md shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 dark:disabled:hover:bg-[#5af0b3] disabled:active:scale-100 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Goal...</span>
            </>
          ) : (
            <>
              <span>Create Goal</span>
              <Check className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
