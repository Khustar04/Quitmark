import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import { useNotificationScheduler } from '../hooks/useNotificationScheduler';

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
      <Navbar />
      <main className={`flex-1 w-full ${user ? 'pb-24 md:pb-0' : ''}`}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
