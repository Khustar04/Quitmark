import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  User,
  Moon,
  Sun,
  ShieldCheck,
  FileText,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { sendPasswordResetEmail, signOut } from '../services/authService';
import { clearAuth } from '../store/slices/authSlice';
import { resetHabitsState } from '../store/slices/habitsSlice';
import { toggleTheme } from '../store/slices/uiSlice';
import { setActiveUserId } from '../utils/auth/sessionGuard';
import { setNotificationUser } from '../utils/notifications/inAppNotificationStore';
import { clearNotifiedStreakHabitIds } from '../utils/notifications/streakNotifier';
import {
  isNotificationsGloballyEnabled,
  saveNotificationPreferences,
} from '../utils/notifications/notificationPreferences';
import {
  isNativeApp,
  cancelAllNativeReminders,
  syncAllNativeHabitReminders,
} from '../utils/notifications/nativeReminderService';
import { getAllReminders } from '../services/reminderService';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import LegalModal from '../components/common/LegalModal';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { items: habits, checkinsByHabit } = useSelector((state) => state.habits);
  const theme = useSelector((state) => state.ui.theme);
  const isDark = theme === 'dark';

  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    isNotificationsGloballyEnabled(user?.id)
  );
  const [togglingNotifications, setTogglingNotifications] = useState(false);

  const handleToggleNotifications = async () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    setTogglingNotifications(true);
    try {
      saveNotificationPreferences({ enabled: nextState }, user?.id);
      if (isNativeApp()) {
        if (!nextState) {
          await cancelAllNativeReminders();
        } else {
          const remindersData = await getAllReminders().catch(() => []);
          const rMap = {};
          for (const r of remindersData) {
            rMap[r.habit_id] = r;
          }
          await syncAllNativeHabitReminders(habits, rMap, checkinsByHabit, { userId: user?.id });
        }
      }
    } catch (err) {
      console.warn('[Quitmark] Failed to toggle notifications:', err);
    } finally {
      setTogglingNotifications(false);
    }
  };

  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState(null);

  const [logoutLoading, setLogoutLoading] = useState(false);

  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });

  const { isInstallable, isInstalled, handleInstallClick } = useInstallPrompt();

  const handlePasswordResetRequest = async () => {
    if (!user || !user.email) return;

    try {
      setResetLoading(true);
      setResetError(null);
      await sendPasswordResetEmail(user.email);
      setResetSuccess(true);
    } catch (err) {
      setResetError(err.message || 'Failed to send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut();
      setActiveUserId(null);
      setNotificationUser(null);
      clearNotifiedStreakHabitIds();
      dispatch(clearAuth());
      dispatch(resetHabitsState());
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLogoutLoading(false);
    }
  };

  const userInitial = (user?.email?.charAt(0) || 'U').toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-16 animate-in fade-in duration-300 space-y-6">
      {/* Page Title & Profile Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Profile &amp; Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Manage your account, preferences, notifications, and data.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
          {userInitial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white truncate">
              {user?.email?.split('@')[0] || 'Habit Builder'}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
            {user?.email || 'Logged in user'}
          </p>
        </div>
      </div>

      {/* 1. Account Section */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Account</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Security and credentials</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Email Address</div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{user?.email}</div>
            </div>
            <span className="text-xs text-zinc-400 font-mono self-start sm:self-auto">Verified</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Password Reset</div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Send a secure password reset link to your email.
              </p>
            </div>

            {resetSuccess ? (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Link Sent</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                disabled={resetLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
              >
                {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                <span>Reset Password</span>
              </button>
            )}
          </div>

          {resetError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Appearance Section */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Appearance</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Current theme: <span className="font-semibold capitalize">{theme}</span> mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Switch to Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Switch to Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Notifications Section */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Notifications</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {notificationsEnabled
                  ? 'Reminders and streak protection active'
                  : 'All habit notifications paused'}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            disabled={togglingNotifications}
            onClick={handleToggleNotifications}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 ${
              notificationsEnabled ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          >
            <span className="sr-only">Toggle notifications</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-1">
        <button
          type="button"
          onClick={() => setLegalModal({ isOpen: true, type: 'privacy' })}
          className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Privacy Policy</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Zero data selling &amp; end-to-end security</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800/80" />

        <button
          type="button"
          onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}
          className="w-full flex items-center justify-between py-3 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Terms of Service</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Personal productivity &amp; usage terms</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </button>
      </div>

      {/* 8. Help & Support */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-1">
        <Link
          to="/faq"
          className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">FAQ</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Frequently asked questions &amp; streak rules</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800/80" />

        <Link
          to="/report-bug"
          className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Help &amp; Support / Bug Report</span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Submit feedback or report an unexpected issue</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-400" />
        </Link>
      </div>

      {/* 9. About Habit Tracker & App Experience */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">About Habit Tracker</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Build better habits, one day at a time</p>
          </div>
        </div>

        <div className="space-y-3 pt-1 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span>Version</span>
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">v1.2.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <span>Platform</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Web &bull; PWA &bull; Android</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Built by</span>
            <a
              href="https://khustarhussain.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Khustar Hussain
            </a>
          </div>

          {!isInstalled && isInstallable && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Install Mobile App</span>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Install
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 10. Logout Section */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
        >
          {logoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          <span>Logout</span>
        </button>
      </div>

      {/* Legal Dialog */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
        type={legalModal.type}
      />
    </div>
  );
}
