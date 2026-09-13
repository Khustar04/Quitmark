import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
