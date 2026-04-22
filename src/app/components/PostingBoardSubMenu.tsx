import { useNavigate, useLocation } from 'react-router';
import { SubMenu, SubMenuItem } from './SubMenu';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { hasMonEspaceAccess } from '../services/permissions.service';
import { PlusCircle, Briefcase } from 'lucide-react';

export function PostingBoardSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Verify access permissions
  const hasAccess = hasMonEspaceAccess(user?.accountType);

  // Menu items for Posting Board
  const menuItems: SubMenuItem[] = [
    // Publish Offer
    {
      label: t('monEspace.nav.publish'),
      icon: PlusCircle,
      active: location.pathname === '/posting-board/publish',
      onClick: hasAccess ? () => navigate('/posting-board/publish') : undefined,
      disabled: !hasAccess,
    },
    // Job Vacancies
    {
      label: t('monEspace.nav.vacancies'),
      icon: Briefcase,
      active: location.pathname.startsWith('/posting-board/vacancies'),
      onClick: hasAccess ? () => navigate('/posting-board/vacancies') : undefined,
      disabled: !hasAccess,
    },
  ];

  return <SubMenu items={menuItems} />;
}
