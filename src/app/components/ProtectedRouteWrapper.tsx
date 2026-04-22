import { ProtectedRoute } from './ProtectedRoute';
import CompteUtilisateurPage from '../modules/account/pages/CompteUtilisateurPage';
import CreditsPage from '../modules/account/pages/CreditsPage';
import ModifierProfilPage from '../modules/mon-espace/pages/ModifierProfilPage';

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