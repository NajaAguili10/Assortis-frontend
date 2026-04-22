import { BarChart3, Briefcase, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { SubMenu, type SubMenuItem } from '@app/components/SubMenu';

export function PublicOrganizationServiceTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const items: SubMenuItem[] = [
    {
      label: t('services.organization.tabs.matching'),
      icon: Briefcase,
      active: location.pathname === '/services/organization/matching-projects',
      onClick: () => navigate('/services/organization/matching-projects'),
    },
    {
      label: t('services.organization.tabs.myProjects'),
      icon: Briefcase,
      active: location.pathname === '/services/organization/my-projects',
      onClick: () => navigate('/services/organization/my-projects'),
    },
    {
      label: t('services.organization.tabs.search'),
      icon: Search,
      active: location.pathname === '/services/organization/search',
      onClick: () => navigate('/services/organization/search'),
    },
    {
      label: t('services.organization.tabs.statistics'),
      icon: BarChart3,
      active: location.pathname === '/services/organization/statistics',
      onClick: () => navigate('/services/organization/statistics'),
    },
  ];

  return <SubMenu items={items} />;
}
