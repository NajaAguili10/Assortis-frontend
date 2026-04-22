import { BarChart3, Briefcase, FileUser, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { SubMenu, type SubMenuItem } from '@app/components/SubMenu';

export function PublicExpertsServiceTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const items: SubMenuItem[] = [
    {
      label: t('services.experts.tabs.matching'),
      icon: Briefcase,
      active: location.pathname === '/services/experts/matching-opportunities',
      onClick: () => navigate('/services/experts/matching-opportunities'),
    },
    {
      label: t('services.experts.tabs.myProjects'),
      icon: Briefcase,
      active: location.pathname === '/services/experts/my-projects',
      onClick: () => navigate('/services/experts/my-projects'),
    },
    {
      label: t('services.experts.tabs.cvRegistration'),
      icon: FileUser,
      active: location.pathname === '/services/experts/cv-registration',
      onClick: () => navigate('/services/experts/cv-registration'),
    },
    {
      label: t('services.experts.tabs.search'),
      icon: Search,
      active: location.pathname === '/services/experts/search',
      onClick: () => navigate('/services/experts/search'),
    },
    {
      label: t('services.experts.tabs.statistics'),
      icon: BarChart3,
      active: location.pathname === '/services/experts/statistics',
      onClick: () => navigate('/services/experts/statistics'),
    },
  ];

  return <SubMenu items={items} />;
}
