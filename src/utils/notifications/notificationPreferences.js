const PREFS_KEY = 'quitmark_notification_prefs';

const defaultPreferences = {
  streakReminders: true,
  morning: true,
  afternoon: true,
  evening: true,
};

export const getNotificationPreferences = () => {
  if (typeof window === 'undefined') return defaultPreferences;
  
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to parse notification preferences', error);
  }
  
  return defaultPreferences;
};

export const saveNotificationPreferences = (newPrefs) => {
  if (typeof window === 'undefined') return;
  
  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...newPrefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save notification preferences', error);
  }
};
