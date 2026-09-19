import { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSession, onAuthStateChange } from './services/authService';
import { setAuth, clearAuth } from './store/slices/authSlice';
import { resetHabitsState } from './store/slices/habitsSlice';
import { syncUserTimezone } from './services/authService';
import { setActiveUserId } from './utils/auth/sessionGuard';
import { unsubscribeFromPush } from './utils/notifications/pushSubscription';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import supabase from './lib/supabase';

import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicAuthRoute from './routes/PublicAuthRoute';
import LoadingScreen from './components/common/LoadingScreen';

// Code-split secondary routes to shrink initial bundle size
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const HabitHistoryPage = lazy(() => import('./pages/HabitHistoryPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ReportBugPage = lazy(() => import('./pages/ReportBugPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

export default function App() {
  const dispatch = useDispatch();
  const activeUserIdRef = useRef(null);

  useEffect(() => {
    const clearUserState = () => {
      activeUserIdRef.current = null;
      setActiveUserId(null);
      dispatch(clearAuth());
      dispatch(resetHabitsState());
      // Clean up push subscription on logout
      unsubscribeFromPush().catch(() => {});
    };

    const applySession = (session, user) => {
      if (!session || !user) {
        clearUserState();
        return;
      }

      if (activeUserIdRef.current && activeUserIdRef.current !== user.id) {
        dispatch(resetHabitsState());
      }
      activeUserIdRef.current = user.id;
      setActiveUserId(user.id);
      dispatch(setAuth({ user, session }));
      void syncUserTimezone();
    };

    // 1. Initial session verification
    getSession().then(({ session, user }) => {
      applySession(session, user);
    });

    // 2. Subscribe to auth events (LOGIN, LOGOUT, TOKEN_REFRESH, OAUTH_REDIRECT)
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (session?.user) {
        applySession(session, session.user);
      } else if (event === 'SIGNED_OUT' || !session) {
        clearUserState();
      }
    });

    // 3. Proactively refresh/verify session when resuming app from background (critical for PWA)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { session, user } = await getSession();
        if (session && user) {
          applySession(session, user);
        } else {
          clearUserState();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Handle Capacitor native deep link redirect (e.g. from Google OAuth callback)
    let appUrlListener = null;
    if (Capacitor.isNativePlatform()) {
      appUrlListener = CapApp.addListener('appUrlOpen', async (event) => {
        try {
          await Browser.close().catch(() => {});
        } catch {
          // ignore
        }

        const url = event.url;
        if (!url) return;

        // PKCE Code flow: ?code=...
        if (url.includes('code=')) {
          try {
            const urlObj = new URL(url);
            const code = urlObj.searchParams.get('code');
            if (code && supabase) {
              await supabase.auth.exchangeCodeForSession(code);
            }
          } catch (err) {
            console.error('[Quitmark] Error exchanging code for session:', err);
          }
          return;
        }

        // Implicit access_token flow: #access_token=...&refresh_token=...
        if (url.includes('#') && url.includes('access_token=')) {
          try {
            const hash = url.split('#')[1];
            const params = new URLSearchParams(hash);
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            if (access_token && refresh_token && supabase) {
              await supabase.auth.setSession({ access_token, refresh_token });
            }
          } catch (err) {
            console.error('[Quitmark] Error setting session from hash:', err);
          }
        }
      });
    }

    // 5. Handle Android hardware/gesture back button
    let backButtonListener = null;
    if (Capacitor.isNativePlatform()) {
      backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
        const currentPath = window.location.pathname;
        if (currentPath === '/dashboard' || currentPath === '/' || currentPath === '/login' || !canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }

    return () => {
      subscription?.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (appUrlListener) {
        appUrlListener.then((handle) => handle.remove()).catch(() => {});
      }
      if (backButtonListener) {
        backButtonListener.then((handle) => handle.remove()).catch(() => {});
      }
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Reset Password (completely isolated layout) */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/" element={<RootLayout />}>
            <Route path="faq" element={<FaqPage />} />
            <Route path="report-bug" element={<ReportBugPage />} />

            {/* Public Auth Routes (redirect to /dashboard if already logged in) */}
            <Route element={<PublicAuthRoute />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>


            {/* Protected Routes (redirect to /login if unauthenticated) */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="habits/:habitId" element={<HabitHistoryPage />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
