import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
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
        heading="Welcome back"
        supportingText="Continue building your streak."
      >
        <LoginForm />
      </AuthLayout>
    </div>
  );
}
