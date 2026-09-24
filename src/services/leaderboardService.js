import { supabase } from '../lib/supabase';

let cachedLeaderboard = null;
let cachedLeaderboardLimit = 0;
let cachedLeaderboardTime = 0;
let inFlightLeaderboardPromise = null;
const LEADERBOARD_CACHE_TTL_MS = 25000;

export const invalidateLeaderboardCache = () => {
  cachedLeaderboard = null;
  cachedLeaderboardLimit = 0;
  cachedLeaderboardTime = 0;
  inFlightLeaderboardPromise = null;
};

/**
 * Retrieves the global leaderboard with automatic retry on clock skew.
 * Features in-memory caching and request deduplication.
 * @param {number} limitCount - The maximum number of entries to return (default 50)
 * @param {{ force?: boolean }} [options]
 * @returns {Promise<Array<{ user_id: string, display_name: string, current_streak: number }>>}
 */
export async function getLeaderboard(limitCount = 50, { force = false } = {}) {
  if (!supabase) {
    throw new Error('Leaderboard is unavailable because the app is not configured.');
  }

  const requestedLimit = Number.isInteger(limitCount)
    ? Math.min(Math.max(limitCount, 1), 100)
    : 50;

  // Always fetch at least 50 from Supabase so requests from Dashboard (limit 5)
  // and LeaderboardPage (limit 50) can share the exact same cached pool and in-flight request.
  const fetchLimit = Math.max(requestedLimit, 50);

  const now = Date.now();
  if (
    !force &&
    cachedLeaderboard &&
    now - cachedLeaderboardTime < LEADERBOARD_CACHE_TTL_MS &&
    cachedLeaderboardLimit >= requestedLimit
  ) {
    return cachedLeaderboard.slice(0, requestedLimit);
  }

  if (inFlightLeaderboardPromise) {
    const data = await inFlightLeaderboardPromise;
    return (data || []).slice(0, requestedLimit);
  }

  inFlightLeaderboardPromise = (async () => {
    try {
      let retries = 2;
      while (retries >= 0) {
        const { data, error } = await supabase.rpc('get_leaderboard', {
          limit_count: fetchLimit,
        });

        if (error) {
          const msg = (error.message || '').toLowerCase();
          const isSkew = error.code === 'PGRST303' || msg.includes('jwt') || msg.includes('future');
          if (isSkew && retries > 0) {
            await new Promise((res) => setTimeout(res, 600));
            await supabase.auth.refreshSession().catch(() => {});
            retries--;
            continue;
          }
          console.error('Error fetching leaderboard:', error);
          throw new Error(error.message || 'Failed to fetch leaderboard');
        }

        cachedLeaderboard = Array.isArray(data) ? data : [];
        cachedLeaderboardLimit = fetchLimit;
        cachedLeaderboardTime = Date.now();
        return cachedLeaderboard;
      }
      return [];
    } finally {
      inFlightLeaderboardPromise = null;
    }
  })();

  const result = await inFlightLeaderboardPromise;
  return (result || []).slice(0, requestedLimit);
}

/**
 * Subscribes to real-time changes on habit_checkins that trigger leaderboard recalculations.
 * @param {() => void} onUpdate
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToLeaderboard(onUpdate) {
  if (!supabase || typeof onUpdate !== 'function') {
    return () => {};
  }

  const channelName = `leaderboard-sync-${Math.random().toString(36).slice(2, 9)}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habit_checkins',
      },
      () => {
        invalidateLeaderboardCache();
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
