import { useNavigate } from 'react-router';
import { MapPin, BarChart3, Award, ListChecks, Building2, Users, UserCheck, PenSquare } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from '@app/components/SubMenu';

export type SearchSectionTab =
  | 'map'
  | 'projects'
  | 'awards'
  | 'shortlists'
  | 'organisations'
  | 'experts'
  | 'my-experts'
  | 'bid-writers';

interface SearchSectionTabsProps {
  activeTab?: SearchSectionTab;
}

export function SearchSectionTabs({ activeTab }: SearchSectionTabsProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const isExpert = user?.accountType === 'expert';

  const items = [
    {
      label: t('search.tabs.map'),
      icon: MapPin,
      active: activeTab === 'map',
      onClick: () => navigate('/search/map'),
    },
    {
      label: t('search.tabs.projects'),
      icon: BarChart3,
      active: activeTab === 'projects',
      onClick: () => navigate('/search/projects'),
    },
    {
      label: t('search.tabs.awards'),
      icon: Award,
      active: activeTab === 'awards',
      onClick: () => navigate('/search/awards'),
    },
    {
      label: t('search.tabs.shortlists'),
      icon: ListChecks,
      active: activeTab === 'shortlists',
      onClick: () => navigate('/search/shortlists'),
    },
    {
      label: t('search.tabs.organisations'),
      icon: Building2,
      active: activeTab === 'organisations',
      onClick: () => navigate('/search/organisations'),
    },
    ...(!isExpert ? [
      {
        label: t('search.tabs.experts'),
        icon: Users,
        active: activeTab === 'experts',
        onClick: () => navigate('/search/experts'),
      },
      {
        label: t('search.tabs.myExperts'),
        icon: UserCheck,
        active: activeTab === 'my-experts',
        onClick: () => navigate('/search/my-experts'),
      },
      {
        label: t('search.tabs.bidWriters'),
        icon: PenSquare,
        active: activeTab === 'bid-writers',
        onClick: () => navigate('/search/bid-writers'),
      },
    ] : []),
  ];

  return <SubMenu items={items} />;
}
