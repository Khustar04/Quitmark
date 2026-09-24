import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, AlertCircle } from 'lucide-react';

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
  replaceTempHabitId,
  setCheckins,
  setLoading,
  setError,
  clearError,
} from '../store/slices/habitsSlice';
import { useCheckin } from '../hooks/useCheckin';
import { isActiveUser } from '../utils/auth/sessionGuard';
import { subscribeToPush, isPushSupported } from '../utils/notifications/pushSubscription';
import { requestNotificationPermission } from '../utils/notifications/notificationService';
import {
  scheduleNativeHabitReminder,
  cancelNativeHabitReminder,
  isNativeApp,
} from '../utils/notifications/nativeReminderService';

import HabitCard from '../components/dashboard/HabitCard';
import CreateHabitModal from '../components/dashboard/CreateHabitModal';
import EditHabitModal from '../components/dashboard/EditHabitModal';
import DeleteHabitDialog from '../components/dashboard/DeleteHabitDialog';
import ReminderModal from '../components/dashboard/ReminderModal';
import EmptyHabitsState from '../components/dashboard/EmptyHabitsState';
import HabitCardSkeleton from '../components/skeletons/HabitCardSkeleton';

const EMPTY_CHECKINS = Object.freeze([]);

export default function HabitsPage() {
  const dispatch = useDispatch();
  const { items: habits, checkinsByHabit, loading, initialized, checkinLoading, error } = useSelector(
    (state) => state.habits
  );
  const user = useSelector((state) => state.auth.user);
  const userId = user?.id;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deletingHabit, setDeletingHabit] = useState(null);

  // Reminders map
  const [remindersMap, setRemindersMap] = useState({});
  const [reminderHabit, setReminderHabit] = useState(null);

  const { handleCheckin } = useCheckin();

  const loadData = useCallback(async () => {
    if (!userId || !isActiveUser(userId)) return;
    try {
      if (!initialized) {
        dispatch(setLoading(true));
      }
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
  }, [dispatch, userId, initialized]);

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
    }
  }, [userId]);

  useEffect(() => {
    loadData();
    queueMicrotask(() => loadReminders());
  }, [loadData, loadReminders]);

  const handleCreate = async (nameOrObj, maybeCategory) => {
    const name = typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj;
    const category = typeof nameOrObj === 'object' ? nameOrObj.category : maybeCategory;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const tempHabit = {
      id: tempId,
      name,
      category: category || 'General',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Instant optimistic addition & close modal (0ms perceived latency)
    dispatch(addHabit(tempHabit));
    setIsCreateOpen(false);

    try {
      const newHabit = await createHabit(name, category);
      dispatch(replaceTempHabitId({ tempId, habit: newHabit }));
    } catch (err) {
      console.error('Failed to create habit in background:', err);
      dispatch(removeHabitFromState(tempId));
      dispatch(setError(err.message || 'Failed to create habit.'));
    }
  };

  const handleUpdate = async (id, nameOrObj, maybeCategory) => {
    const name = typeof nameOrObj === 'object' ? nameOrObj.name : nameOrObj;
    const category = typeof nameOrObj === 'object' ? nameOrObj.category : maybeCategory;
    const previousHabit = habits.find((h) => h.id === id);

    // Instant optimistic update (0ms perceived latency)
    dispatch(updateHabitInState({ id, name, category, updated_at: new Date().toISOString() }));
    setEditingHabit(null);

    try {
      const updated = await updateHabit(id, name, category);
      dispatch(updateHabitInState(updated));

      const existingReminder = remindersMap[id];
      if (isNativeApp() && existingReminder?.enabled) {
        scheduleNativeHabitReminder(
          id,
          updated.name,
          {
            enabled: true,
            reminderTime: existingReminder.reminder_time,
            repeatType: existingReminder.repeat_type,
            repeatDays: existingReminder.repeat_days,
          },
          { userId }
        ).catch((err) => console.warn('[Quitmark] Failed to update reminder:', err));
      }
    } catch (err) {
      console.error('Failed to update habit in background:', err);
      if (previousHabit) {
        dispatch(updateHabitInState(previousHabit));
      }
      dispatch(setError(err.message || 'Failed to update habit.'));
    }
  };

  const handleDelete = async (id) => {
    const habitToDelete = habits.find((h) => h.id === id);
    const prevReminder = remindersMap[id];

    // Instant optimistic removal (0ms perceived latency)
    dispatch(removeHabitFromState(id));
    setDeletingHabit(null);
    setRemindersMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (isNativeApp()) {
      cancelNativeHabitReminder(id).catch(() => {});
    }

    try {
      await deleteHabit(id);
    } catch (err) {
      console.error('Failed to delete habit in background:', err);
      if (habitToDelete) {
        dispatch(addHabit(habitToDelete));
      }
      if (prevReminder) {
        setRemindersMap((prev) => ({ ...prev, [id]: prevReminder }));
      }
      dispatch(setError(err.message || 'Failed to delete habit.'));
    }
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-16 min-h-screen flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Header: Title & "+ Create Habit" button */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Habits
        </h1>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-sm shadow-emerald-600/25 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-sm flex items-start justify-between gap-3 shadow-sm"
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

      {/* Habits Content */}
      {!initialized || (loading && habits.length === 0) ? (
        <div aria-busy="true" aria-label="Loading habits" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <HabitCardSkeleton key={index} />
          ))}
        </div>
      ) : !error && habits.length === 0 ? (
        <EmptyHabitsState
          showHero={false}
          onCreateClick={() => setIsCreateOpen(true)}
          onAddPreset={handleCreate}
        />
      ) : (
        /* Habit Cards Grid ONLY */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              checkins={checkinsByHabit[habit.id] || EMPTY_CHECKINS}
              onCheckin={handleCheckin}
              onEdit={setEditingHabit}
              onDelete={setDeletingHabit}
              isCheckingIn={Boolean(checkinLoading[habit.id])}
              reminder={remindersMap[habit.id] || null}
              onReminderClick={handleReminderClick}
            />
          ))}
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
