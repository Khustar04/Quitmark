import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, CheckSquare, BarChart3, User } from 'lucide-react';
import { isNativeApp } from '../../utils/notifications/nativeReminderService';

export default function MobileBottomNav() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const currentPath = location.pathname;
  const currentHash = location.hash;
  const isNative = isNativeApp();

  const isHabitsActive = currentPath === '/dashboard' && (currentHash === '#habits' || currentHash === '#habits-section');
  const isHomeActive = currentPath === '/dashboard' && !isHabitsActive;

  const handleHabitsClick = (e) => {
    e.preventDefault();
    if (currentPath === '/dashboard') {
      navigate('/dashboard#habits', { replace: true });
      const el = document.getElementById('habits-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/dashboard#habits');
    }
  };

  const handleHomeClick = () => {
    if (currentPath === '/dashboard') {
      if (currentHash) {
        navigate('/dashboard', { replace: true });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems = [
    {
      label: 'Home',
      to: '/dashboard',
      icon: Home,
      isActive: isHomeActive,
      onClick: handleHomeClick,
    },
    {
      label: 'Habits',
      to: '/dashboard#habits',
      icon: CheckSquare,
      isActive: isHabitsActive,
      onClick: handleHabitsClick,
    },
    {
      label: 'Progress',
      to: '/leaderboard',
      icon: BarChart3,
      isActive: currentPath === '/leaderboard',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      label: 'Profile',
      to: '/settings',
      icon: User,
      isActive: currentPath === '/settings',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      style={{
        paddingBottom: isNative
          ? 'max(env(safe-area-inset-bottom, 0px), 16px)'
          : 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D0F17]/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={item.onClick}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all select-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                active
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-transform ${
                  active ? 'bg-emerald-500/10 dark:bg-emerald-500/15 scale-105' : ''
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? 'stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {active && (
                  <span
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className="text-[11px] leading-tight tracking-tight mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
