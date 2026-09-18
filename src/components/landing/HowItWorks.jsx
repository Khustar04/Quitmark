import { Link } from 'react-router-dom';
import { 
  Target, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  Smartphone, 
  Lock, 
  Zap, 
  ArrowRight,
  Check,
  BellRing
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      badge: 'Step 01 • Define Target',
      title: 'Identify & Name the Urge',
      description:
        'Choose the specific habit you want to quit—smoking, late-night doomscrolling, sugar cravings, or procrastination. Defining it clearly creates immediate psychological awareness.',
      icon: Target,
      features: ['Custom habit naming', 'Personal quit intentions', 'Private & discrete'],
      preview: {
        type: 'habit',
        name: 'Late-Night Doomscrolling',
        category: 'Digital Wellness',
        tag: 'Clean Goal: 30 Days',
      },
    },
    {
      number: '02',
      badge: 'Step 02 • Daily Discipline',
      title: '1-Tap Honest Check-ins',
      description:
        'Open Quitmark each day and log your status in seconds. Complete honesty is key—mark whether you successfully resisted the urge or slipped up, with zero judgment.',
      icon: CheckCircle2,
      features: ['Instant 1-tap logging', 'Calendar-locked integrity', 'Daily reflection notes'],
      preview: {
        type: 'checkin',
        status: 'Completed',
        label: 'Resisted Urge Today',
        sub: 'Logged at 9:45 PM • +1 Streak Day',
      },
    },
    {
      number: '03',
      badge: 'Step 03 • Momentum',
      title: 'Watch Your Streak Compound',
      description:
        'Every clean day stacks into an unbroken streak. As the count climbs, loss aversion turns into your superpower—making temptation far easier to resist.',
      icon: Flame,
      features: ['Current & best streak records', 'Visual consistency heatmaps', 'Dynamic progress rates'],
      preview: {
        type: 'streak',
        streak: '14 Days Clean',
        best: 'Personal Best: 14 Days',
        blocks: [true, true, true, true, true, true, true],
      },
    },
    {
      number: '04',
      badge: 'Step 04 • Motivation',
      title: 'Milestones & Leaderboard',
      description:
        'Unlock milestone badges as you reach 3, 7, 14, and 30 clean days. Compete anonymously on the global leaderboard to stay inspired by fellow discipline builders.',
      icon: Trophy,
      features: ['Milestone celebrations', 'Anonymous global leaderboard', 'Smart streak-risk alerts'],
      preview: {
        type: 'leaderboard',
        rank: '#3 on Global Board',
        badge: '⚡ 14-Day Surge Badge Unlocked',
      },
    },
  ];

  return (
    <section
      id="how-it-works"
      className="how-it-works-section max-w-6xl mx-auto px-4 py-20 sm:py-28 border-t border-zinc-200/60 dark:border-zinc-800/60 scroll-mt-16"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Simple, Behavioral Framework</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
          How Quitmark Works
        </h2>
        <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          No complicated setups, no overwhelming charts. Just a clean four-step system designed to rewire your habits one day at a time.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="how-it-works-card group rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 backdrop-blur-sm"
            >
              {/* Top Row: Badge & Icon */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {step.badge}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2.5">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Bullet Highlights */}
                <ul className="space-y-2 mb-6 text-xs text-zinc-600 dark:text-zinc-400">
                  {step.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Mini Preview Box */}
              <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                {step.preview.type === 'habit' && (
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                          {step.preview.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                        {step.preview.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {step.preview.tag}
                    </span>
                  </div>
                )}

                {step.preview.type === 'checkin' && (
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/40">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white block">
                          {step.preview.label}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {step.preview.sub}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Clean
                    </span>
                  </div>
                )}

                {step.preview.type === 'streak' && (
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                        <Flame className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/30" />
                        <span>{step.preview.streak}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {step.preview.best}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {step.preview.blocks.map((active, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-3 rounded-sm ${
                            active
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                              : 'bg-zinc-200 dark:bg-zinc-800'
                          }`}
                          title={`Day ${i + 1} completed`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step.preview.type === 'leaderboard' && (
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold">
                        #3
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white block">
                          {step.preview.rank}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {step.preview.badge}
                        </span>
                      </div>
                    </div>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Architecture Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Installable PWA</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Add to home screen on iOS & Android in 1 tap</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">100% Private Data</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Row-level security ensures only you see your habits</p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-white">Smart Urge Alerts</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Timely reminder notifications when urges peak</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
            Ready to break your first unwanted habit?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Free forever, no credit card required. Start your streak right now.
          </p>
        </div>
        <Link
          to="/signup"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all active:scale-[0.98] flex-shrink-0"
        >
          <span>Start Your Streak</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
