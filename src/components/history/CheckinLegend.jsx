export default function CheckinLegend() {
  const items = [
    {
      id: 'completed',
      label: 'Completed',
      render: <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-emerald-500 border border-emerald-400/50 shadow-sm shadow-emerald-500/10" />
    },
    {
      id: 'missed',
      label: 'Missed',
      render: <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-red-500/70 border border-red-500/50" />
    },
    {
      id: 'no-record',
      label: 'No Record',
      render: <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-300/70 dark:border-zinc-700/60" />
    },
    {
      id: 'pending',
      label: 'Today',
      render: <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-emerald-500/20 border border-dashed border-emerald-500" />
    },
    {
      id: 'future',
      label: 'Future',
      render: <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-zinc-50/50 dark:bg-zinc-900/20 border border-transparent opacity-40" />
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-500 dark:text-zinc-400 pt-5 border-t border-zinc-100 dark:border-[#232936]/60">
      <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
        Legend
      </span>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-1.5">
            {item.render}
            <span className="hidden sm:inline">{item.label}</span>
            <span className="inline sm:hidden">{item.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
