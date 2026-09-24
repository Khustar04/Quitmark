import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  Flame,
  Trophy,
  Check,
  X,
  BarChart2,
  MoreVertical,
  Trash2,
  Pencil,
  CheckCircle2,
} from 'lucide-react';
import { getGoalIcon } from '../../utils/goalIcons';
import { calculateGoalStats, formatGoalDateRange } from '../../services/goalService';
import { getHabitCategory } from '../../utils/habitCategoryUtils';
import { calculateHabitSummary } from '../../utils/progress/calculateHabitSummary';
import GoalEditModal from './GoalEditModal';

export default function GoalDetailView({
  goal,
  habits = [],
  checkinsByHabit = {},
  todayDateStr,
  onBack,
  onRequestDelete,
  onEditGoal,
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'habits' | 'timeline'
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const iconMeta = getGoalIcon(goal?.icon);
  const IconComponent = iconMeta.icon;

  const stats = useMemo(() => {
    return calculateGoalStats(goal, habits, checkinsByHabit, todayDateStr);
  }, [goal, habits, checkinsByHabit, todayDateStr]);

  const duration = Number(goal?.duration_days) || 60;
  const dateRange = formatGoalDateRange(goal?.start_date, goal?.target_date);

  // Linked habits data with streaks
  const linkedHabitsData = useMemo(() => {
    const ids = new Set(goal?.habit_ids || []);
    return habits
      .filter((h) => ids.has(h.id))
      .map((h) => {
        const cList = checkinsByHabit[h.id] || [];
        const summary = calculateHabitSummary(cList, todayDateStr);
        const cat = getHabitCategory(h.name, h.category);
        return {
          ...h,
          currentStreak: summary.currentStreak,
          longestStreak: summary.longestStreak,
          totalCompleted: summary.totalCompleted,
          categoryMeta: cat,
        };
      });
  }, [goal, habits, checkinsByHabit, todayDateStr]);
  const habitsCount = linkedHabitsData.length;

  const bestCurrentStreak = linkedHabitsData.reduce(
    (max, h) => Math.max(max, h.currentStreak || 0),
    0
  );
  const bestLongestStreak = linkedHabitsData.reduce(
    (max, h) => Math.max(max, h.longestStreak || 0),
    0
  );

  const handleDelete = () => {
    setMenuOpen(false);
    onRequestDelete(goal);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-in fade-in duration-300 text-left">
      {/* 1. Top Navigation Bar: Back Arrow & Options Menu */}
      <div className="flex items-center justify-between pb-4 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          aria-label="Back to Goals"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label="Options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-xl bg-white dark:bg-[#1e2329] border border-slate-200 dark:border-white/[0.1] shadow-xl z-20">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); setEditError(''); setIsEditing(true); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Goal</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-left transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Goal</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Goal Card (Matching Reference 8) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs mb-6">
        {/* Top: Icon + Active Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-[#5af0b3] shadow-md shadow-emerald-500/20">
            <IconComponent className="w-8 h-8 stroke-[2]" />
          </div>

          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-[#0d281e] text-[#5af0b3] border border-emerald-500/25">
            Active
          </span>
        </div>

        {/* Goal Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          {goal?.name}
        </h1>

        {/* Progress Bar & Percentage on the same line */}
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

        {/* Days Count */}
        <div className="text-xs text-slate-400 dark:text-[#85948b] mb-3">
          {stats?.completedDaysCount || 0} / {duration} days
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#85948b] mb-2.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-[#85948b]" />
          <span>{dateRange}</span>
        </div>

        {/* Connected Habits Count */}
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-[#85948b]">
          <Users className="w-3.5 h-3.5" />
          <span>{habitsCount} {habitsCount === 1 ? 'habit' : 'habits'} connected</span>
        </div>
      </div>

      {/* 3. Navigation Tabs (Pill style matching Reference 8) */}
      <div className="flex items-center gap-2.5 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-[#5af0b3] shadow-xs'
              : 'bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('habits')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'habits'
              ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-[#5af0b3] shadow-xs'
              : 'bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Habits ({linkedHabitsData.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-[#5af0b3] shadow-xs'
              : 'bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Timeline
        </button>
      </div>

      {/* 4. Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-5">
          {/* 4 Key Stat Cards (2x2 grid on mobile/tablet, 4 columns on desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Card 1: Current Streak */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#85948b]">
                  Current Streak
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {bestCurrentStreak} days
              </div>
            </div>

            {/* Card 2: Longest Streak */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#85948b]">
                  Longest Streak
                </span>
                <span className="w-6 h-6 rounded-full bg-yellow-500/15 text-yellow-400 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {bestLongestStreak} days
              </div>
            </div>

            {/* Card 3: Total Completed */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#85948b]">
                  Total Completed
                </span>
                <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.completedDaysCount || 0} days
              </div>
            </div>

            {/* Card 4: Total Missed */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-[#85948b]">
                  Total Missed
                </span>
                <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {stats?.totalMissedCount || 0} days
              </div>
            </div>
          </div>

          {/* Your Progress Section (Matching Reference 8) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 stroke-[2]" />
            </div>

            <div className="flex flex-col">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Your Progress
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85948b] mt-1 leading-relaxed">
                Complete your habits to see progress insights here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab Content: Habits */}
      {activeTab === 'habits' && (
        <div className="flex flex-col gap-3">
          {linkedHabitsData.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08]">
              <p className="text-sm text-slate-500 dark:text-[#85948b]">
                No connected habits linked to this goal.
              </p>
            </div>
          ) : (
            linkedHabitsData.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 dark:text-[#5af0b3] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {habit.name}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-[#85948b]">
                      {habit.category || 'General'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 dark:text-[#85948b]">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{habit.currentStreak || 0}d streak</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. Tab Content: Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Goal Timeline Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-slate-400 dark:text-[#85948b]">Start Date</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">
                {goal?.start_date || 'Day 1'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-slate-400 dark:text-[#85948b]">Target Date</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1">
                {goal?.target_date || 'Target'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-slate-400 dark:text-[#85948b]">Remaining Days</span>
              <p className="font-bold text-emerald-500 dark:text-[#5af0b3] mt-1">
                {stats?.daysRemaining || 0} days left
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditing && onEditGoal && (
        <GoalEditModal
          key={goal.id}
          goal={goal}
          habits={habits}
          onClose={() => setIsEditing(false)}
          error={editError}
          isSaving={isSavingEdit}
          onSave={async (updatedGoal) => {
            try {
              setIsSavingEdit(true);
              setEditError('');
              const saved = await onEditGoal(updatedGoal);
              if (saved) setIsEditing(false);
            } catch (error) {
              setEditError(error.message || 'Unable to save this goal.');
            } finally {
              setIsSavingEdit(false);
            }
          }}
        />
      )}
    </div>
  );
}
