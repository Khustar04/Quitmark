import supabase from '../lib/supabase';

/**
 * Translates raw technical Supabase errors into clean, user-friendly messages.
 */
export const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = (error.message || error.toString() || '').toLowerCase();

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password.';
  }

  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'This email is already registered. Try logging in.';
  }

  if (message.includes('password should be at least 6 characters') || message.includes('weak password')) {
    return 'Password must be at least 6 characters long.';
  }

  if (message.includes('invalid format') || message.includes('valid email')) {
    return 'Please enter a valid email address.';
  }

  if (message.includes('email not confirmed')) {
    return 'Please check your inbox to confirm your email before logging in.';
  }

  if (message.includes('provider is not enabled') || message.includes('unsupported provider')) {
    return 'Google authentication is not enabled in your Supabase project. Please configure Google provider credentials in Supabase Dashboard (Authentication > Providers).';
  }

  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'Network connection error. Please check your internet connection.';
  }

  return error.message || 'Something went wrong. Please try again.';
};

/**
 * Checks if the Supabase client is initialized with environment variables.
 */
const ensureClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
    );
  }
};

/**
 * Helper to add a timeout to a promise.
 */
const withTimeout = (promise, ms = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Request timed out. Please check your Supabase SMTP configuration as the server took too long to respond.')),
        ms
      )
    ),
  ]);
};

/**
 * Signs up a user using email and password.
 */
export const signUpWithEmail = async (email, password) => {
  ensureClient();
  const redirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard`
      : '/dashboard';

  const { data, error } = await withTimeout(
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })
  );

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};

/**
 * Signs in a user using email and password.
 */
export const signInWithEmail = async (email, password) => {
  ensureClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};

/**
 * Initiates Google OAuth sign-in with an environment-aware redirect URL.
 */
export const signInWithGoogle = async () => {
  ensureClient();
  const redirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/dashboard`
      : '/dashboard';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};

/**
 * Signs out the current user and clears session.
 */
export const signOut = async () => {
  ensureClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
};

/**
 * Retrieves the current session from Supabase.
 */
export const getSession = async () => {
  if (!supabase) return { session: null, user: null };
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[Quitmark] Error fetching initial session:', error);
    return { session: null, user: null };
  }
  return { session: data.session, user: data.session?.user || null };
};

/**
 * Subscribes to Supabase authentication state changes.
 */
export const onAuthStateChange = (callback) => {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Sends a password reset email to the specified address.
 */
export const sendPasswordResetEmail = async (email) => {
  ensureClient();
  const redirectUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : '/reset-password';

  const { error } = await withTimeout(
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
  );

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
};

/**
 * Updates the user's password securely (requires an active session).
 */
export const updatePassword = async (newPassword) => {
  ensureClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }

  return data;
};
