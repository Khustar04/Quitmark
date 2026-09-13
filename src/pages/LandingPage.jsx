import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Hero from '../components/landing/Hero';
import ProductPreview from '../components/landing/ProductPreview';
import HowItWorks from '../components/landing/HowItWorks';
import StreakSection from '../components/landing/StreakSection';
import FinalCTA from '../components/landing/FinalCTA';

export default function LandingPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    // Scoped GSAP animations with proper cleanup
    const ctx = gsap.context(() => {
      gsap.from('.hero-badge', {
        opacity: 0,
        y: -10,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.from('.hero-headline', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.1,
        ease: 'power2.out',
      });

      gsap.from('.hero-subtext', {
        opacity: 0,
        y: 15,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out',
      });

      gsap.from('.hero-ctas', {
        opacity: 0,
        y: 15,
        duration: 0.5,
        delay: 0.3,
        ease: 'power2.out',
      });

      gsap.from('.product-preview-card', {
        opacity: 0,
        y: 25,
        duration: 0.7,
        delay: 0.4,
        ease: 'power2.out',
      });

      gsap.from('.how-it-works-card', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.12,
        delay: 0.55,
        ease: 'power2.out',
      });

      gsap.from('.streak-card', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.7,
        ease: 'power2.out',
      });

      gsap.from('.final-cta-card', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.85,
        ease: 'power2.out',
      });
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
