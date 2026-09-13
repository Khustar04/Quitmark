export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
        <p className="text-xs tracking-wider uppercase text-zinc-400 dark:text-zinc-500 font-medium">
          Loading Quitmark...
        </p>
      </div>
    </div>
  );
}
