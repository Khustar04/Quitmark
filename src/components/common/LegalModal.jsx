import { useEffect, useRef } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, type = 'privacy' }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousActiveElement.current = document.activeElement;

    // Focus the primary close button on open
    const initialFocusTimeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(initialFocusTimeout);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              {isPrivacy ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Habit Tracker &bull; Last updated September 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {isPrivacy ? (
            <>
              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  1. Data Collection & Privacy Commitment
                </h3>
                <p>
                  We believe your habits and personal progress belong solely to you. We only collect the minimum
                  information necessary to provide streak tracking: your registered email address, created habits,
                  and daily check-in timestamps.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  2. Security & Storage
                </h3>
                <p>
                  All account credentials and habit data are encrypted in transit and at rest using enterprise-grade
                  PostgreSQL with Row-Level Security (RLS). Only your authenticated account can read or modify your habits.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  3. Notifications & Permissions
                </h3>
                <p>
                  Reminder notifications are requested strictly with your explicit consent. Push notification tokens
                  and scheduling preferences are stored securely and used solely to send timely reminders for your
                  habits. You can revoke permissions or adjust timing at any time in Settings.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  4. Zero Third-Party Monetization
                </h3>
                <p>
                  We do not sell, rent, or trade your personal data, habits, or behavioral analytics to any advertisers,
                  data brokers, or third parties.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  5. Data Portability & Export
                </h3>
                <p>
                  You retain full ownership of your data. You can download an offline JSON backup of all your habits
                  and check-in records at any time directly from the Profile &gt; Data &amp; Backup section.
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using Habit Tracker (Quitmark), you agree to be bound by these Terms of Service.
                  If you do not agree, please discontinue using the application.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  2. Personal Productivity Use
                </h3>
                <p>
                  Habit Tracker is designed to support personal habit building, consistency tracking, and productivity.
                  You may use the service for personal, non-commercial purposes in compliance with all applicable laws.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  3. Account Responsibility
                </h3>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities
                  that occur under your account. Please notify us immediately of any unauthorized use.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  4. Service Availability & Updates
                </h3>
                <p>
                  We continuously improve Habit Tracker. We may add new features, refine existing features, or perform
                  maintenance updates to ensure smooth performance across web and mobile platforms.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base mb-2">
                  5. Disclaimer & Limitation of Liability
                </h3>
                <p>
                  The application is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind.
                  Habit Tracker is not liable for any indirect or consequential damages arising from your use of the platform.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-[#121622]/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
