import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { PageLoading } from './SystemStates';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login',
  allowedRoles
}) => {
  const { isAuthenticated, isInitializing, user } = useAuth();

  if (isInitializing) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role || '')) {
    // If user is authenticated but doesn't have the right role, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
