import { useEffect, useState, useRef, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Check,
  Flame,
  Zap,
  ArrowUpDown,
  AlignJustify,
  Quote,
  Trophy,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

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
import { getLeaderboard, subscribeToLeaderboard } from '../services/leaderboardService';
import { getGoals, calculateGoalStats } from '../services/goalService';
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
import { toggleTheme } from '../store/slices/uiSlice';
import { useCheckin } from '../hooks/useCheckin';
import { useLocalDate } from '../hooks/useLocalDate';
import { isActiveUser } from '../utils/auth/sessionGuard';
import {
  subscribeToPush,
  isPushSupported,
} from '../utils/notifications/pushSubscription';
import { requestNotificationPermission } from '../utils/notifications/notificationService';
import {
  scheduleNativeHabitReminder,
  cancelNativeHabitReminder,
  ensureNotificationChannel,
  syncAllNativeHabitReminders,
  isNativeApp,
} from '../utils/notifications/nativeReminderService';
import { checkAndNotifyStreakRisks } from '../utils/notifications/streakNotifier';
import { calculateHabitSummary } from '../utils/progress/calculateHabitSummary';

import DashboardHabitRow from '../components/dashboard/DashboardHabitRow';
import { getHabitCategory } from '../utils/habitCategoryUtils';
const EditHabitModal = lazy(() => import('../components/dashboard/EditHabitModal'));
const DeleteHabitDialog = lazy(() => import('../components/dashboard/DeleteHabitDialog'));
const ReminderModal = lazy(() => import('../components/dashboard/ReminderModal'));
import NotificationPermissionModal from '../components/notifications/NotificationPermissionModal';
import EmptyHabitsState from '../components/dashboard/EmptyHabitsState';
const CreateHabitModal = lazy(() => import('../components/dashboard/CreateHabitModal'));
import WeeklyRhythmCard from '../components/dashboard/WeeklyRhythmCard';
import NotificationBellPopover from '../components/common/NotificationBellPopover';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

// Default rituals matching the Stitch screenshots for immediate parity
const DEFAULT_RITUALS = [
  {
    id: 'demo-1',
    name: 'Demo_checking',
    category: 'General',
    description: 'Automated morning verification cycle',
    target_time: '08:15 AM',
    defaultStatus: 'completed',
    frequency: 'daily',
  },
  {
    id: 'demo-2',
    name: '1.5Hrs_English Practice',
    category: 'Learning',
    description: 'Pronunciation & Editorial read',
    minutes: '90 / 90 mins',
    target_time: '09:00 AM',
    defaultStatus: 'completed',
    frequency: 'daily',
  },
  {
    id: 'demo-3',
    name: 'Exercise',
    category: 'Health',
    description: 'Zone 2 Aerobic + Calisthenics',
    target: '0 / 45 min target',
    target_time: '05:00 PM',
    defaultStatus: 'pending',
    frequency: 'daily',
  },
  {
    id: 'demo-4',
    name: 'Read Book',
    category: 'Learning',
    description: 'Atomic Habits — Ch. 7: The Secret to Self-Control',
    target_time: '08:45 AM',
    defaultStatus: 'completed',
    frequency: 'daily',
  },
  {
    id: 'demo-5',
    name: 'Drink Water',
    category: 'Health',
    description: '1.8 / 3.0 Liters',
    progress: 60,
    progressText: '1.8 / 3.0 Liters',
    target_time: 'All Day',
    defaultStatus: 'in_progress',
    frequency: 'daily',
  },
];

const DAILY_AFFIRMATIONS = [
  'Consistency turns small steps into big results.',
  'You do not rise to the level of your goals. You fall to the level of your systems.',
  'Small daily improvements over time lead to stunning results.',
  'Discipline is choosing between what you want now and what you want most.',
  'Every action you take is a vote for the type of person you wish to become.',
  'Focus on who you want to become, not just what you want to achieve.',
  'The secret of your future is hidden in your daily routine.',
  'Success is the sum of small efforts, repeated day in and day out.',
  'Motivation gets you started. Habit is what keeps you going.',
  'Do something today that your future self will thank you for.',
  'Mastering yourself is true power.',
  'Don’t count the days, make the days count.',
  'Great things are done by a series of small things brought together.',
  'Clarity leads to focus, and focus leads to results.',
  'Energy flows where attention goes.',
  'Habits are the compound interest of self-improvement.',
  'Stay committed to your decisions, but flexible in your approach.',
  'Patience and persistence will bring you through.',
  'The best way to predict the future is to create it.',
  'Excellence is not an act, but a habit.',
  'One small positive thought in the morning can change your whole day.',
  'Your habits shape your identity, and your identity shapes your habits.',
  'Make each day your masterpiece.',
  'Progress, not perfection.',
  'Action is the foundational key to all success.',
  'Win the morning, win the day.',
  'Continuous improvement is better than delayed perfection.',
  'A river cuts through rock, not because of its power, but because of its persistence.',
  'Start where you are. Use what you have. Do what you can.',
  'Build streaks, break limits.',
  'Every day is a fresh opportunity to reinforce your discipline.',
];

const EMPTY_CHECKINS = Object.freeze([]);

const DashboardMobileHabitRow = memo(function DashboardMobileHabitRow({
  habit,
  checkins,
  todayDateStr,
  onCheckin,
}) {
  const cList = checkins || EMPTY_CHECKINS;
  const record = cList.find((c) => c.check_in_date === todayDateStr);
  const isDone = record?.status === 'completed';
  const categoryInfo = getHabitCategory(habit.name);
  const IconComponent = categoryInfo.icon;

  const handleToggle = () => {
    onCheckin(habit.id, isDone ? 'pending' : 'completed');
  };

  return (
    <div
      onClick={handleToggle}
      className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#141a1e] border border-slate-200/80 dark:border-white/[0.06] shadow-xs active:scale-[0.99] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Icon container */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isDone
              ? 'bg-emerald-500/10 dark:bg-[#0e2322] border border-emerald-500/30 dark:border-[#143d38] text-emerald-600 dark:text-[#00E599]'
              : 'bg-slate-100 dark:bg-[#181d22] border border-slate-200/80 dark:border-white/[0.06] text-slate-500 dark:text-slate-400'
          }`}
        >
          <IconComponent className="w-5 h-5 stroke-[2]" />
        </div>

        {/* Text container */}
        <div className="flex flex-col min-w-0 text-left">
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {habit.name}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {habit.category || categoryInfo.name}
          </span>
        </div>
      </div>

      {/* Right Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        aria-label={isDone ? 'Mark incomplete' : 'Mark completed'}
        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 cursor-pointer ${
          isDone
            ? 'bg-[#00E599] text-[#002114] shadow-sm'
            : 'border-2 border-slate-300 dark:border-white/20 bg-transparent hover:border-slate-400 dark:hover:border-white/40'
        }`}
      >
        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
      </button>
    </div>
  );
});

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: habits, checkinsByHabit, loading, initialized, checkinLoading, error } = useSelector(
    (state) => state.habits
  );
  const { handleCheckin } = useCheckin();
  const user = useSelector((state) => state.auth.user);
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';
  const userId = user?.id;

  // Explicit Dashboard UI State determination to prevent UI state flashing
  const isDashboardLoading = !initialized || loading;
  const isDashboardEmpty = initialized && !loading && !error && habits.length === 0;

  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Reminder state
  const [remindersMap, setRemindersMap] = useState({});
  const [reminderHabit, setReminderHabit] = useState(null);
  const hasAutoSubscribedRef = useRef(false);

  // Category filter state for Today's Habits (desktop)
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Interactive statuses for demo rituals when user has no custom habits yet
  const [demoStatuses, setDemoStatuses] = useState({
    'demo-1': 'completed',
    'demo-2': 'completed',
    'demo-3': 'pending',
    'demo-4': 'completed',
    'demo-5': 'in_progress',
  });

  // Real today date string (YYYY-MM-DD)
  const todayDateStr = useLocalDate();

  // Formatted date string for Desktop: "Saturday, September 20, 2026"
  const formattedTodayDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Formatted date string for Mobile: "Tuesday, Sep 22, 2026"
  const formattedMobileDate = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  // Personalized user display name
  const userName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName) return fullName.split(' ')[0];
    if (user?.email) {
      const raw = user.email.split('@')[0];
      const alphaOnly = raw.replace(/[0-9_.-]+$/, '');
      if (alphaOnly.toLowerCase().includes('khustar')) return 'Khustar';
      return alphaOnly ? alphaOnly.charAt(0).toUpperCase() + alphaOnly.slice(1) : 'Khustar';
    }
    return 'Khustar';
  }, [user]);

  // On mobile Home section, display at most 3 habits (from real user habits)
  const mobileDisplayHabits = useMemo(() => {
    return habits.slice(0, 3);
  }, [habits]);

  // Determine if user has habits or should use demo placeholders
  const isUsingDemo = habits.length === 0 && !isDashboardLoading;

  // Leaderboard preview state
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);

  // Live leaderboard fetcher (Dashboard only renders top 3)
  const fetchLeaderboardData = useCallback(async () => {
    try {
      const data = await getLeaderboard(5);
      if (Array.isArray(data)) {
        setLeaderboardUsers(data);
      }
    } catch (err) {
      console.warn('[Quitmark] Failed to fetch leaderboard:', err);
    }
  }, []);

  // Leaderboard display items (top 3 from live backend or fallback to demo)
  const leaderboardDisplayList = useMemo(() => {
    if (leaderboardUsers && leaderboardUsers.length > 0) {
      return leaderboardUsers.slice(0, 3).map((entry, idx) => {
        const parts = (entry.display_name || '').trim().split(/\s+/);
        let initial = 'U';
        if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
          initial = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts[0] && parts[0].length > 0) {
          initial = parts[0].slice(0, 2).toUpperCase();
        }

        const streakNum = Number(entry.current_streak) || 0;
        const isCurrentUser = Boolean(userId && entry.user_id === userId);
        const displayName = entry.display_name || (isCurrentUser ? (user?.user_metadata?.full_name || userName) : 'Anonymous');

        return {
          rank: idx + 1,
          initial,
          name: displayName,
          streak: `${streakNum}-day streak`,
          points: `${streakNum > 0 ? (streakNum * 170 + 40).toLocaleString() : '0'} pts`,
          isUser: isCurrentUser,
          userId: entry.user_id,
        };
      });
    }

    if (isUsingDemo) {
      return [
        { rank: 1, initial: 'SM', name: 'Sarah M.', streak: '21-day streak', points: '2,610 pts', isUser: false },
        { rank: 2, initial: 'K', name: userName, streak: '14-day streak', points: '2,420 pts', isUser: true },
        { rank: 3, initial: 'AL', name: 'Alexandre L.', streak: '18-day streak', points: '2,380 pts', isUser: false },
      ];
    }

    return [];
  }, [leaderboardUsers, userId, userName, user, isUsingDemo]);

  // Latest Goal state for featuring active cycle goal
  const [latestGoal, setLatestGoal] = useState(null);

  const latestGoalStats = useMemo(() => {
    if (!latestGoal) return null;
    return calculateGoalStats(latestGoal, habits, checkinsByHabit, todayDateStr);
  }, [latestGoal, habits, checkinsByHabit, todayDateStr]);

  const dailyAffirmation = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_AFFIRMATIONS[day % DAILY_AFFIRMATIONS.length];
  }, []);

  const containerRef = useRef(null);
  const requestIdRef = useRef(0);

  // Parallelized dashboard data loading
  const loadDashboardData = useCallback(async () => {
    if (!userId || !isActiveUser(userId)) return;
    const currentReq = ++requestIdRef.current;

    try {
      if (!initialized) {
        dispatch(setLoading(true));
      }
      dispatch(clearError());

      const [habitsRes, checkinsRes, remindersRes, leaderboardRes, goalsRes] = await Promise.allSettled([
        getHabits(),
        getAllUserCheckins(),
        getAllReminders(),
        getLeaderboard(5),
        userId ? getGoals(userId) : Promise.resolve([]),
      ]);

      if (currentReq !== requestIdRef.current) return;

      if (habitsRes.status === 'fulfilled') {
        dispatch(setHabits(habitsRes.value || []));
      } else {
        dispatch(setError(habitsRes.reason?.message || 'Failed to load habit data.'));
      }

      if (checkinsRes.status === 'fulfilled') {
        dispatch(setCheckins(checkinsRes.value || []));
      }

      if (remindersRes.status === 'fulfilled') {
        const rMap = {};
        for (const r of remindersRes.value || []) {
          rMap[r.habit_id] = r;
        }
        setRemindersMap(rMap);
      }

      if (leaderboardRes.status === 'fulfilled') {
        setLeaderboardUsers(leaderboardRes.value || []);
      }

      if (goalsRes.status === 'fulfilled' && Array.isArray(goalsRes.value)) {
        const userGoals = goalsRes.value;
        const activeGoals = userGoals.filter((g) => g.status === 'active' || !g.status);
        const latest = activeGoals[0] || userGoals[0] || null;
        setLatestGoal(latest);
      }
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load habit data.'));
    } finally {
      if (currentReq === requestIdRef.current) {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, userId, initialized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();

    const handleOnline = () => {
      void loadDashboardData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadDashboardData();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      requestIdRef.current += 1;
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadDashboardData]);

  // Real-time synchronization when local user checks in habits
  const isLeaderboardInitialMountRef = useRef(true);
  useEffect(() => {
    if (isLeaderboardInitialMountRef.current) {
      isLeaderboardInitialMountRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void fetchLeaderboardData();
    }, 700);

    return () => clearTimeout(timer);
  }, [checkinsByHabit, fetchLeaderboardData]);

  // Subscribe to real-time changes on habit_checkins table
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(() => {
      void fetchLeaderboardData();
    });
    return () => unsubscribe();
  }, [fetchLeaderboardData]);

  // Periodic polling fallback while tab is active (every 60s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchLeaderboardData();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchLeaderboardData]);

  const hasCheckedNotifications = useRef(false);

  // Trigger streak risk notifications
  useEffect(() => {
    if (!loading && habits.length > 0 && !hasCheckedNotifications.current) {
      void checkAndNotifyStreakRisks(habits, checkinsByHabit);
      hasCheckedNotifications.current = true;
    }
  }, [loading, habits, checkinsByHabit]);

  // Proactively ensure push subscription is registered in Supabase
  useEffect(() => {
    const autoSubscribeIfGranted = async () => {
      if (!isPushSupported()) return;
      if (Notification.permission !== 'granted') return;

      try {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (!reg?.active) return;
      } catch {
        return;
      }

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

  // Native Android notification setup
  useEffect(() => {
    if (isNativeApp()) {
      ensureNotificationChannel();
    }
  }, []);

  useEffect(() => {
    if (isNativeApp() && habits.length > 0) {
      syncAllNativeHabitReminders(habits, remindersMap, checkinsByHabit, { userId });
    }
  }, [habits, remindersMap, checkinsByHabit, userId]);

  // GSAP animation for smooth entry — dynamically imported to avoid blocking dashboard critical path
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !containerRef.current) return;

    let active = true;
    let ctx;

    import('gsap').then(({ default: gsap }) => {
      if (!active || !containerRef.current) return;

      ctx = gsap.context(() => {
        const items = containerRef.current?.querySelectorAll('.stitch-animate-item');
        if (items && items.length > 0) {
          gsap.from(items, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power2.out',
          });
        }
      }, containerRef);
    });

    return () => {
      active = false;
      ctx?.revert();
    };
  }, [loading]);

  const handleUpdateHabit = async (id, nameOrObj, maybeCategory) => {
    const name = typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj;
    const category = typeof nameOrObj === 'object' ? nameOrObj.category : maybeCategory;
    const updated = await updateHabit(id, name, category);
    dispatch(updateHabitInState(updated));

    const existingReminder = remindersMap[id];
    if (isNativeApp() && existingReminder?.enabled) {
      await scheduleNativeHabitReminder(
        id,
        updated.name,
        {
          enabled: true,
          reminderTime: existingReminder.reminder_time,
          repeatType: existingReminder.repeat_type,
          repeatDays: existingReminder.repeat_days,
        },
        { userId }
      );
    }
  };

  const handleDeleteHabit = async (id) => {
    await deleteHabit(id);
    dispatch(removeHabitFromState(id));
    if (isNativeApp()) {
      await cancelNativeHabitReminder(id);
    }
    setRemindersMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleReminderClick = (habit) => {
    setReminderHabit(habit);
  };

  const handleReminderSave = async (config) => {
    if (!reminderHabit) return;

    let notificationPermission = null;
    if (config.enabled && isPushSupported() && !isNativeApp()) {
      notificationPermission = await requestNotificationPermission();
    }

    const saved = await upsertReminder(reminderHabit.id, config);
    setRemindersMap((prev) => ({ ...prev, [reminderHabit.id]: saved }));

    if (isNativeApp()) {
      if (config.enabled) {
        await scheduleNativeHabitReminder(reminderHabit.id, reminderHabit.name, config, { userId });
      } else {
        await cancelNativeHabitReminder(reminderHabit.id);
      }
    } else if (config.enabled && notificationPermission === 'granted') {
      void (async () => {
        await subscribeToPush();
      })().catch((error) => {
        console.warn('[Quitmark] Push setup skipped:', error);
      });
    }
  };

  const handleCreateHabitSubmit = async (nameOrObj, maybeCategory) => {
    try {
      const name = typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj;
      const category = typeof nameOrObj === 'object' ? nameOrObj.category : maybeCategory;
      const newHabit = await createHabit(name, category);
      dispatch(addHabit(newHabit));
      setIsCreateOpen(false);
    } catch (err) {
      console.error('Failed to create habit:', err);
      dispatch(setError(err.message || 'Failed to create habit'));
      throw err;
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

  // Determine active habits list: custom habits if any exist, otherwise DEFAULT_RITUALS for visual parity
  const activeHabits = isUsingDemo ? DEFAULT_RITUALS : habits;

  // Handle demo checkin toggle
  const handleDemoCheckin = (habitId, nextStatus) => {
    setDemoStatuses((prev) => ({
      ...prev,
      [habitId]: nextStatus,
    }));
  };


  // Progress calculations for Today
  const { todayCompletedCount, totalHabitsCount, completionPercentage } = useMemo(() => {
    if (isUsingDemo) {
      let completed = 0;
      DEFAULT_RITUALS.forEach((r) => {
        if (demoStatuses[r.id] === 'completed') completed++;
      });
      return {
        todayCompletedCount: completed,
        totalHabitsCount: 5,
        completionPercentage: Math.round((completed / 5) * 100),
      };
    }

    const total = habits.length;
    if (total === 0) {
      return { todayCompletedCount: 0, totalHabitsCount: 0, completionPercentage: 0 };
    }

    let completed = 0;
    for (const habit of habits) {
      const cList = checkinsByHabit[habit.id] || [];
      const record = cList.find((c) => c.check_in_date === todayDateStr);
      if (record?.status === 'completed') {
        completed += 1;
      }
    }

    const pct = Math.round((completed / total) * 100);
    return {
      todayCompletedCount: completed,
      totalHabitsCount: total,
      completionPercentage: pct,
    };
  }, [isUsingDemo, demoStatuses, habits, checkinsByHabit, todayDateStr]);

  // Overall streak stats
  const streakStats = useMemo(() => {
    if (isUsingDemo) {
      return {
        currentStreak: 14,
        longestStreak: 21,
      };
    }

    let maxCurrent = 0;
    let maxLongest = 0;

    for (const habit of habits) {
      const cList = checkinsByHabit[habit.id] || [];
      const summary = calculateHabitSummary(cList, todayDateStr);
      if (summary.currentStreak > maxCurrent) {
        maxCurrent = summary.currentStreak;
      }
      if (summary.longestStreak > maxLongest) {
        maxLongest = summary.longestStreak;
      }
    }

    return {
      currentStreak: maxCurrent,
      longestStreak: maxLongest,
    };
  }, [isUsingDemo, habits, checkinsByHabit, todayDateStr]);

  // Filtered habits by Category (for desktop filter bar)
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'All') return activeHabits;
    return activeHabits.filter((h) => {
      const cat = h.category || getHabitCategory(h.name).name;
      return cat.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [activeHabits, selectedCategory]);

  // Circular progress SVG values (desktop)
  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius; // 263.89
  const ringOffset = ringCircumference - (completionPercentage / 100) * ringCircumference;
  const remainingCount = Math.max(0, totalHabitsCount - todayCompletedCount);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#111417] text-slate-900 dark:text-[#e1e2e7] selection:bg-emerald-500 selection:text-[#003825]"
    >
      {/* Automatic Notification Permission Modal */}
      <NotificationPermissionModal />

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="mx-4 sm:mx-8 mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm flex items-start justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearError())}
            className="text-xs font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE APPLICATION VIEW (< lg) — PHONE APP VIEW                          */}
      {/* ========================================================================= */}
      <div className="lg:hidden flex flex-col w-full px-4 pt-4 pb-4 text-slate-900 dark:text-[#e1e2e7]">
        {/* Greeting & Philosophy Quote */}
        <div className="flex flex-col text-left">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug flex items-center gap-2 whitespace-nowrap">
            <span>{greeting} {userName}!</span>
            <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm italic text-slate-500 dark:text-slate-400 mt-1">
            &ldquo;Discipline today, a better tomorrow.&rdquo;
          </p>
        </div>

        {isDashboardLoading ? (
          <DashboardSkeleton variant="mobile" />
        ) : isDashboardEmpty ? (
          <div className="mt-5">
            <EmptyHabitsState
              onCreateClick={() => setIsCreateOpen(true)}
              onAddPreset={handleCreateHabitSubmit}
            />
          </div>
        ) : (
          <>
            {/* Date Selector Row */}
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span>{formattedMobileDate}</span>
              </div>
              <span className="px-3 py-1 rounded-md bg-[#181d22] border border-white/[0.08] text-[11px] font-mono font-bold text-slate-300 tracking-wider uppercase">
                TODAY
              </span>
            </div>

            {/* Today's Progress Card */}
            <div className="rounded-2xl bg-white dark:bg-[#141a1e] border border-slate-200/80 dark:border-white/[0.08] p-4 sm:p-5 mt-4 shadow-sm flex items-center gap-3.5 sm:gap-4 transition-colors">
              {/* Circular Progress Gauge */}
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    className="stroke-slate-200 dark:stroke-[#1d252b]"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="31"
                    strokeWidth="6"
                  />
                  <circle
                    className="stroke-[#00E599] transition-all duration-700"
                    cx="40"
                    cy="40"
                    fill="transparent"
                    r="31"
                    strokeWidth="6"
                    strokeDasharray="194.78"
                    strokeDashoffset={194.78 - (completionPercentage / 100) * 194.78}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono select-none">
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                    {todayCompletedCount}
                  </span>
                  <span className="text-xs text-slate-400 font-normal leading-none">
                    /{totalHabitsCount}
                  </span>
                </div>
              </div>

              {/* Right Progress Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider leading-tight">
                      TODAY&apos;S PROGRESS
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">
                      {todayCompletedCount} of {totalHabitsCount} habits completed
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-600 dark:text-[#00E599] leading-tight shrink-0">
                    {completionPercentage}%
                  </span>
                </div>

                {/* Horizontal Bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#1c242a] overflow-hidden mt-3">
                  <div
                    style={{ width: `${completionPercentage}%` }}
                    className="h-full bg-[#00E599] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,229,153,0.35)]"
                  />
                </div>

                {/* Status Feedback */}
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-[#00E599] text-xs font-medium mt-2.5">
                  <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                  <span className="truncate">
                    {completionPercentage === 100
                      ? 'All habits completed! Amazing work!'
                      : completionPercentage > 0
                      ? "You're doing great! Keep going!"
                      : 'Start your day by checking in a habit!'}
                  </span>
                </div>
              </div>
            </div>

            {/* Today's Habits Section */}
            <div className="mt-6 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Today&apos;s Habits
                </h2>
                {habits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('/habits')}
                    className="text-xs font-semibold text-[#00E599] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <span>&rarr;</span>
                  </button>
                )}
              </div>

              {/* Habits Content / Empty State */}
              {habits.length === 0 ? (
                <EmptyHabitsState
                  onCreateClick={() => setIsCreateOpen(true)}
                  onAddPreset={handleCreateHabitSubmit}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {mobileDisplayHabits.map((habit) => (
                    <DashboardMobileHabitRow
                      key={habit.id}
                      habit={habit}
                      checkins={checkinsByHabit[habit.id] || EMPTY_CHECKINS}
                      todayDateStr={todayDateStr}
                      onCheckin={handleCheckin}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Rhythm 7-Day Momentum Card */}
            <WeeklyRhythmCard
              habits={habits}
              checkinsByHabit={checkinsByHabit}
              todayDateStr={todayDateStr}
              isUsingDemo={isUsingDemo}
              demoStatuses={demoStatuses}
              className="mt-4"
            />

            {/* Active Cycle Goal & Sprint Card */}
            {latestGoal ? (
              <Link
                to="/goals"
                className="block rounded-2xl bg-[#141a1e] border border-white/[0.06] p-4 mt-3 text-left shadow-sm active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-[#00E599]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-[#00E599] transition-colors">
                      {latestGoal.status === 'completed' ? 'Completed Goal' : 'Active Cycle Goal'}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#00E599] transition-all shrink-0" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#00E599]">
                    {latestGoalStats?.isCompleted && (latestGoalStats?.progressPercentage ?? 0) >= 100
                      ? '100% Complete'
                      : `Day ${Math.min(
                          (latestGoalStats?.daysElapsed ?? 0) + 1,
                          latestGoalStats?.totalDays || Number(latestGoal.duration_days) || 30
                        )} of ${latestGoalStats?.totalDays || Number(latestGoal.duration_days) || 30}`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white truncate">
                  {latestGoal.name}
                </p>
                <div className="w-full h-1.5 rounded-full bg-[#1f282e] overflow-hidden mt-2.5">
                  <div
                    style={{ width: `${Math.min(100, Math.max(0, latestGoalStats?.progressPercentage ?? 0))}%` }}
                    className="h-full bg-[#00E599] rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span>🔥</span> {latestGoalStats?.completedDaysCount ?? 0} days logged
                  </span>
                  <span>{latestGoalStats?.daysRemaining ?? 0} days remaining</span>
                </div>
              </Link>
            ) : isUsingDemo ? (
              <Link
                to="/goals"
                className="block rounded-2xl bg-[#141a1e] border border-white/[0.06] p-4 mt-3 text-left shadow-sm active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-[#00E599]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-[#00E599] transition-colors">
                      Active Cycle Goal
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#00E599] transition-all shrink-0" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#00E599]">Day 14 of 30</span>
                </div>
                <p className="text-sm font-semibold text-white">
                  Deep Work &amp; Wellness 30-Day Sprint
                </p>
                <div className="w-full h-1.5 rounded-full bg-[#1f282e] overflow-hidden mt-2.5">
                  <div
                    style={{ width: '46%' }}
                    className="h-full bg-[#00E599] rounded-full transition-all duration-500"
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span>🔥</span> 14-day streak active
                  </span>
                  <span>16 days remaining</span>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl bg-[#141a1e] border border-white/[0.06] p-4 mt-3 text-left shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-[#00E599]" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Active Cycle Goal
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">No active goal</span>
                </div>
                <p className="text-xs text-slate-400 leading-snug mb-3">
                  Set a 30 or 60-day sprint goal to supercharge your consistency.
                </p>
                <Link
                  to="/goals"
                  className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium bg-[#00E599]/10 hover:bg-[#00E599]/20 text-[#00E599] border border-[#00E599]/20 transition-all w-full"
                >
                  <span>+ Set a Goal</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Motivational Quote Card */}
            <div className="rounded-2xl bg-[#141a1e] border border-white/[0.06] p-4 text-center mt-3 mb-2">
              <p className="text-xs text-slate-400 italic leading-relaxed">
                &ldquo;{dailyAffirmation}&rdquo;
              </p>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (≥ lg) — UNTOUCHED & 100% PRESERVED FROM PREVIOUS STEP       */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex flex-col flex-1 min-w-0">
        {/* Fixed/Sticky Header (Exact Stitch Spec) */}
        <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-[#0b0e11]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.04] px-6 sm:px-8 flex items-center justify-between transition-colors shadow-xs">
          {/* Left: Greeting & Date */}
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-medium text-slate-900 dark:text-[#e1e2e7] leading-tight">
              {greeting} {userName}
            </span>
            <span className="text-xs text-slate-500 dark:text-[#85948b] leading-tight mt-0.5">
              {formattedTodayDate}
            </span>
          </div>

          {/* Right: Notification Bell, Theme Toggle, Profile / Settings */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Center */}
            <NotificationBellPopover
              triggerClassName="w-9 h-9 rounded-lg bg-slate-100 dark:bg-[#191c1f] hover:bg-slate-200 dark:hover:bg-[#272a2d] text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-[#e1e2e7] transition-colors flex items-center justify-center cursor-pointer"
            />

            {/* Theme Toggle Button (Night / Light Mode) */}
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

        {/* Main Workspace Body */}
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-12">
          <div className="flex flex-col gap-6 w-full max-w-[1240px] mx-auto">
            {isDashboardLoading ? (
              <DashboardSkeleton />
            ) : isDashboardEmpty ? (
              <EmptyHabitsState
                onCreateClick={() => setIsCreateOpen(true)}
                onAddPreset={handleCreateHabitSubmit}
              />
            ) : (
              <>
                {/* HERO / IN-PROGRESS MOMENTUM SECTION */}
                <section className="stitch-animate-item relative overflow-hidden rounded-xl bg-white dark:bg-[#191c1f] p-6 sm:p-8 shadow-xs border border-slate-200/80 dark:border-white/[0.04] transition-colors">
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/5 dark:bg-[#5af0b3]/5 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                {/* Left Info Cluster */}
                <div className="flex flex-col gap-2 max-w-xl text-left">
                  {/* Ritual Cadence Active Badge */}
                  <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-medium tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    <span>RITUAL CADENCE: ACTIVE</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-2xl sm:text-[28px] font-semibold text-slate-900 dark:text-[#e1e2e7] tracking-tight leading-snug">
                    Today&apos;s Momentum:{' '}
                    <span className="text-emerald-500 dark:text-[#5af0b3] font-semibold">
                      {todayCompletedCount} of {totalHabitsCount}
                    </span>{' '}
                    rituals fulfilled
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-slate-500 dark:text-[#85948b]">
                    Discipline today, quietly compounded tomorrow.
                  </p>

                  {/* Micro Stats Cluster */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-3 pt-1">
                    {/* Streak */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1d2023] flex items-center justify-center text-emerald-500 dark:text-[#5af0b3]">
                        <Flame className="w-4 h-4 fill-current" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-base font-semibold text-slate-900 dark:text-[#e1e2e7] leading-none">
                          {streakStats.currentStreak} Days
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#85948b] mt-1 leading-none">
                          Unbroken streak
                        </span>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-[#323538] hidden sm:block" />

                    {/* Focus Precision */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1d2023] flex items-center justify-center text-teal-400 dark:text-[#44e2cd]">
                        <Zap className="w-4 h-4 fill-current" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-mono text-base font-semibold text-slate-900 dark:text-[#e1e2e7] leading-none">
                          {completionPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-[#85948b] mt-1 leading-none">
                          Focus precision
                        </span>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-[#323538] hidden sm:block" />

                    {/* Status Caption */}
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium select-none pointer-events-none" role="status">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                      <span>You&apos;re doing great! Keep going!</span>
                    </div>
                  </div>
                </div>

                {/* Right: Metric Radial Gauge Box */}
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#1d2023] p-4 rounded-xl shrink-0 self-start lg:self-auto border border-slate-200/60 dark:border-transparent">
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-slate-200 dark:text-[#272a2d]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r={ringRadius}
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-emerald-500 dark:text-[#34d399] transition-all duration-700"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r={ringRadius}
                        stroke="currentColor"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-mono text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#e1e2e7] leading-none">
                        {completionPercentage}%
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#85948b] mt-1 leading-none font-medium">
                        {todayCompletedCount} / {totalHabitsCount} Done
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-[130px] text-left">
                    <span className="text-[11px] text-slate-400 dark:text-[#85948b] uppercase tracking-wider font-semibold">
                      Remaining
                    </span>
                    <span className="text-lg font-medium text-slate-900 dark:text-[#e1e2e7] leading-none mt-0.5">
                      {remainingCount} Rituals
                    </span>
                    <p className="text-xs text-slate-500 dark:text-[#85948b] mt-1 leading-snug">
                      Approx. {remainingCount * 32 || 65}m active focus time remaining.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* MAIN WORKSPACE GRID: HABITS (8-COL) + SIDEBAR (4-COL) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
              {/* Habits Board Main Column (8 Cols) */}
              <section className="stitch-animate-item lg:col-span-8 flex flex-col gap-3">
                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-100 dark:bg-[#0b0e11] rounded-xl border border-slate-200/80 dark:border-transparent">
                  {/* Category tabs */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {['All', 'Learning', 'Health', 'Mindfulness', 'General'].map((cat) => {
                      const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                      const count =
                        cat === 'All'
                          ? activeHabits.length
                          : activeHabits.filter(
                              (h) => (h.category || getHabitCategory(h.name).name).toLowerCase() === cat.toLowerCase()
                            ).length;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white dark:bg-[#1d2023] text-slate-900 dark:text-[#e1e2e7] shadow-sm'
                              : 'text-slate-500 dark:text-[#85948b] hover:text-slate-900 dark:hover:text-[#e1e2e7] hover:bg-white/60 dark:hover:bg-[#191c1f]'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span>{cat}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono leading-none ${
                                isActive
                                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-[#34d399]'
                                  : 'bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {count}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right controls: Chronological Sort & View Mode */}
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-[#85948b] self-end sm:self-auto">
                    <button
                      type="button"
                      title="Chronological Sort"
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#191c1f] hover:bg-slate-200 dark:hover:bg-[#1d2023] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Display Compact Mode"
                      className="w-8 h-8 rounded-lg bg-white dark:bg-[#191c1f] hover:bg-slate-200 dark:hover:bg-[#1d2023] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Habit Rows List */}
                <div className="flex flex-col gap-2.5">
                  {filteredHabits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-white dark:bg-[#191c1f] border border-dashed border-slate-200 dark:border-white/10 text-center">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        No habits in &ldquo;{selectedCategory}&rdquo; yet
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
                        Create or edit a habit and set its category to {selectedCategory} to see it here.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsCreateOpen(true)}
                        className="mt-3.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#34d399] border border-emerald-500/20 transition-all cursor-pointer"
                      >
                        + Create {selectedCategory !== 'All' ? selectedCategory : ''} Habit
                      </button>
                    </div>
                  ) : (
                    filteredHabits.map((habit) => (
                      <DashboardHabitRow
                        key={habit.id}
                        habit={habit}
                        checkins={checkinsByHabit[habit.id] || EMPTY_CHECKINS}
                        overrideCompleted={
                          isUsingDemo ? demoStatuses[habit.id] === 'completed' : undefined
                        }
                        onCheckin={
                          isUsingDemo ? handleDemoCheckin : handleCheckin
                        }
                        onEdit={setEditingHabit}
                        onDelete={setDeletingHabit}
                        isCheckingIn={Boolean(checkinLoading[habit.id])}
                        reminder={remindersMap[habit.id] || null}
                        onReminderClick={handleReminderClick}
                      />
                    ))
                  )}
                </div>
              </section>

              {/* Right Column Telemetry Widgets (4 Cols) */}
              <aside className="stitch-animate-item lg:col-span-4 flex flex-col gap-4">
                {/* 1. Weekly Rhythm Grid */}
                <WeeklyRhythmCard
                  habits={habits}
                  checkinsByHabit={checkinsByHabit}
                  todayDateStr={todayDateStr}
                  isUsingDemo={isUsingDemo}
                  demoStatuses={demoStatuses}
                />

                {/* 2. Leaderboard Pulse */}
                <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-[#191c1f] border border-slate-200/80 dark:border-white/[0.04] shadow-xs text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-400 dark:text-[#79edb9]" />
                      <span className="text-sm font-medium text-slate-900 dark:text-[#e1e2e7]">
                        Leaderboard Pulse
                      </span>
                    </div>
                    <Link
                      to="/leaderboard"
                      className="text-xs text-slate-400 dark:text-[#85948b] hover:text-emerald-500 dark:hover:text-[#5af0b3] transition-colors"
                    >
                      Cohort Alpha
                    </Link>
                  </div>

                  {/* Top 3 Ranks */}
                  <div className="flex flex-col gap-2">
                    {leaderboardDisplayList.length > 0 ? (
                      leaderboardDisplayList.map((entry) => (
                        <div
                          key={entry.userId || `${entry.rank}-${entry.name}`}
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            entry.isUser
                              ? 'bg-emerald-50/50 dark:bg-[#1d2023]'
                              : 'bg-slate-50 dark:bg-[#0b0e11]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`font-mono text-xs w-4 shrink-0 text-center ${
                                entry.isUser
                                  ? 'text-emerald-600 dark:text-[#5af0b3] font-bold'
                                  : 'text-slate-400 dark:text-[#85948b]'
                              }`}
                            >
                              {entry.rank}
                            </span>
                            <div
                              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                                entry.isUser
                                  ? 'bg-emerald-500 dark:bg-[#5af0b3] text-slate-950 dark:text-[#003825] font-bold'
                                  : 'bg-slate-200 dark:bg-[#272a2d] text-slate-600 dark:text-[#85948b]'
                              }`}
                            >
                              {entry.initial}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className={`text-xs font-medium leading-none truncate ${
                                    entry.isUser
                                      ? 'font-semibold text-slate-900 dark:text-[#e1e2e7]'
                                      : 'text-slate-900 dark:text-[#e1e2e7]'
                                  }`}
                                >
                                  {entry.name}
                                </span>
                                {entry.isUser && (
                                  <span className="shrink-0 px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-[#5af0b3] font-mono text-[9px] uppercase font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] mt-0.5 truncate ${
                                  entry.isUser
                                    ? 'text-emerald-600 dark:text-[#34d399]'
                                    : 'text-slate-400 dark:text-[#85948b]'
                                }`}
                              >
                                {entry.streak}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`shrink-0 ml-2 font-mono text-xs ${
                              entry.isUser
                                ? 'font-bold text-emerald-600 dark:text-[#5af0b3]'
                                : 'font-semibold text-slate-900 dark:text-[#e1e2e7]'
                            }`}
                          >
                            {entry.points}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-5 px-3 text-center rounded-lg bg-slate-50 dark:bg-[#0b0e11]">
                        <Trophy className="w-5 h-5 text-slate-300 dark:text-[#85948b] mb-1 opacity-60" />
                        <span className="text-xs font-medium text-slate-700 dark:text-[#e1e2e7]">
                          No active streaks yet
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-[#85948b] mt-0.5">
                          Complete habits to start the streak leaderboard!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Daily Affirmation & Active Cycle Goal */}
                <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#191c1f] border border-slate-200/80 dark:border-white/[0.04] p-4 shadow-xs text-left">
                  <div className="flex flex-col gap-3">
                    {/* Daily Affirmation Header */}
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-[#85948b]">
                      <Quote className="w-3.5 h-3.5 text-emerald-500 dark:text-[#5af0b3]" />
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Daily Affirmation
                      </span>
                    </div>

                    <blockquote className="text-sm text-slate-800 dark:text-[#e1e2e7] italic font-normal leading-relaxed">
                      &ldquo;{dailyAffirmation}&rdquo;
                    </blockquote>

                    {/* Active Cycle Goal */}
                    {latestGoal ? (
                      <Link
                        to="/goals"
                        className="group pt-2.5 border-t border-slate-100 dark:border-[#272a2d] flex flex-col gap-1.5 transition-colors hover:opacity-95 block"
                        title="Click to view and manage goals"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] transition-colors truncate">
                              {latestGoal.status === 'completed' ? 'Completed Goal' : 'Active Cycle Goal'}
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] transition-all shrink-0" />
                          </div>
                          <span className="font-mono text-xs text-emerald-500 dark:text-[#5af0b3] font-semibold shrink-0">
                            {latestGoalStats?.isCompleted && (latestGoalStats?.progressPercentage ?? 0) >= 100
                              ? '100% Complete'
                              : `Day ${Math.min(
                                  (latestGoalStats?.daysElapsed ?? 0) + 1,
                                  latestGoalStats?.totalDays || Number(latestGoal.duration_days) || 30
                                )} of ${latestGoalStats?.totalDays || Number(latestGoal.duration_days) || 30}`}
                          </span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#323538] overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 dark:bg-[#34d399] rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(0, latestGoalStats?.progressPercentage ?? 0))}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] mt-0.5">
                          <span className="text-slate-500 dark:text-[#85948b] group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors truncate pr-2 font-medium">
                            {latestGoal.name}
                          </span>
                          <span className="font-mono font-medium text-emerald-600 dark:text-[#34d399] shrink-0">
                            {latestGoalStats?.progressPercentage ?? 0}%
                          </span>
                        </div>
                      </Link>
                    ) : isUsingDemo ? (
                      <Link
                        to="/goals"
                        className="group pt-2.5 border-t border-slate-100 dark:border-[#272a2d] flex flex-col gap-1.5 transition-colors hover:opacity-95 block"
                        title="Click to explore and set goals"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] transition-colors">
                              Active Cycle Goal
                            </span>
                            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-500 dark:group-hover:text-[#5af0b3] transition-all shrink-0" />
                          </div>
                          <span className="font-mono text-xs text-emerald-500 dark:text-[#5af0b3] font-semibold">
                            Day 14 of 30
                          </span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-[#323538] overflow-hidden">
                          <div className="h-full bg-emerald-500 dark:bg-[#34d399] rounded-full w-[46%] transition-all duration-500" />
                        </div>

                        <div className="flex items-center justify-between text-[11px] mt-0.5">
                          <span className="text-slate-500 dark:text-[#85948b] group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors truncate">
                            Deep Work &amp; Wellness 30-Day Sprint
                          </span>
                          <span className="font-mono font-medium text-emerald-600 dark:text-[#34d399] shrink-0">
                            46%
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-[#272a2d] flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Active Cycle Goal
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">
                            No active goal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-[#85948b] leading-tight">
                          Set a 30 or 60-day sprint goal to supercharge your consistency.
                        </p>
                        <Link
                          to="/goals"
                          className="inline-flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-[#5af0b3] border border-emerald-500/20 transition-all group"
                        >
                          <span>+ Set a Goal</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <Suspense fallback={null}>
          <CreateHabitModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onCreate={handleCreateHabitSubmit}
            initialCategory={selectedCategory !== 'All' ? selectedCategory : 'General'}
          />
        </Suspense>
      )}
      {editingHabit && (
        <Suspense fallback={null}>
          <EditHabitModal
            key={editingHabit.id}
            habit={editingHabit}
            isOpen={Boolean(editingHabit)}
            onClose={() => setEditingHabit(null)}
            onUpdate={handleUpdateHabit}
          />
        </Suspense>
      )}

      {deletingHabit && (
        <Suspense fallback={null}>
          <DeleteHabitDialog
            key={deletingHabit.id}
            habit={deletingHabit}
            isOpen={Boolean(deletingHabit)}
            onClose={() => setDeletingHabit(null)}
            onDelete={handleDeleteHabit}
          />
        </Suspense>
      )}

      {reminderHabit && (
        <Suspense fallback={null}>
          <ReminderModal
            key={`reminder-${reminderHabit.id}`}
            isOpen={Boolean(reminderHabit)}
            onClose={() => setReminderHabit(null)}
            habitName={reminderHabit.name}
            reminder={remindersMap[reminderHabit.id] || null}
            onSave={handleReminderSave}
            onDelete={handleReminderDelete}
          />
        </Suspense>
      )}
    </div>
  );
}
