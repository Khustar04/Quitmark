import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, CheckSquare, Trophy, Target } from 'lucide-react';
import { isNativeApp } from '../../utils/notifications/nativeReminderService';

export default function MobileBottomNav() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!user) return null;

  const currentPath = location.pathname;
  const isNative = isNativeApp();

  const navItems = [
    {
      label: 'Home',
      to: '/dashboard',
      icon: Home,
      isActive: currentPath === '/dashboard',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      label: 'Habits',
      to: '/habits',
      icon: CheckSquare,
      isActive: currentPath === '/habits',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      label: 'Leaderboard',
      to: '/leaderboard',
      icon: Trophy,
      isActive: currentPath === '/leaderboard',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    },
    {
      label: 'Goals',
      to: '/goals',
      icon: Target,
      isActive: currentPath === '/goals',
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c1013] backdrop-blur-xl border-t border-slate-200 dark:border-white/[0.06] pt-2 shadow-[0_-4px_25px_rgba(0,0,0,0.3)] transition-colors"
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={item.onClick}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all select-none touch-manipulation focus-visible:outline-none ${
                active
                  ? 'text-emerald-500 dark:text-[#00E599] font-semibold'
                  : 'text-slate-400 dark:text-[#85948b] hover:text-slate-700 dark:hover:text-[#e1e2e7] font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  active ? 'stroke-[2.4] scale-105' : 'stroke-[1.8]'
                }`}
              />
              <span className="text-[11px] leading-tight tracking-tight mt-1">
                {item.label}
              </span>
              {active ? (
                <span
                  className="w-4 h-0.5 rounded-full bg-emerald-500 dark:bg-[#00E599] mt-1"
                  aria-hidden="true"
                />
              ) : (
                <span className="w-4 h-0.5 rounded-full bg-transparent mt-1" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
