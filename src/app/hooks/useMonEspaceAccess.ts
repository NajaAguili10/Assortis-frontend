import { useAuth } from '../contexts/AuthContext';
import { hasMonEspaceAccess } from '../services/permissions.service';

/**
 * Hook to check if user has access to Mon Espace module
 * Only expert, organization, organization, and admin roles have access
 */
export function useMonEspaceAccess() {
  const { isAuthenticated, isInitializing, user } = useAuth();

  // Check if user has the required role using the permissions service
  const hasAccess = isAuthenticated && hasMonEspaceAccess(user?.accountType);

  return {
    hasAccess,
    isAuthenticated,
    isInitializing,
    userRole: user?.accountType,
  };
}
