import supabase from '../lib/supabase';
import { syncUserTimezone } from './authService';
import { getLocalDateString } from '../utils/streaks/dateUtils';
import { invalidateLeaderboardCache } from './leaderboardService';
import { getHabitCategory } from '../utils/habitCategoryUtils';

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
  if (msg.includes('only be recorded for today')) {
    return 'Check-ins can only be recorded on the current day.';
  }
  if (msg.includes('future') || msg.includes('jwt') || error?.code === 'PGRST303') {
    return 'Your session was synchronizing. Please refresh.';
  }
  console.error('[Quitmark] Database request failed:', error);
  return 'We could not complete that request. Please try again.';
};

let cachedUser = null;
let cachedUserExpiry = 0;

let cachedHabits = null;
let cachedHabitsTime = 0;
let inFlightHabitsPromise = null;

let cachedCheckins = null;
let cachedCheckinsTime = 0;
let inFlightCheckinsPromise = null;

const CACHE_TTL_MS = 20000; // 20 seconds short-lived cache

export const invalidateHabitsCache = () => {
  cachedHabits = null;
  cachedHabitsTime = 0;
  inFlightHabitsPromise = null;
};

export const invalidateCheckinsCache = () => {
  cachedCheckins = null;
  cachedCheckinsTime = 0;
  inFlightCheckinsPromise = null;
};

export const clearCachedUser = () => {
  cachedUser = null;
  cachedUserExpiry = 0;
  invalidateHabitsCache();
  invalidateCheckinsCache();
};

/**
 * Verifies that the Supabase client is initialized and returns the authenticated user.
 * Caches in-memory for 5 seconds to eliminate repetitive storage reads across concurrent calls.
 */
const getAuthenticatedUser = async () => {
  if (!supabase) {
    throw new Error(
      'Supabase environment variables are missing. Please configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.'
    );
  }

  const now = Date.now();
  if (cachedUser && now < cachedUserExpiry) {
    return cachedUser;
  }

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({ data: {} }));
    if (refreshed?.session?.user) {
      cachedUser = refreshed.session.user;
      cachedUserExpiry = now + 5000;
      return cachedUser;
    }
    throw new Error('You must be logged in to perform this action.');
  }

  cachedUser = session.user;
  cachedUserExpiry = now + 5000;
  return cachedUser;
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

const CATEGORY_STORAGE_PREFIX = 'quitmark_habit_categories_';

export const getStoredHabitCategories = (userId) => {
  if (!userId || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${CATEGORY_STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setStoredHabitCategory = (userId, habitId, category) => {
  if (!userId || !habitId || typeof localStorage === 'undefined') return;
  try {
    const map = getStoredHabitCategories(userId);
    map[habitId] = category;
    localStorage.setItem(`${CATEGORY_STORAGE_PREFIX}${userId}`, JSON.stringify(map));
  } catch (e) {
    console.warn('[Quitmark] Failed to persist habit category locally:', e);
  }
};

export const removeStoredHabitCategory = (userId, habitId) => {
  if (!userId || !habitId || typeof localStorage === 'undefined') return;
  try {
    const map = getStoredHabitCategories(userId);
    delete map[habitId];
    localStorage.setItem(`${CATEGORY_STORAGE_PREFIX}${userId}`, JSON.stringify(map));
  } catch (err) {
    console.warn('[Quitmark] Failed to remove stored category:', err);
  }
};

/**
 * Fetches all habits for the authenticated user.
 * Features in-memory caching, category retrieval, and concurrent request deduplication.
 */
export const getHabits = async ({ force = false } = {}) => {
  const user = await getAuthenticatedUser();
  const now = Date.now();

  if (!force && cachedHabits && now - cachedHabitsTime < CACHE_TTL_MS) {
    return cachedHabits;
  }

  if (inFlightHabitsPromise) {
    return inFlightHabitsPromise;
  }

  inFlightHabitsPromise = (async () => {
    try {
      const data = await withClockSkewRetry(() =>
        supabase
          .from('habits')
          .select('id, name, created_at, updated_at, user_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );

      const storedCategories = getStoredHabitCategories(user.id);
      cachedHabits = (data || []).map((h) => ({
        ...h,
        category: storedCategories[h.id] || getHabitCategory(h.name).name,
      }));
      cachedHabitsTime = Date.now();
      return cachedHabits;
    } finally {
      inFlightHabitsPromise = null;
    }
  })();

  return inFlightHabitsPromise;
};

/**
 * Creates a new habit for the authenticated user with category.
 */
export const createHabit = async (nameOrData, categoryParam) => {
  const user = await getAuthenticatedUser();
  const isObj = typeof nameOrData === 'object' && nameOrData !== null;
  const rawName = isObj ? nameOrData.name : nameOrData;
  const rawCategory = isObj ? nameOrData.category : categoryParam;
  const trimmedName = (rawName || '').trim();
  const category = (rawCategory || 'General').trim() || 'General';

  if (!trimmedName) {
    throw new Error('Please enter a habit name.');
  }
  if (trimmedName.length > 50) {
    throw new Error('Habit name must be 50 characters or less.');
  }

  const result = await withClockSkewRetry(() =>
    supabase
      .from('habits')
      .insert({
        name: trimmedName,
        user_id: user.id,
      })
      .select()
      .single()
  );

  const finalHabit = { ...result, category };
  if (finalHabit.id) {
    setStoredHabitCategory(user.id, finalHabit.id, category);
  }

  invalidateHabitsCache();
  return finalHabit;
};

/**
 * Renames and/or recategorizes an existing habit.
 */
export const updateHabit = async (id, nameOrData, categoryParam) => {
  const user = await getAuthenticatedUser();
  const isObj = typeof nameOrData === 'object' && nameOrData !== null;
  const rawName = isObj ? nameOrData.name : nameOrData;
  const rawCategory = isObj ? nameOrData.category : categoryParam;
  const trimmedName = (rawName || '').trim();
  const hasCategory = rawCategory !== undefined && rawCategory !== null;
  const category = hasCategory ? (rawCategory.trim() || 'General') : undefined;

  if (!trimmedName) {
    throw new Error('Please enter a habit name.');
  }
  if (trimmedName.length > 50) {
    throw new Error('Habit name must be 50 characters or less.');
  }

  const result = await withClockSkewRetry(() =>
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

  if (category) {
    setStoredHabitCategory(user.id, id, category);
  }

  const finalHabit = {
    ...result,
    category: category || getStoredHabitCategories(user.id)[id] || getHabitCategory(result?.name || trimmedName).name,
  };

  invalidateHabitsCache();
  return finalHabit;
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

  removeStoredHabitCategory(user.id, id);
  invalidateHabitsCache();
  invalidateCheckinsCache();
  return true;
};

/**
 * Fetches all check-ins belonging to the authenticated user.
 * Features in-memory caching and concurrent request deduplication.
 */
export const getAllUserCheckins = async ({ force = false } = {}) => {
  const user = await getAuthenticatedUser();
  const now = Date.now();

  if (!force && cachedCheckins && now - cachedCheckinsTime < CACHE_TTL_MS) {
    return cachedCheckins;
  }

  if (inFlightCheckinsPromise) {
    return inFlightCheckinsPromise;
  }

  inFlightCheckinsPromise = (async () => {
    try {
      const data = await withClockSkewRetry(() =>
        supabase
          .from('habit_checkins')
          .select('id, habit_id, check_in_date, status, user_id')
          .eq('user_id', user.id)
          .order('check_in_date', { ascending: false })
      );

      cachedCheckins = data || [];
      cachedCheckinsTime = Date.now();
      return cachedCheckins;
    } finally {
      inFlightCheckinsPromise = null;
    }
  })();

  return inFlightCheckinsPromise;
};

/**
 * Records or updates today's check-in for a habit.
 * The database independently verifies that this is the user's current local day.
 */
export const upsertTodayCheckin = async (habitId, status) => {
  await syncUserTimezone();
  const user = await getAuthenticatedUser();
  const today = getLocalDateString();

  if (status !== 'completed' && status !== 'missed') {
    throw new Error('Invalid status. Status must be "completed" or "missed".');
  }

  const result = await withClockSkewRetry(() =>
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

  invalidateCheckinsCache();
  invalidateLeaderboardCache();
  return result;
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

  invalidateCheckinsCache();
  invalidateLeaderboardCache();
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
      .select('id, name, created_at, updated_at, user_id')
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
      .select('id, habit_id, check_in_date, status, user_id')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
  );

  return data || [];
};
