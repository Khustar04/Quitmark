import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingScreen from '../components/common/LoadingScreen';

export default function PublicAuthRoute() {
  const { user, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
