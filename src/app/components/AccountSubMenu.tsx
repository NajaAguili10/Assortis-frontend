import React from 'react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { SubMenu } from '@app/components/SubMenu';
import { useLocation, useNavigate } from 'react-router';
import {
  User,
  Shield,
  Library,
  LayoutDashboard,
  Layers,
  CreditCard,
} from 'lucide-react';

interface AccountSubMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode?: 'account-tabs' | 'profile-settings';
}

export function AccountSubMenu({ activeTab, onTabChange, mode = 'account-tabs' }: AccountSubMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  if (mode === 'profile-settings') {
    const isHomeRoute =
      location.pathname === '/account' ||
      location.pathname === '/compte-utilisateur';

    const isMySelectionRoute = location.pathname.startsWith('/account/my-selection');

    const isSubscriptionRoute =
      location.pathname.startsWith('/account/subscription') ||
      location.pathname === '/compte-utilisateur/abonnement' ||
      location.pathname === '/account/member-area' ||
      location.pathname === '/compte-utilisateur/espace-membre';

    const isSecurityRoute =
      location.pathname === '/account/security' ||
      location.pathname === '/compte-utilisateur/security';

    const isResourcesRoute =
      location.pathname === '/account/resources' ||
      location.pathname === '/compte-utilisateur/resources';

    const isProfileRoute =
      location.pathname === '/compte-utilisateur' ||
      location.pathname === '/account/profile' ||
      location.pathname === '/compte-utilisateur/profil';

    const items = [
      {
        label: t('account.nav.home'),
        icon: LayoutDashboard,
        active: isHomeRoute,
        onClick: () => navigate('/account'),
      },
      {
        label: t('account.nav.profile'),
        icon: User,
        active: isProfileRoute,
        onClick: () => navigate('/account/profile'),
      },
      {
        label: t('account.nav.security'),
        icon: Shield,
        active: isSecurityRoute,
        onClick: () => navigate('/account/security'),
      },
      {
        label: t('account.nav.mySelection'),
        icon: Layers,
        active: isMySelectionRoute,
        onClick: () => navigate('/account/my-selection'),
      },
      {
        label: t('account.nav.subscription'),
        icon: CreditCard,
        active: isSubscriptionRoute,
        onClick: () => navigate('/account/subscription'),
      },
      {
        label: t('account.nav.resources'),
        icon: Library,
        active: isResourcesRoute,
        onClick: () => navigate('/account/resources'),
      },
    ];

    return <SubMenu items={items} />;
  }

  const items = [
    {
      label: t('account.tabs.profile'),
      icon: User,
      active: activeTab === 'profile',
      onClick: () => onTabChange('profile'),
    },
    {
      label: t('account.tabs.security'),
      icon: Shield,
      active: activeTab === 'security',
      onClick: () => onTabChange('security'),
    },
  ];

  return <SubMenu items={items} />;
}
