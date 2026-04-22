import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from '../contexts/LanguageContext';
import { SubMenu } from './SubMenu';
import {
  Phone,
  Gift,
} from 'lucide-react';

export function OffersSubMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const getCurrentActive = () => {
    const path = location.pathname;
    // Si on est sur la page overview, aucun onglet n'est actif
    if (path === '/offers' || path === '/offers/overview') return null;
    if (path.startsWith('/offers/promotion-request')) return 'promotion';
    if (path.startsWith('/offers/contact-sales')) return 'contactSales';
    // Par défaut, aucun onglet actif
    return null;
  };

  const activeTab = getCurrentActive();

  const items = [
    {
      label: t('offers.promo.title'),
      icon: Gift,
      active: activeTab === 'promotion',
      onClick: () => navigate('/offers/promotion-request'),
    },
    {
      label: t('offers.submenu.contactSales'),
      icon: Phone,
      active: activeTab === 'contactSales',
      onClick: () => navigate('/offers/contact-sales'),
    },
  ];

  return <SubMenu items={items} />;
}