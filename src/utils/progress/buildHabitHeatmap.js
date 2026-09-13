import { getLocalDateString } from '../streaks/dateUtils';

/**
 * Builds a flat array of 'YYYY-MM-DD' strings representing a continuous grid of dates,
 * designed for a GitHub-style heatmap (grid-flow-col with 7 rows).
 *
 * It perfectly aligns weeks so that index 0 is a Sunday, ensuring that
 * when rendered in a CSS Grid with `grid-rows-7 grid-flow-col`,
 * the days of the week align correctly across all columns.
 *
 * @param {number} weeks The number of complete weeks (columns) to return.
 * @returns {string[]} Flat array of date strings.
 */
export function buildHeatmapGrid(weeks = 12) {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // To have complete columns, we determine the date of the Saturday of the CURRENT week.
  // This allows the grid to end on a Saturday (index 6), making sure the layout is 100% square.
  const daysToSaturday = 6 - currentDayOfWeek;
  const lastGridDate = new Date(today);
  lastGridDate.setDate(today.getDate() + daysToSaturday);

  const totalDays = weeks * 7;
  const grid = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(lastGridDate);
    d.setDate(lastGridDate.getDate() - i);
    grid.push(getLocalDateString(d));
  }

  return grid;
}
