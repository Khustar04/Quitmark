import supabase from '../lib/supabase';
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
  return error.message || 'Operation failed. Please try again.';
};

/**
 * Verifies that the Supabase client is initialized and returns the authenticated user.
 */
const getAuthenticatedUser = async () => {
  if (!supabase) {
    throw new Error(
      'Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('You must be logged in to perform this action.');
  }

  return user;
};

/**
 * Fetches all habits for the authenticated user.
 */
export const getHabits = async () => {
  await getAuthenticatedUser();

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

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

  const { data, error } = await supabase
    .from('habits')
    .insert({
      name: trimmedName,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return data;
};

/**
 * Renames an existing habit.
 */
export const updateHabit = async (id, name) => {
  await getAuthenticatedUser();
  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    throw new Error('Please enter a habit name.');
  }

  const { data, error } = await supabase
    .from('habits')
    .update({
      name: trimmedName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return data;
};

/**
 * Deletes a habit and its cascaded check-in history.
 */
export const deleteHabit = async (id) => {
  await getAuthenticatedUser();

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return true;
};

/**
 * Fetches all check-ins belonging to the authenticated user.
 */
export const getAllUserCheckins = async () => {
  await getAuthenticatedUser();

  const { data, error } = await supabase
    .from('habit_checkins')
    .select('*')
    .order('check_in_date', { ascending: false });

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return data || [];
};

/**
 * Records or updates today's check-in for a habit.
 * Strictly prevents future date insertion by locking date to today's local calendar day.
 */
export const upsertTodayCheckin = async (habitId, status) => {
  const user = await getAuthenticatedUser();
  const today = getLocalDateString();

  if (status !== 'completed' && status !== 'missed') {
    throw new Error('Invalid status. Status must be "completed" or "missed".');
  }

  const { data, error } = await supabase
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
    .single();

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return data;
};

/**
 * Fetches a single habit by ID belonging to the authenticated user.
 */
export const getHabitById = async (id) => {
  await getAuthenticatedUser();

  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return data;
};

/**
 * Fetches all check-in records for a specific habit belonging to the authenticated user.
 */
export const getHabitCheckins = async (habitId) => {
  await getAuthenticatedUser();

  const { data, error } = await supabase
    .from('habit_checkins')
    .select('*')
    .eq('habit_id', habitId)
    .order('check_in_date', { ascending: false });

  if (error) {
    throw new Error(getFriendlyDbErrorMessage(error));
  }

  return data || [];
};
