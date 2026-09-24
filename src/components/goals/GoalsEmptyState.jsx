import { Plus, Target, BarChart3, Link2, Trophy, Star, Heart, Leaf } from 'lucide-react';

export default function GoalsEmptyState({ onCreateGoal }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col items-center justify-center animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="text-center mb-5 sm:mb-6">
        <span className="text-emerald-600 dark:text-[#5af0b3] text-xs sm:text-[13px] font-bold tracking-widest uppercase">
          GOALS
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 mb-2">
          Turn Your Habits Into a Better You
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#85948b] max-w-lg mx-auto font-normal leading-relaxed">
          Set meaningful goals, connect your habits, and track your progress towards a brighter future.
        </p>
      </div>

      {/* 2. Target Illustration with 4 Floating Badges */}
      <div className="relative w-full max-w-md h-48 sm:h-52 flex items-center justify-center my-2 select-none" aria-hidden="true">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 sm:w-48 h-40 sm:h-48 rounded-full bg-emerald-500/15 dark:bg-[#5af0b3]/15 blur-2xl" />
        </div>

        {/* Central Vector Archery Target on Tripod Stand */}
        <div className="relative z-10 flex items-center justify-center">
          <svg
            className="w-40 h-40 sm:w-48 sm:h-48 drop-shadow-[0_12px_24px_rgba(16,185,129,0.22)]"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground shadow beneath tripod */}
            <ellipse cx="100" cy="172" rx="54" ry="7" fill="#000000" fillOpacity="0.3" />

            {/* Tripod Stand Legs */}
            <g strokeLinecap="round">
              {/* Back / Center Leg */}
              <line x1="100" y1="126" x2="100" y2="168" stroke="#1e293b" className="dark:stroke-[#2b3543]" strokeWidth="4.5" />
              {/* Horizontal Crossbar */}
              <line x1="68" y1="150" x2="132" y2="150" stroke="#334155" className="dark:stroke-[#3a4759]" strokeWidth="3" />
              {/* Left Leg */}
              <line x1="72" y1="124" x2="58" y2="168" stroke="#334155" className="dark:stroke-[#475569]" strokeWidth="4.5" />
              {/* Right Leg */}
              <line x1="128" y1="124" x2="142" y2="168" stroke="#334155" className="dark:stroke-[#475569]" strokeWidth="4.5" />
            </g>

            {/* Target Outer Rim / Bezel */}
            <circle cx="100" cy="86" r="54" fill="#064e3b" className="dark:fill-[#072d22]" stroke="#059669" strokeWidth="2.5" strokeOpacity="0.6" />

            {/* Target Concentric Rings */}
            <circle cx="100" cy="86" r="44" fill="#047857" className="dark:fill-[#0d4032]" stroke="#34d399" strokeWidth="2" strokeOpacity="0.4" />
            <circle cx="100" cy="86" r="33" fill="#059669" className="dark:fill-[#125442]" stroke="#6ee7b7" strokeWidth="2" strokeOpacity="0.5" />
            <circle cx="100" cy="86" r="22" fill="#10b981" className="dark:fill-[#1b735c]" stroke="#a7f3d0" strokeWidth="2.5" />
            <circle cx="100" cy="86" r="12" fill="#ffffff" />
            <circle cx="100" cy="86" r="5" fill="#ef4444" />

            {/* Bullseye Arrow / Dart */}
            <g transform="translate(100, 86) rotate(-40)">
              {/* Arrow Shaft */}
              <line x1="-42" y1="0" x2="0" y2="0" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
              {/* Arrow Fletching / Feathers */}
              <path d="M-42 0 L-50 -7 L-45 0 L-50 7 Z" fill="#34d399" />
              <path d="M-46 0 L-54 -7 L-49 0 L-54 7 Z" fill="#10b981" />
              {/* Point at Bullseye center */}
              <circle cx="0" cy="0" r="3.5" fill="#dc2626" />
            </g>
          </svg>
        </div>

        {/* Floating Pill Badge 1: Top Left - More Discipline */}
        <div className="absolute top-1 left-2 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#161a1f] border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-md text-[11px] sm:text-xs font-medium text-slate-700 dark:text-gray-200 transition-transform hover:scale-105">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 shrink-0">
            <BarChart3 className="w-2.5 h-2.5" />
          </span>
          <span>More Discipline</span>
        </div>

        {/* Floating Pill Badge 2: Top Right - Achieve Dreams */}
        <div className="absolute top-1 right-2 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#161a1f] border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-md text-[11px] sm:text-xs font-medium text-slate-700 dark:text-gray-200 transition-transform hover:scale-105">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] shrink-0">
            <Star className="w-2.5 h-2.5 fill-amber-500" />
          </span>
          <span>Achieve Dreams</span>
        </div>

        {/* Floating Pill Badge 3: Bottom Left - Healthier You */}
        <div className="absolute bottom-1 left-2 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#161a1f] border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-md text-[11px] sm:text-xs font-medium text-slate-700 dark:text-gray-200 transition-transform hover:scale-105">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
            <Heart className="w-2.5 h-2.5 fill-rose-500/30" />
          </span>
          <span>Healthier You</span>
        </div>

        {/* Floating Pill Badge 4: Bottom Right - Better Habits */}
        <div className="absolute bottom-1 right-2 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#161a1f] border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-md text-[11px] sm:text-xs font-medium text-slate-700 dark:text-gray-200 transition-transform hover:scale-105">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-[#5af0b3] border border-emerald-500/20 shrink-0">
            <Leaf className="w-2.5 h-2.5" />
          </span>
          <span>Better Habits</span>
        </div>
      </div>

      {/* 3. Primary Call-to-Action Button */}
      <div className="mt-4 mb-8 sm:mb-9 text-center">
        <button
          type="button"
          onClick={() => onCreateGoal?.()}
          className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 dark:bg-[#00e599] dark:hover:bg-[#00c985] text-slate-950 dark:text-[#003825] font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create Your First Goal</span>
        </button>
      </div>

      {/* 4. Single-Row 4-Column Feature Pillars Grid (Exactly as circled) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
        {/* Pillar 1: Stay Focused */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex items-center gap-3.5 transition-all hover:border-emerald-500/30 hover:shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#5af0b3]">
            <Target className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Stay Focused
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#85948b] mt-0.5 leading-snug">
              Keep your motivation on track.
            </p>
          </div>
        </div>

        {/* Pillar 2: Track Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex items-center gap-3.5 transition-all hover:border-sky-500/30 hover:shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 text-sky-500">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Track Progress
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#85948b] mt-0.5 leading-snug">
              See how far you&apos;ve come.
            </p>
          </div>
        </div>

        {/* Pillar 3: Connect Habits */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex items-center gap-3.5 transition-all hover:border-teal-500/30 hover:shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0 text-teal-600 dark:text-[#5af0b3]">
            <Link2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Connect Habits
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#85948b] mt-0.5 leading-snug">
              Link habits to goals.
            </p>
          </div>
        </div>

        {/* Pillar 4: Achieve More */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161a1f] border border-slate-200/80 dark:border-white/[0.07] shadow-xs flex items-center gap-3.5 transition-all hover:border-amber-500/30 hover:shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
            <Trophy className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0 text-left">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Achieve More
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#85948b] mt-0.5 leading-snug">
              Turn efforts into results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
