import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from '@app/components/SubMenu';
import { hasOrganizationsSubMenuAccess } from '@app/services/permissions.service';
import {
  Building2,
  UsersRound,
  FileText,
  Shield,
  BriefcaseBusiness,
} from 'lucide-react';

export function OrganizationsSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  const getCurrentActive = () => {
    const path = location.pathname;
    // Si on est sur la page overview, aucun onglet n'est actif
    if (path === '/organizations' || path === '/organizations/overview') return null;
    if (path.startsWith('/organizations/database')) return 'database';
    if (path.startsWith('/organizations/my-organization')) return 'myOrganization';
    if (path.startsWith('/organizations/my-tenders')) return 'myTenders';
    if (path.startsWith('/organizations/subscription')) return 'subscription';
    if (path.startsWith('/organizations/project-references')) return 'projectReferences';
    if (path.startsWith('/organizations/teams')) return 'teams';
    if (path.startsWith('/organizations/partnerships')) return 'partnerships';
    if (path.startsWith('/organizations/matching-dossier')) return 'matchingDossier';
    if (path.startsWith('/organizations/matching')) return 'matching';
    if (path.startsWith('/organizations/create-profile')) return null;
    // Par défaut, aucun onglet actif
    return null;
  };

  const activeTab = getCurrentActive();

  // Vérifier l'accès à chaque sous-menu individuellement
  const canAccessMyOrganization = hasOrganizationsSubMenuAccess('myOrganization', user?.accountType);
  const canAccessMyTenders = hasOrganizationsSubMenuAccess('myTenders', user?.accountType);
  const canAccessSubscription = hasOrganizationsSubMenuAccess('subscription', user?.accountType);
  const canAccessProjectReferences = hasOrganizationsSubMenuAccess('projectReferences', user?.accountType);
  const canAccessTeams = hasOrganizationsSubMenuAccess('teams', user?.accountType);
  const canAccessMatching = hasOrganizationsSubMenuAccess('matching', user?.accountType);
  const canAccessMatchingDossier = hasOrganizationsSubMenuAccess('matchingDossier', user?.accountType);

  // Construire les items en filtrant selon les permissions
  const items = [
    canAccessMyOrganization && {
      label: t('organizations.submenu.myOrganizationProfile'),
      icon: Building2,
      active: activeTab === 'myOrganization',
      onClick: () => navigate('/organizations/my-organization'),
    },
    canAccessMyTenders && {
      label: t('organizations.submenu.myTenders'),
      icon: BriefcaseBusiness,
      active: activeTab === 'myTenders',
      onClick: () => navigate('/organizations/my-tenders'),
    },
    canAccessSubscription && {
      label: t('organizations.submenu.subscription'),
      icon: Shield,
      active: activeTab === 'subscription',
      onClick: () => navigate('/organizations/subscription'),
    },
    canAccessProjectReferences && {
      label: t('organizations.submenu.projectReferences'),
      icon: FileText,
      active: activeTab === 'projectReferences',
      onClick: () => navigate('/organizations/project-references'),
    },
    canAccessTeams && {
      label: t('organizations.submenu.teams'),
      icon: UsersRound,
      active: activeTab === 'teams',
      onClick: () => navigate('/organizations/teams'),
    },
  ].filter(Boolean); // Retirer les false/undefined

  return <SubMenu items={items} />;
}