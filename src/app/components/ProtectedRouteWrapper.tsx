import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import CompteUtilisateurPage from '../modules/account/pages/CompteUtilisateurPage';
import CreditsPage from '../modules/account/pages/CreditsPage';
import ModifierProfilPage from '../modules/mon-espace/pages/ModifierProfilPage';
import AccountHomePage from '../modules/account/pages/AccountHomePage';
import AccountMessagesPage from '../modules/account/pages/AccountMessagesPage';
import MySelectionAlertsPage from '../modules/account/pages/MySelectionAlertsPage';
import AccountSubscriptionPage from '../modules/account/pages/AccountSubscriptionPage';
import AccountTeamsPage from '../modules/account/pages/AccountTeamsPage';
import ManageProfilesPage from '../modules/account/pages/ManageProfilesPage';
import OrganizationAccountDashboard from '../modules/account/pages/OrganizationAccountDashboard';
import OrganizationUserProfileSettingsPage from '../modules/account/pages/OrganizationUserProfileSettingsPage';
import { canAccessTeamMembers, isExpertAccount, isOrganizationOrAdminAccount } from '../services/permissions.service';
import { Navigate } from 'react-router';

export const ProtectedCompteUtilisateur = () => (
  <ProtectedRoute>
    <CompteUtilisateurPage />
  </ProtectedRoute>
);

export const ProtectedCompteUtilisateurSecurity = () => (
  <ProtectedRoute>
    <CompteUtilisateurPage initialTab="security" />
  </ProtectedRoute>
);

export const ProtectedCompteUtilisateurResources = () => (
  <ProtectedRoute>
    <CompteUtilisateurPage initialTab="resources" />
  </ProtectedRoute>
);

export const ProtectedModifierProfilPage = () => (
  <ProtectedRoute>
    <RoleAwareProfileSettings />
  </ProtectedRoute>
);

export const ProtectedCompteUtilisateurCredits = () => (
  <ProtectedRoute>
    <CreditsPage />
  </ProtectedRoute>
);

export const ProtectedAccountHome = () => (
  <ProtectedRoute>
    <RoleAwareAccountHome />
  </ProtectedRoute>
);

export const ProtectedMySelectionAlerts = () => (
  <ProtectedRoute>
    <MySelectionAlertsPage />
  </ProtectedRoute>
);

export const ProtectedAccountSubscription = () => (
  <ProtectedRoute>
    <AccountSubscriptionPage />
  </ProtectedRoute>
);

export const ProtectedAccountTeams = () => (
  <ProtectedRoute>
    <RoleAwareAccountTeams />
  </ProtectedRoute>
);

export const ProtectedManageProfiles = () => (
  <ProtectedRoute>
    <ManageProfilesPage />
  </ProtectedRoute>
);

export const ProtectedAccountMessages = () => (
  <ProtectedRoute>
    <AccountMessagesPage />
  </ProtectedRoute>
);

const RoleAwareAccountHome = () => {
  const { user } = useAuth();

  if (isOrganizationOrAdminAccount(user?.accountType)) {
    return <OrganizationAccountDashboard />;
  }

  return <AccountHomePage />;
};

const RoleAwareProfileSettings = () => {
  const { user } = useAuth();

  if (isOrganizationOrAdminAccount(user?.accountType)) {
    return <OrganizationUserProfileSettingsPage />;
  }

  if (isExpertAccount(user?.accountType)) {
    return <ModifierProfilPage />;
  }

  return <CompteUtilisateurPage />;
};

const RoleAwareAccountTeams = () => {
  const { user } = useAuth();

  if (!canAccessTeamMembers(user?.accountType)) {
    return <Navigate to="/account" replace />;
  }

  return <AccountTeamsPage />;
};
