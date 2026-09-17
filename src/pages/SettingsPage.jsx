import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getNotificationPreferences, saveNotificationPreferences } from '../utils/notifications/notificationPreferences';
import { sendPasswordResetEmail } from '../services/authService';
import { Bell, Shield, Loader2, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

function ToggleSwitch({ label, checked, onChange, description }) {
  return (
    <div className="flex items-center justify-between py-5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0">
      <div className="pr-4">
        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer" onClick={() => onChange(!checked)}>
          {label}
        </label>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0D0F17] ${
          checked ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(getNotificationPreferences());
  const user = useSelector((state) => state.auth.user);
  
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState(null);

  const { isInstallable, isInstalled, handleInstallClick } = useInstallPrompt();

  const handleToggle = (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
  };

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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-in fade-in duration-300 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
          Manage your Quitmark preferences.
        </p>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Notifications</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Control when and how Quitmark alerts you.</p>
          </div>
        </div>

        <div className="flex flex-col">
          <ToggleSwitch
            label="Streak Reminders"
            description="Get notified if you're about to lose an active streak."
            checked={prefs.streakReminders}
            onChange={(val) => handleToggle('streakReminders', val)}
          />
          <ToggleSwitch
            label="Morning"
            description="Allow reminder notifications in the morning."
            checked={prefs.morning}
            onChange={(val) => handleToggle('morning', val)}
          />
          <ToggleSwitch
            label="Afternoon"
            description="Allow reminder notifications in the afternoon."
            checked={prefs.afternoon}
            onChange={(val) => handleToggle('afternoon', val)}
          />
          <ToggleSwitch
            label="Evening"
            description="Allow reminder notifications in the evening."
            checked={prefs.evening}
            onChange={(val) => handleToggle('evening', val)}
          />
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Security</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Manage your account security and password.</p>
          </div>
        </div>

        <div className="py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Password Reset</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                Receive an email containing a secure link to reset your account password.
              </p>
            </div>
            
            {resetSuccess ? (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                <span>Email Sent</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePasswordResetRequest}
                disabled={resetLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            )}
          </div>
          
          {resetError && (
            <div className="mt-4 flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}
        </div>
      </div>

      {/* App Experience Section */}
      {(!isInstalled && isInstallable) && (
        <div className="bg-white dark:bg-[#0D0F17] rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">App Experience</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Install Quitmark for a better, app-like experience.</p>
            </div>
          </div>

          <div className="py-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Add to Home Screen</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
                  Install Quitmark on your device for quick access and offline support.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-sm shadow-emerald-600/20"
              >
                <span>Install Quitmark</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
