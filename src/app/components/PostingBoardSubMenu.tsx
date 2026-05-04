import { useNavigate, useLocation } from 'react-router';
import { SubMenu, SubMenuItem } from './SubMenu';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { hasMonEspaceAccess, hasVacanciesAccess } from '../services/permissions.service';
import { PlusCircle, Briefcase } from 'lucide-react';

export function PostingBoardSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const hasAccess = hasMonEspaceAccess(user?.accountType);
  const canSeeVacancies = hasVacanciesAccess(user?.accountType);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  const menuItems: SubMenuItem[] = [
    // Publish Offers (all users with mon-espace access)
    {
      label: t('monEspace.nav.publish'),
      icon: PlusCircle,
      active: location.pathname === '/posting-board/publish' && currentTab !== 'jobs',
      onClick: hasAccess ? () => navigate('/posting-board/publish') : undefined,
      disabled: !hasAccess,
    },
    // Job Offers
    {
      label: t('monEspace.tab.jobOffers'),
      icon: Briefcase,
      active: location.pathname === '/posting-board/publish' && currentTab === 'jobs',
      onClick: hasAccess ? () => navigate('/posting-board/publish?tab=jobs') : undefined,
      disabled: !hasAccess,
    },
    // Job Vacancies (experts and admins only — hidden for organizations)
    ...(canSeeVacancies
      ? [{
          label: t('monEspace.nav.vacancies'),
          icon: Briefcase,
          active: location.pathname.startsWith('/posting-board/vacancies'),
          onClick: () => navigate('/posting-board/vacancies'),
        } as SubMenuItem]
      : []),
  ];

  return <SubMenu items={menuItems} />;
}
