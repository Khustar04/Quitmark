import { useState, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  MoreVertical,
  Calendar,
  Bell,
  BellRing,
  Edit2,
  Trash2,
  TrendingUp,
  BookOpen,
  Dumbbell,
  Droplet,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useLocalDate } from '../../hooks/useLocalDate';

/**
 * Maps a habit name or category to an appropriate icon, color, and label.
 */
function getHabitVisuals(habit) {
  const name = (habit?.name || '').toLowerCase();
  const cat = (habit?.category || '').toLowerCase();

  if (cat === 'learning' || name.includes('book') || name.includes('read') || name.includes('study') || name.includes('english') || name.includes('learn') || name.includes('code') || name.includes('dsa')) {
    return {
      category: 'Learning',
      icon: BookOpen,
      badgeClass: 'bg-sky-500/15 text-sky-500 dark:text-sky-400 border-sky-500/20',
    };
  }
  if (name.includes('water') || name.includes('drink') || name.includes('hydrate')) {
    return {
      category: 'Health',
      icon: Droplet,
      badgeClass: 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/20',
    };
  }
  if (cat === 'health' || name.includes('exercise') || name.includes('gym') || name.includes('workout') || name.includes('run') || name.includes('walk') || name.includes('fitness')) {
    return {
      category: 'Health',
      icon: Dumbbell,
      badgeClass: 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border-rose-500/20',
    };
  }
  if (cat === 'mindfulness' || name.includes('meditat') || name.includes('journal') || name.includes('breathe') || name.includes('pray')) {
    return {
      category: 'Mindfulness',
      icon: Sparkles,
      badgeClass: 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border-amber-500/20',
    };
  }
  return {
    category: habit?.category || 'General',
    icon: TrendingUp,
    badgeClass: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
  };
}

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

function HomeHabitRow({
  habit,
  checkins = [],
  onCheckin,
  onEdit,
  onDelete,
  isCheckingIn = false,
  reminder = null,
  onReminderClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const todayDateStr = useLocalDate();

  // Find today's checkin
  const todayRecord = checkins.find((c) => c.check_in_date === todayDateStr);
  const isCompleted = todayRecord?.status === 'completed';

  // Visual categorization
  const visuals = getHabitVisuals(habit);
  const IconComponent = visuals.icon;

  // Toggle checkin: if completed -> pending, if not completed -> completed
  const handleToggleCheckin = async () => {
    if (isCheckingIn) return;
    const nextStatus = isCompleted ? 'pending' : 'completed';
    await onCheckin(habit.id, nextStatus);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const hasReminder = reminder && reminder.enabled;

  return (
    <div className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#131722] hover:border-zinc-300 dark:hover:border-[#334155] transition-all shadow-sm">
      {/* Left: Icon & Habit Information */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-3">
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${visuals.badgeClass}`}
        >
          <IconComponent className="w-5 h-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white tracking-tight truncate">
            {habit.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {visuals.category}
            </span>
            {hasReminder && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
                <BellRing className="w-2.5 h-2.5" />
                <span>{formatTime12h(reminder.reminder_time)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Interactive Checkbox & Overflow Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Checkbox button */}
        <button
          type="button"
          onClick={handleToggleCheckin}
          disabled={isCheckingIn}
          aria-label={isCompleted ? `Mark ${habit.name} pending` : `Mark ${habit.name} completed`}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            isCompleted
              ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-100'
              : 'border-2 border-zinc-300 dark:border-zinc-700 bg-transparent hover:border-emerald-500/60 dark:hover:border-emerald-500/60 text-transparent hover:scale-105'
          } ${isCheckingIn ? 'opacity-60 cursor-wait' : 'cursor-pointer active:scale-95'}`}
        >
          {isCheckingIn ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : (
            <Check
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3] transition-transform ${
                isCompleted ? 'scale-100' : 'scale-0'
              }`}
            />
          )}
        </button>

        {/* Compact Overflow Menu (⋮) for Edit / Delete / Reminder / History */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="More habit actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <Link
                to={`/habits/${habit.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Progress</span>
              </Link>

              {onReminderClick && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onReminderClick(habit);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors text-left"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>{hasReminder ? 'Edit Reminder' : 'Set Reminder'}</span>
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(habit);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Edit Name</span>
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(habit);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Delete Habit</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(HomeHabitRow);
