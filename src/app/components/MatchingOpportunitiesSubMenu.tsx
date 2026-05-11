import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { Home, Layers, Bookmark, UserCircle2, Bell, List, FileText } from 'lucide-react';
import { isExpertAccountType } from '@app/services/permissions.service';

export function MatchingOpportunitiesSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isExpert = isExpertAccountType(user?.accountType);

  const getCurrentActive = () => {
    const path = location.pathname;
    const search = location.search;
    if (path === '/matching-opportunities' || path.startsWith('/matching-opportunities/home'))
      return 'home';
    if (path.startsWith('/matching-opportunities/projects')) {
      const params = new URLSearchParams(search);
      const type = params.get('type');
      if (type === 'shortlists' || type === 'shortlist') return 'shortlists';
      if (type === 'contract-awards' || type === 'contract') return 'contracts';
      if (type === 'project-vacancies' || type === 'vacancy') return 'jobVacancies';
      return 'openProjects';
    }
    if (path.startsWith('/matching-opportunities/opportunities')) return 'openProjects';
    if (path.startsWith('/matching-opportunities/saved')) return 'saved';
    if (path.startsWith('/matching-opportunities/profiles')) return 'profiles';
    if (path.startsWith('/matching-opportunities/alerts')) return 'alerts';
    return 'home';
  };

  const activeTab = getCurrentActive();

  // Expert-specific menu: Home + Open Projects + Shortlists + Contracts + Job Vacancies
  // Each tab navigates to MatchingProjectsPage with the correct ?type= filter pre-selected
  if (isExpert) {
    return (
      <SubMenu
        items={[
          {
            label: t('matching-opportunities.nav.home'),
            active: activeTab === 'home',
            icon: Home,
            onClick: () => navigate('/matching-opportunities/home'),
          },
          {
            label: t('matching-opportunities.nav.openProjects'),
            active: activeTab === 'openProjects',
            icon: Layers,
            onClick: () => navigate('/matching-opportunities/projects'),
          },
          {
            label: t('matching-opportunities.nav.shortlists'),
            active: activeTab === 'shortlists',
            icon: List,
            onClick: () => navigate('/matching-opportunities/projects?type=shortlists'),
          },
          {
            label: t('matching-opportunities.nav.contracts'),
            active: activeTab === 'contracts',
            icon: FileText,
            onClick: () => navigate('/matching-opportunities/projects?type=contract-awards'),
          },
          {
            label: t('matching-opportunities.nav.jobVacancies'),
            active: activeTab === 'jobVacancies',
            icon: UserCircle2,
            onClick: () => navigate('/matching-opportunities/projects?type=project-vacancies'),
          },
        ]}
      />
    );
  }

  // Default menu for non-expert roles (admin, organisation, etc.)
  const items = [
    {
      label: t('matching-opportunities.nav.home'),
      active: activeTab === 'home',
      icon: Home,
      onClick: () => navigate('/matching-opportunities/home'),
    },
    {
      label: t('matching-opportunities.nav.projects'),
      active: activeTab === 'openProjects',
      icon: Layers,
      onClick: () => navigate('/matching-opportunities/projects'),
    },
    {
      label: t('matching-opportunities.nav.saved'),
      active: activeTab === 'saved',
      icon: Bookmark,
      onClick: () => navigate('/matching-opportunities/saved'),
    },
    {
      label: t('matching-opportunities.nav.profiles'),
      active: activeTab === 'profiles',
      icon: UserCircle2,
      onClick: () => navigate('/matching-opportunities/profiles'),
    },
    {
      label: t('matching-opportunities.nav.alerts'),
      active: activeTab === 'alerts',
      icon: Bell,
      onClick: () => navigate('/matching-opportunities/alerts'),
    },
  ];

  return <SubMenu items={items} />;
}
