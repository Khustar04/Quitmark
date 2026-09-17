import { supabase } from '../lib/supabase';

/**
 * Retrieves the global leaderboard.
 * @param {number} limitCount - The maximum number of entries to return (default 50)
 * @returns {Promise<Array<{ user_id: string, display_name: string, current_streak: number }>>}
 */
export async function getLeaderboard(limitCount = 50) {
  const { data, error } = await supabase.rpc('get_leaderboard', {
    limit_count: limitCount
  });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error(error.message || 'Failed to fetch leaderboard');
  }

  return data || [];
}
