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

/**
 * Calculates standard ISO 8601 week number (1 - 53)
 */
export const getISOWeekNumber = (d = new Date()) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
};

/**
 * Returns array of 7 day objects for the week containing `todayDateStr` (Monday to Sunday)
 */
export const getWeekDates = (todayDateStr) => {
  const effectiveToday = todayDateStr || getLocalDateString();
  const [year, month, day] = effectiveToday.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);

  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfWeek = targetDate.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(year, month - 1, day + diffToMonday);
  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateStr = getLocalDateString(d);

    days.push({
      date: d,
      dateStr,
      label: DAY_LABELS[i],
      isToday: dateStr === effectiveToday,
      isFuture: dateStr > effectiveToday,
      isPast: dateStr < effectiveToday,
    });
  }

  return days;
};

/**
 * Determines the visual theme for a day in the weekly rhythm view.
 *
 * Rules:
 * - 'future': Day is in the future.
 * - 'empty': Total habits is 0 (no habits to track).
 * - 'green': All habits completed (completed >= totalHabits && totalHabits > 0).
 * - 'yellow': Partial completion (0 < completed < totalHabits).
 * - 'pending': Today with 0 completed (day is active/in-progress, not missed).
 * - 'red': Past day with 0 completed (missed day).
 *
 * @param {Object} params
 * @param {number} [params.totalHabits=0]
 * @param {number} [params.completed=0]
 * @param {boolean} [params.isToday=false]
 * @param {boolean} [params.isFuture=false]
 * @returns {'future' | 'empty' | 'green' | 'yellow' | 'pending' | 'red'}
 */
export const getDayTheme = ({ totalHabits = 0, completed = 0, isToday = false, isFuture = false } = {}) => {
  if (isFuture) return 'future';
  if (totalHabits === 0) return 'empty';
  if (completed >= totalHabits) return 'green';
  if (completed > 0) return 'yellow';
  if (isToday) return 'pending';
  return 'red';
};

