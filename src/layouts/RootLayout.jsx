import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import DesktopSidebar from '../components/dashboard/DesktopSidebar';
import { useNotificationScheduler } from '../hooks/useNotificationScheduler';
import { isMobileApp } from '../utils/platform';

export default function RootLayout() {
  useNotificationScheduler();
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  // Scroll to top when changing routes, unless navigating to a specific hash anchor
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  const isAuth = Boolean(user);
  const isMobileStarter = isMobileApp() && location.pathname === '/' && !isAuth;

  if (isMobileStarter) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#eef9f2] via-[#f7fcf9] to-[#e4f5eb] antialiased">
        <main className="w-full min-h-screen">
          <Outlet />
        </main>
      </div>
    );
  }

  const isAppRoute = ['/dashboard', '/habits', '/goals', '/leaderboard', '/settings'].some(
    (route) => location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-[#111417] text-slate-900 dark:text-[#e1e2e7] antialiased transition-colors">
      {/* Desktop Sidebar (Only for authenticated users on lg+) */}
      {isAuth && <DesktopSidebar />}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar: Visible on mobile/tablet for everyone, and on desktop for unauthenticated visitors */}
        <div className={`sticky top-0 z-50 w-full ${isAuth ? 'lg:hidden' : ''}`}>
          <Navbar />
        </div>

        <main className={`flex-1 w-full ${isAuth ? 'pb-20 lg:pb-0' : ''}`}>
          <Outlet />
        </main>

        {/* Marketing footer for public marketing routes only */}
        {!isAppRoute && <Footer />}

        {/* Mobile bottom navigation for authenticated mobile users */}
        {isAuth && <MobileBottomNav />}
      </div>
    </div>
  );
}
