import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { Home, Sparkles, Bookmark } from 'lucide-react';

export function MatchingOpportunitiesSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getCurrentActive = () => {
    const path = location.pathname;
    if (path === '/matching-opportunities' || path.startsWith('/matching-opportunities/home'))
      return 'home';
    if (path.startsWith('/matching-opportunities/opportunities')) return 'opportunities';
    if (path.startsWith('/matching-opportunities/saved')) return 'saved';
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
      label: t('matching-opportunities.nav.opportunities'),
      active: activeTab === 'opportunities',
      icon: Sparkles,
      onClick: () => navigate('/matching-opportunities/opportunities'),
    },
    {
      label: t('matching-opportunities.nav.saved'),
      active: activeTab === 'saved',
      icon: Bookmark,
      onClick: () => navigate('/matching-opportunities/saved'),
    },
  ];

  return <SubMenu items={items} />;
}
