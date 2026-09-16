import { useState, useEffect } from 'react';
import { getLocalDateString } from '../utils/streaks/dateUtils';

/**
 * A hook that returns the current local date string (YYYY-MM-DD).
 * It automatically updates if the date changes (e.g., crossing midnight).
 */
export function useLocalDate() {
  const [localDateStr, setLocalDateStr] = useState(getLocalDateString());

  useEffect(() => {
    const checkDate = () => {
      const newDateStr = getLocalDateString();
      if (newDateStr !== localDateStr) {
        setLocalDateStr(newDateStr);
      }
    };

    // Check when tab becomes visible (user returns to app)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkDate();
      }
    };
    
    // Check when window gains focus
    const handleFocus = () => {
      checkDate();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    // Periodic check in case the tab is kept active on a monitor (check every 1 minute)
    const interval = setInterval(checkDate, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [localDateStr]);

  return localDateStr;
}

export default useLocalDate;
