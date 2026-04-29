import { ProtectedRoute } from './ProtectedRoute';
import CompteUtilisateurPage from '../modules/account/pages/CompteUtilisateurPage';
import CreditsPage from '../modules/account/pages/CreditsPage';
import ModifierProfilPage from '../modules/mon-espace/pages/ModifierProfilPage';
import AccountHomePage from '../modules/account/pages/AccountHomePage';
import AccountMessagesPage from '../modules/account/pages/AccountMessagesPage';
import MySelectionAlertsPage from '../modules/account/pages/MySelectionAlertsPage';
import AccountSubscriptionPage from '../modules/account/pages/AccountSubscriptionPage';
import AccountTeamsPage from '../modules/account/pages/AccountTeamsPage';

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
    <ModifierProfilPage />
  </ProtectedRoute>
);

export const ProtectedCompteUtilisateurCredits = () => (
  <ProtectedRoute>
    <CreditsPage />
  </ProtectedRoute>
);

export const ProtectedAccountHome = () => (
  <ProtectedRoute>
    <AccountHomePage />
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
    <AccountTeamsPage />
  </ProtectedRoute>
);

export const ProtectedAccountMessages = () => (
  <ProtectedRoute>
    <AccountMessagesPage />
  </ProtectedRoute>
);
