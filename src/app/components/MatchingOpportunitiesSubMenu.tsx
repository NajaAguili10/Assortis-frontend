import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { Home, Layers, Bookmark, UserCircle2, Bell } from 'lucide-react';

export function MatchingOpportunitiesSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getCurrentActive = () => {
    const path = location.pathname;
    if (path === '/matching-opportunities' || path.startsWith('/matching-opportunities/home'))
      return 'home';
    if (path.startsWith('/matching-opportunities/projects')) return 'projects';
    if (path.startsWith('/matching-opportunities/opportunities')) return 'opportunities';
    if (path.startsWith('/matching-opportunities/saved')) return 'saved';
    if (path.startsWith('/matching-opportunities/profiles')) return 'profiles';
    if (path.startsWith('/matching-opportunities/alerts')) return 'alerts';
    return 'home';
  };

  const activeTab = getCurrentActive();

  const items = [
    {
      label: t('matching-opportunities.nav.home'),
      active: activeTab === 'home',
      icon: Home,
      onClick: () => navigate('/matching-opportunities/home'),
    },
    {
      label: t('matching-opportunities.nav.projects'),
      active: activeTab === 'projects',
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
