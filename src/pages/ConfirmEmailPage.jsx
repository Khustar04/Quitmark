import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import supabase from '../lib/supabase';
import { clearAuth } from '../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import AuthLayout from '../components/auth/AuthLayout';

export default function ConfirmEmailPage() {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && containerRef.current) {
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
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const processConfirmation = async () => {
      try {
        const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
        const search = typeof window !== 'undefined' ? window.location.search : '';

        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(search);

        const errorDesc =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error') ||
          hashParams.get('error');

        if (errorDesc) {
          if (mounted) {
            setError(decodeURIComponent(errorDesc).replace(/\+/g, ' '));
            setIsProcessing(false);
          }
          return;
        }

        // If PKCE flow code is present, exchange it so Supabase verifies the email
        const code = searchParams.get('code');
        if (code && supabase) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (err) {
            console.warn('[Quitmark] exchangeCodeForSession result:', err);
          }
        }

        // CRITICAL SECURITY REQUIREMENT:
        // Email confirmation must NOT grant direct application access.
        // Explicitly clear/terminate any active session created by the auth provider
        // during confirmation so the user MUST log in explicitly.
        if (supabase) {
          try {
            await supabase.auth.signOut();
          } catch (err) {
            console.warn('[Quitmark] Signout after confirmation:', err);
          }
        }

        dispatch(clearAuth());

        // Clean URL hash/query without page reload
        if (typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (err) {
        console.error('[Quitmark] Email confirmation error:', err);
      } finally {
        if (mounted) {
          setIsProcessing(false);
        }
      }
    };

    processConfirmation();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return (
    <div ref={containerRef} className="w-full">
      <AuthLayout hideNavigation={true}>
        <div className="w-full text-center space-y-6">
          {error ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Verification Failed
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  {error || 'This confirmation link may have expired or has already been used.'}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Email Confirmed
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Your email address has been successfully confirmed.
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  You can now return to the login page and sign in to your account.
                </p>
              </div>

              <div className="pt-3">
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
                >
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </AuthLayout>
    </div>
  );
}
