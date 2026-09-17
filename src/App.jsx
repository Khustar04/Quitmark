import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getSession, onAuthStateChange } from './services/authService';
import { setAuth, clearAuth } from './store/slices/authSlice';

import RootLayout from './layouts/RootLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import HabitHistoryPage from './pages/HabitHistoryPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicAuthRoute from './routes/PublicAuthRoute';
import FaqPage from './pages/FaqPage';
import ReportBugPage from './pages/ReportBugPage';
import SettingsPage from './pages/SettingsPage';
import LeaderboardPage from './pages/LeaderboardPage';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Initial session verification
    getSession().then(({ session, user }) => {
      if (session && user) {
        dispatch(setAuth({ user, session }));
      } else {
        dispatch(clearAuth());
      }
    });

    // 2. Subscribe to auth events (LOGIN, LOGOUT, TOKEN_REFRESH, OAUTH_REDIRECT)
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setAuth({ user: session.user, session }));
      } else {
        dispatch(clearAuth());
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Reset Password (completely isolated layout) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={<RootLayout />}>
          {/* Public Landing Page */}
          <Route index element={<LandingPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="report-bug" element={<ReportBugPage />} />

          {/* Public Auth Routes (redirect to /dashboard if already logged in) */}
          <Route element={<PublicAuthRoute />}>
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
    </BrowserRouter>
  );
}
