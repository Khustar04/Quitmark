import { useMemo, memo } from 'react';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { getISOWeekNumber, getWeekDates, getLocalDateString, getDayTheme } from '../../utils/streaks/dateUtils';

function WeeklyRhythmCard({
  habits = [],
  checkinsByHabit = {},
  todayDateStr,
  isUsingDemo = false,
  demoStatuses = {},
  className = '',
}) {
  // Compute week days and week number based on real current date
  const { weekDays, weekNumber } = useMemo(() => {
    const effectiveTodayStr =
      (typeof todayDateStr === 'string' && todayDateStr.trim())
        ? todayDateStr
        : getLocalDateString();
    const days = getWeekDates(effectiveTodayStr);
    const [y, m, d] = effectiveTodayStr.split('-').map(Number);
    const currentObj = new Date(y, m - 1, d);
    const wNum = getISOWeekNumber(currentObj);
    return { weekDays: days, weekNumber: wNum };
  }, [todayDateStr]);

  // Total habits denominator (e.g. 5, 10, etc.)
  const totalHabits = useMemo(() => {
    if (habits && habits.length > 0) {
      return habits.length;
    }
    return isUsingDemo ? 5 : 0;
  }, [habits, isUsingDemo]);

  // Calculate day completion status and color theme for each day
  const dayStats = useMemo(() => {
    return weekDays.map((day) => {
      if (day.isFuture) {
        return {
          ...day,
          status: 'future',
          theme: 'future',
          completed: 0,
          total: totalHabits,
        };
      }

      let completed = 0;
      if (habits && habits.length > 0) {
        for (const habit of habits) {
          const cList = checkinsByHabit[habit.id] || [];
          const record = cList.find((c) => c.check_in_date === day.dateStr);
          if (record?.status === 'completed') {
            completed += 1;
          }
        }
      } else if (isUsingDemo) {
        if (day.isToday) {
          ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'].forEach((id) => {
            if (demoStatuses[id] === 'completed') completed += 1;
          });
        } else {
          // Default mock distribution for past days in demo mode
          const pastMocks = [5, 5, 4, 5, 5, 4, 3];
          const dayIndex = (day.date.getDay() + 6) % 7;
          completed = pastMocks[dayIndex] ?? 5;
        }
      }

      const theme = getDayTheme({
        totalHabits,
        completed,
        isToday: day.isToday,
        isFuture: day.isFuture,
      });

      return {
        ...day,
        status: day.isToday ? 'today' : 'active',
        theme,
        completed,
        total: totalHabits,
      };
    });
  }, [weekDays, habits, checkinsByHabit, isUsingDemo, demoStatuses, totalHabits]);

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#141a1e] border border-slate-200/80 dark:border-white/[0.06] p-4 text-left shadow-xs transition-colors ${className}`}
    >
      {/* Header: Title & Dynamic Week Number */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-500 dark:text-[#00E599]" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Weekly Rhythm
          </span>
        </div>
        <span className="font-mono text-xs text-emerald-600 dark:text-[#00E599] font-medium">
          Week {weekNumber}
        </span>
      </div>

      {/* 7 Days Grid (Mon - Sun) */}
      <div className="grid grid-cols-7 gap-1.5 pt-1 text-center">
        {dayStats.map((item) => {
          const isToday = item.isToday;
          const isFuture = item.theme === 'future';
          const isEmpty = item.theme === 'empty';
          const isGreen = item.theme === 'green';
          const isYellow = item.theme === 'yellow';
          const isPending = item.theme === 'pending';
          const isRed = item.theme === 'red';

          // Theme box styling
          let boxClasses = '';
          if (isFuture || isEmpty) {
            boxClasses =
              'bg-slate-100/60 dark:bg-[#181d22]/40 border border-slate-200/60 dark:border-white/[0.04] text-slate-400 dark:text-slate-500';
          } else if (isGreen) {
            boxClasses =
              'bg-emerald-50 dark:bg-[#0e2322] border border-emerald-300 dark:border-[#143d38] text-emerald-600 dark:text-[#00E599] shadow-xs';
          } else if (isYellow) {
            boxClasses =
              'bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-xs';
          } else if (isPending) {
            boxClasses =
              'bg-slate-50 dark:bg-[#181d22]/70 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300';
          } else if (isRed) {
            boxClasses =
              'bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-xs';
          }

          return (
            <div key={item.dateStr} className="flex flex-col items-center gap-1.5">
              {/* Day Label (M, T, W, T, F, S, S) */}
              <span
                className={`text-[11px] select-none ${
                  isToday
                    ? 'text-emerald-600 dark:text-[#00E599] font-bold'
                    : 'text-slate-400 dark:text-[#85948b] font-medium'
                }`}
              >
                {item.label}
              </span>

              {/* Day Metric Box */}
              <div
                className={`w-full py-1.5 min-h-[46px] rounded-lg flex flex-col items-center justify-center transition-all ${boxClasses} ${
                  isToday
                    ? 'ring-1 ring-emerald-500/50 dark:ring-[#00E599]/50'
                    : ''
                }`}
              >
                {isFuture || isEmpty ? (
                  <span className="font-mono text-[10px] select-none">—</span>
                ) : isGreen ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold leading-none mt-0.5">
                      {item.completed}/{item.total}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-[10px] sm:text-[11px] font-bold leading-none">
                      {item.completed}/{item.total}
                    </span>
                    {isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-1 ${
                          isYellow
                            ? 'bg-amber-500 dark:bg-amber-400'
                            : isRed
                            ? 'bg-rose-500 dark:bg-rose-400'
                            : isPending
                            ? 'bg-slate-400 dark:bg-slate-500'
                            : 'bg-emerald-500 dark:bg-[#00E599]'
                        }`}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(WeeklyRhythmCard);

