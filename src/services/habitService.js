import supabase from '../lib/supabase';
import { syncUserTimezone } from './authService';
import { getLocalDateString } from '../utils/streaks/dateUtils';

/**
 * Translates raw database/Supabase errors into clean, user-friendly messages.
 */
const getFriendlyDbErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const msg = (error.message || error.toString() || '').toLowerCase();

  if (msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'Permission denied. You can only access your own habits.';
  }
  if (msg.includes('unique_habit_daily_checkin')) {
    return 'You have already checked in for today.';
  }
  if (msg.includes('null value in column "name"')) {
    return 'Habit name cannot be empty.';
  }
  if (msg.includes('foreign key constraint')) {
    return 'Unable to link check-in. The specified habit does not exist.';
  }
  if (msg.includes('future') || msg.includes('jwt') || error?.code === 'PGRST303') {
    return 'Your session was synchronizing. Please refresh.';
  }
  console.error('[Quitmark] Database request failed:', error);
  return 'We could not complete that request. Please try again.';
};

/**
 * Verifies that the Supabase client is initialized and returns the authenticated user.
 */
const getAuthenticatedUser = async () => {
  if (!supabase) {
    throw new Error(
      'Supabase environment variables are missing. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: {} }));
    if (refreshed?.session?.user) {
      return refreshed.session.user;
    }
    throw new Error('You must be logged in to perform this action.');
  }

  return session.user;
};

/**
 * Executes a Supabase query with automatic retry for transient clock skew
 * ("JWT issued at future", PGRST303) errors.
 */
const withClockSkewRetry = async (queryFn, retries = 2) => {
  try {
    const { data, error } = await queryFn();
    if (error) {
      const msg = (error.message || error.toString() || '').toLowerCase();
      const isSkew = error.code === 'PGRST303' || msg.includes('future') || msg.includes('jwt');
      if (isSkew && retries > 0) {
        // Wait 600ms for database clock to catch up with JWT iat
        await new Promise((resolve) => setTimeout(resolve, 600));
        await supabase.auth.refreshSession().catch(() => {});
        return withClockSkewRetry(queryFn, retries - 1);
      }
      throw new Error(getFriendlyDbErrorMessage(error));
    }
    return data;
  } catch (err) {
    const msg = (err?.message || err?.toString() || '').toLowerCase();
    const isSkew = err?.code === 'PGRST303' || msg.includes('future') || msg.includes('jwt');
    if (isSkew && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await supabase.auth.refreshSession().catch(() => {});
      return withClockSkewRetry(queryFn, retries - 1);
    }
    throw err;
  }
};

/**
 * Fetches all habits for the authenticated user.
 */
export const getHabits = async () => {
  const user = await getAuthenticatedUser();

  const data = await withClockSkewRetry(() =>
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  );

  return data || [];
};

/**
 * Creates a new habit for the authenticated user.
 */
export const createHabit = async (name) => {
  const user = await getAuthenticatedUser();
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    throw new Error('Please enter a habit name.');
  }
  if (trimmedName.length > 50) {
    throw new Error('Habit name must be 50 characters or less.');
  }

  return await withClockSkewRetry(() =>
    supabase
      .from('habits')
      .insert({
        name: trimmedName,
        user_id: user.id,
      })
      .select()
      .single()
  );
};

/**
 * Renames an existing habit.
 */
export const updateHabit = async (id, name) => {
  const user = await getAuthenticatedUser();
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    throw new Error('Please enter a habit name.');
  }
  if (trimmedName.length > 50) {
    throw new Error('Habit name must be 50 characters or less.');
  }

  return await withClockSkewRetry(() =>
    supabase
      .from('habits')
      .update({
        name: trimmedName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
  );
};

/**
 * Deletes a habit and its cascaded check-in history.
 */
export const deleteHabit = async (id) => {
  const user = await getAuthenticatedUser();

  await withClockSkewRetry(() =>
    supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
  );

  return true;
};

/**
 * Fetches all check-ins belonging to the authenticated user.
 */
export const getAllUserCheckins = async () => {
  const user = await getAuthenticatedUser();

  const data = await withClockSkewRetry(() =>
    supabase
      .from('habit_checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
  );

  return data || [];
};

/**
 * Records or updates today's check-in for a habit.
 * Strictly prevents future date insertion by locking date to today's local calendar day.
 */
export const upsertTodayCheckin = async (habitId, status) => {
  await syncUserTimezone();
  const user = await getAuthenticatedUser();
  const today = getLocalDateString();

  if (status !== 'completed' && status !== 'missed') {
    throw new Error('Invalid status. Status must be "completed" or "missed".');
  }

  return await withClockSkewRetry(() =>
    supabase
      .from('habit_checkins')
      .upsert(
        {
          habit_id: habitId,
          user_id: user.id,
          check_in_date: today,
          status,
        },
        { onConflict: 'habit_id,check_in_date' }
      )
      .select()
      .single()
  );
};

/**
 * Removes today's explicit status so the habit returns to the pending state.
 */
export const deleteTodayCheckin = async (habitId) => {
  await syncUserTimezone();
  const user = await getAuthenticatedUser();
  const today = getLocalDateString();

  await withClockSkewRetry(() =>
    supabase
      .from('habit_checkins')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('check_in_date', today)
  );

  return true;
};

/**
 * Fetches a single habit by ID belonging to the authenticated user.
 */
export const getHabitById = async (id) => {
  const user = await getAuthenticatedUser();

  return await withClockSkewRetry(() =>
    supabase
      .from('habits')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
  );
};

/**
 * Fetches all check-in records for a specific habit belonging to the authenticated user.
 */
export const getHabitCheckins = async (habitId) => {
  const user = await getAuthenticatedUser();

  const data = await withClockSkewRetry(() =>
    supabase
      .from('habit_checkins')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
  );

  return data || [];
};
