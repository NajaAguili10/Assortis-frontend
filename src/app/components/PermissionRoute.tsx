import { Navigate } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import type { AccountType } from '@app/services/permissions.service';

interface PermissionRouteProps {
  children: React.ReactNode;
  canAccess: (accountType?: AccountType) => boolean;
  fallbackTo?: string;
}

export function PermissionRoute({ children, canAccess, fallbackTo = '/account' }: PermissionRouteProps) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {canAccess(user?.accountType) ? <>{children}</> : <Navigate to={fallbackTo} replace />}
    </ProtectedRoute>
  );
}
