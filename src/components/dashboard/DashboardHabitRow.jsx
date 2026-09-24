import { useState, useMemo, memo } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Bell,
} from 'lucide-react';
import { calculateHabitSummary } from '../../utils/progress/calculateHabitSummary';
import { useLocalDate } from '../../hooks/useLocalDate';
import { getHabitCategory } from '../../utils/habitCategoryUtils';

function DashboardHabitRow({
  habit,
  checkins = [],
  onCheckin,
  onEdit,
  onDelete,
  isCheckingIn = false,
  reminder = null,
  onReminderClick,
  overrideCompleted = undefined,
}) {
  const todayDateStr = useLocalDate();
  const [showMenu, setShowMenu] = useState(false);

  // Check today's status: either overridden or computed from real checkins
  const todayRecord = checkins.find((c) => c.check_in_date === todayDateStr);
  const isCompleted =
    overrideCompleted !== undefined
      ? overrideCompleted
      : todayRecord?.status === 'completed' || habit.defaultStatus === 'completed';

  const isInProgress =
    !isCompleted && (habit.defaultStatus === 'in_progress' || habit.status === 'in_progress');

  // Compute live streak
  const summary = useMemo(
    () => calculateHabitSummary(checkins, todayDateStr),
    [checkins, todayDateStr]
  );
  const { currentStreak } = summary;

  const categoryName = useMemo(() => {
    if (habit.category) return habit.category;
    return getHabitCategory(habit.name).name;
  }, [habit.category, habit.name]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (isCheckingIn) return;
    const nextStatus = isCompleted ? 'pending' : 'completed';
    if (onCheckin) {
      await onCheckin(habit.id, nextStatus);
    }
  };

  const scheduleText = useMemo(() => {
    if (reminder?.reminder_time) {
      const [h, m] = reminder.reminder_time.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${formattedHour}:${m} ${ampm}`;
    }
    if (habit.target_time) return habit.target_time;
    if (habit.name?.toLowerCase().includes('water')) return 'All Day';
    return '09:00 AM';
  }, [reminder, habit.target_time, habit.name]);

  // Check if habit has custom progress bar (like Drink Water 1.8 / 3.0 Liters)
  const isWaterHabit =
    habit.progressText ||
    habit.progress !== undefined ||
    habit.name?.toLowerCase().includes('water');

  const targetMinutesInfo = useMemo(() => {
    if (habit.minutes) return { primary: habit.minutes, secondary: habit.description };
    if (habit.target) return { primary: habit.target, secondary: habit.description };
    if (habit.name === '1.5Hrs_English Practice') {
      return {
        primary: '90 / 90 mins',
        secondary: habit.description || 'Pronunciation & Editorial read',
      };
    }
    if (habit.name === 'Exercise') {
      return {
        primary: '0 / 45 min target',
        secondary: habit.description || 'Zone 2 Aerobic + Calisthenics',
      };
    }
    return null;
  }, [habit.minutes, habit.target, habit.name, habit.description]);

  return (
    <article
      data-category={categoryName}
      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#191c1f] hover:bg-slate-50 dark:hover:bg-[#1d2023] transition-all relative"
    >
      {/* Left: Checkbox + Title + Category + Subtitle */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Left Checkbox Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isCheckingIn}
          aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs shrink-0 transition-all cursor-pointer select-none active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isCompleted
              ? 'bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-950'
              : 'bg-slate-100 dark:bg-[#272a2d] hover:bg-slate-200 dark:hover:bg-[#323538] text-transparent hover:text-slate-400 dark:hover:text-slate-400'
          }`}
        >
          <Check
            className={`w-4 h-4 stroke-[2.8] ${
              isCompleted ? 'block' : 'opacity-0 group-hover:opacity-50'
            }`}
          />
        </button>

        {/* Text Container */}
        <div className="flex flex-col min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm sm:text-base font-medium truncate transition-colors ${
                isCompleted
                  ? 'line-through opacity-75 text-slate-400 dark:text-[#e1e2e7]'
                  : 'text-slate-900 dark:text-[#e1e2e7]'
              }`}
            >
              {habit.name}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#272a2d] text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide">
              {categoryName}
            </span>
          </div>

          {/* Subtitle variations */}
          {isWaterHabit ? (
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 h-1.5 bg-slate-200 dark:bg-[#323538] rounded-full overflow-hidden">
                <div
                  style={{ width: isCompleted ? '100%' : `${habit.progress || 60}%` }}
                  className="h-full bg-teal-400 dark:bg-emerald-400 transition-all duration-300"
                />
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {isCompleted ? '3.0 / 3.0 Liters' : (habit.progressText || '1.8 / 3.0 Liters')}
              </span>
            </div>
          ) : targetMinutesInfo ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                {targetMinutesInfo.primary}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-[#323538]" />
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {targetMinutesInfo.secondary}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {habit.description || `${currentStreak || 0} day streak`}
            </span>
          )}
        </div>
      </div>

      {/* Right: Schedule + Status Badge + Options */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Schedule Time */}
        <div
          className={`hidden sm:flex items-center gap-1 font-mono text-[11px] ${
            isCompleted
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-400 dark:text-slate-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5 stroke-[2]" />
          <span>{scheduleText}</span>
        </div>

        {/* Status Badge */}
        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-medium">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Done</span>
          </div>
        ) : isInProgress ? (
          <span className="px-2 sm:px-2.5 py-1 rounded bg-slate-100 dark:bg-[#272a2d] text-slate-500 dark:text-slate-400 font-mono text-[11px] font-medium">
            In progress
          </span>
        ) : (
          <span className="px-2 sm:px-2.5 py-1 rounded bg-slate-100 dark:bg-[#272a2d] text-slate-500 dark:text-slate-400 font-mono text-[11px] font-medium">
            Pending
          </span>
        )}

        {/* Subtle Options Menu */}
        {(onEdit || onDelete || onReminderClick) && (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu((prev) => !prev);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#272a2d] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
              title="Options"
              aria-label="Habit options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-7 z-50 w-44 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#191c1f] shadow-xl py-1 text-xs">
                  {onReminderClick && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onReminderClick(habit);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-[#e1e2e7] hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-[#272a2d] text-left transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-emerald-500 dark:text-[#5af0b3]" />
                      <span>{reminder?.enabled ? 'Edit Reminder' : 'Set Reminder'}</span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(habit);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-[#e1e2e7] hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-[#272a2d] text-left transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Habit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(habit);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 text-left transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(DashboardHabitRow);
