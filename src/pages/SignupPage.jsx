import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AuthLayout from '../components/auth/AuthLayout';
import SignupForm from '../components/auth/SignupForm';

export default function SignupPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.auth-card', {
        opacity: 0,
        y: 20,
        scale: 0.98,
        duration: 0.5,
        ease: 'power2.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <AuthLayout
        heading="Start your streak"
        supportingText="Create your Quitmark account and start today."
      >
        <SignupForm />
      </AuthLayout>
    </div>
  );
}
