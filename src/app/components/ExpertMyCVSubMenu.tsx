import { useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, FileUser } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SubMenu } from '@app/components/SubMenu';
import { hasExpertMyCVAccess } from '@app/services/permissions.service';

export function ExpertMyCVSubMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const hasAccess = hasExpertMyCVAccess(user?.accountType);

  const activeTab = location.pathname.startsWith('/experts/my-cv/info')
    ? 'info'
    : 'dashboard';

  return (
    <SubMenu
      items={[
        {
          label: t('mycv.submenu.dashboard'),
          active: activeTab === 'dashboard',
          icon: LayoutDashboard,
          onClick: hasAccess ? () => navigate('/experts/my-cv/dashboard') : undefined,
          disabled: !hasAccess,
        },
        {
          label: t('mycv.submenu.info'),
          active: activeTab === 'info',
          icon: FileUser,
          onClick: hasAccess ? () => navigate('/experts/my-cv/info') : undefined,
          disabled: !hasAccess,
        },
      ]}
    />
  );
}
