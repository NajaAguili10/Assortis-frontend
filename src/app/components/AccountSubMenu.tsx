import React from 'react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { SubMenu } from '@app/components/SubMenu';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '@app/contexts/AuthContext';
import { hasCreditsAccess } from '@app/services/permissions.service';
import {
  User,
  Shield,
  Inbox,
  Coins,
  Library,
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
  const { user } = useAuth();

  if (mode === 'profile-settings') {
    const isProfileRoute =
      location.pathname === '/account' ||
      location.pathname === '/compte-utilisateur' ||
      location.pathname === '/account/profile' ||
      location.pathname === '/compte-utilisateur/profil';

    const isSecurityRoute =
      location.pathname === '/account/security' ||
      location.pathname === '/compte-utilisateur/security';

    const isResourcesRoute =
      location.pathname === '/account/resources' ||
      location.pathname === '/compte-utilisateur/resources';

    const isCreditsRoute =
      location.pathname === '/account/credits' ||
      location.pathname === '/compte-utilisateur/credits';

    const canAccessCredits = hasCreditsAccess(user?.accountType);
    const canAccessMemberAreaFromAccount = user?.accountType === 'expert';

    const items = [
      {
        label: t('account.tabs.profile'),
        icon: User,
        active: isProfileRoute,
        onClick: () => navigate('/compte-utilisateur'),
      },
      {
        label: t('account.tabs.security'),
        icon: Shield,
        active: isSecurityRoute,
        onClick: () => navigate('/compte-utilisateur/security'),
      },
      {
        label: t('monEspace.nav.invitations'),
        icon: Inbox,
        active: location.pathname.startsWith('/account/invitations') || location.pathname.startsWith('/compte-utilisateur/invitations'),
        onClick: () => navigate('/compte-utilisateur/invitations'),
      },
      ...(canAccessMemberAreaFromAccount
        ? [
            {
              label: t('monEspace.nav.memberArea'),
              icon: Shield,
              active:
                location.pathname === '/account/subscription' ||
                location.pathname === '/compte-utilisateur/abonnement' ||
                location.pathname === '/account/member-area' ||
                location.pathname === '/compte-utilisateur/espace-membre',
              onClick: () => navigate('/compte-utilisateur/abonnement'),
            },
          ]
        : []),
      {
        label: t('account.tabs.resources'),
        icon: Library,
        active: isResourcesRoute,
        onClick: () => navigate('/compte-utilisateur/resources'),
      },
      ...(canAccessCredits
        ? [
            {
              label: t('monEspace.nav.credits'),
              icon: Coins,
              active: isCreditsRoute,
              onClick: () => navigate('/compte-utilisateur/credits'),
            },
          ]
        : []),
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