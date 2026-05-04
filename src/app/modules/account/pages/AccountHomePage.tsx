import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Avatar, AvatarFallback } from '@app/components/ui/avatar';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  Bell,
  Mail,
  Layers,
  CreditCard,
  Users,
  User,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function AccountHomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = canManageOrganizationAdminActions(user?.accountType, user?.role);

  const initials = `${(user?.firstName ?? 'U')[0]}${(user?.lastName ?? '')[0] ?? ''}`.toUpperCase();

  const accountTypeKey =
    user?.accountType === 'expert'
      ? 'account.home.accountType.expert'
      : user?.accountType === 'admin'
        ? 'account.home.accountType.admin'
        : 'account.home.accountType.organization';

  // Mock stats — replace with real context values when available
  const stats = [
    { label: t('account.home.stats.projects'), value: '5', icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-50', onClick: () => navigate('/projects') },
    { label: t('account.home.stats.matches'), value: '12', icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50', onClick: () => navigate('/matching-opportunities/home') },
    { label: t('account.home.stats.alerts'), value: '3', icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/account/my-selection') },
    { label: t('account.home.stats.invitations'), value: '2', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50', onClick: () => navigate('/compte-utilisateur/invitations') },
  ];

  const quickLinks = [
    { label: t('account.home.quickLinks.mySelection'), icon: Layers, path: '/account/my-selection', show: true },
    { label: t('account.home.quickLinks.subscription'), icon: CreditCard, path: '/account/subscription', show: true },
    { label: t('account.home.quickLinks.teams'), icon: Users, path: '/account/teams', show: isAdmin },
    { label: t('account.home.quickLinks.profile'), icon: User, path: '/compte-utilisateur', show: true },
    { label: t('account.home.quickLinks.security'), icon: Shield, path: '/compte-utilisateur/security', show: true },
    { label: t('account.home.quickLinks.matching'), icon: Sparkles, path: '/matching-opportunities/home', show: true },
    { label: t('account.home.quickLinks.projects'), icon: FolderKanban, path: '/projects', show: true },
  ].filter((l) => l.show);

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={LayoutDashboard}
        title={t('account.home.banner.title')}
        description={t('account.home.banner.description')}
      />

      <AccountSubMenu activeTab="home" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-8">

          {/* User identity card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16 text-xl font-semibold">
                  <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{t('account.home.welcome')}</p>
                  <h2 className="text-xl font-semibold truncate">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {t(accountTypeKey)}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/compte-utilisateur')} className="shrink-0 gap-1.5">
                  <User className="h-4 w-4" />
                  {t('account.home.editProfile')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={stat.onClick}
                className="text-left rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} mb-3`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </button>
            ))}
          </div>

          {/* Quick access links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t('account.home.quickLinks.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </PageContainer>
    </div>
  );
}
