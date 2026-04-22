import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { SubMenu } from './SubMenu';
import { hasAssistanceAccess, hasAssistanceSubMenuAccess } from '../services/permissions.service';
import {
  Search,
  FileText,
  Clock,
} from 'lucide-react';

export function AssistanceSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Vérifier les permissions d'accès au module
  const hasAccess = hasAssistanceAccess(user?.accountType);

  const getCurrentActive = () => {
    const path = location.pathname;
    // Si on est sur la page overview, aucun onglet n'est actif
    if (path === '/assistance' || path === '/excellence') return null;
    if (path.startsWith('/assistance/find-expert')) return 'findExpert';
    if (path.startsWith('/assistance/request')) return 'request';
    if (path.startsWith('/assistance/history')) return 'history';
    // Par défaut, aucun onglet actif
    return null;
  };

  const activeTab = getCurrentActive();

  // Vérifier l'accès à chaque sous-menu individuellement
  const canAccessFindExpert = hasAssistanceSubMenuAccess('findExpert', user?.accountType);
  const canAccessRequest = hasAssistanceSubMenuAccess('request', user?.accountType);
  const canAccessHistory = hasAssistanceSubMenuAccess('history', user?.accountType);

  const items = [
    {
      label: t('assistance.submenu.findExpert'),
      icon: Search,
      active: activeTab === 'findExpert',
      onClick: canAccessFindExpert ? () => navigate('/assistance/find-expert') : undefined,
      disabled: !canAccessFindExpert
    },
    {
      label: t('assistance.submenu.request'),
      icon: FileText,
      active: activeTab === 'request',
      onClick: canAccessRequest ? () => navigate('/assistance/request') : undefined,
      disabled: !canAccessRequest
    },
    {
      label: t('assistance.submenu.history'),
      icon: Clock,
      active: activeTab === 'history',
      onClick: canAccessHistory ? () => navigate('/assistance/history') : undefined,
      disabled: !canAccessHistory
    },
  ];

  return <SubMenu items={items} />;
}
