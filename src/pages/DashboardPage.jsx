import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, AlertCircle, RefreshCw, Check, Flame, Activity } from 'lucide-react';
import gsap from 'gsap';
import { selectDashboardSummary } from '../store/selectors/habitSelectors';

import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getAllUserCheckins,
  upsertTodayCheckin,
} from '../services/habitService';
import {
  setHabits,
  addHabit,
  updateHabitInState,
  removeHabitFromState,
  setCheckins,
  setHabitCheckinOptimistic,
  revertHabitCheckin,
  setLoading,
  setCheckinLoading,
  setError,
  clearError,
} from '../store/slices/habitsSlice';
import { getLocalDateString, getLastNWeeksDays } from '../utils/streaks/dateUtils';
import { checkAndNotifyStreakRisks } from '../utils/notifications/streakNotifier';

import HabitCard from '../components/dashboard/HabitCard';
import CreateHabitModal from '../components/dashboard/CreateHabitModal';
import EditHabitModal from '../components/dashboard/EditHabitModal';
import DeleteHabitDialog from '../components/dashboard/DeleteHabitDialog';
import EmptyHabitsState from '../components/dashboard/EmptyHabitsState';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { items: habits, checkinsByHabit, loading, checkinLoading, error } = useSelector(
    (state) => state.habits
  );
  const dashboardSummary = useSelector(selectDashboardSummary);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);

  const containerRef = useRef(null);
  const headerRef = useRef(null);

  // Subtle formatted date string (e.g. Saturday, September 12, 2026)
  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate 7-day global activity grid
  const last7Days = getLastNWeeksDays(1).slice(-7);
  const globalActivity = last7Days.map((dateStr) => {
    // Check if any habit was completed on this date
    let anyCompleted = false;
    let anyMissed = false;
    
    Object.values(checkinsByHabit).forEach(checkins => {
      const record = checkins.find(c => c.check_in_date === dateStr);
      if (record?.status === 'completed') anyCompleted = true;
      if (record?.status === 'missed') anyMissed = true;
    });

    let status = 'none';
    if (anyCompleted) status = 'completed';
    else if (anyMissed) status = 'missed';
    else if (dateStr === getLocalDateString()) status = 'pending';
    else if (dateStr > getLocalDateString()) status = 'future';

    return { dateStr, status };
  });

  // Fetch habits and check-ins
  const loadHabitData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const [habitsData, checkinsData] = await Promise.all([
        getHabits(),
        getAllUserCheckins(),
      ]);
      dispatch(setHabits(habitsData));
      dispatch(setCheckins(checkinsData));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load habit data.'));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadHabitData();
  }, [loadHabitData]);

  // Trigger streak risk notifications after habits and checkins are loaded
  useEffect(() => {
    if (!loading && habits.length > 0) {
      checkAndNotifyStreakRisks(habits, checkinsByHabit);
    }
  }, [loading, habits, checkinsByHabit]);

  // GSAP animation for header entrance and habit cards stagger
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }

      if (habits.length > 0) {
        gsap.fromTo('.habit-card',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.08 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [habits.length]);

  // Habit creation handler
  const handleCreate = async (name) => {
    const newHabit = await createHabit(name);
    dispatch(addHabit(newHabit));
  };

  // Habit update handler
  const handleUpdate = async (id, name) => {
    const updated = await updateHabit(id, name);
    dispatch(updateHabitInState(updated));
  };

  // Habit deletion handler
  const handleDelete = async (id) => {
    await deleteHabit(id);
    dispatch(removeHabitFromState(id));
  };

  // Daily check-in handler with optimistic UI and graceful rollback
  const handleCheckin = async (habitId, status) => {
    const today = getLocalDateString();
    const previousCheckins = checkinsByHabit[habitId] ? [...checkinsByHabit[habitId]] : [];

    // 1. Optimistic Redux update
    dispatch(
      setHabitCheckinOptimistic({
        habitId,
        checkin: {
          habit_id: habitId,
          check_in_date: today,
          status,
        },
      })
    );
    dispatch(setCheckinLoading({ habitId, loading: true }));

    try {
      // 2. Commit to Supabase
      const saved = await upsertTodayCheckin(habitId, status);
      // Synchronize exact server payload
      dispatch(setHabitCheckinOptimistic({ habitId, checkin: saved }));
    } catch (err) {
      // 3. Rollback on failure
      dispatch(revertHabitCheckin({ habitId, previousCheckins }));
      dispatch(setError(err.message || 'Failed to record check-in. Rolled back.'));
    } finally {
      dispatch(setCheckinLoading({ habitId, loading: false }));
    }
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen flex flex-col">
      {/* 1. Header Section */}
      <div
        ref={headerRef}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 sm:pb-8 border-b border-zinc-200/80 dark:border-[#232936] mb-8"
      >
        <div>
          <p className="text-xs sm:text-sm font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            {formattedTodayDate}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Your Habits
          </h1>
          <p className="mt-1 text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            One day at a time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadHabitData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-[#334155] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Refresh habits"
            aria-label="Refresh habits"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-sm shadow-emerald-600/25 dark:shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-emerald-600/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Habit</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-sm flex items-start justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && habits.length === 0 ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-2xl border border-zinc-200/60 dark:border-[#232936] bg-zinc-100/60 dark:bg-[#0D0F17]/50 animate-pulse"
            />
          ))}
        </div>
      ) : habits.length === 0 ? (
        /* Empty State */
        <EmptyHabitsState onCreateClick={() => setIsCreateOpen(true)} />
      ) : (
        /* Habits Content with Overview Summary */
        <div className="space-y-8 flex-1">
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Highest Streak */}
            <div className="px-5 py-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
                <Flame className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Highest Streak</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {dashboardSummary.bestCurrentStreak}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">days</span>
              </div>
            </div>

            {/* Card 2: Total Check-ins / Completed */}
            <div className="px-5 py-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total Completed</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {dashboardSummary.totalCompleted}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">check-ins</span>
              </div>
            </div>

            {/* Card 3: 7-Day Activity Matrix (GitHub Style) */}
            <div className="px-5 py-4 rounded-2xl border border-zinc-200/80 dark:border-[#232936] bg-white dark:bg-[#0D0F17] shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider font-mono">Last 7 Days</span>
              </div>
              <div className="flex items-end gap-1.5 h-full">
                {globalActivity.map((day, i) => {
                  let colorClass = 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-[#232936]';
                  
                  if (day.status === 'completed') {
                    colorClass = 'bg-emerald-500 border border-emerald-400 shadow-sm';
                  } else if (day.status === 'missed') {
                    colorClass = 'bg-red-500/70 border border-red-500/80';
                  } else if (day.status === 'pending') {
                    colorClass = 'bg-emerald-500/10 border border-emerald-500/30';
                  }

                  return (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-sm ${colorClass}`}
                      title={day.dateStr}
                    />
                  );
                })}
              </div>
            </div>

          </div>

          {/* Habit List Toolbar */}
          <div className="flex items-center justify-between mt-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              My Habits
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-[#232936] text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {habits.length}
              </span>
            </h2>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {dashboardSummary.overallConsistency} consistency
            </div>
          </div>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                checkins={checkinsByHabit[habit.id] || []}
                onCheckin={handleCheckin}
                onEdit={(h) => setEditingHabit(h)}
                onDelete={(h) => setDeletingHabit(h)}
                isCheckingIn={Boolean(checkinLoading[habit.id])}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreateHabitModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}

      {editingHabit && (
        <EditHabitModal
          key={editingHabit.id}
          habit={editingHabit}
          isOpen={Boolean(editingHabit)}
          onClose={() => setEditingHabit(null)}
          onUpdate={handleUpdate}
        />
      )}

      {deletingHabit && (
        <DeleteHabitDialog
          key={deletingHabit.id}
          habit={deletingHabit}
          isOpen={Boolean(deletingHabit)}
          onClose={() => setDeletingHabit(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
