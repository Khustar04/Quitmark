import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AlertCircle } from 'lucide-react';
import { getFriendlyAuthErrorMessage, updatePassword } from '../services/authService';
import supabase from '../lib/supabase';
import AuthLayout from '../components/auth/AuthLayout';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const configurationError = !supabase
    ? 'Password reset is unavailable because this app is not configured. Please contact support.'
    : null;
  const visibleError = configurationError || error;
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const isResettingRef = useRef(false);
  const isValidRecoveryRef = useRef(false);


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

  // Validate the reset state
  useEffect(() => {
    let mounted = true;

    if (!supabase) return undefined;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hasRecoveryParams = searchParams.has('code') || hashParams.get('type') === 'recovery';

    // PKCE recovery links can emit SIGNED_IN after exchanging their code, so a
    // valid session on this page is sufficient to complete the password reset.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && (hasRecoveryParams || session))) {
        isValidRecoveryRef.current = true;
        setRecoveryReady(true);
        setError(null);
      } else if (event === 'SIGNED_OUT' && !isResettingRef.current) {
        // If they get signed out, they don't have a valid recovery session
        setError('Your password reset link is invalid or has expired. If you opened the link in a different browser than where you requested it, please copy the link and open it in the original browser.');
      }
    });

    // Fallback check after Supabase has processed the recovery URL.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted || isValidRecoveryRef.current) return;

      if (session) {
        isValidRecoveryRef.current = true;
        setRecoveryReady(true);
        setError(null);
      } else {
        setError('Invalid or expired password reset link. Please request a new one.');
      }
    };
    
    // Give Supabase a moment to process the URL tokens before checking
    const timer = setTimeout(checkSession, 1500);

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  const validate = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recoveryReady || !supabase || !validate()) return;

    try {
      setLoading(true);
      setError(null);
      isResettingRef.current = true;
      
      // Double check session right before submitting to prevent "Auth session missing" error
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error('No active recovery session found. Please request a new reset link. Ensure you open the link in the exact same browser/device.');
      }

      await updatePassword(password);
      await supabase.auth.signOut(); // Ensure temporary recovery session is destroyed
      navigate('/login', { state: { message: 'Password reset successfully. Please log in with your new password.' } });
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <AuthLayout
        heading="Create New Password"
        supportingText="Please enter your new password below."
        hideNavigation={true}
      >
        <div className="w-full space-y-6">
          {visibleError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <span>{visibleError}</span>
                {visibleError && (
                  <Link to="/forgot-password" className="block font-semibold underline hover:no-underline">
                    Request a new reset link
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                New Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading || !recoveryReady}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading || !recoveryReady}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !recoveryReady || !password || !confirmPassword}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Resetting...</span>
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

          </form>
        </div>
      </AuthLayout>
    </div>
  );
}
