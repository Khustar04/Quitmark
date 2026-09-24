import { getLocalDateString } from '../utils/streaks/dateUtils';

const STORAGE_PREFIX = 'quitmark_goals_';
let supabaseClientPromise;

const getSupabaseClient = async () => {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import('../lib/supabase')
      .then(({ default: client }) => client)
      .catch((error) => {
        console.warn('[Quitmark] Supabase client is unavailable for goals:', error);
        return null;
      });
  }
  return supabaseClientPromise;
};

const getStorageKey = (userId) => `${STORAGE_PREFIX}${userId}`;

export const readCachedGoals = (userId) => {
  if (!userId || typeof localStorage === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(getStorageKey(userId)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeCachedGoals = (userId, goals) => {
  if (!userId || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(goals));
  } catch (error) {
    console.warn('[Quitmark] Unable to update the offline goals cache:', error);
  }
};

const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

const makeGoalId = () =>
  `goal_${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;

const normalizeGoal = (goal, userId, existingGoal) => {
  if (!goal?.name?.trim()) throw new Error('Goal name is required.');

  const now = new Date().toISOString();
  const durationDays = Math.max(1, Math.min(3650, Number(goal.duration_days) || 60));
  const startDate = goal.start_date || existingGoal?.start_date || getLocalDateString();
  const targetDate = goal.target_date || existingGoal?.target_date || null;

  if (!parseLocalDate(startDate) || (targetDate && !parseLocalDate(targetDate))) {
    throw new Error('Please provide valid goal dates.');
  }
  if (targetDate && targetDate < startDate) {
    throw new Error('Target date must be on or after the start date.');
  }

  return {
    ...existingGoal,
    ...goal,
    id: goal.id || existingGoal?.id || makeGoalId(),
    user_id: userId,
    name: goal.name.trim(),
    icon: goal.icon || existingGoal?.icon || 'Target',
    category: goal.category || existingGoal?.category || 'Personal',
    duration_days: durationDays,
    start_date: startDate,
    target_date: targetDate,
    habit_ids: [...new Set(Array.isArray(goal.habit_ids) ? goal.habit_ids.filter(Boolean) : [])],
    description: goal.description?.trim() || '',
    status: goal.status || existingGoal?.status || 'active',
    created_at: existingGoal?.created_at || goal.created_at || now,
    updated_at: now,
  };
};

let isGoalsTableMissing = false;
let inMemoryGoalsByUser = {};
let inMemoryGoalsTimeByUser = {};
let inFlightGoalsPromiseByUser = {};
const GOALS_CACHE_TTL_MS = 20000;

export const invalidateGoalsCache = (userId) => {
  if (userId) {
    delete inMemoryGoalsByUser[userId];
    delete inMemoryGoalsTimeByUser[userId];
    delete inFlightGoalsPromiseByUser[userId];
  } else {
    inMemoryGoalsByUser = {};
    inMemoryGoalsTimeByUser = {};
    inFlightGoalsPromiseByUser = {};
  }
};

/** Loads remote goals when available, with a user-scoped offline cache fallback. */
export async function getGoals(userId, { force = false } = {}) {
  if (!userId) return [];
  const now = Date.now();

  if (!force && inMemoryGoalsByUser[userId] && now - (inMemoryGoalsTimeByUser[userId] || 0) < GOALS_CACHE_TTL_MS) {
    return inMemoryGoalsByUser[userId];
  }

  if (inFlightGoalsPromiseByUser[userId]) {
    return inFlightGoalsPromiseByUser[userId];
  }

  const cachedGoals = readCachedGoals(userId);
  if (isGoalsTableMissing) {
    inMemoryGoalsByUser[userId] = cachedGoals;
    inMemoryGoalsTimeByUser[userId] = now;
    return cachedGoals;
  }

  const supabase = await getSupabaseClient();
  if (!supabase) {
    inMemoryGoalsByUser[userId] = cachedGoals;
    inMemoryGoalsTimeByUser[userId] = now;
    return cachedGoals;
  }

  inFlightGoalsPromiseByUser[userId] = (async () => {
    try {
      const { data, error, status } = await supabase
        .from('goals')
        .select('id, user_id, name, icon, category, duration_days, start_date, target_date, habit_ids, description, status, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        if (status === 404 || error.code === 'PGRST204' || error.code === '42P01' || error.message?.includes('not found')) {
          isGoalsTableMissing = true;
          console.info(
            '[Quitmark] The "goals" table is not yet created in your Supabase project. Using offline storage. (Run supabase/migrations/20260924000000_create_goals.sql in Supabase SQL Editor to enable cloud sync).'
          );
        } else {
          console.warn('[Quitmark] Unable to load goals from Supabase; using offline cache:', error);
        }
        inMemoryGoalsByUser[userId] = cachedGoals;
        inMemoryGoalsTimeByUser[userId] = Date.now();
        return cachedGoals;
      }

      const remoteGoals = data || [];
      // One-time migration of goals created before remote persistence was added.
      if (remoteGoals.length === 0 && cachedGoals.length > 0) {
        const { data: migrated, error: migrationError } = await supabase
          .from('goals')
          .upsert(cachedGoals.map((goal) => normalizeGoal(goal, userId, goal)), { onConflict: 'id' })
          .select();
        if (!migrationError) {
          const finalGoals = migrated || cachedGoals;
          writeCachedGoals(userId, finalGoals);
          inMemoryGoalsByUser[userId] = finalGoals;
          inMemoryGoalsTimeByUser[userId] = Date.now();
          return finalGoals;
        }
        console.warn('[Quitmark] Unable to migrate cached goals:', migrationError);
      }

      writeCachedGoals(userId, remoteGoals);
      inMemoryGoalsByUser[userId] = remoteGoals;
      inMemoryGoalsTimeByUser[userId] = Date.now();
      return remoteGoals;
    } finally {
      delete inFlightGoalsPromiseByUser[userId];
    }
  })();

  return inFlightGoalsPromiseByUser[userId];
}

/** Creates or updates a goal remotely and maintains an offline cache. */
export async function saveGoal(goal, userId) {
  if (!userId) throw new Error('User is required to save a goal.');
  const cachedGoals = readCachedGoals(userId);
  const existingGoal = cachedGoals.find((item) => item.id === goal?.id);
  const savedGoal = normalizeGoal(goal, userId, existingGoal);

  const supabase = await getSupabaseClient();
  if (supabase && !isGoalsTableMissing) {
    const { data, error, status } = await supabase
      .from('goals')
      .upsert(savedGoal, { onConflict: 'id' })
      .select()
      .single();
    if (!error && data) {
      writeCachedGoals(userId, [data, ...cachedGoals.filter((item) => item.id !== data.id)]);
      invalidateGoalsCache(userId);
      return data;
    }
    if (status === 404 || error?.code === 'PGRST204' || error?.code === '42P01') {
      isGoalsTableMissing = true;
    }
    console.warn('[Quitmark] Unable to save goal to Supabase; saved offline instead:', error);
  }

  writeCachedGoals(userId, [savedGoal, ...cachedGoals.filter((item) => item.id !== savedGoal.id)]);
  invalidateGoalsCache(userId);
  return savedGoal;
}

/** Deletes a goal remotely when possible and always clears its offline cache entry. */
export async function deleteGoal(goalId, userId) {
  if (!userId || !goalId) return false;
  const supabase = await getSupabaseClient();
  if (supabase && !isGoalsTableMissing) {
    const { error, status } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
    if (status === 404 || error?.code === 'PGRST204' || error?.code === '42P01') {
      isGoalsTableMissing = true;
    }
    if (error) {
      console.warn('[Quitmark] Unable to delete goal from Supabase:', error);
      return false;
    }
  }
  writeCachedGoals(userId, readCachedGoals(userId).filter((goal) => goal.id !== goalId));
  invalidateGoalsCache(userId);
  return true;
}

export function calculateGoalStats(goal, habits = [], checkinsByHabit = {}, todayDateStr) {
  if (!goal) return null;

  const today = todayDateStr || getLocalDateString();
  const startDate = goal.start_date || today;
  const totalDays = Number(goal.duration_days) || 30;
  const start = parseLocalDate(startDate);
  const current = parseLocalDate(today);
  const diffDays = start && current ? Math.max(0, Math.floor((current - start) / 86400000)) : 0;
  const daysElapsed = Math.min(totalDays, diffDays);
  const linkedHabitIds = new Set(goal.habit_ids || []);
  const linkedHabits = habits.filter((habit) => linkedHabitIds.has(habit.id));
  let totalHabitCompletions = 0;
  let totalMissedCount = 0;
  const completionDates = new Set();

  for (const habit of linkedHabits) {
    for (const record of checkinsByHabit[habit.id] || []) {
      if (record.check_in_date >= startDate && record.check_in_date <= (goal.target_date || today)) {
        if (record.status === 'completed') {
          completionDates.add(record.check_in_date);
          totalHabitCompletions += 1;
        } else if (record.status === 'missed') totalMissedCount += 1;
      }
    }
  }

  const completedDaysCount = completionDates.size;
  return {
    totalDays,
    daysElapsed,
    daysRemaining: Math.max(0, totalDays - daysElapsed),
    completedDaysCount,
    progressPercentage: totalDays > 0 ? Math.min(100, Math.round((completedDaysCount / totalDays) * 100)) : 0,
    totalHabitCompletions,
    totalMissedCount,
    linkedHabits,
    isCompleted: daysElapsed >= totalDays || goal.status === 'completed',
  };
}

export function formatGoalDateRange(startDateIso, targetDateIso) {
  const formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const start = parseLocalDate(startDateIso);
  const target = parseLocalDate(targetDateIso);
  return start && target
    ? `${start.toLocaleDateString('en-US', formatOptions)} – ${target.toLocaleDateString('en-US', formatOptions)}`
    : '';
}
