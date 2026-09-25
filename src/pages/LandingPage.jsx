import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import ProductPreview from '../components/landing/ProductPreview';
import HowItWorks from '../components/landing/HowItWorks';
import StreakSection from '../components/landing/StreakSection';
import CallToAction from '../components/landing/CallToAction';
import { isMobileApp } from '../utils/platform';
import MobileStarterPage from './MobileStarterPage';

export default function LandingPage() {
  const containerRef = useRef(null);
  const { user, initialized } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const isMobile = isMobileApp();

  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [initialized, user, navigate]);

  useEffect(() => {
    if (isMobile) return;
    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    let active = true;
    let ctx;

    // GSAP is presentation-only. Load it after the landing page is visible so
    // a cold WebView launch is not held up by animation code.
    void import('gsap').then(({ default: gsap }) => {
      if (!active) return;

      // Scoped animations with proper cleanup and clearProps to prevent frozen opacity.
      ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-badge',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.hero-headline',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.hero-subtext',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.hero-ctas',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.product-preview-card',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.how-it-works-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 0.5, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.streak-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.65, ease: 'power2.out', clearProps: 'all' }
      );

      gsap.fromTo(
        '.final-cta-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.8, ease: 'power2.out', clearProps: 'all' }
      );
      }, containerRef);
    });

    return () => {
      active = false;
      ctx?.revert();
    };
  }, [isMobile]);

  if (isMobile) {
    return <MobileStarterPage />;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ──────────────────────────────────────────────────────────────────
          DAYMODE ANIMATED BACKGROUND (Visible only in light mode)
      ────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 dark:hidden overflow-hidden transform-gpu"
      >
        {/* Animated breathing mesh wash */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_65%),radial-gradient(ellipse_at_bottom,rgba(45,212,191,0.14),transparent_65%)] animate-day-mesh will-change-transform transform-gpu" />

        {/* Floating animated orbs in daymode */}
        <div className="absolute -top-24 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.22)_0%,rgba(52,211,153,0.12)_45%,transparent_70%)] blur-3xl animate-day-orb-1 will-change-transform transform-gpu" />
        <div className="absolute top-1/4 -right-24 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.20)_0%,rgba(167,243,208,0.14)_45%,transparent_70%)] blur-3xl animate-day-orb-2 will-change-transform transform-gpu" />
        <div className="absolute top-1/2 -left-28 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.14)_0%,rgba(110,231,183,0.1)_50%,transparent_70%)] blur-2xl animate-day-orb-3 will-change-transform transform-gpu" />
        <div className="absolute -bottom-20 right-1/4 w-[680px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.18)_0%,rgba(254,240,138,0.12)_40%,transparent_70%)] blur-3xl animate-day-orb-1 will-change-transform transform-gpu" />

        {/* Subtle geometric dot matrix grid with soft radial mask */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#10b981_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-35"
          style={{
            maskImage: 'radial-gradient(ellipse 75% 60% at 50% 25%, black 25%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 25%, black 25%, transparent 75%)',
          }}
        />

        {/* Floating daymode shimmer particles */}
        <span className="absolute top-[18%] left-[14%] w-2 h-2 rounded-full bg-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-day-particle-1 will-change-transform transform-gpu" />
        <span className="absolute top-[30%] right-[18%] w-2.5 h-2.5 rounded-full bg-teal-500/70 shadow-[0_0_14px_rgba(20,184,166,0.7)] animate-day-particle-2 will-change-transform transform-gpu" />
        <span className="absolute top-[55%] left-[22%] w-2 h-2 rounded-full bg-emerald-600/60 shadow-[0_0_10px_rgba(5,150,105,0.6)] animate-day-particle-3 will-change-transform transform-gpu" />
        <span className="absolute top-[72%] right-[24%] w-1.5 h-1.5 rounded-full bg-emerald-400/75 shadow-[0_0_10px_rgba(52,211,153,0.7)] animate-day-particle-4 will-change-transform transform-gpu" />
        <span className="absolute top-[86%] left-[32%] w-2 h-2 rounded-full bg-teal-400/65 shadow-[0_0_12px_rgba(45,212,191,0.6)] animate-day-particle-1 will-change-transform transform-gpu" />

        {/* Light-mode soft vignette: keeps copy crisp while letting background breathe */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/15 via-transparent to-slate-50/60" />
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          DARKMODE ATMOSPHERIC BACKGROUND (Visible only in dark mode)
      ────────────────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block bg-cover bg-center bg-no-repeat opacity-85 animate-light-pulse transform-gpu will-change-[transform,opacity]"
        style={{
          backgroundImage: "url('/landing-bg.webp')",
        }}
      />

      {/* Darkmode ambient orbs & particles */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block overflow-hidden transform-gpu"
      >
        <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-aurora-1 will-change-transform transform-gpu" />
        <div className="absolute top-1/3 -right-24 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(52,211,153,0.12)_0%,transparent_70%)] animate-aurora-2 will-change-transform transform-gpu" />
        <div className="absolute -bottom-24 left-1/4 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(5,150,105,0.12)_0%,transparent_70%)] animate-aurora-1 will-change-transform transform-gpu" />

        <span className="absolute top-[22%] left-[18%] w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#34d399] animate-particle-1 will-change-transform transform-gpu" />
        <span className="absolute top-[48%] right-[22%] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399] animate-particle-2 will-change-transform transform-gpu" />
        <span className="absolute top-[72%] left-[32%] w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_#2dd4bf] animate-particle-3 will-change-transform transform-gpu" />

        {/* Dark-mode vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950/70" />
      </div>

      {/* Landing Content Above Background */}
      <div className="relative z-10">
        <Hero />
        <ProductPreview />
        <HowItWorks />
        <StreakSection />
        <CallToAction />
      </div>
    </div>
  );
}
