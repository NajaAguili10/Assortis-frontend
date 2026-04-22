import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if user has access to global features
 * Only organization, expert, and admin roles have access
 * Public users and users without authorized roles cannot use these features
 */
export function useFeatureAccess() {
  const { isAuthenticated, user } = useAuth();

  // Check if user has the required role for global features (search, notifications)
  const hasAccess = isAuthenticated && user?.accountType && 
    ['expert', 'organization', 'admin'].includes(user.accountType);

  return {
    hasAccess,
    isAuthenticated,
    userRole: user?.accountType,
  };
}
