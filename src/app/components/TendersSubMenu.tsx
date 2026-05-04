import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { useTenders } from '../hooks/useTenders';
import { hasTendersAccess } from '../services/permissions.service';
import {
  Home,
} from 'lucide-react';

export function TendersSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { kpis } = useTenders();
  
  // Vérifier les permissions d'accès
  const hasAccess = hasTendersAccess(user?.accountType);

  const getCurrentActive = () => {
    const path = location.pathname;
    if (path === '/calls' || path === '/tenders' || path === '/calls/overview' || path === '/tenders/overview') return 'overview';
    if (path.startsWith('/calls/active') || path.startsWith('/tenders/active')) return 'active';
    if (path.startsWith('/calls/tors') || path.startsWith('/tenders/tors')) return 'tors';
    // Si on est sur une page de détails d'appel d'offres (/calls/tender-123)
    // on considère qu'on est dans la section "active", sauf si c'est un ToR
    if ((path.startsWith('/calls/') || path.startsWith('/tenders/')) && 
        path !== '/calls' && path !== '/tenders' && 
        !path.includes('/tor-')) return 'active';
    // Par défaut, aucun onglet actif
    return null;
  };

  const activeTab = getCurrentActive();

  const basePath = location.pathname.startsWith('/calls') ? '/calls' : '/tenders';

  return (
    <SubMenu
      items={[
        {
          label: t('tenders.submenu.overview'),
          active: activeTab === 'overview',
          icon: Home,
          onClick: hasAccess ? () => navigate(`${basePath}/overview`) : undefined,
          disabled: !hasAccess,
        },
      ]}
    />
  );
}