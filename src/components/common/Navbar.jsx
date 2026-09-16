import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X, LogOut, LayoutDashboard, User, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationToggle from './NotificationToggle';
import { signOut } from '../../services/authService';
import { clearAuth } from '../../store/slices/authSlice';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

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
      dispatch(clearAuth());
      setMobileMenuOpen(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Links to /dashboard when authenticated, / when unauthenticated */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-zinc-900 dark:text-white group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-md"
          onClick={() => setMobileMenuOpen(false)}
          aria-label={user ? 'Quitmark Dashboard' : 'Quitmark Home'}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 group-hover:scale-110 transition-transform" />
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

              <NotificationToggle />
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
          {user && <NotificationToggle />}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 animate-in fade-in duration-150">
          {user ? (
            /* Authenticated Mobile Drawer: Profile Row + Dashboard + Logout (NO "How it works", NO public links) */
            <>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">Account</p>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {user.email || 'User'}
                  </p>
                </div>
              </div>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] transition-colors ${
                  location.pathname === '/settings'
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium min-h-[44px] text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            /* Unauthenticated Mobile Drawer: How it Works + Login + Get Started */
            <>
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
            </>
          )}
        </div>
      )}
    </header>
  );
}
