import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, AlertCircle, RefreshCw, Bell, X } from 'lucide-react';
import gsap from 'gsap';
import { selectDashboardSummary } from '../store/selectors/habitSelectors';
import DashboardSummaryCards from '../components/dashboard/DashboardSummaryCards';

import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getAllUserCheckins,
} from '../services/habitService';
import {
  getAllReminders,
  upsertReminder,
  deleteReminder as deleteReminderApi,
} from '../services/reminderService';
import {
  setHabits,
  addHabit,
  updateHabitInState,
  removeHabitFromState,
  setCheckins,
  setLoading,
  setError,
  clearError,
} from '../store/slices/habitsSlice';
import { useLocalDate } from '../hooks/useLocalDate';
import { getLastNWeeksDays } from '../utils/streaks/dateUtils';
import { useCheckin } from '../hooks/useCheckin';
import { checkAndNotifyStreakRisks } from '../utils/notifications/streakNotifier';
import { isActiveUser } from '../utils/auth/sessionGuard';
import { subscribeToPush, isPushSupported } from '../utils/notifications/pushSubscription';
import { requestNotificationPermission } from '../utils/notifications/notificationService';
import {
  scheduleNativeHabitReminder,
  cancelNativeHabitReminder,
  syncAllNativeHabitReminders,
  ensureNotificationChannel,
  requestNativeNotificationPermission,
  isNativeApp,
} from '../utils/notifications/nativeReminderService';

import HabitCard from '../components/dashboard/HabitCard';
import CreateHabitModal from '../components/dashboard/CreateHabitModal';
import EditHabitModal from '../components/dashboard/EditHabitModal';
import DeleteHabitDialog from '../components/dashboard/DeleteHabitDialog';
import EmptyHabitsState from '../components/dashboard/EmptyHabitsState';
import ReminderModal from '../components/dashboard/ReminderModal';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { items: habits, checkinsByHabit, loading, checkinLoading, error } = useSelector(
    (state) => state.habits
  );
  const userId = useSelector((state) => state.auth.user?.id);
  const dashboardSummary = useSelector(selectDashboardSummary);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  
  // Reminder state
  const [remindersMap, setRemindersMap] = useState({}); // { [habitId]: reminderObj }
  const [reminderHabit, setReminderHabit] = useState(null); // habit being configured
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const hasAutoSubscribedRef = useRef(false);
  
  const { handleCheckin } = useCheckin();

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Subtle formatted date string (e.g. Saturday, September 12, 2026)
  const formattedTodayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate 7-day global activity grid
  const todayDateStr = useLocalDate();
  const last7Days = useMemo(() => getLastNWeeksDays(1).slice(-7), []);
  const globalActivity = useMemo(() => {
    return last7Days.map((dateStr) => {
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
      else if (dateStr === todayDateStr) status = 'pending';
      else if (dateStr > todayDateStr) status = 'future';

      return { dateStr, status };
    });
  }, [last7Days, checkinsByHabit, todayDateStr]);

  // Fetch habits, check-ins, and reminders
  const loadHabitData = useCallback(async () => {
    if (!userId) return;
    if (!isActiveUser(userId)) return;
    const requestId = ++requestIdRef.current;
    try {
      if (!isActiveUser(userId)) return;
      dispatch(setLoading(true));
      dispatch(clearError());
      const [habitsData, checkinsData] = await Promise.all([
        getHabits(),
        getAllUserCheckins(),
      ]);
      if (requestId !== requestIdRef.current || !isActiveUser(userId)) return;
      dispatch(setHabits(habitsData));
      dispatch(setCheckins(checkinsData));
    } catch (err) {
      if (requestId !== requestIdRef.current || !isActiveUser(userId)) return;
      dispatch(setError(err.message || 'Failed to load habit data.'));
    } finally {
      if (requestId === requestIdRef.current && isActiveUser(userId)) {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, userId]);

  // Load reminders separately (not in useEffect to satisfy lint)
  const loadReminders = useCallback(async () => {
    if (!userId) return;
    try {
      const remindersData = await getAllReminders();
      const rMap = {};
      for (const r of remindersData) {
        rMap[r.habit_id] = r;
      }
      setRemindersMap(rMap);
    } catch (err) {
      console.warn('[Quitmark] Failed to load reminders:', err);
      // Reminders are non-critical — silently fail
    }
  }, [userId]);

  useEffect(() => {
    loadHabitData();
    // Load reminders asynchronously to avoid triggering set-state-in-effect lint
    queueMicrotask(() => loadReminders());

    const retryReminders = () => queueMicrotask(() => loadReminders());
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') retryReminders();
    };

    window.addEventListener('online', retryReminders);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      requestIdRef.current += 1;
      window.removeEventListener('online', retryReminders);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadHabitData, loadReminders]);

  const hasCheckedNotifications = useRef(false);

  // Trigger streak risk notifications after habits and checkins are loaded
  useEffect(() => {
    if (!loading && habits.length > 0 && !hasCheckedNotifications.current) {
      void checkAndNotifyStreakRisks(habits, checkinsByHabit);
      hasCheckedNotifications.current = true;
    }
  }, [loading, habits, checkinsByHabit]);

  // Proactively ensure push subscription is registered in Supabase
  // if reminders are active and permission is already granted on this device
  useEffect(() => {
    const autoSubscribeIfGranted = async () => {
      if (!isPushSupported()) return;
      if (Notification.permission !== 'granted') return;

      const hasActive = Object.values(remindersMap).some((r) => r?.enabled);
      if (!hasActive) return;

      if (hasAutoSubscribedRef.current) return;
      hasAutoSubscribedRef.current = true;

      try {
        await subscribeToPush();
      } catch (err) {
        console.warn('[Quitmark] Auto-subscription check skipped:', err);
      }
    };

    autoSubscribeIfGranted();
  }, [remindersMap]);

  // On native Android app: ensure notification channel is registered and request permission on startup
  useEffect(() => {
    if (isNativeApp()) {
      ensureNotificationChannel();
      requestNativeNotificationPermission();
    }
  }, []);

  // Sync all habit reminders with native Android alarms when habits or reminders change
  useEffect(() => {
    if (isNativeApp() && habits.length > 0) {
      syncAllNativeHabitReminders(habits, remindersMap);
    }
  }, [habits, remindersMap]);

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

    const existingReminder = remindersMap[id];
    if (isNativeApp() && existingReminder?.enabled) {
      await scheduleNativeHabitReminder(id, updated.name, {
        enabled: true,
        reminderTime: existingReminder.reminder_time,
        repeatType: existingReminder.repeat_type,
        repeatDays: existingReminder.repeat_days,
      });
    }
  };

  const handleDelete = async (id) => {
    await deleteHabit(id);
    dispatch(removeHabitFromState(id));
    if (isNativeApp()) {
      await cancelNativeHabitReminder(id);
    }
    // Also clean up local reminder state
    setRemindersMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Reminder handlers
  const handleReminderClick = (habit) => {
    setReminderHabit(habit);
  };

  const handleReminderSave = async (config) => {
    if (!reminderHabit) return;

    // Request permission while this handler is still running from the user's
    // Save click. Browsers can reject permission prompts started after an
    // unrelated awaited request has completed.
    let notificationPermission = null;
    if (config.enabled && isPushSupported() && !isNativeApp()) {
      notificationPermission = await requestNotificationPermission();
    }

    // Save the reminder before attempting browser push setup. Push is an
    // optional delivery enhancement and must not block the database write.
    const saved = await upsertReminder(reminderHabit.id, config);
    setRemindersMap((prev) => ({ ...prev, [reminderHabit.id]: saved }));

    // On native mobile app, schedule direct OS AlarmManager notification
    if (isNativeApp()) {
      if (config.enabled) {
        await scheduleNativeHabitReminder(reminderHabit.id, reminderHabit.name, config);
      } else {
        await cancelNativeHabitReminder(reminderHabit.id);
      }
    } else if (config.enabled && notificationPermission === 'granted') {
      // Request permission + create a push subscription in the background (web/PWA)
      void (async () => {
        await subscribeToPush();
      })().catch((error) => {
        console.warn('[Quitmark] Push setup skipped:', error);
      });
    }
  };

  const handleReminderDelete = async () => {
    if (!reminderHabit) return;
    await deleteReminderApi(reminderHabit.id);
    if (isNativeApp()) {
      await cancelNativeHabitReminder(reminderHabit.id);
    }
    setRemindersMap((prev) => {
      const next = { ...prev };
      delete next[reminderHabit.id];
      return next;
    });
  };

  const handleEnableNotifications = async () => {
    setIsSubscribingPush(true);
    try {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (err) {
      console.error('[Quitmark] Failed to enable push notifications:', err);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const hasActiveReminders = Object.values(remindersMap).some((r) => r?.enabled);
  const showNotificationBanner =
    !isBannerDismissed &&
    !isNativeApp() &&
    isPushSupported() &&
    notificationPermission === 'default' &&
    hasActiveReminders;

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen flex flex-col">
      {/* Push Notification Device Enable Banner */}
      {showNotificationBanner && (
        <div
          role="status"
          className="mb-6 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Enable notifications on this device to receive your habit reminders.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isSubscribingPush}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-emerald-600/25 hover:shadow-emerald-600/35 active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {isSubscribingPush ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Enabling...</span>
                </>
              ) : (
                'Enable'
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              title="Dismiss"
              aria-label="Dismiss notification banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
      {loading ? (
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
          <DashboardSummaryCards 
            dashboardSummary={dashboardSummary} 
            globalActivity={globalActivity} 
          />

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
                reminder={remindersMap[habit.id] || null}
                onReminderClick={handleReminderClick}
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

      {reminderHabit && (
        <ReminderModal
          key={`reminder-${reminderHabit.id}`}
          isOpen={Boolean(reminderHabit)}
          onClose={() => setReminderHabit(null)}
          habitName={reminderHabit.name}
          reminder={remindersMap[reminderHabit.id] || null}
          onSave={handleReminderSave}
          onDelete={handleReminderDelete}
        />
      )}
    </div>
  );
}
