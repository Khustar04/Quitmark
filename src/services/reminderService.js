import supabase from '../lib/supabase';

let cachedUser = null;
let cachedUserExpiry = 0;

let cachedReminders = null;
let cachedRemindersTime = 0;
let inFlightRemindersPromise = null;
const REMINDER_CACHE_TTL_MS = 20000;

export const invalidateRemindersCache = () => {
  cachedReminders = null;
  cachedRemindersTime = 0;
  inFlightRemindersPromise = null;
};

export const clearCachedReminderUser = () => {
  cachedUser = null;
  cachedUserExpiry = 0;
  invalidateRemindersCache();
};

/**
 * Verifies that the Supabase client is initialized and returns the authenticated user.
 * (Caches in-memory for 5 seconds to eliminate duplicate auth storage reads across concurrent queries)
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
 * Executes a Supabase query with automatic retry for transient clock skew errors.
 * (Mirrors habitService pattern)
 */
const withClockSkewRetry = async (queryFn, retries = 2) => {
  try {
    const { data, error } = await queryFn();
    if (error) {
      const msg = (error.message || error.toString() || '').toLowerCase();
      const isSkew = error.code === 'PGRST303' || msg.includes('future') || msg.includes('jwt');
      if (isSkew && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        await supabase.auth.refreshSession().catch(() => {});
        return withClockSkewRetry(queryFn, retries - 1);
      }
      throw error;
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

// ─── Reminder CRUD ───────────────────────────────────────────────────────────

/**
 * Fetches the reminder for a specific habit (if any).
 */
export const getReminder = async (habitId) => {
  await getAuthenticatedUser();

  return await withClockSkewRetry(() =>
    supabase
      .from('habit_reminders')
      .select('id, habit_id, user_id, enabled, reminder_time, repeat_type, repeat_days, updated_at')
      .eq('habit_id', habitId)
      .maybeSingle()
  );
};

/**
 * Fetches all reminders for the current user.
 * Features in-memory caching and request deduplication.
 */
export const getAllReminders = async ({ force = false } = {}) => {
  const user = await getAuthenticatedUser();
  const now = Date.now();

  if (!force && cachedReminders && now - cachedRemindersTime < REMINDER_CACHE_TTL_MS) {
    return cachedReminders;
  }

  if (inFlightRemindersPromise) {
    return inFlightRemindersPromise;
  }

  inFlightRemindersPromise = (async () => {
    try {
      const data = await withClockSkewRetry(() =>
        supabase
          .from('habit_reminders')
          .select('id, habit_id, user_id, enabled, reminder_time, repeat_type, repeat_days, updated_at')
          .eq('user_id', user.id)
      );

      cachedReminders = data || [];
      cachedRemindersTime = Date.now();
      return cachedReminders;
    } finally {
      inFlightRemindersPromise = null;
    }
  })();

  return inFlightRemindersPromise;
};

/**
 * Creates or updates a reminder for a habit.
 * Uses upsert on the unique habit_id constraint.
 */
export const upsertReminder = async (habitId, { enabled, reminderTime, repeatType, repeatDays }) => {
  const user = await getAuthenticatedUser();

  const result = await withClockSkewRetry(() =>
    supabase
      .from('habit_reminders')
      .upsert(
        {
          user_id: user.id,
          habit_id: habitId,
          enabled: enabled !== false,
          reminder_time: reminderTime,
          repeat_type: repeatType || 'DAILY',
          repeat_days: repeatType === 'SELECTED_DAYS' ? (repeatDays || []) : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'habit_id' }
      )
      .select()
      .single()
  );

  invalidateRemindersCache();
  return result;
};

/**
 * Deletes the reminder for a habit.
 */
export const deleteReminder = async (habitId) => {
  const user = await getAuthenticatedUser();

  await withClockSkewRetry(() =>
    supabase
      .from('habit_reminders')
      .delete()
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
  );

  invalidateRemindersCache();
  return true;
};

// ─── Push Subscription CRUD ──────────────────────────────────────────────────

/**
 * Saves (upserts) a Web Push subscription to the database.
 */
export const savePushSubscription = async (subscription) => {
  const user = await getAuthenticatedUser();

  if (!subscription || typeof subscription.toJSON !== 'function') {
    throw new Error('Invalid push subscription.');
  }

  const subJson = subscription.toJSON();

  if (!subJson?.endpoint || !subJson?.keys?.p256dh || !subJson?.keys?.auth) {
    throw new Error('Invalid push subscription: endpoint or encryption keys are missing.');
  }

  return await withClockSkewRetry(() =>
    supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      )
      .select()
      .single()
  );
};

/**
 * Deletes a push subscription by its endpoint.
 */
export const deletePushSubscription = async (endpoint) => {
  const user = await getAuthenticatedUser();

  await withClockSkewRetry(() =>
    supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint)
      .eq('user_id', user.id)
  );

  return true;
};
