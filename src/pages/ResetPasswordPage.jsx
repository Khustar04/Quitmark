import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { updatePassword } from '../services/authService';
import supabase from '../lib/supabase';
import AuthLayout from '../components/auth/AuthLayout';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const handleExit = async (path) => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore errors during emergency signout
    }
    navigate(path);
  };

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

    // Supabase will automatically process the hash/code in the URL.
    // We listen to the auth state change to catch the PASSWORD_RECOVERY event or the session establishment.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      if (session) {
        // Session established successfully (either from hash or PKCE exchange)
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        // If they get signed out, they don't have a valid recovery session
        setError('Your password reset link is invalid or has expired. If you opened the link in a different browser than where you requested it, please copy the link and open it in the original browser.');
      }
    });

    // Fallback check: if after 2 seconds there's still no session and no hash/code in URL, 
    // it means they arrived here without a valid link.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted && !session && !window.location.hash.includes('access_token') && !window.location.search.includes('code')) {
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
    if (!validate()) return;

    try {
      setLoading(true);
      setError(null);
      
      // Double check session right before submitting to prevent "Auth session missing" error
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active recovery session found. Please request a new reset link. Ensure you open the link in the exact same browser/device.');
      }

      await updatePassword(password);
      await supabase.auth.signOut(); // Ensure temporary recovery session is destroyed
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div ref={containerRef} className="w-full">
        <AuthLayout
          heading="Password Reset Successfully"
          supportingText="Your password has been changed. You can now log in with your new password."
          onBackAction={() => handleExit('/')}
        >
          <div className="w-full space-y-6">
            <div className="text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-sm shadow-emerald-600/20"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </AuthLayout>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <AuthLayout
        heading="Create New Password"
        supportingText="Please enter your new password below."
        onBackAction={() => handleExit('/')}
      >
        <div className="w-full space-y-6">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
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
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
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
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
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

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => handleExit('/login')}
                className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus:outline-none"
              >
                Cancel and return to login
              </button>
            </div>
          </form>
        </div>
      </AuthLayout>
    </div>
  );
}
