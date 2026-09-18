import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, AlertCircle, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

import {
  getHabitById,
  getHabitCheckins,
} from '../services/habitService';
import {
  setSingleHabit,
  setSingleHabitCheckins,
} from '../store/slices/habitsSlice';
import { useCheckin } from '../hooks/useCheckin';
import HabitHistory from '../components/history/HabitHistory';
import { isActiveUser } from '../utils/auth/sessionGuard';

export default function HabitHistoryPage() {
  const { habitId } = useParams();
  const dispatch = useDispatch();

  const { items: habits, checkinsByHabit, checkinLoading } = useSelector(
    (state) => state.habits
  );
  const userId = useSelector((state) => state.auth.user?.id);

  const { handleCheckin } = useCheckin();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pageError, setPageError] = useState(null);

  const containerRef = useRef(null);

  // Rely strictly on Redux as the single source of truth
  const habit = habits.find((h) => h.id === habitId) || null;
  const checkins = checkinsByHabit[habitId] || [];

  // Load from Supabase if not in Redux or when visiting directly
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!userId || !isActiveUser(userId)) return;
      try {
        const [hData, cData] = await Promise.all([
          getHabitById(habitId),
          getHabitCheckins(habitId),
        ]);

        if (!isMounted || !isActiveUser(userId)) return;

        if (!hData) {
          setNotFound(true);
        } else {
          dispatch(setSingleHabit(hData));
          dispatch(setSingleHabitCheckins({ habitId, checkins: cData }));
        }
      } catch (err) {
        if (isMounted && isActiveUser(userId)) {
          setPageError(err.message || 'Failed to load habit history.');
        }
      } finally {
        if (isMounted && isActiveUser(userId)) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [habitId, dispatch, userId]);

  // Subtle GSAP entrance animation
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || loading || notFound) return;

    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 12,
        duration: 0.35,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, notFound]);


  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Loading Skeleton */}
      {loading && !habit ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-zinc-100 dark:bg-[#0D0F17] border border-zinc-200 dark:border-[#232936]"
              />
            ))}
          </div>
          <div className="h-80 rounded-2xl bg-zinc-100 dark:bg-[#0D0F17] border border-zinc-200 dark:border-[#232936]" />
        </div>
      ) : notFound ? (
        /* Not Found / Forbidden State */
        <div className="text-center py-16 sm:py-20 px-4 rounded-2xl border border-dashed border-zinc-200 dark:border-[#232936] bg-white/40 dark:bg-[#0D0F17]/40 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            Habit not found.
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            This habit may have been deleted or you may not have access to it.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-sm shadow-emerald-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      ) : pageError ? (
        /* Error State */
        <div
          role="alert"
          className="p-5 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-2">
            <p className="font-semibold">Unable to load habit history</p>
            <p>{pageError}</p>
            <Link
              to="/dashboard"
              className="inline-block text-xs font-semibold underline hover:no-underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Habit History Content */
        <HabitHistory
          habit={habit}
          checkins={checkins}
          onCheckin={handleCheckin}
          isCheckingIn={Boolean(checkinLoading[habit.id])}
        />
      )}
    </div>
  );
}
