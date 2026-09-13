import { useState } from 'react';
import { getNotificationPreferences, saveNotificationPreferences } from '../utils/notifications/notificationPreferences';
import { Bell } from 'lucide-react';

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

  const handleToggle = (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 animate-in fade-in duration-300">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-3">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
          Manage your Quitmark preferences.
        </p>
      </div>

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
    </div>
  );
}
