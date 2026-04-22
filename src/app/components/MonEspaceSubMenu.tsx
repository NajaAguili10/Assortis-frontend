import { useNavigate, useLocation } from 'react-router';
import { SubMenu, SubMenuItem } from './SubMenu';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { hasMonEspaceAccess } from '../services/permissions.service';
import { FileUser } from 'lucide-react';

export function MonEspaceSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Vérifier les permissions d'accès
  const hasAccess = hasMonEspaceAccess(user?.accountType);
  
  // Vérifier si l'utilisateur est une organisation (pas organization)
  const isOrganizationOnly = user?.accountType === 'organization';

  // Construction conditionnelle des items selon le rôle
  const menuItems: SubMenuItem[] = [
    // Mon CV : NON visible pour organization uniquement
    ...(!isOrganizationOnly ? [{
      label: t('monEspace.nav.myCV'),
      icon: FileUser,
      active: location.pathname === '/mon-espace/mon-cv',
      onClick: hasAccess ? () => navigate('/mon-espace/mon-cv') : undefined,
      disabled: !hasAccess,
    }] : []),
  ];

  return <SubMenu items={menuItems} />;
}