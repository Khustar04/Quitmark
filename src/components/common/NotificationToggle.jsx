import { useState, useEffect } from 'react';
import { BellOff, BellRing } from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
} from '../../utils/notifications/notificationService';
import { getNotificationPreferences, saveNotificationPreferences } from '../../utils/notifications/notificationPreferences';

export default function NotificationToggle() {
  const [supported] = useState(isNotificationSupported());
  const [permission, setPermission] = useState(getNotificationPermission());
  const [appEnabled, setAppEnabled] = useState(() => {
    if (!isNotificationSupported()) return false;
    const prefs = getNotificationPreferences();
    return prefs.enabled === true;
  });
  const [showMessage, setShowMessage] = useState(false);
  const [clickMessage, setClickMessage] = useState('');

  useEffect(() => {
    if (!supported) return;

    const handleStorageChange = (e) => {
      // e.key is the localStorage key that changed. null means all of localStorage was cleared.
      if (e.key === 'quitmark_notification_prefs' || e.key === null) {
        const prefs = getNotificationPreferences();
        setAppEnabled(prefs.enabled === true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [supported]);

  if (!supported || permission === 'unsupported') {
    return null; // Fail gracefully: do not show broken controls
  }

  const isCurrentlyOn = appEnabled && permission === 'granted';

  const showToast = (message) => {
    setClickMessage(message);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const handleToggle = async () => {
    if (isCurrentlyOn) {
      // Turn OFF
      saveNotificationPreferences({ enabled: false });
      setAppEnabled(false);
      showToast('Notifications disabled');
    } else {
      // Turn ON
      if (permission === 'denied') {
        showToast('Browser notifications are blocked. Please allow them in your browser settings.');
      } else if (permission === 'default') {
        const result = await requestNotificationPermission();
        setPermission(result);
        if (result === 'granted') {
          saveNotificationPreferences({ enabled: true });
          setAppEnabled(true);
          showToast('Notifications enabled');
        } else {
          showToast('Please allow browser notifications to enable notifications');
        }
      } else if (permission === 'granted') {
        saveNotificationPreferences({ enabled: true });
        setAppEnabled(true);
        showToast('Notifications enabled');
      }
    }
  };

  let Icon;
  let baseTitle;
  let styles;

  if (isCurrentlyOn) {
    Icon = BellRing;
    baseTitle = 'Notifications Enabled (Click to disable)';
    styles =
      'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20';
  } else if (permission === 'denied') {
    Icon = BellOff;
    baseTitle = 'Notifications Blocked';
    styles =
      'text-red-500 dark:text-red-400 border-red-500/40 bg-red-500/10 opacity-70 hover:opacity-100';
  } else {
    // It's OFF but not denied (default or disabled by user)
    Icon = BellOff;
    baseTitle = 'Notifications Disabled (Click to enable)';
    styles =
      'text-zinc-500 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900';
  }

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-center w-9 h-9 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${styles}`}
        title={baseTitle}
        aria-label={baseTitle}
      >
        <Icon className="w-4 h-4" />
      </button>

      {/* Calm temporary message popup for toggles */}
      {showMessage && clickMessage && (
        <div className="absolute top-full mt-2 right-0 w-max max-w-[200px] sm:max-w-xs p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs shadow-lg text-center font-medium animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          {clickMessage}
        </div>
      )}
    </div>
  );
}
