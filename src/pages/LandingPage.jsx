import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Hero from '../components/landing/Hero';
import ProductPreview from '../components/landing/ProductPreview';
import HowItWorks from '../components/landing/HowItWorks';
import StreakSection from '../components/landing/StreakSection';
import FinalCTA from '../components/landing/FinalCTA';

export default function LandingPage() {
  const containerRef = useRef(null);
  const { user, initialized } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialized && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [initialized, user, navigate]);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    // Scoped GSAP animations with proper cleanup and clearProps to prevent frozen opacity
    const ctx = gsap.context(() => {
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

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <Hero />
      <ProductPreview />
      <HowItWorks />
      <StreakSection />
      <FinalCTA />
    </div>
  );
}
