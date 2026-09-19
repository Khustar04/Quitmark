import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signUpWithEmail } from '../../services/authService';
import { setAuth } from '../../store/slices/authSlice';
import GoogleAuthButton from './GoogleAuthButton';
import { AlertCircle, Mail } from 'lucide-react';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const data = await signUpWithEmail(email.trim(), password);

      if (data?.session) {
        // Active session established immediately
        dispatch(setAuth({ user: data.user, session: data.session }));
        navigate('/dashboard');
      } else if (data?.user?.identities && data.user.identities.length === 0) {
        setServerError('This email is already registered. Please log in instead.');
      } else {
        // Email confirmation is required
        setConfirmationPending(true);
      }
    } catch (err) {
      setServerError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // View shown when email confirmation is required by Supabase
  if (confirmationPending) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Check your email
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-xs mx-auto">
            We sent a verification link to{' '}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {email}
            </span>
            . Please verify your account before logging in.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-sm"
          >
            Go to Login
          </Link>
          <button
            type="button"
            onClick={() => setConfirmationPending(false)}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Entered the wrong email? Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Server Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Google OAuth Option */}
      <GoogleAuthButton onError={setServerError} />

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        <span className="absolute bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Or with email
        </span>
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
            }}
            disabled={loading}
            placeholder="you@example.com"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
              fieldErrors.email
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
            }}
            disabled={loading}
            placeholder="At least 6 characters"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
              fieldErrors.password
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
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
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
              }
            }}
            disabled={loading}
            placeholder="Re-enter password"
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
              fieldErrors.confirmPassword
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/20'
            }`}
          />
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-emerald-600/20"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Creating account...</span>
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switch to Login Link */}
      <div className="text-center pt-2 text-xs text-zinc-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
