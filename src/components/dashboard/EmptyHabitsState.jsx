import { useState } from 'react';
import {
  Plus,
  Droplet,
  BookOpen,
  Dumbbell,
  Sparkles,
  Footprints,
  Tag,
  Check,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sun,
  Moon,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';

const STARTER_HABITS = [
  {
    id: 'drink-water',
    name: 'Drink Water',
    category: 'Health',
    tag: 'Daily',
    subtitle: 'Stay hydrated • 2.5L daily target',
    schedule: 'Throughout Day',
    scheduleType: 'clock',
    icon: Droplet,
    iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
  },
  {
    id: 'read-book',
    name: 'Read Book',
    category: 'Focus',
    tag: 'Growth',
    subtitle: 'Improve knowledge • 20 mins/day',
    schedule: '20 Mins Session',
    scheduleType: 'clock',
    icon: BookOpen,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  },
  {
    id: 'exercise',
    name: 'Exercise',
    category: 'Health',
    tag: 'Body',
    subtitle: 'Stay fit • 30 mins workout',
    schedule: '30 Mins Target',
    scheduleType: 'clock',
    icon: Dumbbell,
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  },
  {
    id: 'meditate',
    name: 'Meditate',
    category: 'Mind',
    tag: 'Mind',
    subtitle: 'Stay calm • 10 mins mindfulness',
    schedule: '10 Mins Silence',
    scheduleType: 'clock',
    icon: Sparkles,
    iconBg: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
    badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/25',
  },
  {
    id: 'morning-walk',
    name: 'Morning Walk',
    category: 'Health',
    tag: 'Daily',
    subtitle: 'Boost energy • Daily 15 mins',
    schedule: 'Before 09:00 AM',
    scheduleType: 'sun',
    icon: Footprints,
    iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
  },
  {
    id: 'journaling',
    name: 'Journaling',
    category: 'Mind',
    tag: 'Night',
    subtitle: 'Reflect & unwind • Evening',
    schedule: 'Post Dinner',
    scheduleType: 'moon',
    icon: Tag,
    iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
  },
];

export default function EmptyHabitsState({
  onCreateClick,
  onAddPreset,
  showHero = true,
}) {
  const [customName, setCustomName] = useState('');
  const [addingHabitId, setAddingHabitId] = useState(null);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleAddClick = async (habit) => {
    if (addingHabitId) return;
    setAddingHabitId(habit.id);
    try {
      if (onAddPreset) {
        await onAddPreset(habit.name, habit.category, habit.subtitle);
      } else if (onCreateClick) {
        onCreateClick(habit.name);
      }
      setToastMessage(`"${habit.name}" added to your rituals!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error adding habit preset:', err);
    } finally {
      setTimeout(() => setAddingHabitId(null), 1200);
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    const name = customName.trim();
    if (!name || isSubmittingCustom) return;

    setIsSubmittingCustom(true);
    try {
      setCustomName('');
      if (onAddPreset) {
        await onAddPreset(name, 'General', 'Daily habit');
      } else if (onCreateClick) {
        onCreateClick(name);
      }
      setToastMessage(`"${name}" added to your rituals!`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Error adding custom habit:', err);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleScrollToStarters = () => {
    const el = document.getElementById('starter-habits-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none animate-in fade-in duration-300">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/95 dark:bg-[#191c1f]/95 border border-slate-700 dark:border-white/[0.15] text-white rounded-full shadow-2xl flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-[#00E599] shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP DASHBOARD EMPTY STATE HERO CARD (From Reference Image 1)           */}
      {/* ========================================================================= */}
      {showHero && (
        <div className="relative overflow-hidden rounded-3xl bg-[#0c1014] border border-white/[0.07] p-6 sm:p-8 lg:p-10 shadow-2xl">
          {/* Subtle Background Glows */}
        <div className="absolute -left-12 -top-12 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch gap-6 sm:gap-8 lg:gap-12">
          {/* Left Artwork Vessel (Glowing Seedling Sprout Card with DAY 01) */}
          <div className="w-48 h-56 sm:w-52 sm:h-60 rounded-2xl bg-[#070a0c] border border-white/[0.08] flex flex-col items-center justify-between p-5 relative overflow-hidden shadow-inner shrink-0 group">
            {/* Ambient Radial Spotlight inside card */}
            <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent opacity-80" />

            {/* Glowing Seedling Sprout Graphic */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center">
              {/* Floating vital sparkles */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -left-2 animate-pulse" />
                <Sparkles className="w-3.5 h-3.5 text-teal-300 absolute top-4 -right-2 animate-pulse delay-300" />
                
                {/* Seedling SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 drop-shadow-[0_0_18px_rgba(0,229,153,0.45)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Soil & Base Arc */}
                  <ellipse cx="50" cy="86" rx="28" ry="4.5" fill="#00E599" fillOpacity="0.12" />
                  <path
                    d="M26 85 C34 81, 66 81, 74 85"
                    stroke="#00E599"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeOpacity="0.35"
                  />
                  <circle cx="38" cy="85" r="1.5" fill="#00E599" fillOpacity="0.6" />
                  <circle cx="50" cy="83.5" r="1.8" fill="#00E599" />
                  <circle cx="62" cy="85" r="1.5" fill="#00E599" fillOpacity="0.6" />

                  {/* Stem */}
                  <path
                    d="M50 83 C50 62, 50 48, 50 34"
                    stroke="#00E599"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Left Leaf */}
                  <path
                    d="M50 56 C38 52, 28 42, 34 30 C44 26, 49 42, 50 54 Z"
                    fill="#00E599"
                    className="transition-transform group-hover:scale-105 origin-bottom-right"
                  />

                  {/* Right Leaf */}
                  <path
                    d="M50 44 C62 38, 74 28, 72 16 C60 14, 52 30, 50 42 Z"
                    fill="#5af0b3"
                    className="transition-transform group-hover:scale-105 origin-bottom-left"
                  />
                </svg>
              </div>
            </div>

            {/* DAY 01 Badge at bottom of card */}
            <div className="relative z-10 px-4 py-1 rounded-full bg-[#10151a] border border-white/[0.08] text-center shadow-xs">
              <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                DAY 01
              </span>
            </div>
          </div>

          {/* Right Info & Action Cluster */}
          <div className="flex-1 flex flex-col justify-between gap-4 text-left">
            <div className="flex flex-col gap-2.5">
              {/* Zero Day Ritual Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-[#0d221c] border border-[#144739] text-[#00E599] text-[11px] font-mono font-bold tracking-wider uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse" />
                <span>ZERO DAY RITUAL • READY TO BEGIN</span>
              </div>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Let&apos;s Build Your{' '}
                <span className="text-[#00E599] drop-shadow-[0_0_20px_rgba(0,229,153,0.3)]">
                  Better Tomorrow
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed mt-0.5">
                You haven&apos;t added any habits yet. Start with a small step — big changes come from consistent, deliberate actions.
              </p>
            </div>

            {/* CTA Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onCreateClick?.()}
                className="h-11 px-6 bg-[#00E599] hover:bg-[#00c985] text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Your First Habit</span>
              </button>

              <button
                type="button"
                onClick={handleScrollToStarters}
                className="h-11 px-5 bg-[#14191e] hover:bg-[#1a2128] border border-white/[0.08] hover:border-white/[0.15] text-white font-semibold rounded-xl text-sm flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Use Guided Template</span>
              </button>
            </div>

            {/* Micro Feature Highlights */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.06] text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#11161b] border border-white/[0.06]">
                <Check className="w-3.5 h-3.5 text-[#00E599] stroke-[2.5]" />
                <span>Atomic micro-cadences</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#11161b] border border-white/[0.06]">
                <RotateCcw className="w-3.5 h-3.5 text-teal-400 stroke-[2]" />
                <span>No streak anxiety</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#11161b] border border-white/[0.06]">
                <Zap className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
                <span>Instant telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* ========================================================================= */}
      {/* 2. HABIT SECTION (Strictly From Reference Image 2)                       */}
      {/* Contains exclusively the 6 starter habit cards and custom input bar       */}
      {/* ========================================================================= */}
      <div id="starter-habits-section" className="w-full flex flex-col gap-4">
        {/* 2-Column Grid of 6 Starter Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {STARTER_HABITS.map((starter) => {
            const IconComponent = starter.icon;
            const isAdding = addingHabitId === starter.id;

            return (
              <div
                key={starter.id}
                className="group p-4 sm:p-4.5 bg-[#0e1216] border border-white/[0.06] hover:border-emerald-500/30 rounded-2xl shadow-xs transition-all flex flex-col justify-between gap-4 text-left hover:bg-[#12161b]"
              >
                {/* Card Top: Icon, Name + Verified Badge, Category Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center shrink-0 ${starter.iconBg}`}
                    >
                      <IconComponent className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm sm:text-base font-bold text-white truncate">
                          {starter.name}
                        </span>
                        <ShieldCheck className="w-4 h-4 text-[#00E599] shrink-0" />
                      </div>
                      <span className="text-xs text-[#85948b] block truncate mt-0.5">
                        {starter.subtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold shrink-0 border ${starter.badgeBg}`}
                  >
                    {starter.tag}
                  </span>
                </div>

                {/* Card Bottom: Schedule/Timing and Add Button */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-xs text-[#85948b] font-medium">
                    {starter.scheduleType === 'sun' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : starter.scheduleType === 'moon' ? (
                      <Moon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span>{starter.schedule}</span>
                  </div>

                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleAddClick(starter)}
                    className={`h-8 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 ${
                      isAdding
                        ? 'bg-[#00E599] text-slate-950 border-[#00E599]'
                        : 'bg-[#181e23] hover:bg-[#00E599] hover:text-slate-950 text-slate-200 border-white/[0.08]'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add to My Day</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Quick Custom Habit Input Bar */}
        <form
          onSubmit={handleCustomSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 p-2 sm:p-2.5 bg-[#0e1216] border border-white/[0.08] rounded-2xl shadow-sm mt-1 focus-within:border-emerald-500/40 transition-colors"
        >
          <div className="relative flex-1 flex items-center w-full">
            <Tag className="w-4 h-4 text-[#606e7b] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Or enter your custom habit name (e.g., Code for 45 mins, Floss, Read pa...)"
              className="w-full h-10 pl-10 pr-4 bg-transparent rounded-xl text-xs sm:text-sm text-white placeholder-[#606e7b] focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!customName.trim() || isSubmittingCustom}
            className="h-10 px-5 bg-[#00E599] hover:bg-[#00c985] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 shadow-md shadow-emerald-500/20 cursor-pointer w-full sm:w-auto"
          >
            <span>Create Habit</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
