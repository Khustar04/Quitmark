import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LegalModal from './LegalModal';

export default function Footer() {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });

  const openLegal = (type) => {
    setLegalModal({ isOpen: true, type });
  };

  const closeLegal = () => {
    setLegalModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleHowItWorksClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const section = document.getElementById('how-it-works');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <footer
        className={`relative z-10 border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#090B10] text-zinc-600 dark:text-zinc-400 transition-colors transform-gpu ${
          user ? 'hidden md:block' : 'block'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            {/* Column 1: Brand & Tagline (spans 2 cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <Link
                to={user ? '/dashboard' : '/'}
                className="inline-flex items-center gap-2.5 font-bold tracking-tight text-zinc-900 dark:text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md text-lg"
                aria-label="Quitmark Home"
              >
                <img
                  src="/logo.png"
                  alt="Quitmark Logo"
                  className="w-6 h-6 object-contain group-hover:scale-105 transition-transform"
                />
                <span className="font-extrabold uppercase tracking-wider text-base sm:text-lg">
                  QUITMARK
                </span>
              </Link>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed">
                Build better habits, one day at a time.
              </p>

              {/* Social / Feedback Links */}
              <div className="pt-2 flex items-center gap-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <a
                  href="https://github.com/Khustar04/Quitmark---AI-based-Habit-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  GitHub
                </a>
                <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">&bull;</span>
                <a
                  href="https://www.linkedin.com/in/khustarhussain04/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  LinkedIn
                </a>
                <span className="text-zinc-300 dark:text-zinc-700" aria-hidden="true">&bull;</span>
                <Link
                  to="/report-bug"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                >
                  Feedback
                </Link>
              </div>
            </div>

            {/* Column 2: PRODUCT */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
                PRODUCT
              </h3>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link
                    to={user ? '/dashboard' : '/login'}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? '/dashboard#habits' : '/login'}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Habits
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? '/leaderboard' : '/login'}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Progress
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? '/settings' : '/login'}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Reminders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: RESOURCES */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
                RESOURCES
              </h3>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link
                    to={user ? '/dashboard' : '/#how-it-works'}
                    onClick={handleHowItWorksClick}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    to="/report-bug"
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: LEGAL */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4">
                LEGAL
              </h3>
              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('privacy')}
                    className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => openLegal('terms')}
                    className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-sm"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar Divider and Copyright */}
          <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <p>&copy; {new Date().getFullYear()} Quitmark</p>
            <p className="inline-flex items-center gap-1.5">
              <span>Built By Khustar Hussain</span>
              <span role="img" aria-label="love" className="text-red-500">❤️</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modal Dialog */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={closeLegal}
        type={legalModal.type}
      />
    </>
  );
}
