import { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLocalDateString } from '../utils/streaks/dateUtils';
import { deleteTodayCheckin, upsertTodayCheckin } from '../services/habitService';
import {
  setHabitCheckinOptimistic,
  removeHabitCheckinOptimistic,
  revertHabitCheckin,
  setCheckinLoading,
  setError,
} from '../store/slices/habitsSlice';
import { isActiveUser } from '../utils/auth/sessionGuard';
import { isNativeApp, cancelTodayNativeHabitReminder } from '../utils/notifications/nativeReminderService';
import { invalidateLeaderboardCache } from '../services/leaderboardService';

export function useCheckin() {
  const dispatch = useDispatch();
  const checkinsByHabit = useSelector((state) => state.habits.checkinsByHabit);
  const userId = useSelector((state) => state.auth.user?.id);
  const pendingRequestsRef = useRef(new Set());

  const handleCheckin = useCallback(async (habitId, status) => {
    if (!userId || !['completed', 'missed', 'pending'].includes(status)) return;
    // 1. Guard against rapid double-clicks (bypasses React's async batching)
    if (pendingRequestsRef.current.has(habitId)) return;
    pendingRequestsRef.current.add(habitId);
    
    const today = getLocalDateString();
    const previousCheckins = checkinsByHabit[habitId] ? [...checkinsByHabit[habitId]] : [];

    // 2. Optimistic Redux update
    if (status === 'pending') {
      dispatch(removeHabitCheckinOptimistic({ habitId, checkInDate: today }));
    } else {
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
    }
    dispatch(setCheckinLoading({ habitId, loading: true }));

    try {
      // 3. Commit to Supabase
      const saved = status === 'pending'
        ? await deleteTodayCheckin(habitId)
        : await upsertTodayCheckin(habitId, status);
      if (!isActiveUser(userId)) return;
      // Synchronize exact server payload
      if (status !== 'pending') {
        dispatch(setHabitCheckinOptimistic({ habitId, checkin: saved }));
      }
      invalidateLeaderboardCache();

      // Stop remainder of reminder cycle for today on native device
      if (status === 'completed' && isNativeApp()) {
        void cancelTodayNativeHabitReminder(habitId);
      }
    } catch (err) {
      if (!isActiveUser(userId)) return;
      // 4. Rollback on failure
      dispatch(revertHabitCheckin({ habitId, previousCheckins }));
      dispatch(setError(err.message || 'Failed to record check-in.'));
    } finally {
      // 5. Release lock
      pendingRequestsRef.current.delete(habitId);
      if (isActiveUser(userId)) {
        dispatch(setCheckinLoading({ habitId, loading: false }));
      }
    }
  }, [dispatch, checkinsByHabit, userId]);

  return { handleCheckin };
}
