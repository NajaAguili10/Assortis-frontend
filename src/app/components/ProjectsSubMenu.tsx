import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { hasProjectsAccess } from '../services/permissions.service';
import {
  FolderOpen,
  CheckSquare,
  Handshake,
  Target,
  Sparkles,
  Archive,
  BookOpen,
  Building2,
  Star,
} from 'lucide-react';

export function ProjectsSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Vérifier les permissions d'accès
  const hasAccess = hasProjectsAccess(user?.accountType);
  
  // Vérifier si l'utilisateur est un expert (pas organization)
  const isExpertOnly = user?.accountType === 'expert';

  const getCurrentActive = () => {
    const path = location.pathname;
    // If navigated from pipeline context, highlight pipeline tab
    if ((location.state as Record<string, unknown>)?.fromPipeline) return 'pipeline';
    // Si on est sur la page overview, aucun onglet n'est actif
    if (path === '/projects' || path === '/projects/overview') return null;
    if (path.startsWith('/projects/active')) return 'active';
    if (path.startsWith('/projects/pipeline')) return 'pipeline';
    if (path.startsWith('/projects/tasks')) return 'tasks';
    if (path.startsWith('/projects/references')) return 'references';
    if (path.startsWith('/projects/collaborations')) return 'collaborations';
    if (path.startsWith('/projects/contractors')) return 'contractors';
    if (path.startsWith('/projects/organizations-scoring')) return 'organizations-scoring';
    if (path.startsWith('/projects/matching-archive')) return 'matching-archive';
    if (path.startsWith('/projects/matching')) return 'matching';
    // Par défaut, aucun onglet actif
    return null;
  };

  const activeTab = getCurrentActive();

  // Construction conditionnelle des items selon le rôle
  const items = [
    // Pipeline : NON visible pour expert uniquement
    ...(!isExpertOnly ? [{
      label: t('projects.submenu.pipeline'),
      active: activeTab === 'pipeline',
      icon: Target,
      onClick: hasAccess ? () => navigate('/projects/pipeline') : undefined,
      disabled: !hasAccess
    }] : []),
    // Mes tâches : NON visible pour expert uniquement
    ...(!isExpertOnly ? [{
      label: t('projects.submenu.myTasks'),
      active: activeTab === 'tasks',
      icon: CheckSquare,
      onClick: hasAccess ? () => navigate('/projects/tasks') : undefined,
      disabled: !hasAccess
    }] : []),
    // Project References : NON visible pour expert uniquement
    ...(!isExpertOnly ? [{
      label: t('projects.submenu.references'),
      active: activeTab === 'references',
      icon: BookOpen,
      onClick: hasAccess ? () => navigate('/projects/references') : undefined,
      disabled: !hasAccess
    }] : []),
    // Collaborations : NON visible pour expert uniquement
    ...(!isExpertOnly ? [{
      label: t('projects.submenu.collaborations'),
      active: activeTab === 'collaborations',
      icon: Handshake,
      onClick: hasAccess ? () => navigate('/projects/collaborations') : undefined,
      disabled: !hasAccess
    }] : []),
    // Contractors : visible pour expert uniquement
    ...(isExpertOnly ? [{
      label: t('projects.submenu.contractors'),
      active: activeTab === 'contractors',
      icon: Building2,
      onClick: hasAccess ? () => navigate('/projects/contractors') : undefined,
      disabled: !hasAccess
    }] : []),
    // Organizations scoring : visible pour expert uniquement
    ...(isExpertOnly ? [{
      label: t('projects.submenu.organizationsScoring'),
      active: activeTab === 'organizations-scoring',
      icon: Star,
      onClick: hasAccess ? () => navigate('/projects/organizations-scoring') : undefined,
      disabled: !hasAccess
    }] : []),
  ];

  return (
    <SubMenu items={items} />
  );
}