import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Check, X, Edit2, Trash2, RotateCcw, Loader2, Calendar, Bell, BellRing } from 'lucide-react';
import gsap from 'gsap';
import { calculateHabitSummary } from '../../utils/progress/calculateHabitSummary';
import { useLocalDate } from '../../hooks/useLocalDate';
import { getHabitCategory } from '../../utils/habitCategoryUtils';

/**
 * Formats a "HH:MM:SS" or "HH:MM" time string to 12h display.
 */
const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

function HabitCard({
  habit,
  checkins = [],
  onCheckin,
  onEdit,
  onDelete,
  isCheckingIn = false,
  reminder = null,
  onReminderClick,
}) {
  const [showStatusChange, setShowStatusChange] = useState(false);
  const todayDateStr = useLocalDate();

  // Find today's checkin if recorded
  const todayRecord = checkins.find((c) => c.check_in_date === todayDateStr);
  const todayStatus = todayRecord ? todayRecord.status : 'pending';

  // Compute live progress summary
  const summary = useMemo(
    () => calculateHabitSummary(checkins, todayDateStr),
    [checkins, todayDateStr]
  );
  const { currentStreak, longestStreak } = summary;
  const hasActiveStreak = currentStreak > 0;

  // Refs for GSAP micro-animations
  const streakRef = useRef(null);
  const prevStreakRef = useRef(currentStreak);
  const statusAreaRef = useRef(null);
  const prevStatusRef = useRef(todayStatus);

  // 1. Streak number micro-interaction
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    if (prevStreakRef.current !== currentStreak && streakRef.current) {
      const ctx = gsap.context(() => {
        if (currentStreak > prevStreakRef.current) {
          gsap.fromTo(
            streakRef.current,
            { scale: 1.18, color: '#34d399' },
            { scale: 1, color: '', duration: 0.35, ease: 'back.out(2)' }
          );
        } else {
          gsap.fromTo(
            streakRef.current,
            { opacity: 0.5, y: 1 },
            { opacity: 1, y: 0, duration: 0.25, ease: 'power1.out' }
          );
        }
      });
      prevStreakRef.current = currentStreak;
      return () => ctx.revert();
    }
  }, [currentStreak]);

  // 2. Status area transition
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    if (prevStatusRef.current !== todayStatus && statusAreaRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          statusAreaRef.current,
          { opacity: 0.6, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }
        );
      });
      prevStatusRef.current = todayStatus;
      return () => ctx.revert();
    }
  }, [todayStatus]);

  const handleMark = async (status) => {
    if (isCheckingIn) return;
    setShowStatusChange(false);
    await onCheckin(habit.id, status);
  };

  const hasReminder = reminder && reminder.enabled;

  return (
    <div
      className={`habit-card relative rounded-2xl border transition-all flex flex-col p-5 sm:p-6 h-full min-w-0 max-w-full overflow-hidden ${
        hasActiveStreak
          ? 'bg-white dark:bg-[#0D0F17] border-emerald-500/30 dark:border-emerald-500/20 shadow-sm dark:shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)] hover:border-emerald-500/50'
          : 'bg-white dark:bg-[#131722] border-zinc-200 dark:border-[#232936] hover:border-zinc-300 dark:hover:border-[#334155]'
      }`}
    >
      {/* Subtle top indicator bar for active streaks */}
      {hasActiveStreak && (
        <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full pointer-events-none" />
      )}

      {/* --- HIERARCHY 1: Habit Name & Category --- */}
      <div className="mb-4 flex items-start justify-between gap-2.5">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug break-words">
          {habit.name}
        </h2>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#272a2d] text-slate-500 dark:text-slate-400 text-[11px] font-medium tracking-wide shrink-0 mt-1">
          {habit.category || getHabitCategory(habit.name).name}
        </span>
      </div>

      {/* --- HIERARCHY 2: Current Streak (Unified baseline and centered alignment) --- */}
      <div className="mb-5 flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            hasActiveStreak
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/10'
              : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'
          }`}
        >
          <Flame
            className={`w-6 h-6 ${
              hasActiveStreak
                ? 'fill-emerald-500/30 text-emerald-500 animate-pulse'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-2 leading-none">
            <span
              ref={streakRef}
              className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100 tracking-tight"
            >
              {currentStreak}
            </span>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 lowercase">
              day streak
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
            Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      <div className="flex-grow" />

      {/* --- HIERARCHY 3: Today's check-in --- */}
      <div className="pt-4 border-t border-zinc-100 dark:border-[#232936] mb-4" ref={statusAreaRef}>
        {todayStatus === 'pending' || showStatusChange ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>Today's Check-in</span>
              {showStatusChange && (
                <button
                  type="button"
                  onClick={() => setShowStatusChange(false)}
                  className="hover:text-zinc-800 dark:hover:text-zinc-200 underline focus-visible:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 w-full min-w-0">
              <button
                type="button"
                onClick={() => handleMark('completed')}
                disabled={isCheckingIn}
                className="min-h-[42px] sm:min-h-[44px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-w-0"
              >
                {isCheckingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                )}
                <span className="truncate">Completed</span>
              </button>

              <button
                type="button"
                onClick={() => handleMark('missed')}
                disabled={isCheckingIn}
                className="min-h-[42px] sm:min-h-[44px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:bg-red-500/10 hover:text-red-600 dark:hover:border-red-500/30 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 min-w-0"
              >
                {isCheckingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <X className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">Missed</span>
              </button>

              {showStatusChange && todayStatus !== 'pending' && (
                <button
                  type="button"
                  onClick={() => handleMark('pending')}
                  disabled={isCheckingIn}
                  className="col-span-2 min-h-[42px] sm:min-h-[44px] inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-w-0"
                >
                  {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <RotateCcw className="w-4 h-4 shrink-0" />}
                  <span className="truncate">Pending</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[44px]">
            {todayStatus === 'completed' ? (
              <span className="flex-1 inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Done</span>
              </span>
            ) : (
              <span className="flex-1 inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold">
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Missed</span>
              </span>
            )}
            
            <button
              type="button"
              onClick={() => setShowStatusChange(true)}
              disabled={isCheckingIn}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 h-10 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-transparent hover:border-zinc-200 dark:hover:border-[#232936] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Change</span>
            </button>
          </div>
        )}
      </div>

      {/* --- HIERARCHY 4: Secondary actions (Adequate 12px touch spacing & accessible targets) --- */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <Link
            to={`/habits/${habit.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Progress</span>
          </Link>

          {/* Reminder Indicator */}
          {onReminderClick && (
            <button
              type="button"
              onClick={() => onReminderClick(habit)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                hasReminder
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title={hasReminder ? `Reminder set for ${formatTime12h(reminder.reminder_time)}. Click to edit.` : 'Set reminder'}
              aria-label={hasReminder ? `Reminder set for ${formatTime12h(reminder.reminder_time)}` : `Set reminder for ${habit.name}`}
            >
              {hasReminder ? (
                <>
                  <BellRing className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Remind</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    {formatTime12h(reminder.reminder_time)}
                  </span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Remind</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            aria-label={`Edit ${habit.name}`}
          >
            <Edit2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
            aria-label={`Delete ${habit.name}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(HabitCard);
