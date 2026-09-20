import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, LogOut, LayoutDashboard, User, Settings, Trophy } from 'lucide-react';
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

  return (
    <header
      style={{
        paddingTop: isNative
          ? 'max(env(safe-area-inset-top, 0px), 28px)'
          : 'max(env(safe-area-inset-top, 0px), 0px)',
      }}
      className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-900/60 backdrop-blur-md transition-all shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.2)] transform-gpu"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Links to /dashboard when authenticated, / when unauthenticated */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-zinc-900 dark:text-white group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-md"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={user ? 'Quitmark Dashboard' : 'Quitmark Home'}
        >
          <img src="/logo.png" alt="Quitmark Logo" className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" />
          <span>Quitmark</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          {user ? (
            /* Authenticated Navigation: Dashboard + Theme Toggle + Profile + Logout */
            <>
              <Link
                to="/dashboard"
                className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  location.pathname === '/dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                aria-label="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
                  location.pathname === '/leaderboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
                aria-label="Leaderboard"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>

              <NotificationBellPopover
                isOpen={notificationOpen}
                onToggle={handleToggleNotification}
                onClose={handleCloseNotification}
              />
              <ThemeToggle />

              {/* Profile Display */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                title={user.email}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                  {user.email?.split('@')[0] || 'User'}
                </span>
              </div>

              {/* Settings Link (Toggle) */}
              <Link
                to={location.pathname === '/settings' ? '/dashboard' : '/settings'}
                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 select-none ${
                  location.pathname === '/settings'
                    ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-500'
                }`}
                title={location.pathname === '/settings' ? 'Close Settings' : 'Settings'}
                aria-label={location.pathname === '/settings' ? 'Close Settings' : 'Settings'}
              >
                <Settings className="w-4 h-4" />
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
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                How it Works
              </a>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              <Link
                to="/login"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
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
            className="w-full text-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-sm min-h-[44px] flex items-center justify-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
