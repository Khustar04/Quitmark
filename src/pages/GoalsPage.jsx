import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Sun, Moon } from 'lucide-react';
import { useLocalDate } from '../hooks/useLocalDate';
import { getGoals, saveGoal, deleteGoal } from '../services/goalService';
import { getHabits, getAllUserCheckins } from '../services/habitService';
import { setHabits, setCheckins } from '../store/slices/habitsSlice';
import { toggleTheme } from '../store/slices/uiSlice';

import GoalsEmptyState from '../components/goals/GoalsEmptyState';
import GoalCreationFlow from '../components/goals/GoalCreationFlow';
import GoalsList from '../components/goals/GoalsList';
import GoalDetailView from '../components/goals/GoalDetailView';
import NotificationBellPopover from '../components/common/NotificationBellPopover';

export default function GoalsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const theme = useSelector((state) => state.ui?.theme);
  const isDark = theme === 'dark';
  const userId = user?.id;

  const { items: habits, checkinsByHabit, initialized } = useSelector((state) => state.habits);
  const todayDateStr = useLocalDate();

  const [goals, setGoals] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalPendingDeletion, setGoalPendingDeletion] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Sync goals when user changes
  useEffect(() => {
    let active = true;
    if (!userId) return () => { active = false; };
    void getGoals(userId).then((loadedGoals) => {
      if (active) setGoals(loadedGoals);
    });
    return () => { active = false; };
  }, [userId]);

  // Ensure habits and checkins are loaded in Redux if not already initialized
  useEffect(() => {
    if (!initialized && userId) {
      void Promise.allSettled([getHabits(), getAllUserCheckins()]).then(([hRes, cRes]) => {
        if (hRes.status === 'fulfilled' && Array.isArray(hRes.value)) {
          dispatch(setHabits(hRes.value));
        }
        if (cRes.status === 'fulfilled' && Array.isArray(cRes.value)) {
          dispatch(setCheckins(cRes.value));
        }
      });
    }
  }, [initialized, userId, dispatch]);

  // Handlers
  const handleOpenCreate = () => {
    setViewMode('create');
  };

  const handleCloseCreate = () => {
    setViewMode(goals.length > 0 ? 'list' : 'empty');
  };

  const handleGoalCreated = (newGoal) => {
    setGoals((prev) => [newGoal, ...prev.filter((g) => g.id !== newGoal.id)]);
    setSelectedGoal(newGoal);
  };

  const handleSelectGoal = (goal) => {
    setSelectedGoal(goal);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedGoal(null);
    setViewMode(goals.length > 0 ? 'list' : 'empty');
  };

  const handleUpdateGoal = async (updatedGoal) => {
    // Instant optimistic update (0ms perceived latency)
    setGoals((previous) => previous.map((goal) => (goal.id === updatedGoal.id ? { ...goal, ...updatedGoal } : goal)));
    setSelectedGoal(updatedGoal);

    try {
      const saved = await saveGoal(updatedGoal, userId);
      setGoals((previous) => previous.map((goal) => (goal.id === saved.id ? saved : goal)));
      setSelectedGoal(saved);
      return saved;
    } catch (err) {
      console.error('Failed to update goal in background:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userId || !goalPendingDeletion) return;
    const goalId = goalPendingDeletion.id;
    const prevGoals = goals;
    const nextGoals = goals.filter((goal) => goal.id !== goalId);

    // Instant optimistic removal (0ms perceived latency)
    setGoals(nextGoals);
    setGoalPendingDeletion(null);
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(null);
      setViewMode(nextGoals.length > 0 ? 'list' : 'empty');
    }

    try {
      const ok = await deleteGoal(goalId, userId);
      if (!ok) {
        setGoals(prevGoals);
        setDeleteError('Unable to delete this goal. Please try again.');
      }
    } catch {
      setGoals(prevGoals);
      setDeleteError('Unable to delete this goal. Please try again.');
    }
  };

  // Derive active view
  const currentView = useMemo(() => {
    if (viewMode === 'create') return 'create';
    if (viewMode === 'detail' && selectedGoal) return 'detail';
    if (goals.length === 0) return 'empty';
    return 'list';
  }, [viewMode, selectedGoal, goals.length]);

  return (
    <div className="min-h-full w-full bg-slate-50 dark:bg-[#111417] text-slate-900 dark:text-[#e1e2e7] transition-colors flex flex-col">
      {/* Desktop Sticky Header (Exact match with DashboardPage) */}
      <header className="hidden lg:flex sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#0b0e11]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.04] px-6 sm:px-8 items-center justify-between transition-colors shadow-xs">
        {/* Left: Section Title / Greeting */}
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-lg font-medium text-slate-900 dark:text-[#e1e2e7] leading-tight">
            {viewMode === 'create'
              ? 'Create New Goal'
              : viewMode === 'detail'
              ? selectedGoal?.name || 'Goal Details'
              : 'Goals & Milestones'}
          </span>
          <span className="text-xs text-slate-500 dark:text-[#85948b] leading-tight mt-0.5">
            Turn your daily habits into long-term achievements
          </span>
        </div>

        {/* Right: Notification Bell, Theme Toggle */}
        <div className="flex items-center gap-3">
          <NotificationBellPopover
            triggerClassName="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#191c1f] hover:bg-slate-200 dark:hover:bg-[#272a2d] text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-[#e1e2e7] transition-colors flex items-center justify-center cursor-pointer"
          />

          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#191c1f] hover:bg-slate-200 dark:hover:bg-[#272a2d] text-slate-600 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-[#e1e2e7] transition-colors flex items-center justify-center cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 stroke-[2]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-1 w-full">
        {currentView === 'empty' && (
          <GoalsEmptyState onCreateGoal={handleOpenCreate} />
        )}

        {currentView === 'create' && (
          <GoalCreationFlow
            habits={habits}
            userId={userId}
            onClose={handleCloseCreate}
            onGoalCreated={handleGoalCreated}
            onViewGoal={handleSelectGoal}
          />
        )}

      {currentView === 'list' && (
        <GoalsList
          goals={goals}
          habits={habits}
          checkinsByHabit={checkinsByHabit}
          todayDateStr={todayDateStr}
          onCreateGoal={handleOpenCreate}
          onSelectGoal={handleSelectGoal}
          onRequestDelete={setGoalPendingDeletion}
        />
      )}

      {currentView === 'detail' && selectedGoal && (
        <GoalDetailView
          goal={selectedGoal}
          habits={habits}
          checkinsByHabit={checkinsByHabit}
          todayDateStr={todayDateStr}
          onBack={handleBackToList}
          onRequestDelete={setGoalPendingDeletion}
          onEditGoal={handleUpdateGoal}
        />
      )}
      </div>

      {goalPendingDeletion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-white/[0.1] dark:bg-[#161a1f]" role="dialog" aria-modal="true" aria-labelledby="delete-goal-title">
            <h2 id="delete-goal-title" className="text-lg font-bold text-slate-900 dark:text-white">Delete goal?</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">This will permanently delete “{goalPendingDeletion.name}”. Your habits and check-in history will not be deleted.</p>
            {deleteError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{deleteError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => { setGoalPendingDeletion(null); setDeleteError(''); }} className="goal-button-secondary">Cancel</button>
              <button type="button" onClick={handleConfirmDelete} className="goal-button-danger">Delete Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
