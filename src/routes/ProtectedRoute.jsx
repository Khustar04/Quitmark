import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';

export default function ProtectedRoute() {
  const { user, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
