import { supabase } from '../lib/supabase';

/**
 * Retrieves the global leaderboard with automatic retry on clock skew.
 * @param {number} limitCount - The maximum number of entries to return (default 50)
 * @returns {Promise<Array<{ user_id: string, display_name: string, current_streak: number }>>}
 */
export async function getLeaderboard(limitCount = 50) {
  if (!supabase) {
    throw new Error('Leaderboard is unavailable because the app is not configured.');
  }

  const requestedLimit = Number.isInteger(limitCount)
    ? Math.min(Math.max(limitCount, 1), 100)
    : 50;
  let retries = 2;
  while (retries >= 0) {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      limit_count: requestedLimit
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

    return data || [];
  }
  return [];
}
