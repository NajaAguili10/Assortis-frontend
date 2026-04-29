import { useState } from 'react';
import { Users, UserPlus, Shield, User, Trash2, Send, Crown, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Avatar, AvatarFallback } from '@app/components/ui/avatar';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@app/components/ui/card';
import { Input } from '@app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';

type TeamRole = 'admin' | 'member' | 'viewer';
type MemberStatus = 'active' | 'pending';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
}

const INITIAL_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Alice Martin', email: 'alice.martin@example.com', role: 'admin', status: 'active' },
  { id: 'm2', name: 'Bob Dupont', email: 'bob.dupont@example.com', role: 'member', status: 'active' },
  { id: 'm3', name: 'Carol Leroy', email: 'carol.leroy@example.com', role: 'viewer', status: 'pending' },
];

const ROLE_ICONS: Record<TeamRole, React.ReactNode> = {
  admin: <Crown className="h-3.5 w-3.5 text-amber-500" />,
  member: <User className="h-3.5 w-3.5 text-blue-500" />,
  viewer: <Shield className="h-3.5 w-3.5 text-gray-400" />,
};

const STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function AccountTeamsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = canManageOrganizationAdminActions(user?.accountType, user?.role);

  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error(t('account.validation.email.invalid'));
      return;
    }
    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'pending',
    };
    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    toast.success(t('account.teams.invite.success'));
  };

  const handleRemove = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    toast.success(t('account.teams.remove.success'));
  };

  const handleRoleChange = (id: string, role: TeamRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
    toast.success(t('account.teams.role.updated'));
  };

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={Users}
        title={t('account.teams.banner.title')}
        description={t('account.teams.banner.description')}
        stats={[
          { value: String(members.filter(m => m.status === 'active').length), label: t('account.teams.status.active') },
          { value: String(members.filter(m => m.status === 'pending').length), label: t('account.teams.status.pending') },
          { value: String(members.length), label: t('account.teams.members') },
        ]}
      />

      <AccountSubMenu activeTab="teams" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">

          {!isAdmin && (
            <Alert className="border-blue-100 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                {t('account.teams.adminOnly')}
              </AlertDescription>
            </Alert>
          )}

          {/* ── Invite section (admin only) ── */}
          {isAdmin && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UserPlus className="h-5 w-5 text-primary" />
                  {t('account.teams.addMember')}
                </CardTitle>
                <CardDescription>{t('account.teams.inviteByEmail')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    className="flex-1"
                  />
                  <Select value={inviteRole} onValueChange={(v: TeamRole) => setInviteRole(v)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t('account.teams.roles.admin')}</SelectItem>
                      <SelectItem value="member">{t('account.teams.roles.member')}</SelectItem>
                      <SelectItem value="viewer">{t('account.teams.roles.viewer')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite} className="shrink-0 gap-1.5">
                    <Send className="h-4 w-4" />
                    {t('account.teams.sendInvite')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Members list ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                {t('account.teams.members')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">{t('account.teams.empty')}</p>
              ) : (
                <div className="divide-y">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center gap-4 py-3 flex-wrap">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Badge variant="outline" className={STATUS_COLORS[member.status]}>
                          {t(`account.teams.status.${member.status}`)}
                        </Badge>

                        {isAdmin ? (
                          <Select
                            value={member.role}
                            onValueChange={(v: TeamRole) => handleRoleChange(member.id, v)}
                          >
                            <SelectTrigger className="w-36 h-7 text-xs gap-1">
                              <span className="flex items-center gap-1">
                                {ROLE_ICONS[member.role]}
                                <SelectValue />
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">{t('account.teams.roles.admin')}</SelectItem>
                              <SelectItem value="member">{t('account.teams.roles.member')}</SelectItem>
                              <SelectItem value="viewer">{t('account.teams.roles.viewer')}</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {ROLE_ICONS[member.role]}
                            {t(`account.teams.roles.${member.role}`)}
                          </span>
                        )}

                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive h-7 px-2"
                            onClick={() => handleRemove(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">{t('account.teams.removeMember')}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </PageContainer>
    </div>
  );
}
