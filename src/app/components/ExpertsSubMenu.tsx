import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { hasExpertsAccess } from '../services/permissions.service';
import {
  Database,
  Zap,
  FileText,
  Archive,
  Building2,
} from 'lucide-react';

export function ExpertsSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Vérifier les permissions d'accès
  const hasAccess = hasExpertsAccess(user?.accountType);
  
  // Pour Expert : seulement Base de données
  // Pour Organization/Organization/Admin : Tous les sous-menus (Matching standard + Matching Organisation)
  const isExpert = user?.accountType === 'expert';
  const isOrgOrAdmin = user?.accountType === 'organization' || 
                       user?.accountType === 'admin';
  
  // Matching Organisation visible SEULEMENT pour Organization, Organization, Admin
  // PAS pour Expert
  const canAccessOrgMatching = isOrgOrAdmin;

  const getCurrentActive = () => {
    const path = location.pathname;
    // Si on est sur la page overview, aucun onglet n'est actif
    if (path === '/experts' || path === '/experts/overview') return null;
    if (path.startsWith('/experts/database')) return 'database';
    if (path.startsWith('/experts/matching-archive')) return 'matchingArchive';
    if (path.startsWith('/experts/matching-organisation-archive')) return 'matchingOrganisationArchive';
    if (path.startsWith('/experts/matching-organisation')) return 'matchingOrganisation';
    if (path.startsWith('/experts/matching')) return 'matching';
    if (path.startsWith('/experts/cv-templates')) return 'cvTemplates';
    
    // Si on est sur une page de détails d'expert (/experts/:id)
    // On garde l'onglet "database" actif par défaut
    if (path.match(/^\/experts\/[^\/]+$/)) return 'database';
    
    // Par défaut, aucun onglet actif
    return null;
  };

  const activeTab = getCurrentActive();

  return (
    <SubMenu
      items={[
        {
          label: t('experts.submenu.database'),
          active: activeTab === 'database',
          icon: Database,
          onClick: hasAccess ? () => navigate('/experts/database') : undefined,
          disabled: !hasAccess
        },
        // Matching Organisation : pour Organization, Organization, Admin
        // PAS pour Expert
        ...(canAccessOrgMatching ? [
          {
            label: t('experts.submenu.matchingOrganisation'),
            active: activeTab === 'matchingOrganisation',
            icon: Building2,
            onClick: hasAccess ? () => navigate('/experts/matching-organisation') : undefined,
            disabled: !hasAccess
          },
          {
            label: t('experts.submenu.matchingOrganisationArchive'),
            active: activeTab === 'matchingOrganisationArchive',
            icon: Archive,
            onClick: hasAccess ? () => navigate('/experts/matching-organisation-archive') : undefined,
            disabled: !hasAccess
          }
        ] : []),
        // CV Templates : seulement pour Organization/Organization/Admin (pas pour Expert)
        ...(isOrgOrAdmin ? [
          {
            label: t('experts.submenu.cvTemplates'),
            active: activeTab === 'cvTemplates',
            icon: FileText,
            onClick: hasAccess ? () => navigate('/experts/cv-templates') : undefined,
            disabled: !hasAccess
          }
        ] : []),
      ]}
    />
  );
}