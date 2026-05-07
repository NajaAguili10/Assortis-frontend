import type React from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  Database,
  GraduationCap,
  KeyRound,
  LogOut,
  Mail,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@app/contexts/AuthContext';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';

type DashboardAction = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  show: boolean;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
      <div className="text-lg font-semibold tabular-nums text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ServiceCard({
  icon: Icon,
  title,
  status,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg text-primary">{title}</CardTitle>
          </div>
          {status && (
            <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  );
}

export default function OrganizationAccountDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const canUseAdminActions = canManageOrganizationAdminActions(user?.accountType, user?.role);

  const activatedUntil = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  }, []);

  const actions: DashboardAction[] = [
    { label: 'Change User Details', icon: User, onClick: () => navigate('/compte-utilisateur'), show: true },
    { label: 'Change Email', icon: Mail, onClick: () => navigate('/compte-utilisateur'), show: true },
    { label: 'Change Password', icon: KeyRound, onClick: () => navigate('/account/security'), show: true },
    { label: 'User Admin', icon: Shield, onClick: () => navigate('/account/teams'), show: canUseAdminActions },
    { label: 'Forum Settings', icon: Settings, onClick: () => navigate('/account/resources'), show: true },
    { label: 'Logout', icon: LogOut, onClick: logout, show: true },
  ].filter((action) => action.show);

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={CalendarCheck}
        title="My Account"
        description="Your organization services, alerts, experts database, and preferences."
      />
      <AccountSubMenu activeTab="home" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {actions.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  variant={action.label === 'Logout' ? 'ghost' : 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className={action.label === 'Logout' ? 'text-accent hover:text-accent' : ''}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ServiceCard
              icon={Bell}
              title="Daily Tender Alerts"
              status={`Activated until ${activatedUntil}`}
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric label="Sectors" value={12} />
                <Metric label="Countries" value={15} />
                <Metric label="Funding agencies" value={5} />
                <Metric label="Notice types" value={2} />
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={() => navigate('/account/profile')} className="bg-accent hover:bg-accent/90">
                  Edit Individual Profile
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/account/my-selection')}>
                  Show My Alerts
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
                  Show My Projects
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/search')}>
                  Show My Searches
                </Button>
              </div>
            </ServiceCard>

            <ServiceCard
              icon={Database}
              title="Experts Database"
              status={`Activated until ${activatedUntil}`}
            >
              <div className="grid grid-cols-2 gap-3">
                <Metric label="CVs remaining" value={42} />
                <Metric label="CVs downloaded" value={8} />
              </div>
              <Button type="button" className="mt-5 bg-accent hover:bg-accent/90" onClick={() => navigate('/experts/database')}>
                Show My Experts
              </Button>
            </ServiceCard>

            <ServiceCard icon={BriefcaseBusiness} title="My Vacancies">
              <p className="text-sm text-muted-foreground">
                Under My vacancies you can check the vacant positions matching your preferences.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={() => navigate('/posting-board/vacancies')}>
                  See your project vacancies
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/mon-espace/offres-internes')}>
                  See your in-house vacancies
                </Button>
              </div>
            </ServiceCard>

            <ServiceCard icon={Users} title="Other Services">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" variant="outline" onClick={() => navigate('/services/organization/matching-projects')}>
                  Twinning Centre
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/training')}>
                  <GraduationCap className="h-4 w-4" />
                  Training Academy
                </Button>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                Use your saved searches and alert profile to keep these services aligned.
              </div>
            </ServiceCard>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
