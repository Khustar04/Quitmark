import { useState } from 'react';
import { Activity, Info, Check, X } from 'lucide-react';
import { formatFullDisplayDate } from '../../utils/streaks/dateUtils';
import { useLocalDate } from '../../hooks/useLocalDate';
import { buildHeatmapGrid } from '../../utils/progress/buildHabitHeatmap';
import CheckinLegend from './CheckinLegend';

export default function CheckinCalendar({ checkins = [] }) {
  const todayStr = useLocalDate();
  const [selectedDay, setSelectedDay] = useState(null);

  // Pre-index checkins by date for O(1) lookups
  const checkinsMap = new Map();
  checkins.forEach((c) => {
    if (c?.check_in_date) {
      checkinsMap.set(c.check_in_date, c.status);
    }
  });

  const getDayStatus = (dateStr) => {
    if (dateStr > todayStr) return 'future';
    if (checkinsMap.has(dateStr)) return checkinsMap.get(dateStr); // 'completed' or 'missed'
    if (dateStr === todayStr) return 'pending';
    return 'none';
  };

  const heatmapDays = buildHeatmapGrid(13); // 13 weeks = 91 days
  const weekDaysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-[#232936] bg-white dark:bg-[#0D0F17] p-5 sm:p-7 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-[#232936]">
        <Activity className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
          Contribution Heatmap
        </h2>
      </div>

      {/* Heatmap Grid Wrapper (overflow-x-auto to prevent page breakage on mobile) */}
      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[600px] flex gap-2">
          {/* Day Labels */}
          <div className="grid grid-rows-7 gap-1.5">
            {weekDaysLabels.map((day, idx) => (
              <div 
                key={day} 
                className={`text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 pr-2 flex items-center justify-end h-3.5 sm:h-4 ${idx % 2 === 1 ? '' : 'opacity-0'}`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 flex-1">
            {heatmapDays.map((dateStr) => {
              const status = getDayStatus(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay?.dateStr === dateStr;

              let cellStyles = 'bg-zinc-100/80 dark:bg-[#131722] border border-zinc-200/50 dark:border-[#232936]';
              
              if (status === 'completed') {
                cellStyles = 'bg-emerald-500 border border-emerald-400/50 shadow-sm shadow-emerald-500/10';
              } else if (status === 'missed') {
                cellStyles = 'bg-red-500/70 border border-red-500/50';
              } else if (status === 'pending') {
                cellStyles = 'bg-emerald-500/20 border border-dashed border-emerald-500';
              } else if (status === 'future') {
                cellStyles = 'bg-zinc-50/50 dark:bg-zinc-900/20 border border-transparent opacity-40 cursor-not-allowed';
              }

              if (isSelected) {
                cellStyles += ' ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0D0F17] z-10';
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={status === 'future'}
                  onClick={() => setSelectedDay({ dateStr, status })}
                  onMouseEnter={() => setSelectedDay({ dateStr, status })}
                  onFocus={() => setSelectedDay({ dateStr, status })}
                  className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm transition-all hover:scale-125 hover:z-20 focus-visible:outline-none ${cellStyles}`}
                  title={`${formatFullDisplayDate(dateStr)}: ${
                    status === 'completed' ? 'Completed' :
                    status === 'missed' ? 'Missed' :
                    isToday ? 'Today (Pending)' : 'No check-in'
                  }`}
                  aria-label={`${formatFullDisplayDate(dateStr)}, status: ${status}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Quick Inspector */}
      {selectedDay && (
        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-[#232936] bg-zinc-50 dark:bg-[#131722] flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="font-semibold text-zinc-900 dark:text-white">
              {formatFullDisplayDate(selectedDay.dateStr)}
            </span>
          </div>
          <div>
            {selectedDay.status === 'completed' && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Completed</span>
              </span>
            )}
            {selectedDay.status === 'missed' && (
              <span className="inline-flex items-center gap-1 font-semibold text-red-500 dark:text-red-400">
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Missed</span>
              </span>
            )}
            {selectedDay.status === 'pending' && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Pending Today
              </span>
            )}
            {selectedDay.status === 'none' && (
              <span className="text-zinc-400 dark:text-zinc-500">
                No Record
              </span>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <CheckinLegend />
    </div>
  );
}
