import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { RestrictedTooltip } from '@app/components/RestrictedTooltip';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Textarea } from '@app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { canManageOrganizationAdminActions, isOrganizationUserRole } from '@app/services/permissions.service';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@app/types/notification.dto';

import { 
  Building2, 
  Users, 
  UsersRound, 
  UserPlus, 
  Search,
  Mail,
  Shield,
  Crown,
  Edit,
  Trash2,
  Filter,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Briefcase,
  User,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { ExpertDTO } from '../../expert/hooks/useExperts';
import { expertService } from '@/app/services/expertService';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  department: string;
  joinedDate: string;
  status: 'active' | 'pending' | 'inactive';
}

interface Expert {
  id: string;
  name: string;
  email: string;
  expertise: string;
  verified: boolean;
}

// Mock organization data
const mockOrganization = {
  id: '1',
  name: 'UNICEF',
  type: 'International Organization'
};

// Mock experts database (same as in OrganizationsInvite)
const experts: Expert[] = [
  { id: '1', name: 'Dr. Sarah Johnson', expertise: 'Health & Development', verified: true, email: 'sarah.johnson@expert.com' },
  { id: '2', name: 'Naja Smith', expertise: 'Project Management', verified: true, email: 'john.smith@expert.com' },
  { id: '3', name: 'Marie Dupont', expertise: 'Education', verified: true, email: 'marie.dupont@expert.com' },
  { id: '4', name: 'Ahmed Hassan', expertise: 'Infrastructure', verified: true, email: 'ahmed.hassan@expert.com' },
  { id: '5', name: 'Elena Rodriguez', expertise: 'Environment', verified: true, email: 'elena.rodriguez@expert.com' },
  { id: '6', name: 'Dr. Michael Brown', expertise: 'Public Health', verified: true, email: 'michael.brown@expert.com' },
  { id: '7', name: 'Sophie Martin', expertise: 'Social Development', verified: true, email: 'sophie.martin@expert.com' },
  { id: '8', name: 'Omar Al-Rashid', expertise: 'Water & Sanitation', verified: true, email: 'omar.alrashid@expert.com' },
];




// Mock team members data
const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@unicef.org', role: 'admin', department: 'Management', joinedDate: '2023-01-15', status: 'active' },
  { id: '2', name: 'John Smith', email: 'john.s@unicef.org', role: 'member', department: 'Operations', joinedDate: '2023-03-20', status: 'active' },
  { id: '3', name: 'Marie Dupont', email: 'marie.d@unicef.org', role: 'member', department: 'Finance', joinedDate: '2023-05-10', status: 'active' },
  { id: '4', name: 'Ahmed Hassan', email: 'ahmed.h@unicef.org', role: 'member', department: 'Programs', joinedDate: '2023-07-08', status: 'active' },
  { id: '5', name: 'Elena Rodriguez', email: 'elena.r@unicef.org', role: 'viewer', department: 'Communications', joinedDate: '2023-09-12', status: 'pending' },
  { id: '6', name: 'David Chen', email: 'david.c@unicef.org', role: 'member', department: 'IT', joinedDate: '2023-11-05', status: 'active' },
  { id: '7', name: 'Lisa Anderson', email: 'lisa.a@unicef.org', role: 'member', department: 'HR', joinedDate: '2024-01-18', status: 'active' },
  { id: '8', name: 'Carlos Martinez', email: 'carlos.m@unicef.org', role: 'viewer', department: 'Legal', joinedDate: '2024-03-22', status: 'inactive' },
];

const departments = ['Management', 'Operations', 'Finance', 'Programs', 'Communications', 'IT', 'HR', 'Legal'];

// Maximum number of invitations allowed
const MAX_INVITATIONS = 2;

export default function OrganizationsTeams() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kpis } = useOrganizations();
  const { addNotification } = useNotifications();
  const { addHistoryEntry } = useAssistanceHistory();
  const isRestrictedOrganizationUser = isOrganizationUserRole(user?.accountType, user?.role);
  const canManageAdminActions = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const restrictedActionMessage = t('permissions.organization.adminOnlyAction');
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Invitation limit tracking
  const [invitationsSent, setInvitationsSent] = useState(0);
  const [invitedEmails, setInvitedEmails] = useState<Set<string>>(new Set());
  
  // Invite dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertDTO | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [newMemberDepartment, setNewMemberDepartment] = useState('');
  const [newMemberMessage, setNewMemberMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit dialog state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [editDepartment, setEditDepartment] = useState('');
  const [experts, setExperts] = useState<ExpertDTO[]>([]);

   
        React.useEffect(() => {
  
         const fetchExperts = async () => {
        try {
          const result = await expertService.getAllExperts();
          setExperts(result);
        } catch (error) {
          console.error("Error fetching experts:", error);
        }
      };
          fetchExperts();
        
        }, []);
      
  
  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const resetInviteForm = () => {
    setSelectedExpert(null);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('member');
    setNewMemberDepartment('');
    setNewMemberMessage('');
  };
  
  // Map role to organization role type
  const mapRoleToOrgRole = (role: 'admin' | 'member' | 'viewer'): string => {
    const roleMapping = {
      admin: 'AdminOrganisation',
      member: 'MemberOrganisation',
      viewer: 'ObserverOrganisation'
    };
    return roleMapping[role];
  };
  
  // Handle expert selection
  const handleExpertSelection = (expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (expert) {
      setSelectedExpert(expert);
      setNewMemberName(expert.firstName);
     // setNewMemberEmail(expert.email);
    }
  };

  const handleInviteMember = async () => {
    if (!newMemberEmail || !newMemberName) {
      toast.error(t('organizations.teams.invite.error'), {
        description: t('organizations.teams.invite.error.required'),
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      toast.error(t('organizations.teams.invite.error'), {
        description: t('organizations.teams.invite.error.email'),
      });
      return;
    }

    // Normalize email to lowercase for comparison
    const normalizedEmail = newMemberEmail.toLowerCase().trim();

    // Check if email has already been invited (must be before limit check)
    if (invitedEmails.has(normalizedEmail)) {
      toast.error(t('organizations.teams.invite.error'), {
        description: t('organizations.teams.invite.error.emailAlreadyInvited'),
      });
      return;
    }

    // Check invitation limit
    if (invitationsSent >= MAX_INVITATIONS) {
      toast.error(t('organizations.teams.invite.error'), {
        description: t('organizations.teams.invite.error.limitReached'),
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate sending email and notification
    setTimeout(() => {
      // Success toast
      toast.success(t('organizations.teams.invite.success'), {
        description: t('organizations.teams.invite.success.description', { email: newMemberEmail }),
      });

      // Email simulation toast
      setTimeout(() => {
        toast.info(t('organizations.teams.invite.email.sent'), {
          description: t('organizations.teams.invite.email.description', { email: newMemberEmail }),
          icon: <Mail className="w-4 h-4" />,
        });
      }, 800);

      // Add notification to Assortis notification system
      addNotification({
        type: NotificationTypeEnum.INVITATION,
        priority: NotificationPriorityEnum.HIGH,
        titleKey: 'notifications.team.invite.title',
        messageKey: 'notifications.team.invite.message',
        params: { 
          name: newMemberName, 
          email: newMemberEmail,
          role: t(`organizations.teams.role.${newMemberRole}`)
        },
        link: '/organizations/teams',
        actionable: true,
        actionLabel: 'notifications.action.view',
        actionLink: '/organizations/teams',
      });

      // Notification system toast
      setTimeout(() => {
        toast.success(t('organizations.teams.invite.notification.sent'), {
          description: t('organizations.teams.invite.notification.description'),
          icon: <CheckCircle2 className="w-4 h-4" />,
        });
      }, 1600);

      // Enregistrer dans l'historique
      addHistoryEntry({
        type: 'team-invitation',
        expertName: newMemberName,
        expertRole: t(`organizations.teams.role.${newMemberRole}`),
        title: `${t('organizations.teams.invite.member')} - ${mockOrganization.name}`,
        message: newMemberMessage || undefined,
        status: 'sent',
      });

      setShowInviteDialog(false);
      resetInviteForm();
      setIsSubmitting(false);
      setInvitationsSent(invitationsSent + 1);
      setInvitedEmails(new Set([...invitedEmails, normalizedEmail]));
    }, 1500);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditRole(member.role);
    setEditDepartment(member.department);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingMember) return;

    const updatedMembers = teamMembers.map(m =>
      m.id === editingMember.id
        ? { ...m, name: editName, role: editRole, department: editDepartment }
        : m
    );

    setTeamMembers(updatedMembers);

    toast.success(t('organizations.teams.edit.success'), {
      description: t('organizations.teams.edit.success.description', { name: editName }),
    });

    setShowEditDialog(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setDeletingMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMember = () => {
    if (!deletingMember) return;

    const updatedMembers = teamMembers.filter(m => m.id !== deletingMember.id);
    setTeamMembers(updatedMembers);

    toast.success(t('organizations.teams.member.removed'), {
      description: t('organizations.teams.member.removed.description', { name: deletingMember.name }),
    });

    // Add notification
    addNotification({
      type: NotificationTypeEnum.ALERT,
      priority: NotificationPriorityEnum.MEDIUM,
      titleKey: 'notifications.team.removed.title',
      messageKey: 'notifications.team.removed.message',
      params: { name: deletingMember.name },
      link: '/organizations/teams',
    });

    setShowDeleteDialog(false);
    setDeletingMember(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'member':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewer':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'member':
        return <Users className="w-4 h-4" />;
      case 'viewer':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const limitReached = invitationsSent >= MAX_INVITATIONS;
  const remainingInvitations = MAX_INVITATIONS - invitationsSent;

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('organizations.hub.title')}
        description={t('organizations.hub.subtitle')}
        icon={Building2}
        stats={[
          { value: kpis.totalOrganizations.toString(), label: t('organizations.kpis.totalOrganizations') },
          { value: kpis.activeOrganizations.toString(), label: t('organizations.kpis.activeOrganizations') },
          { value: `${remainingInvitations}/${MAX_INVITATIONS}`, label: t('organizations.invite.limit.available') }
        ]}
      />

      {/* Sub Menu */}
      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Invitation Limit Alerts */}
          {limitReached && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-red-900 mb-1">
                    {t('organizations.invite.limit.reached.title')}
                  </h4>
                  <p className="text-sm text-red-700">
                    {t('organizations.invite.limit.reached.description')
                      .replace('{max}', MAX_INVITATIONS.toString())}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {!limitReached && remainingInvitations <= 1 && invitationsSent > 0 && (
            <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-orange-900 mb-1">
                    {t('organizations.invite.limit.warning.title')}
                  </h4>
                  <p className="text-sm text-orange-700">
                    {t('organizations.invite.limit.warning.description')
                      .replace('{remaining}', remainingInvitations.toString())}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">{t('organizations.teams.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('organizations.teams.subtitle')}</p>
            </div>
            <RestrictedTooltip disabled={isRestrictedOrganizationUser} content={restrictedActionMessage}>
              <Button 
                onClick={!canManageAdminActions ? undefined : () => setShowInviteDialog(true)} 
                className="bg-primary hover:bg-primary/90"
                disabled={limitReached || !canManageAdminActions}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('organizations.teams.invite.member')}
              </Button>
            </RestrictedTooltip>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <StatCard
              title={t('organizations.teams.active')}
              value={teamMembers.filter(m => m.status === 'active').length.toString()}
              trend="+8%"
              icon={UsersRound}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('organizations.kpis.teamMembers')}
              value={teamMembers.length.toString()}
              subtitle={t('dashboard.total')}
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('organizations.teams.departments')}
              value={new Set(teamMembers.map(m => m.department)).size.toString()}
              subtitle={t('dashboard.total')}
              icon={Building2}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-lg border p-5 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('organizations.teams.search.placeholder')}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('organizations.teams.filter.role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('organizations.filters.all')}</SelectItem>
                  <SelectItem value="admin">{t('organizations.teams.role.admin')}</SelectItem>
                  <SelectItem value="member">{t('organizations.teams.role.member')}</SelectItem>
                  <SelectItem value="viewer">{t('organizations.teams.role.viewer')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={t('organizations.teams.filter.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('organizations.filters.all')}</SelectItem>
                  <SelectItem value="active">{t('organizations.teams.status.active')}</SelectItem>
                  <SelectItem value="pending">{t('organizations.teams.status.pending')}</SelectItem>
                  <SelectItem value="inactive">{t('organizations.teams.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-white rounded-lg border overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground">
                <div className="col-span-4">{t('organizations.teams.table.member')}</div>
                <div className="col-span-2">{t('organizations.teams.table.role')}</div>
                <div className="col-span-2">{t('organizations.teams.table.department')}</div>
                <div className="col-span-2">{t('organizations.teams.table.status')}</div>
                <div className="col-span-2 text-right">{t('organizations.teams.table.actions')}</div>
              </div>
            </div>

            {/* Members List */}
            <div className="divide-y">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Member Info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{member.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="col-span-2">
                        <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                          <span className="mr-1">{getRoleIcon(member.role)}</span>
                          {t(`organizations.teams.role.${member.role}`)}
                        </Badge>
                      </div>

                      {/* Department */}
                      <div className="col-span-2">
                        <span className="text-sm text-foreground">{member.department}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <Badge variant="outline" className={getStatusBadgeColor(member.status)}>
                          {t(`organizations.teams.status.${member.status}`)}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <RestrictedTooltip disabled={isRestrictedOrganizationUser} content={restrictedActionMessage}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={canManageAdminActions ? () => handleEditMember(member) : undefined}
                            disabled={!canManageAdminActions}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </RestrictedTooltip>
                        <RestrictedTooltip disabled={isRestrictedOrganizationUser} content={restrictedActionMessage}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={canManageAdminActions ? () => handleDeleteMember(member) : undefined}
                            disabled={!canManageAdminActions}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </RestrictedTooltip>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {t('organizations.teams.noResults')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Invite Member Dialog - Enhanced */}
          {showInviteDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Organization Header */}
                <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{t('organizations.teams.invite.organizationLabel')}</p>
                    <h4 className="text-lg font-bold text-primary">{mockOrganization.name}</h4>
                    <p className="text-xs text-muted-foreground">{mockOrganization.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {t('organizations.teams.invite.member')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('organizations.teams.invite.description')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowInviteDialog(false);
                      resetInviteForm();
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-5">
                  {/* Select Expert from List */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('organizations.teams.invite.selectExpert')} <span className="text-destructive">*</span>
                    </label>
                    <Select value={selectedExpert?.id || ''} onValueChange={handleExpertSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('organizations.teams.invite.selectExpert.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {experts.map((expert) => (
                          <SelectItem key={expert.id} value={expert.id}>
                            <div className="flex items-center gap-2">
                              {expert.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              <span>{expert.name}</span>
                              <span className="text-xs text-muted-foreground">({expert.expertise})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email (Auto-populated) */}
                  {selectedExpert && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t('organizations.teams.invite.email')}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={newMemberEmail}
                          disabled
                          className="pl-10 bg-gray-50"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('organizations.teams.invite.email.autoFilled')}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Role */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t('organizations.teams.invite.role')} <span className="text-destructive">*</span>
                      </label>
                      <Select value={newMemberRole} onValueChange={(value: any) => setNewMemberRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-red-500" />
                              <div>
                                <div>{t('organizations.teams.role.admin')}</div>
                                <div className="text-xs text-muted-foreground">AdminOrganisation</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="member">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-500" />
                              <div>
                                <div>{t('organizations.teams.role.member')}</div>
                                <div className="text-xs text-muted-foreground">MemberOrganisation</div>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-gray-500" />
                              <div>
                                <div>{t('organizations.teams.role.viewer')}</div>
                                <div className="text-xs text-muted-foreground">ObserverOrganisation</div>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        {t('organizations.teams.invite.department')}
                      </label>
                      <Select value={newMemberDepartment} onValueChange={setNewMemberDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('organizations.teams.invite.department.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Personal Message */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('organizations.teams.invite.message')} <span className="text-muted-foreground text-xs">({t('organizations.invite.message.optional')})</span>
                    </label>
                    <Textarea
                      value={newMemberMessage}
                      onChange={(e) => setNewMemberMessage(e.target.value)}
                      placeholder={t('organizations.teams.invite.message.placeholder')}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('organizations.teams.invite.message.hint')}
                    </p>
                  </div>

                  {/* Info Box - Email with Direct Access Link */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">
                          {t('organizations.teams.invite.emailInfo.title')}
                        </p>
                        <p className="text-blue-700 text-xs leading-relaxed mb-2">
                          {t('organizations.teams.invite.emailInfo.description')}
                        </p>
                        <div className="bg-white rounded px-3 py-2 mt-2 border border-blue-200">
                          <p className="text-xs font-mono text-blue-900">
                            https://assortis.app/join/{mockOrganization.id}?role={mapRoleToOrgRole(newMemberRole)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInviteDialog(false);
                      resetInviteForm();
                    }}
                    disabled={isSubmitting}
                  >
                    {t('organizations.invite.action.cancel')}
                  </Button>
                  <Button 
                    onClick={handleInviteMember} 
                    className="bg-primary hover:bg-primary/90"
                    disabled={isSubmitting || !selectedExpert}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {t('organizations.teams.invite.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('organizations.teams.invite.send')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Member Dialog */}
          {showEditDialog && editingMember && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-primary">
                    {t('organizations.teams.edit.title')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditDialog(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('organizations.teams.edit.name')}
                    </label>
                    <Input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t('organizations.teams.invite.name.placeholder')}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('organizations.teams.invite.role')}
                    </label>
                    <Select value={editRole} onValueChange={(value: any) => setEditRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t('organizations.teams.role.admin')}</SelectItem>
                        <SelectItem value="member">{t('organizations.teams.role.member')}</SelectItem>
                        <SelectItem value="viewer">{t('organizations.teams.role.viewer')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('organizations.teams.invite.department')}
                    </label>
                    <Select value={editDepartment} onValueChange={setEditDepartment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                  >
                    {t('organizations.invite.action.cancel')}
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('organizations.teams.edit.save')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteDialog && deletingMember && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {t('organizations.teams.delete.title')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('organizations.teams.delete.subtitle')}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-foreground mb-2">
                    {t('organizations.teams.delete.confirmation', { name: deletingMember.name })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('organizations.teams.delete.warning')}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeletingMember(null);
                    }}
                  >
                    {t('organizations.invite.action.cancel')}
                  </Button>
                  <Button 
                    onClick={confirmDeleteMember} 
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('organizations.teams.delete.confirm')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}