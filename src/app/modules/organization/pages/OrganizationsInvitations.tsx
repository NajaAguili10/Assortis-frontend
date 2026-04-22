import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { MonEspaceSubMenu } from '@app/components/MonEspaceSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@app/types/notification.dto';
import { 
  Building2, 
  Inbox, 
  Mail,
  Send,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  type: 'received' | 'sent';
  from: string;
  to: string;
  invitationType: 'partnership' | 'consortium' | 'collaboration' | 'team' | 'consultant' | 'advisor';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  subject: string;
  message: string;
  sentDate: string;
  expiryDate: string;
}

// Mock invitations data
const mockInvitations: Invitation[] = [
  {
    id: '1',
    type: 'received',
    from: 'World Health Organization',
    to: 'UNICEF',
    invitationType: 'partnership',
    status: 'pending',
    subject: 'Strategic Partnership Proposal',
    message: 'We would like to propose a strategic partnership for health programs in Africa.',
    sentDate: '2024-02-20',
    expiryDate: '2024-03-20',
  },
  {
    id: '2',
    type: 'received',
    from: 'UNESCO',
    to: 'UNICEF',
    invitationType: 'consortium',
    status: 'pending',
    subject: 'Education Consortium Invitation',
    message: 'Join our education consortium for Southeast Asia development projects.',
    sentDate: '2024-02-18',
    expiryDate: '2024-03-18',
  },
  {
    id: '3',
    type: 'received',
    from: 'Red Cross International',
    to: 'UNICEF',
    invitationType: 'collaboration',
    status: 'accepted',
    subject: 'Humanitarian Response Collaboration',
    message: 'Collaborate on emergency response in conflict zones.',
    sentDate: '2024-01-15',
    expiryDate: '2024-02-15',
  },
  {
    id: '4',
    type: 'sent',
    from: 'UNICEF',
    to: 'World Bank',
    invitationType: 'partnership',
    status: 'accepted',
    subject: 'Development Finance Partnership',
    message: 'We propose a partnership for financing child welfare programs.',
    sentDate: '2024-02-10',
    expiryDate: '2024-03-10',
  },
  {
    id: '5',
    type: 'sent',
    from: 'UNICEF',
    to: 'Doctors Without Borders',
    invitationType: 'collaboration',
    status: 'pending',
    subject: 'Medical Support Collaboration',
    message: 'Collaborate on providing medical support in underserved areas.',
    sentDate: '2024-02-15',
    expiryDate: '2024-03-15',
  },
  {
    id: '6',
    type: 'sent',
    from: 'UNICEF',
    to: 'Save the Children',
    invitationType: 'consortium',
    status: 'rejected',
    subject: 'Child Protection Consortium',
    message: 'Join our consortium for child protection initiatives.',
    sentDate: '2024-01-20',
    expiryDate: '2024-02-20',
  },
  {
    id: '7',
    type: 'received',
    from: 'Global Education Alliance',
    to: 'UNICEF',
    invitationType: 'team',
    status: 'expired',
    subject: 'Team Member Invitation',
    message: 'We invite you to join our advisory team for education policy.',
    sentDate: '2024-01-01',
    expiryDate: '2024-02-01',
  },
];

export default function OrganizationsInvitations() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { kpis } = useOrganizations();
  const { addNotification } = useNotifications();
  
  // Detect which module we're in based on the URL path
  const isMonEspace = location.pathname.startsWith('/mon-espace');
  
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  
  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToReject, setInvitationToReject] = useState<Invitation | null>(null);
  const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null);
  const [rejectionJustification, setRejectionJustification] = useState('');
  const [justificationError, setJustificationError] = useState(false);

  // Filter invitations
  const filteredInvitations = invitations
    .filter(inv => inv.type === activeTab)
    .filter(inv => {
      const matchesSearch = 
        inv.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

  const receivedInvitations = invitations.filter(inv => inv.type === 'received');
  const sentInvitations = invitations.filter(inv => inv.type === 'sent');
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="w-3 h-3" /> };
      case 'accepted':
        return { color: 'bg-green-50 text-green-700 border-green-200', icon: <CheckCircle className="w-3 h-3" /> };
      case 'rejected':
        return { color: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle className="w-3 h-3" /> };
      case 'expired':
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Clock className="w-3 h-3" /> };
      default:
        return { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Clock className="w-3 h-3" /> };
    }
  };

  const getInvitationTypeBadge = (type: string) => {
    switch (type) {
      case 'partnership':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'consortium':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'collaboration':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'team':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'consultant':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'advisor':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const handleAcceptInvitation = (invitation: Invitation) => {
    setInvitations(prev =>
      prev.map(inv =>
        inv.id === invitation.id ? { ...inv, status: 'accepted' as const } : inv
      )
    );
    toast.success(t('organizations.invitations.accepted'), {
      description: `Accepted invitation from ${invitation.from}`,
    });
    
    // Add notification to Assortis notification system
    addNotification({
      type: NotificationTypeEnum.SUCCESS,
      priority: NotificationPriorityEnum.HIGH,
      titleKey: 'notifications.invitation.accepted.title',
      messageKey: 'notifications.invitation.accepted.message',
      params: { organization: invitation.from },
      link: '/organizations/invitations',
      actionable: false,
    });
    
    setSelectedInvitation(null);
  };

  const handleRejectInvitation = (invitation: Invitation) => {
    setInvitations(prev =>
      prev.map(inv =>
        inv.id === invitation.id ? { ...inv, status: 'rejected' as const } : inv
      )
    );
    toast.error(t('organizations.invitations.rejected'), {
      description: `Rejected invitation from ${invitation.from}`,
    });
    
    // Add notification to Assortis notification system
    addNotification({
      type: NotificationTypeEnum.INVITATION,
      priority: NotificationPriorityEnum.HIGH,
      titleKey: 'notifications.invitation.declined.title',
      messageKey: 'notifications.invitation.declined.message',
      params: { organization: invitation.from },
      link: '/organizations/invitations',
      actionable: false,
    });
    
    setSelectedInvitation(null);
  };

  const handleDeleteInvitation = (invitation: Invitation) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
    toast.success(t('organizations.invitations.deleted'), {
      description: 'Invitation has been deleted',
    });
    setSelectedInvitation(null);
  };

  const handleSendInvitation = () => {
    navigate(isMonEspace ? '/mon-espace/invite' : '/organizations/invite');
  };

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
          { value: kpis.partnerships.toString(), label: t('organizations.kpis.partnerships') }
        ]}
      />

      {/* Sub Menu */}
      {isMonEspace ? <MonEspaceSubMenu /> : <OrganizationsSubMenu />}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Page Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">{t('organizations.invitations.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('organizations.invitations.subtitle')}</p>
            </div>
            <Button onClick={handleSendInvitation} className="bg-primary hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              {t('organizations.invitations.send')}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <StatCard
              title={t('organizations.invitations.received')}
              value={receivedInvitations.length.toString()}
              trend="+5%"
              icon={Inbox}
              iconBgColor="bg-pink-50"
              iconColor="text-pink-500"
            />
            <StatCard
              title={t('organizations.kpis.pendingInvitations')}
              value={pendingInvitations.length.toString()}
              subtitle={t('organizations.invitations.pending')}
              icon={Mail}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('organizations.invitations.sent')}
              value={sentInvitations.length.toString()}
              subtitle={t('dashboard.total')}
              icon={Send}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
          </div>

          {/* Tabs & Filters */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="received">
                <Inbox className="w-4 h-4 mr-2" />
                {t('organizations.invitations.received')} ({receivedInvitations.length})
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="w-4 h-4 mr-2" />
                {t('organizations.invitations.sent')} ({sentInvitations.length})
              </TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="bg-white rounded-lg border p-5 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('organizations.invitations.search.placeholder')}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t('organizations.invitations.filter.status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('organizations.filters.all')}</SelectItem>
                    <SelectItem value="pending">{t('organizations.invitations.status.pending')}</SelectItem>
                    <SelectItem value="accepted">{t('organizations.invitations.status.accepted')}</SelectItem>
                    <SelectItem value="rejected">{t('organizations.invitations.status.rejected')}</SelectItem>
                    <SelectItem value="expired">{t('organizations.invitations.status.expired')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invitations List */}
            <TabsContent value="received" className="mt-0">
              <div className="space-y-4">
                {filteredInvitations.length > 0 ? (
                  filteredInvitations.map((invitation) => {
                    const statusBadge = getStatusBadge(invitation.status);
                    return (
                      <div
                        key={invitation.id}
                        className="bg-white rounded-xl border p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-primary truncate">
                                  {invitation.subject}
                                </h3>
                                <Badge variant="outline" className={getInvitationTypeBadge(invitation.invitationType)}>
                                  {t(`organizations.invite.orgType.${invitation.invitationType}`)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">From: {invitation.from}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {invitation.message}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(invitation.sentDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Expires: {new Date(invitation.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <Badge variant="outline" className={statusBadge.color}>
                              {statusBadge.icon}
                              <span className="ml-1">{t(`organizations.invitations.status.${invitation.status}`)}</span>
                            </Badge>
                            {invitation.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setInvitationToReject(invitation);
                                    setRejectDialogOpen(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  {t('organizations.invitations.reject')}
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90"
                                  onClick={() => handleAcceptInvitation(invitation)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  {t('organizations.invitations.accept')}
                                </Button>
                              </div>
                            )}
                            {invitation.status !== 'pending' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setInvitationToDelete(invitation);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-lg border p-12 text-center">
                    <Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {t('organizations.invitations.noReceived')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('organizations.invitations.noReceived.description')}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-0">
              <div className="space-y-4">
                {filteredInvitations.length > 0 ? (
                  filteredInvitations.map((invitation) => {
                    const statusBadge = getStatusBadge(invitation.status);
                    return (
                      <div
                        key={invitation.id}
                        className="bg-white rounded-xl border p-6 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Send className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-primary truncate">
                                  {invitation.subject}
                                </h3>
                                <Badge variant="outline" className={getInvitationTypeBadge(invitation.invitationType)}>
                                  {t(`organizations.invite.orgType.${invitation.invitationType}`)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">To: {invitation.to}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {invitation.message}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(invitation.sentDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Expires: {new Date(invitation.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <Badge variant="outline" className={statusBadge.color}>
                              {statusBadge.icon}
                              <span className="ml-1">{t(`organizations.invitations.status.${invitation.status}`)}</span>
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setInvitationToDelete(invitation);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-lg border p-12 text-center">
                    <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {t('organizations.invitations.noSent')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {t('organizations.invitations.noSent.description')}
                    </p>
                    <Button onClick={handleSendInvitation} className="bg-primary hover:bg-primary/90">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('organizations.invitations.send')}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>

      {/* Reject Invitation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('organizations.invitations.reject.title')}</DialogTitle>
            <DialogDescription>
              {t('organizations.invitations.reject.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('organizations.invitations.reject.placeholder')}
              </label>
              <textarea
                value={rejectionJustification}
                onChange={(e) => {
                  setRejectionJustification(e.target.value);
                  setJustificationError(false);
                }}
                placeholder={t('organizations.invitations.reject.placeholder')}
                className={`w-full min-h-[100px] px-3 py-2 border rounded-md resize-none ${justificationError ? 'border-red-500' : 'border-gray-300'}`}
              />
              {justificationError && (
                <p className="text-sm text-red-500 mt-1">
                  {t('organizations.invitations.reject.error')}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectionJustification('');
                  setJustificationError(false);
                }}
              >
                {t('organizations.form.cancel')}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (!rejectionJustification.trim()) {
                    setJustificationError(true);
                    return;
                  }
                  if (invitationToReject) {
                    handleRejectInvitation(invitationToReject);
                  }
                  setRejectDialogOpen(false);
                  setRejectionJustification('');
                  setJustificationError(false);
                }}
              >
                {t('organizations.invitations.reject')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Invitation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('organizations.invitations.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('organizations.invitations.delete.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {t('organizations.form.cancel')}
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (invitationToDelete) {
                    handleDeleteInvitation(invitationToDelete);
                  }
                  setDeleteDialogOpen(false);
                }}
              >
                {t('organizations.invitations.delete')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}