/**
 * Calendar date utilities using YYYY-MM-DD representation.
 * Prevents timezone drift by operating strictly on local calendar year, month, and day.
 */

/**
 * Returns a 'YYYY-MM-DD' string for the given Date (defaults to local now).
 */
export const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns the 'YYYY-MM-DD' string for the calendar day immediately preceding dateStr.
 */
export const getPreviousDayString = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
};

/**
 * Formats a 'YYYY-MM-DD' string into a friendly label (e.g. 'Today', 'Yesterday', 'Sep 12').
 */
export const formatDisplayDate = (dateStr) => {
  const today = getLocalDateString();
  const yesterday = getPreviousDayString(today);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/**
 * Formats a 'YYYY-MM-DD' string into a full readable date (e.g. 'September 12, 2026').
 */
export const formatFullDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Returns month details for calendar generation (1-indexed month: 1=Jan, 12=Dec).
 */
export const getMonthDetails = (year, month) => {
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
  });

  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    days.push({
      dayNumber: d,
      dateStr: `${year}-${monthStr}-${dayStr}`,
    });
  }

  return {
    year,
    month,
    monthName,
    firstDayIndex,
    daysInMonth,
    days,
  };
};

/**
 * Returns date strings for the last N weeks (default 12 weeks) ending on today.
 */
export const getLastNWeeksDays = (weeks = 12) => {
  const daysCount = weeks * 7;
  const days = [];
  const today = new Date();

  // Find ending date (today)
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getLocalDateString(d));
  }

  return days;
};
