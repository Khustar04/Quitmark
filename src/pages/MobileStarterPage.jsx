import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowRight,
  ChevronLeft,
  BookOpen,
  Dumbbell,
  Droplets,
  Check,
  Star,
  Heart,
  Sprout,
  Mail,
  Loader2,
} from 'lucide-react';
import { signInWithGoogle } from '../services/authService';
import { isOnboardingCompleted, setOnboardingCompleted } from '../utils/platform';

/**
 * Clean SVG illustration of gentle rolling green hills with a growing sprout
 */
function RollingHillsIllustration({ showSun = false }) {
  return (
    <div className="relative w-full h-44 sm:h-52 flex items-end justify-center overflow-hidden pointer-events-none select-none">
      {/* Sun glow if enabled */}
      {showSun && (
        <div className="absolute top-2 w-28 h-28 rounded-full bg-gradient-to-b from-amber-200/90 to-amber-100/20 blur-sm" />
      )}

      {/* Layered Rolling Green Hills */}
      <svg
        className="w-full h-full"
        viewBox="0 0 400 180"
        fill="none"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back Hill */}
        <path
          d="M-20 180 Q80 80 200 120 T420 100 L420 180 Z"
          fill="url(#backHillGradient)"
          opacity="0.85"
        />
        {/* Mid Hill */}
        <path
          d="M-20 180 Q100 110 240 135 T420 120 L420 180 Z"
          fill="url(#midHillGradient)"
        />
        {/* Front Hill with Sprout base */}
        <path
          d="M-20 180 Q120 130 200 145 T420 135 L420 180 Z"
          fill="url(#frontHillGradient)"
        />

        <defs>
          <linearGradient id="backHillGradient" x1="200" y1="80" x2="200" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9be7b7" />
            <stop offset="1" stopColor="#3b9662" />
          </linearGradient>
          <linearGradient id="midHillGradient" x1="200" y1="100" x2="200" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#48aa73" />
            <stop offset="1" stopColor="#226e45" />
          </linearGradient>
          <linearGradient id="frontHillGradient" x1="200" y1="120" x2="200" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2e8555" />
            <stop offset="1" stopColor="#1b5936" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sprouting Seedling Plant in Foreground */}
      <div className="absolute bottom-2 flex flex-col items-center">
        <div className="relative">
          {/* Leaves */}
          <div className="w-14 h-14 relative flex items-center justify-center">
            {/* Left Leaf */}
            <div className="absolute w-6 h-9 bg-gradient-to-tr from-[#15803d] to-[#4ade80] rounded-[50%_0_50%_50%] -rotate-45 -left-1 bottom-3 shadow-sm transform origin-bottom-right" />
            {/* Right Leaf */}
            <div className="absolute w-7 h-10 bg-gradient-to-tl from-[#166534] to-[#22c55e] rounded-[0_50%_50%_50%] rotate-45 -right-2 bottom-3.5 shadow-sm transform origin-bottom-left" />
            {/* Center stem */}
            <div className="w-1.5 h-6 bg-[#166534] rounded-full mt-7" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileStarterPage() {
  const [step, setStep] = useState(() => (isOnboardingCompleted() ? 5 : 1));
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const { user, initialized } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [initialized, user, navigate]);

  // Handle hardware / gesture back button while traversing onboarding slides
  useEffect(() => {
    window.__quitmark_step_back = () => {
      if (step > 1) {
        setStep((s) => s - 1);
        return true;
      }
      return false;
    };
    return () => {
      delete window.__quitmark_step_back;
    };
  }, [step]);

  const handleNext = () => {
    if (step === 4) {
      setOnboardingCompleted();
      setStep(5);
    } else if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted();
    setStep(5);
  };

  const handleLoginClick = (e) => {
    if (e) e.preventDefault();
    setOnboardingCompleted();
    navigate('/login');
  };

  const handleEmailSignUp = () => {
    setOnboardingCompleted();
    navigate('/signup');
  };

  // Touch swipe support for native mobile feel
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger only if horizontal swipe is significantly stronger than vertical scroll
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swipe Left -> Next
        handleNext();
      } else {
        // Swipe Right -> Back
        handleBack();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setAuthError(null);
      setOnboardingCompleted();
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    setOnboardingCompleted();
    navigate('/signup');
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#eef9f2] via-[#f7fcf9] to-[#e4f5eb] text-slate-900 select-none overflow-x-hidden relative"
      style={{
        minHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* ────────────────────────────────────────────────────────
          TOP NAVIGATION BAR (Skip / Back Button)
      ──────────────────────────────────────────────────────── */}
      <div className="w-full px-6 pt-4 pb-1 flex items-center justify-between z-20 min-h-[44px]">
        {step === 5 ? (
          <button
            type="button"
            onClick={handleBack}
            className="w-10 h-10 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
            aria-label="Go back to tour"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        ) : (
          <div className="w-10 h-10" />
        )}

        {step > 1 && step < 5 ? (
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 active:scale-95 transition-all px-2.5 py-1.5 rounded-lg"
          >
            Skip
          </button>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          MAIN SCREEN CONTENT (5 STEPS)
      ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-sm mx-auto text-center z-10">

        {/* ──────── SCREEN 1: WELCOME / INTRO ──────── */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Logo */}
            <div className="mb-3">
              <img
                src="/logo.png"
                alt="Quitmark Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shadow-xl shadow-emerald-600/20 object-contain"
              />
            </div>

            {/* App Name */}
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-5">
              Quitmark
            </h2>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.2] mb-3">
              Small Habits<br />
              <span className="text-[#15803d]">Bigger You</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-[270px] mb-4">
              Build good habits, stay consistent and become the best version of yourself.
            </p>

            {/* Rolling Hills & Seedling Illustration */}
            <RollingHillsIllustration showSun={false} />
          </div>
        )}

        {/* ──────── SCREEN 2: TRACK YOUR HABITS ──────── */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Headline */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              Track Your <span className="text-[#15803d]">Habits</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-[280px] mb-6">
              Add your goals, set reminders and build consistency every day.
            </p>

            {/* Floating Tilted Card */}
            <div className="relative w-full max-w-[290px] mb-4">
              {/* Subtle green sparkles / rays around card */}
              <div className="absolute -top-3 -left-3 text-emerald-500 opacity-60 text-lg">✦</div>
              <div className="absolute -bottom-2 -right-2 text-emerald-500 opacity-60 text-xl">✦</div>

              <div className="w-full bg-white rounded-3xl p-4 shadow-xl shadow-emerald-950/10 border border-emerald-50 -rotate-1 text-left space-y-2.5">
                {/* Habit 1: Read Book */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-[#15803d] flex items-center justify-center">
                      <BookOpen className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Read Book</div>
                      <div className="text-[11px] text-slate-400 font-medium">Daily</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#15803d] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Habit 2: Exercise */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Exercise</div>
                      <div className="text-[11px] text-slate-400 font-medium">Daily</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                </div>

                {/* Habit 3: Drink Water */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                      <Droplets className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Drink Water</div>
                      <div className="text-[11px] text-slate-400 font-medium">Daily</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#15803d] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Habit 4: Meditate */}
                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center">
                      <Sprout className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Meditate</div>
                      <div className="text-[11px] text-slate-400 font-medium">Daily</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── SCREEN 3: STAY MOTIVATED ──────── */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Headline */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              Stay <span className="text-[#15803d]">Motivated</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-[280px] mb-5">
              Track your progress, maintain streaks and achieve your goals step by step.
            </p>

            {/* Fire flame graphic with sunburst rays */}
            <div className="relative mb-3 flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-amber-400/20 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center">
                <span className="text-5xl animate-bounce" style={{ animationDuration: '2.5s' }}>
                  🔥
                </span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="w-full max-w-[290px] bg-white rounded-3xl p-4 shadow-xl shadow-emerald-950/10 border border-emerald-50 mb-3">
              <div className="text-sm font-bold text-slate-800 mb-3 text-center">
                7 Day Streak 🔥
              </div>
              <div className="flex items-center justify-between px-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const isChecked = idx < 6;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">{day}</span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                          isChecked
                            ? 'bg-[#15803d] text-white shadow-sm'
                            : 'border border-slate-200 bg-slate-50'
                        }`}
                      >
                        {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mini Goal Badges */}
            <div className="w-full max-w-[290px] grid grid-cols-2 gap-2.5 mb-2 text-left">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Complete</div>
                  <div className="text-[10px] text-slate-400">Your Goals</div>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                <span className="text-lg">📊</span>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">Track</div>
                  <div className="text-[10px] text-slate-400">Your Progress</div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[290px] bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center gap-2 text-left">
              <span className="text-lg">⭐</span>
              <div className="text-xs font-bold text-slate-800">Build a Better You</div>
            </div>
          </div>
        )}

        {/* ──────── SCREEN 4: BUILD A BETTER YOU ──────── */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Headline */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              Build a <span className="text-[#15803d]">Better You</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-[280px] mb-6">
              Create positive habits, improve your lifestyle and make real progress in your life.
            </p>

            {/* Staggered Floating Lifestyle Badges */}
            <div className="w-full max-w-[280px] flex flex-col gap-3 mb-2">
              <div className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ecfdf5] border border-emerald-200/80 shadow-sm text-emerald-800 font-semibold text-xs animate-in slide-in-from-left duration-300">
                <Sprout className="w-4 h-4 text-[#15803d]" />
                <span>Be More Productive</span>
              </div>

              <div className="self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#fff1f2] border border-rose-200/80 shadow-sm text-rose-800 font-semibold text-xs animate-in slide-in-from-right duration-300">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                <span>Healthier Lifestyle</span>
              </div>

              <div className="self-start inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#fefce8] border border-amber-200/80 shadow-sm text-amber-800 font-semibold text-xs animate-in slide-in-from-left duration-300">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Achieve Your Goals</span>
              </div>
            </div>

            {/* Hills & Sun Background */}
            <RollingHillsIllustration showSun={true} />
          </div>
        )}

        {/* ──────── SCREEN 5: AUTH GATEWAY (LET'S GET STARTED) ──────── */}
        {step === 5 && (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {/* Logo */}
            <div className="mb-2">
              <img
                src="/logo.png"
                alt="Quitmark Logo"
                className="w-16 h-16 rounded-2xl shadow-lg shadow-emerald-600/20 object-contain"
              />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">
              Quitmark
            </h2>

            {/* Headline */}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
              Let's <span className="text-[#15803d]">Get Started</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-[280px] mb-7">
              Create your account to start building better habits.
            </p>

            {authError && (
              <div className="w-full mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-left">
                {authError}
              </div>
            )}

            {/* Auth Action Buttons */}
            <div className="w-full space-y-3 mb-6">
              {/* 1. Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all font-semibold text-slate-700 text-sm cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* 2. Continue with Apple */}
              <button
                type="button"
                onClick={handleAppleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-black hover:bg-zinc-900 active:scale-[0.98] transition-all font-semibold text-white text-sm cursor-pointer shadow-md"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.89c.64-.78 1.08-1.87.96-2.96-.93.04-2.06.62-2.73 1.4-.59.68-1.11 1.77-.97 2.83 1.04.08 2.1-.49 2.74-1.27z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              {/* 3. Continue with Email */}
              <button
                type="button"
                onClick={handleEmailSignUp}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all font-semibold text-slate-700 text-sm cursor-pointer"
              >
                <Mail className="w-5 h-5 text-[#15803d]" />
                <span>Continue with Email</span>
              </button>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center justify-center mb-5">
              <span className="text-xs text-slate-400 font-medium">or</span>
            </div>

            {/* Footer */}
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleLoginClick}
                className="font-bold text-[#15803d] hover:underline inline cursor-pointer"
              >
                Log In
              </button>
            </p>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          BOTTOM AREA: PAGINATION DOTS & NAVIGATION BUTTONS (STEPS 1-4)
      ──────────────────────────────────────────────────────── */}
      {step < 5 && (
        <div className="w-full px-6 pb-8 pt-3 flex flex-col items-center gap-5 z-20">
          {/* 4 Pagination Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((dotIndex) => {
              const isActive = step === dotIndex;
              return (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => setStep(dotIndex)}
                  aria-label={`Go to slide ${dotIndex}`}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? 'w-7 h-2 bg-[#15803d]'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              );
            })}
          </div>

          {/* Action Button Row */}
          {step === 1 ? (
            /* Step 1: Big Full-Width "Get Started ->" */
            <div className="w-full flex flex-col items-center">
              <button
                type="button"
                onClick={handleNext}
                className="w-full max-w-xs py-4 px-6 rounded-full bg-[#1b5e3a] hover:bg-[#14472c] active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <p className="text-sm text-slate-600 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="font-bold text-[#15803d] hover:underline inline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            </div>
          ) : (
            /* Steps 2, 3, 4: Circular Back Button + "Next ->" Pill */
            <div className="w-full max-w-xs flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Go back"
                className="w-12 h-12 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-4 px-6 rounded-full bg-[#1b5e3a] hover:bg-[#14472c] active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
