import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, LogOut, LayoutDashboard, Trophy } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBellPopover from './NotificationBellPopover';
import { signOut } from '../../services/authService';
import { clearAuth } from '../../store/slices/authSlice';
import { resetHabitsState } from '../../store/slices/habitsSlice';
import { setActiveUserId } from '../../utils/auth/sessionGuard';
import { setNotificationUser } from '../../utils/notifications/inAppNotificationStore';
import { clearNotifiedStreakHabitIds } from '../../utils/notifications/streakNotifier';
import { isNativeApp } from '../../utils/notifications/nativeReminderService';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Close both menus when route changes
  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    if (mobileMenuOpen) setMobileMenuOpen(false);
    if (notificationOpen) setNotificationOpen(false);
  }

  const handleToggleNotification = () => {
    setNotificationOpen((prev) => {
      const next = !prev;
      if (next) setMobileMenuOpen(false); // Close mobile drawer when popover opens
      return next;
    });
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const next = !prev;
      if (next) setNotificationOpen(false); // Close notification popover when mobile drawer opens
      return next;
    });
  };

  const handleHowItWorksClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const section = document.getElementById('how-it-works');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setActiveUserId(null);
      setNotificationUser(null);
      clearNotifiedStreakHabitIds();
      dispatch(clearAuth());
      dispatch(resetHabitsState());
      setMobileMenuOpen(false);
      setNotificationOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isNative = isNativeApp();
  const userInitial = (user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();

  return (
    <header
      style={{
        paddingTop: isNative
          ? 'max(env(safe-area-inset-top, 0px), 28px)'
          : 'max(env(safe-area-inset-top, 0px), 0px)',
      }}
      className="w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#090A0F] supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-[#090A0F]/95 backdrop-blur-md transition-colors shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Links to /dashboard when authenticated, / when unauthenticated */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-zinc-900 dark:text-white group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-md"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={user ? 'Quitmark Home' : 'Quitmark'}
        >
          <img src="/logo.png" alt="Quitmark Logo" className="w-8 h-8 rounded-xl object-contain group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Quitmark</span>
            <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400 tracking-tight leading-none">
              Small Habits. Big Changes.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            /* Authenticated Navigation: Home + Habits + Leaderboard + Goals + Bell + Theme + Profile + Logout */
            <>
              <Link
                to="/dashboard"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  location.pathname === '/dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                aria-label="Home"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <Link
                to="/habits"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  location.pathname === '/habits'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                aria-label="Habits"
              >
                <span>Habits</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  location.pathname === '/leaderboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                aria-label="Leaderboard"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>

              <Link
                to="/goals"
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  location.pathname === '/goals'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                aria-label="Goals"
              >
                <span>Goals</span>
              </Link>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 my-auto" />

              <NotificationBellPopover
                isOpen={notificationOpen}
                onToggle={handleToggleNotification}
                onClose={handleCloseNotification}
              />
              <ThemeToggle />

              {/* Profile Avatar Button -> Navigates to /settings */}
              <Link
                to="/settings"
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  location.pathname === '/settings'
                    ? 'bg-emerald-500 text-zinc-950 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-[#090A0F]'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
                }`}
                title="Profile & Settings"
                aria-label="Profile & Settings"
              >
                {userInitial}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            /* Unauthenticated Navigation: How it Works + Login + Get Started + Theme */
            <>
              <a
                href="/#how-it-works"
                onClick={handleHowItWorksClick}
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                How it Works
              </a>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              <Link
                to="/login"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="inline-flex items-center justify-center text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white transition-colors shadow-sm shadow-emerald-700/20 active:scale-[0.98]"
              >
                Get Started
              </Link>

              <ThemeToggle />
            </>
          )}
        </nav>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <NotificationBellPopover
              isOpen={notificationOpen}
              onToggle={handleToggleNotification}
              onClose={handleCloseNotification}
            />
          )}
          <ThemeToggle />
          {user && (
            <Link
              to="/settings"
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                location.pathname === '/settings'
                  ? 'bg-emerald-500 text-zinc-950 ring-2 ring-emerald-400 ring-offset-2 dark:ring-offset-[#090A0F]'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25'
              }`}
              title="Profile & Settings"
              aria-label="Profile & Settings"
            >
              {userInitial}
            </Link>
          )}
          {/* Mobile Menu Button (Only for unauthenticated users; authenticated mobile users use MobileBottomNav) */}
          {!user && (
            <button
              type="button"
              onClick={handleToggleMobileMenu}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Only for unauthenticated users: How it Works + Login + Get Started) */}
      {!user && mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 animate-in fade-in duration-150">
          <a
            href="/#how-it-works"
            onClick={handleHowItWorksClick}
            className="block px-3 py-2.5 rounded-md text-sm font-medium min-h-[44px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            How it Works
          </a>

          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-sm font-medium min-h-[44px] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Login
          </Link>

          <Link
            to="/signup"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white text-sm font-semibold shadow-sm min-h-[44px] flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
