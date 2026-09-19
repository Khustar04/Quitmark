import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { getNotificationPreferences } from '../utils/notifications/notificationPreferences';
import { sendNotification } from '../utils/notifications/notificationService';
import { getLocalDateString } from '../utils/streaks/dateUtils';

const WINDOWS = {
  morning: { start: 9, end: 11 }, // 9 AM to 11:59 AM
  afternoon: { start: 14, end: 17 }, // 2 PM to 5:59 PM
  evening: { start: 20, end: 23 }, // 8 PM to 11:59 PM
};

export function useNotificationScheduler() {
  const habits = useSelector((state) => state.habits?.items || []);
  const checkinsByHabit = useSelector((state) => state.habits?.checkinsByHabit || {});
  
  // Use a ref so the interval always has the latest state without re-triggering the effect
  const stateRef = useRef({ habits, checkinsByHabit });
  
  useEffect(() => {
    stateRef.current = { habits, checkinsByHabit };
  }, [habits, checkinsByHabit]);

  useEffect(() => {
    const checkSchedule = async () => {
      const prefs = getNotificationPreferences();
      if (!prefs.enabled || !prefs.streakReminders) return;

      const now = new Date();
      const hour = now.getHours();
      
      let currentWindow = null;
      if (hour >= WINDOWS.morning.start && hour <= WINDOWS.morning.end && prefs.morning) {
        currentWindow = 'morning';
      } else if (hour >= WINDOWS.afternoon.start && hour <= WINDOWS.afternoon.end && prefs.afternoon) {
        currentWindow = 'afternoon';
      } else if (hour >= WINDOWS.evening.start && hour <= WINDOWS.evening.end && prefs.evening) {
        currentWindow = 'evening';
      }

      if (!currentWindow) return;

      // We use local YYYY-MM-DD
      const todayStr = getLocalDateString(now);

      const lastSentDate = localStorage.getItem('quitmark_last_notif_date');
      const lastSentWindow = localStorage.getItem('quitmark_last_notif_window');

      // If we already sent a notification for this specific window today, skip
      if (lastSentDate === todayStr && lastSentWindow === currentWindow) {
        return;
      }

      const { habits: currentHabits, checkinsByHabit: currentCheckins } = stateRef.current;
      
      // If habits haven't loaded yet, skip for now and try again next tick
      if (currentHabits.length === 0) return;

      // Check how many habits are incomplete today
      let incompleteCount = 0;
      for (const habit of currentHabits) {
        const checkins = currentCheckins[habit.id] || [];
        const hasCheckedInToday = checkins.some(c => {
          return c.check_in_date && c.check_in_date.startsWith(todayStr);
        });

        if (!hasCheckedInToday) {
          incompleteCount++;
        }
      }

      if (incompleteCount > 0) {
        const title = 'Quitmark Reminder';
        const body = `You have ${incompleteCount} habit${incompleteCount > 1 ? 's' : ''} left to complete this ${currentWindow}! 🔥`;
        
        const success = await sendNotification(title, { body });
        if (success) {
          localStorage.setItem('quitmark_last_notif_date', todayStr);
          localStorage.setItem('quitmark_last_notif_window', currentWindow);
        }
      } else {
        // Even if they have 0 incomplete habits, mark this window as processed
        // so we don't keep calculating.
        localStorage.setItem('quitmark_last_notif_date', todayStr);
        localStorage.setItem('quitmark_last_notif_window', currentWindow);
      }
    };

    // Check immediately on mount
    void checkSchedule();
    // Then every 1 minute
    const interval = setInterval(() => void checkSchedule(), 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
