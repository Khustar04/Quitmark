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
      {/* Light-mode wash: keep the page bright instead of tinting with the dark art */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 dark:hidden bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.14),transparent_42%),radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.10),transparent_38%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.08),transparent_46%)]"
      />

      {/* Dark-mode atmospheric photo */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block bg-cover bg-center bg-no-repeat opacity-85 animate-light-pulse transform-gpu will-change-[transform,opacity]"
        style={{
          backgroundImage: "url('/landing-bg.webp')",
        }}
      />

      {/* Floating ambient orbs — softer in light mode */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden transform-gpu opacity-50 dark:opacity-100"
      >
        <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(16,185,129,0.22)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-aurora-1 will-change-transform transform-gpu" />
        <div className="absolute top-1/3 -right-24 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(52,211,153,0.16)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(52,211,153,0.12)_0%,transparent_70%)] animate-aurora-2 will-change-transform transform-gpu" />
        <div className="absolute -bottom-24 left-1/4 w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(5,150,105,0.12)_0%,transparent_70%)] animate-aurora-1 will-change-transform transform-gpu" />

        <span className="hidden dark:block absolute top-[22%] left-[18%] w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#34d399] animate-particle-1 will-change-transform transform-gpu" />
        <span className="hidden dark:block absolute top-[48%] right-[22%] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399] animate-particle-2 will-change-transform transform-gpu" />
        <span className="hidden dark:block absolute top-[72%] left-[32%] w-1.5 h-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_#2dd4bf] animate-particle-3 will-change-transform transform-gpu" />
      </div>

      {/* Vignette: opaque enough in light mode that copy stays crisp */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-slate-50/90 via-slate-50/55 to-slate-50 dark:from-zinc-950/30 dark:via-transparent dark:to-zinc-950/70 transform-gpu"
      />

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
