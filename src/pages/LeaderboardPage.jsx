import { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Trophy, Flame, AlertCircle, RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { getLeaderboard } from '../services/leaderboardService';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Auth state is resolved by ProtectedRoute before rendering this page.
  const user = useSelector((state) => state.auth.user);

  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const isFetchingRef = useRef(false);

  const fetchLeaderboard = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getLeaderboard(50);
      setLeaderboard(data);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError('Something went wrong while loading the leaderboard.');
      setLeaderboard([]); // Clear stale data on error
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // GSAP animation for entrance
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
      }

      if (!loading && leaderboard.length > 0 && !error) {
        gsap.fromTo(
          '.leaderboard-row',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.08 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, leaderboard.length, error]);

  const isUserMissing = user && !loading && !error && leaderboard.length > 0 && !leaderboard.find((entry) => entry.user_id === user.id);

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen flex flex-col">
      {/* Header Section */}
      <div
        ref={headerRef}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 sm:pb-8 border-b border-zinc-200/80 dark:border-[#232936] mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Global ranking by current highest streak.
          </p>
        </div>

        <button
          type="button"
          onClick={() => !loading && fetchLeaderboard()}
          disabled={loading}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-[#334155] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          title="Refresh leaderboard"
          aria-label="Refresh leaderboard"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {loading ? (
          /* 1. Loading State */
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-[72px] rounded-2xl border border-zinc-200/60 dark:border-[#232936] bg-zinc-100/60 dark:bg-[#0D0F17]/50 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          /* 4. Dedicated Error State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-200 dark:border-[#232936] rounded-2xl bg-red-50/50 dark:bg-red-500/5">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Unable to load leaderboard</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-6">
              {error}
            </p>
            <button
              type="button"
              onClick={() => fetchLeaderboard()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          /* 2. Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-200 dark:border-[#232936] rounded-2xl bg-zinc-50/50 dark:bg-[#0D0F17]/30">
            <Trophy className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Leaderboard is empty</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Once users build active streaks, they'll appear here.
            </p>
          </div>
        ) : (
          /* Leaderboard List */
          <div className="space-y-3 pb-12">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = user && user.id === entry.user_id;
              const rank = index + 1;

              // Subtle styling based on rank
              let rankColor = 'text-zinc-400 dark:text-zinc-500 font-mono';
              let rowBorder = 'border-zinc-200/80 dark:border-[#232936]';
              let rowBg = 'bg-white dark:bg-[#0D0F17]';
              let flameColor = 'text-emerald-500';

              if (rank === 1) {
                rankColor = 'text-amber-500 font-bold font-mono';
                flameColor = 'text-amber-500';
              } else if (rank === 2) {
                rankColor = 'text-slate-400 font-bold font-mono';
              } else if (rank === 3) {
                rankColor = 'text-amber-700 dark:text-amber-600 font-bold font-mono';
              }

              // Current user highlighting
              if (isCurrentUser) {
                rowBorder = 'border-emerald-500/40 dark:border-emerald-500/30';
                rowBg = 'bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm shadow-emerald-500/5';
              }

              return (
                <div
                  key={entry.user_id}
                  className={`leaderboard-row flex items-center justify-between p-4 sm:px-6 rounded-2xl border ${rowBg} ${rowBorder} transition-colors`}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className={`w-6 sm:w-8 text-center text-sm sm:text-base ${rankColor}`}>
                      #{rank}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`text-sm sm:text-base truncate max-w-[140px] sm:max-w-xs ${
                          isCurrentUser
                            ? 'text-zinc-900 dark:text-white font-bold tracking-tight'
                            : 'text-zinc-700 dark:text-zinc-200 font-medium'
                        }`}
                      >
                        {entry.display_name}
                      </span>
                      {isCurrentUser && (
                        <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          You
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <Flame className={`w-4 h-4 sm:w-5 sm:h-5 ${flameColor} ${isCurrentUser ? 'animate-pulse' : ''}`} />
                    <div className="flex items-baseline gap-1 sm:gap-1.5">
                      <span className={`text-lg sm:text-xl font-bold ${isCurrentUser ? 'text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-100'}`}>
                        {entry.current_streak}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        days
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* 3. Current User Missing State */}
            {isUserMissing && (
              <div className="mt-6 p-4 text-center rounded-xl bg-zinc-50 dark:bg-[#131722] border border-zinc-200 dark:border-[#232936] leaderboard-row">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Your current streak isn't shown in the current leaderboard.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
