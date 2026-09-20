import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHeatmapGrid } from '../src/utils/progress/buildHabitHeatmap.js';

// ──────────────────────────────────────
// Basic structure
// ──────────────────────────────────────

test('buildHeatmapGrid returns correct number of days for 12 weeks', () => {
  const grid = buildHeatmapGrid(12);
  assert.equal(grid.length, 84);
});

test('buildHeatmapGrid returns correct number of days for 1 week', () => {
  const grid = buildHeatmapGrid(1);
  assert.equal(grid.length, 7);
});

test('buildHeatmapGrid returns correct number of days for 52 weeks', () => {
  const grid = buildHeatmapGrid(52);
  assert.equal(grid.length, 364);
});

// ──────────────────────────────────────
// Format validation
// ──────────────────────────────────────

test('all dates in grid are YYYY-MM-DD format', () => {
  const grid = buildHeatmapGrid(4);
  for (const dateStr of grid) {
    assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
  }
});

// ──────────────────────────────────────
// Order
// ──────────────────────────────────────

test('dates are in ascending chronological order', () => {
  const grid = buildHeatmapGrid(8);
  for (let i = 1; i < grid.length; i++) {
    assert.ok(grid[i] > grid[i - 1], `${grid[i]} should be after ${grid[i - 1]}`);
  }
});

// ──────────────────────────────────────
// Grid alignment
// ──────────────────────────────────────

test('grid starts on a Sunday (day 0)', () => {
  const grid = buildHeatmapGrid(4);
  const firstDate = grid[0];
  const [y, m, d] = firstDate.split('-').map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();
  assert.equal(dayOfWeek, 0, 'First date in grid should be a Sunday');
});

test('grid ends on a Saturday (day 6)', () => {
  const grid = buildHeatmapGrid(4);
  const lastDate = grid[grid.length - 1];
  const [y, m, d] = lastDate.split('-').map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();
  assert.equal(dayOfWeek, 6, 'Last date in grid should be a Saturday');
});

test('grid includes today', () => {
  const grid = buildHeatmapGrid(12);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const today = `${y}-${m}-${d}`;
  assert.ok(grid.includes(today), 'Grid should include today');
});
