import { ReactNode } from 'react';
import { useMonEspaceAccess } from '../hooks/useMonEspaceAccess';
import MonEspaceRestrictedPage from '../modules/mon-espace/pages/MonEspaceRestrictedPage';

interface MonEspaceProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected Route Component for Mon Espace Module
 * Checks if user has required role (expert, organization, organization, admin)
 * Shows restricted access page if user doesn't have access
 */
export function MonEspaceProtectedRoute({ children }: MonEspaceProtectedRouteProps) {
  const { hasAccess } = useMonEspaceAccess();

  if (!hasAccess) {
    return <MonEspaceRestrictedPage />;
  }

  return <>{children}</>;
}
