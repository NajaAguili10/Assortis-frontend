import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Textarea } from '@app/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { useTenders } from '@app/hooks/useTenders';
import { InvitationDTO, InvitationStatusEnum, SectorEnum } from '@app/types/tender.dto';
import { toast } from 'sonner';
import {
  Mail,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Calendar,
  DollarSign,
  Eye,
  AlertCircle,
  Building,
  FileText,
  Send,
  Info,
  ChevronDown,
  X,
  Target,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

export default function Invitations() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { kpis } = useTenders();

  // Détecter si on est dans Mon Espace
  const isAccountSection = location.pathname.startsWith('/account') || location.pathname.startsWith('/compte-utilisateur');

  // Mock data
  const [invitations, setInvitations] = useState<InvitationDTO[]>([
    {
      id: '1',
      tenderId: 'tender-5',
      tenderTitle: 'Digital Transformation Initiative for Public Services',
      tenderReference: 'EU-2024-DIG-001',
      organizationName: 'European Commission',
      invitedAt: new Date('2026-03-10'),
      expiresAt: new Date('2026-04-10'),
      status: InvitationStatusEnum.PENDING,
      message: 'Based on your expertise in digital transformation, we invite you to submit a proposal.',
      budget: { amount: 750000, currency: 'EUR' as const, formatted: '€750,000' },
      deadline: new Date('2026-04-25'),
      sectors: [SectorEnum.GOVERNANCE, SectorEnum.INFRASTRUCTURE],
      matchScore: 92,
    },
    {
      id: '2',
      tenderId: 'tender-6',
      tenderTitle: 'Renewable Energy Access Program',
      tenderReference: 'ADB-2024-ENR-015',
      organizationName: 'Asian Development Bank',
      invitedAt: new Date('2026-03-15'),
      expiresAt: new Date('2026-04-15'),
      status: InvitationStatusEnum.PENDING,
      budget: { amount: 2000000, currency: 'USD' as const, formatted: '$2,000,000' },
      deadline: new Date('2026-05-01'),
      sectors: [SectorEnum.ENERGY],
      matchScore: 88,
    },
    {
      id: '3',
      tenderId: 'tender-7',
      tenderTitle: 'Youth Employment and Skills Development',
      tenderReference: 'ILO-2024-YTH-008',
      organizationName: 'International Labour Organization',
      invitedAt: new Date('2026-02-10'),
      expiresAt: new Date('2026-03-25'),
      status: InvitationStatusEnum.ACCEPTED,
      budget: { amount: 450000, currency: 'USD' as const, formatted: '$450,000' },
      deadline: new Date('2026-04-15'),
      sectors: [SectorEnum.YOUTH, SectorEnum.EDUCATION],
      matchScore: 95,
    },
    {
      id: '4',
      tenderId: 'tender-8',
      tenderTitle: 'Gender Equality in Workplace Program',
      tenderReference: 'UNWOMEN-2024-005',
      organizationName: 'UN Women',
      invitedAt: new Date('2026-01-15'),
      expiresAt: new Date('2026-02-01'),
      status: InvitationStatusEnum.EXPIRED,
      budget: { amount: 300000, currency: 'USD' as const, formatted: '$300,000' },
      deadline: new Date('2026-02-28'),
      sectors: [SectorEnum.GENDER],
      matchScore: 90,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvitationStatusEnum | 'all'>('all');

  // Modal states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationDTO | null>(null);

  // Filter invitations
  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch =
      !searchQuery ||
      invitation.tenderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.tenderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.organizationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalInvitations = invitations.length;
  const pendingCount = invitations.filter((i) => i.status === InvitationStatusEnum.PENDING).length;
  const acceptedCount = invitations.filter((i) => i.status === InvitationStatusEnum.ACCEPTED).length;
  const avgMatchScore = invitations.length > 0
    ? Math.round(invitations.reduce((acc, i) => acc + (i.matchScore || 0), 0) / invitations.length)
    : 0;

  const getStatusBadge = (status: InvitationStatusEnum) => {
    const statusConfig = {
      [InvitationStatusEnum.PENDING]: { color: 'bg-yellow-100 text-yellow-800', label: t('invitations.status.pending') },
      [InvitationStatusEnum.ACCEPTED]: { color: 'bg-green-100 text-green-800', label: t('invitations.status.accepted') },
      [InvitationStatusEnum.DECLINED]: { color: 'bg-red-100 text-red-800', label: t('invitations.status.declined') },
      [InvitationStatusEnum.EXPIRED]: { color: 'bg-gray-100 text-gray-800', label: t('invitations.status.expired') },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDaysRemaining = (expiresAt: Date) => {
    const days = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleAccept = (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvitationStatusEnum.ACCEPTED } : inv
      )
    );
    toast.success(t('invitations.toast.accepted'), {
      description: t('invitations.toast.acceptedMessage'),
      duration: 5000,
    });
    setShowAcceptModal(false);
    setSelectedInvitation(null);
  };

  const handleDecline = (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: InvitationStatusEnum.DECLINED } : inv
      )
    );
    toast.error(t('invitations.toast.declined'), {
      description: t('invitations.toast.declinedMessage'),
      duration: 5000,
    });
    setShowDeclineModal(false);
    setSelectedInvitation(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <PageBanner
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        icon={FileText}
        stats={[
          { value: kpis.activeTenders.toString(), label: t('tenders.kpis.activeTenders') }
        ]}
      />

      {/* Sub Menu */}
      {isAccountSection
        ? <AccountSubMenu activeTab="invitations" onTabChange={() => undefined} mode="profile-settings" />
        : <TendersSubMenu />}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('invitations.kpis.total')}
              value={totalInvitations.toString()}
              subtitle={t('invitations.kpis.totalSubtitle')}
              icon={Mail}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('invitations.kpis.pending')}
              value={pendingCount.toString()}
              subtitle={t('invitations.kpis.pendingSubtitle')}
              icon={Clock}
              iconBgColor="bg-yellow-50"
              iconColor="text-yellow-500"
            />
            <StatCard
              title={t('invitations.kpis.accepted')}
              value={acceptedCount.toString()}
              subtitle={t('invitations.kpis.acceptedSubtitle')}
              icon={CheckCircle}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('invitations.kpis.avgMatch')}
              value={`${avgMatchScore}%`}
              subtitle={t('invitations.kpis.avgMatchSubtitle')}
              icon={Sparkles}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-primary">{t('filters.title')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t('invitations.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InvitationStatusEnum | 'all')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">{t('filters.all')}</option>
                  {Object.values(InvitationStatusEnum).map((status) => (
                    <option key={status} value={status}>
                      {t(`invitations.status.${status.toLowerCase()}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || statusFilter !== 'all') && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{t('filters.active')}:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    {searchQuery}
                    <button onClick={() => setSearchQuery('')}>×</button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t(`invitations.status.${statusFilter.toLowerCase()}`)}
                    <button onClick={() => setStatusFilter('all')}>×</button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-xs ml-auto"
                >
                  {t('filters.clear')}
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Invitations List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {t('invitations.list.title')} ({filteredInvitations.length})
              </h2>
            </div>

            {filteredInvitations.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('invitations.empty.title')}
                </h3>
                <p className="text-gray-600">{t('invitations.empty.message')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredInvitations.map((invitation) => {
                  const daysRemaining = getDaysRemaining(invitation.expiresAt);
                  const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
                  const isExpired = daysRemaining <= 0;

                  return (
                    <div
                      key={invitation.id}
                      className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
                        invitation.status === InvitationStatusEnum.PENDING && !isExpired
                          ? 'border-purple-200 bg-purple-50/30'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-primary">
                              {invitation.tenderTitle}
                            </h3>
                            {getStatusBadge(invitation.status)}
                            {invitation.matchScore && (
                              <Badge className="bg-purple-50 text-purple-700">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {invitation.matchScore}% {t('common.match')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {invitation.organizationName}
                            </span>
                            <span>•</span>
                            <span>{invitation.tenderReference}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {invitation.sectors.map((sector) => (
                              <Badge key={sector} variant="outline" className="text-xs">
                                {t(`sectors.${sector}`)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary mb-1">
                            {invitation.budget.formatted}
                          </div>
                          <div
                            className={`text-sm ${
                              isExpired
                                ? 'text-red-600 font-semibold'
                                : isExpiringSoon
                                ? 'text-orange-600 font-semibold'
                                : 'text-gray-600'
                            }`}
                          >
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {isExpired
                              ? t('invitations.expired')
                              : `${daysRemaining}d ${t('invitations.toRespond')}`}
                          </div>
                        </div>
                      </div>

                      {invitation.message && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-900">{invitation.message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {t('invitations.invitedOn', {
                            date: invitation.invitedAt.toLocaleDateString(),
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t('invitations.deadline', {
                            date: invitation.deadline.toLocaleDateString(),
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/calls/${invitation.tenderId}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('invitations.actions.viewTender')}
                        </Button>
                        {invitation.status === InvitationStatusEnum.ACCEPTED && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => navigate(
                              isAccountSection 
                                ? `/compte-utilisateur/invitations/${invitation.id}/messages`
                                : `/invitations/${invitation.id}/messages`
                            )}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {t('invitations.messaging.viewMessages')}
                          </Button>
                        )}
                        {invitation.status === InvitationStatusEnum.PENDING && !isExpired && (
                          <>
                            <Button
                              size="sm"
                              className="bg-accent text-white hover:bg-accent/90"
                              onClick={() => {
                                setSelectedInvitation(invitation);
                                setShowAcceptModal(true);
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('invitations.actions.accept')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => {
                                setSelectedInvitation(invitation);
                                setShowDeclineModal(true);
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              {t('invitations.actions.decline')}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Accept Invitation Modal */}
      {showAcceptModal && selectedInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {t('invitations.modal.accept.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('invitations.modal.accept.message')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedInvitation.tenderTitle}
              </p>
              <p className="text-sm text-gray-600">
                {selectedInvitation.organizationName}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t('invitations.deadline', {
                  date: selectedInvitation.deadline.toLocaleDateString(),
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => handleAccept(selectedInvitation.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('invitations.modal.accept.confirm')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedInvitation(null);
                }}
              >
                {t('invitations.modal.accept.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Invitation Modal */}
      {showDeclineModal && selectedInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-primary">
                {t('invitations.modal.decline.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('invitations.modal.decline.message')}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {selectedInvitation.tenderTitle}
              </p>
              <p className="text-sm text-gray-600">
                {selectedInvitation.organizationName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeclineModal(false);
                  setSelectedInvitation(null);
                }}
              >
                {t('invitations.modal.decline.cancel')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={() => handleDecline(selectedInvitation.id)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {t('invitations.modal.decline.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}