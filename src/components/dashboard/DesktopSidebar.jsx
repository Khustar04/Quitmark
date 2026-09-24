import { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutGrid,
  CheckCircle2,
  Trophy,
  Target,
  Sliders,
  LogOut,
} from 'lucide-react';
import { signOut } from '../../services/authService';
import { clearAuth } from '../../store/slices/authSlice';
import { resetHabitsState } from '../../store/slices/habitsSlice';
import { setActiveUserId } from '../../utils/auth/sessionGuard';
import { setNotificationUser } from '../../utils/notifications/inAppNotificationStore';
import { clearNotifiedStreakHabitIds } from '../../utils/notifications/streakNotifier';

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const currentPath = location.pathname;

  const userName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName) return fullName.split(' ')[0];
    if (user?.email) {
      const raw = user.email.split('@')[0];
      const alphaOnly = raw.replace(/[0-9_.-]+$/, '');
      if (alphaOnly.toLowerCase().includes('khustar')) return 'Khustar';
      return alphaOnly ? alphaOnly.charAt(0).toUpperCase() + alphaOnly.slice(1) : 'Khustar';
    }
    return 'Khustar';
  }, [user]);

  const isHomeActive = currentPath === '/dashboard';
  const isHabitsActive = currentPath === '/habits' || currentPath.startsWith('/habits/');
  const isLeaderboardActive = currentPath === '/leaderboard' || currentPath.startsWith('/leaderboard/');
  const isGoalsActive = currentPath === '/goals' || currentPath.startsWith('/goals/');
  const isSettingsActive = currentPath === '/settings' || currentPath.startsWith('/settings/');

  const handleLogout = async () => {
    try {
      await signOut();
      setActiveUserId(null);
      setNotificationUser(null);
      clearNotifiedStreakHabitIds();
      dispatch(clearAuth());
      dispatch(resetHabitsState());
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItemClass = (isActive) =>
    `relative flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
      isActive
        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs pl-3.5 before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:rounded-r-full before:bg-emerald-500'
        : 'text-slate-600 dark:text-[#85948b] hover:bg-slate-50 dark:hover:bg-[#272a2d] hover:text-slate-900 dark:hover:text-[#e1e2e7]'
    }`;

  return (
    <aside
      className="hidden lg:flex w-64 bg-white dark:bg-[#0b0e11] border-r border-slate-200 dark:border-white/[0.04] flex-col p-5 shrink-0 h-screen sticky top-0 z-30 select-none transition-colors"
      aria-label="Desktop Navigation"
    >
      {/* Top Branding & Navigation */}
      <div className="flex flex-col gap-6">
        {/* Quitmark Logo */}
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-1 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          aria-label="Quitmark Home"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#272a2d] flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#5af0b3]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-semibold text-slate-900 dark:text-[#e1e2e7] tracking-tight leading-none">
              Quitmark
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#85948b] font-normal leading-tight mt-1">
              Daily consistency
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav aria-label="Main Menu" className="flex flex-col gap-1">
          {/* Dashboard */}
          <Link
            to="/dashboard"
            aria-current={isHomeActive ? 'page' : undefined}
            className={navItemClass(isHomeActive)}
          >
            <LayoutGrid className="w-5 h-5 stroke-[2]" />
            <span>Dashboard</span>
          </Link>

          {/* Habits */}
          <Link
            to="/habits"
            aria-current={isHabitsActive ? 'page' : undefined}
            className={navItemClass(isHabitsActive)}
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            <span>Habits</span>
          </Link>

          {/* Leaderboard */}
          <Link
            to="/leaderboard"
            aria-current={isLeaderboardActive ? 'page' : undefined}
            className={navItemClass(isLeaderboardActive)}
          >
            <Trophy className="w-5 h-5 stroke-[2]" />
            <span>Leaderboard</span>
          </Link>

          {/* Goals */}
          <Link
            to="/goals"
            aria-current={isGoalsActive ? 'page' : undefined}
            className={navItemClass(isGoalsActive)}
          >
            <Target className="w-5 h-5 stroke-[2]" />
            <span>Goals</span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            aria-current={isSettingsActive ? 'page' : undefined}
            className={navItemClass(isSettingsActive)}
          >
            <Sliders className="w-5 h-5 stroke-[2]" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Profile & Logout Card - Pinned consistently with intentional divider */}
      <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-white/[0.04] flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#161a1f]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#272a2d] flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs font-semibold text-slate-900 dark:text-[#e1e2e7] leading-tight truncate">
              {userName}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-[#85948b] leading-tight truncate">
              Active account
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors text-xs font-semibold shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          title="Log out of Quitmark"
          aria-label="Log out"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
