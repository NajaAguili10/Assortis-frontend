/**
 * Service de gestion des permissions par rôle
 * Gère l'accès aux modules et fonctionnalités selon le type de compte utilisateur
 */

export type AccountType = 'expert' | 'organization' | 'admin' | 'public';

export interface ModulePermissions {
  canAccess: boolean;
  canNavigate: boolean;
  canViewContent: boolean;
  canModify: boolean;
  canDelete: boolean;
}

export const isOrganizationAccount = (accountType?: AccountType): boolean => {
  return accountType === 'organization';
};

export const isOrganizationUserRole = (accountType?: AccountType, role?: string): boolean => {
  return isOrganizationAccount(accountType) && role === 'organization-user';
};

export const canManageOrganizationAdminActions = (accountType?: AccountType, role?: string): boolean => {
  if (!isOrganizationAccount(accountType)) {
    return accountType === 'admin';
  }

  return role !== 'organization-user';
};

/**
 * Vérifie si un utilisateur a accès au module Appels d'offres (Tenders)
 */
export const hasTendersAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  // Seuls organization et admin ont accès
  return ['organization', 'admin'].includes(accountType);
};

/**
 * Vérifie si un utilisateur a accès au module Projets (Projects)
 */
export const hasProjectsAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  // organization, expert et admin ont accès
  return ['organization', 'expert', 'admin'].includes(accountType);
};

/**
 * Vérifie si un utilisateur a accès au module Experts
 */
export const hasExpertsAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  // organization, expert et admin ont accès
  // Seul public n'a pas accès
  return ['organization', 'expert', 'admin'].includes(accountType);
};

/**
 * Vérifie si un utilisateur a accès à la section Mon CV Expert
 */
export const hasExpertMyCVAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;

  // Strictement réservé aux experts
  return accountType === 'expert';
};

/**
 * Vérifie si un utilisateur a accès au module Organizations
 */
export const hasOrganizationsAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  // organization, expert et admin ont accès
  // Seul public n'a pas accès
  return ['organization', 'expert', 'admin'].includes(accountType);
};

/**
 * Vérifie si un utilisateur a accès à un sous-menu spécifique du module Organizations
 */
export const hasOrganizationsSubMenuAccess = (
  subMenu: 'database' | 'myOrganization' | 'myTenders' | 'projectReferences' | 'teams' | 'partnerships' | 'matching' | 'matchingDossier' | 'subscription',
  accountType?: AccountType
): boolean => {
  if (!accountType) return false;
  
  // Base de données : Tous sauf public
  if (subMenu === 'database') {
    return ['organization', 'expert', 'admin'].includes(accountType);
  }
  
  // Matching et Dossier Matching : Expert, Organization et Admin
  if (subMenu === 'matching' || subMenu === 'matchingDossier') {
    return ['organization', 'expert', 'admin'].includes(accountType);
  }
  
  // Mon Organisation, Références projets, Équipes, Partenariats : Organization et Admin uniquement (PAS Expert)
  return ['organization', 'admin'].includes(accountType);
};

/**
 * Vérifie si un utilisateur a accès au module Assistance
 */
export const hasAssistanceAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  // Tous les comptes ont accès au module Assistance
  return ['organization', 'expert', 'public', 'admin'].includes(accountType);
};

/**
 * Vérifie si un utilisateur a accès au module Mon Espace
 */
export const hasMonEspaceAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  // organization, expert et admin ont accès
  // Seul public n'a pas accès
  return ['organization', 'expert', 'admin'].includes(accountType);
};

/**
 * Verifie si un utilisateur peut acceder a la page Credits CV
 */
export const hasCreditsAccess = (accountType?: AccountType): boolean => {
  if (!accountType) return false;

  // Reserve aux organisations
  return accountType === 'organization';
};

/**
 * Vérifie si un utilisateur a accès à un sous-menu spécifique du module Assistance
 */
export const hasAssistanceSubMenuAccess = (
  subMenu: 'findExpert' | 'request' | 'history',
  accountType?: AccountType
): boolean => {
  if (!accountType) return false;
  
  // Demander de l'assistance : Tous les comptes
  if (subMenu === 'request') {
    return ['organization', 'expert', 'public', 'admin'].includes(accountType);
  }
  
  // Trouver un Expert et Historique : Tous sauf public
  return ['organization', 'expert', 'admin'].includes(accountType);
};

/**
 * Verifie si un utilisateur a acces au module Statistics
 */
export const hasStatisticsAccess = (accountType?: AccountType | 'expert-organization'): boolean => {
  if (!accountType) return false;

  // Accessible pour tous les comptes authentifies
  return ['organization', 'expert', 'expert-organization', 'admin'].includes(accountType);
};

/**
 * Verifie si un utilisateur a acces a un sous-menu du module Statistics
 */
export const hasStatisticsSubMenuAccess = (
  subMenu:
    | 'dashboard'
    | 'projectsContracts'
    | 'marketTrends'
    | 'pricingExperts'
    | 'competitors'
    | 'usageAnalytics'
    | 'mapInsights',
  accountType?: AccountType | 'expert-organization'
): boolean => {
  if (!accountType) return false;

  return hasStatisticsAccess(accountType);
};

/**
 * Vérifie si le compte est un Expert (expert ou expert-organization)
 * Utilisé pour adapter l'affichage des statistiques à la vue Expert
 */
export const isExpertAccountType = (accountType?: AccountType | 'expert-organization'): boolean => {
  if (!accountType) return false;
  return accountType === 'expert' || accountType === 'expert-organization';
};

/**
 * Récupère les permissions complètes pour le module Tenders
 */
export const getTendersPermissions = (accountType?: AccountType): ModulePermissions => {
  const hasAccess = hasTendersAccess(accountType);
  
  return {
    canAccess: hasAccess,
    canNavigate: hasAccess,
    canViewContent: hasAccess,
    canModify: hasAccess && accountType !== 'public',
    canDelete: accountType === 'admin',
  };
};

/**
 * Récupère les permissions complètes pour le module Projects
 */
export const getProjectsPermissions = (accountType?: AccountType): ModulePermissions => {
  const hasAccess = hasProjectsAccess(accountType);
  
  return {
    canAccess: hasAccess,
    canNavigate: hasAccess,
    canViewContent: hasAccess,
    canModify: hasAccess && accountType !== 'public',
    canDelete: accountType === 'admin',
  };
};

/**
 * Récupère les permissions complètes pour le module Experts
 */
export const getExpertsPermissions = (accountType?: AccountType): ModulePermissions => {
  const hasAccess = hasExpertsAccess(accountType);
  
  return {
    canAccess: hasAccess,
    canNavigate: hasAccess,
    canViewContent: hasAccess,
    canModify: hasAccess && accountType !== 'public',
    canDelete: accountType === 'admin',
  };
};

/**
 * Vérifie si un utilisateur peut naviguer sur un module spécifique
 */
export const canNavigateModule = (module: 'tenders' | 'offers' | 'experts' | 'organizations' | 'projects' | 'training' | 'statistics', accountType?: AccountType): boolean => {
  if (!accountType) return false;
  
  switch (module) {
    case 'tenders':
      return hasTendersAccess(accountType);
    
    case 'projects':
      return hasProjectsAccess(accountType);
    
    case 'experts':
      return hasExpertsAccess(accountType);
    
    case 'organizations':
      return hasOrganizationsAccess(accountType);
    
    case 'offers':
      // Tous les types peuvent accéder aux offres
      return true;
    
    case 'training':
      // Tous les types peuvent accéder aux formations
      return true;

    case 'statistics':
      return hasStatisticsAccess(accountType);
    
    default:
      return false;
  }
};

/**
 * Récupère le message d'accès refusé pour un module
 */
export const getAccessDeniedMessage = (module: string, accountType?: AccountType): {
  titleKey: string;
  descriptionKey: string;
  upgradeRequired: boolean;
} => {
  const isPublic = accountType === 'public';
  const isExpert = accountType === 'expert';
  
  return {
    titleKey: `permissions.${module}.accessDenied.title`,
    descriptionKey: isPublic 
      ? `permissions.${module}.accessDenied.publicUser`
      : isExpert
      ? `permissions.${module}.accessDenied.expertUser`
      : `permissions.${module}.accessDenied.default`,
    upgradeRequired: isPublic || isExpert,
  };
};