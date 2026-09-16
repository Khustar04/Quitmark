import { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getLocalDateString } from '../utils/streaks/dateUtils';
import { upsertTodayCheckin } from '../services/habitService';
import {
  setHabitCheckinOptimistic,
  revertHabitCheckin,
  setCheckinLoading,
  setError,
} from '../store/slices/habitsSlice';

export function useCheckin() {
  const dispatch = useDispatch();
  const checkinsByHabit = useSelector((state) => state.habits.checkinsByHabit);
  const pendingRequestsRef = useRef(new Set());

  const handleCheckin = useCallback(async (habitId, status) => {
    // 1. Guard against rapid double-clicks (bypasses React's async batching)
    if (pendingRequestsRef.current.has(habitId)) return;
    pendingRequestsRef.current.add(habitId);
    
    const today = getLocalDateString();
    const previousCheckins = checkinsByHabit[habitId] ? [...checkinsByHabit[habitId]] : [];

    // 2. Optimistic Redux update
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
      // 3. Commit to Supabase
      const saved = await upsertTodayCheckin(habitId, status);
      // Synchronize exact server payload
      dispatch(setHabitCheckinOptimistic({ habitId, checkin: saved }));
    } catch (err) {
      // 4. Rollback on failure
      dispatch(revertHabitCheckin({ habitId, previousCheckins }));
      dispatch(setError(err.message || 'Failed to record check-in.'));
    } finally {
      // 5. Release lock
      pendingRequestsRef.current.delete(habitId);
      dispatch(setCheckinLoading({ habitId, loading: false }));
    }
  }, [dispatch, checkinsByHabit]);

  return { handleCheckin };
}
