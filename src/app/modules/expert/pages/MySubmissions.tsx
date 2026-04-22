import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useTenders } from '@app/hooks/useTenders';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { SubmissionStatusEnum } from '@app/types/tender.dto';
import { submissionsTranslations } from '@app/i18n/submissions-translations';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { StatCard } from '@app/components/StatCard';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@app/components/ui/dialog';
import {
  Send,
  Search,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  FileText,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  X,
  ChevronDown,
  Target,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MySubmissions() {
  const { t: tBase, language } = useLanguage();
  const navigate = useNavigate();
  const { kpis, tenders } = useTenders();
  const { 
    pipelineItems, 
    getSubmissions, 
    updateSubmissionStatus,
    convertToSubmission,
    removeFromPipeline 
  } = usePipeline();

  // Merge base translations with submissions translations
  const translations = {
    ...submissionsTranslations[language],
  };
  
  const t = (key: string, params?: Record<string, string>) => {
    let translation = translations[key] || tBase(key);
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, value);
      });
    }
    return translation;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatusEnum[]>([]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<SubmissionStatusEnum | null>(null);

  // Generate submissions from pipeline items
  const submissions = useMemo(() => {
    return pipelineItems
      .filter(item => item.submissionStatus) // Only show items with submission status
      .map(item => {
        // Find tender data
        const tender = tenders.data.find(t => t.id === item.tenderId);
        
        if (!tender) return null;
        
        return {
          id: item.tenderId,
          tenderId: item.tenderId,
          tenderTitle: tender.title,
          tenderReference: tender.reference,
          organizationName: tender.organizationName,
          status: item.submissionStatus!,
          submittedAt: item.submittedAt ? new Date(item.submittedAt) : undefined,
          lastModified: new Date(item.lastModified || item.addedAt),
          deadline: tender.deadline,
          budget: tender.budget,
          score: tender.matchScore,
          documents: [],
        };
      })
      .filter(Boolean);
  }, [pipelineItems, tenders.data]);

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    if (!submission) return false;
    
    const matchesSearch =
      !searchQuery ||
      submission.tenderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.tenderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.organizationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(submission.status);

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter((s) => 
    s && (s.status === SubmissionStatusEnum.SUBMITTED || s.status === SubmissionStatusEnum.UNDER_REVIEW)
  ).length;
  const shortlistedCount = submissions.filter((s) => 
    s && s.status === SubmissionStatusEnum.SHORTLISTED
  ).length;
  const avgScore = submissions.filter((s) => s && s.score).length > 0
    ? Math.round(submissions.reduce((acc, s) => acc + ((s && s.score) || 0), 0) / submissions.filter((s) => s && s.score).length)
    : 0;

  const getStatusBadge = (status: SubmissionStatusEnum) => {
    const statusConfig = {
      [SubmissionStatusEnum.DRAFT]: { color: 'bg-gray-100 text-gray-800', label: t('submissions.status.draft') },
      [SubmissionStatusEnum.SUBMITTED]: { color: 'bg-blue-100 text-blue-800', label: t('submissions.status.submitted') },
      [SubmissionStatusEnum.UNDER_REVIEW]: { color: 'bg-purple-100 text-purple-800', label: t('submissions.status.underReview') },
      [SubmissionStatusEnum.SHORTLISTED]: { color: 'bg-green-100 text-green-800', label: t('submissions.status.shortlisted') },
      [SubmissionStatusEnum.AWARDED]: { color: 'bg-emerald-100 text-emerald-800', label: t('submissions.status.awarded') },
      [SubmissionStatusEnum.REJECTED]: { color: 'bg-red-100 text-red-800', label: t('submissions.status.rejected') },
      [SubmissionStatusEnum.WITHDRAWN]: { color: 'bg-orange-100 text-orange-800', label: t('submissions.status.withdrawn') },
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getDaysRemaining = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleStatusFilter = (status: SubmissionStatusEnum) => {
    const newStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(newStatus);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus([]);
  };

  // Handler pour modifier une soumission
  const handleEditSubmission = (submission: any) => {
    toast.info(t('submissions.actions.editToast', { title: submission.tenderTitle }), {
      description: t('submissions.actions.editToastDescription'),
    });
    
    // Navigate to tender detail where user can edit their submission
    navigate(`/calls/${submission.tenderId}`);
  };

  // Handler pour supprimer une soumission
  const handleDeleteSubmission = (submission: any) => {
    // Confirm deletion
    if (window.confirm(t('submissions.actions.deleteConfirm'))) {
      // Remove submission from pipeline
      removeFromPipeline(submission.tenderId);
      
      // Show success toast
      toast.success(t('submissions.actions.deleteSuccess'), {
        description: t('submissions.actions.deleteSuccessDescription'),
      });
    }
  };

  // Handler pour ouvrir le dialog de changement de statut
  const handleOpenStatusDialog = (submissionId: string, currentStatus: SubmissionStatusEnum) => {
    setSelectedSubmissionId(submissionId);
    setNewStatus(currentStatus);
    setStatusDialogOpen(true);
  };

  // Handler pour sauvegarder le nouveau statut
  const handleSaveStatus = () => {
    if (selectedSubmissionId && newStatus) {
      updateSubmissionStatus(selectedSubmissionId, newStatus);
      toast.success(t('submissions.actions.statusUpdated'), {
        description: t('submissions.actions.statusUpdateDescription'),
      });
      setStatusDialogOpen(false);
      setSelectedSubmissionId(null);
      setNewStatus(null);
    }
  };

  const activeFiltersCount = selectedStatus.length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <PageBanner
        title={tBase('submissions.title')}
        description={tBase('submissions.subtitle')}
        icon={FileText}
        stats={[
          { value: kpis.activeTenders.toString(), label: tBase('tenders.kpis.activeTenders') }
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('submissions.kpis.total')}
              value={totalSubmissions.toString()}
              subtitle={t('submissions.kpis.totalSubtitle')}
              icon={FileText}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('submissions.kpis.inReview')}
              value={submittedCount.toString()}
              subtitle={t('submissions.kpis.inReviewSubtitle')}
              icon={Clock}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('submissions.kpis.shortlisted')}
              value={shortlistedCount.toString()}
              subtitle={t('submissions.kpis.shortlistedSubtitle')}
              icon={Award}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('submissions.kpis.avgScore')}
              value={`${avgScore}%`}
              subtitle={t('submissions.kpis.avgScoreSubtitle')}
              icon={TrendingUp}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Horizontal Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  {tBase('tenders.list.filters')}
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  <X className="w-4 h-4 mr-1" />
                  {tBase('filters.clear')}
                </Button>
              )}
            </div>

            {/* Search Row */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {tBase('common.search')}
              </label>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('submissions.search.placeholder')}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Filters Row - Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {tBase('filters.status')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="w-4 h-4 mr-2" />
                      {selectedStatus.length > 0 
                        ? t(`submissions.status.${selectedStatus[0].toLowerCase()}`)
                        : tBase('filters.selectStatus')}
                      {selectedStatus.length > 0 && (
                        <Badge className="ml-auto" variant="secondary">
                          {selectedStatus.length}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4 ml-auto" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-3">{tBase('filters.status')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.values(SubmissionStatusEnum).map((status) => (
                          <Button
                            key={status}
                            variant={selectedStatus.includes(status) ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleStatusFilter(status)}
                          >
                            {selectedStatus.includes(status) && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t(`submissions.status.${status.toLowerCase()}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    {tBase('filters.active')}:
                  </span>
                  {selectedStatus.map((status) => (
                    <Badge key={status} variant="secondary" className="gap-1">
                      {t(`submissions.status.${status.toLowerCase()}`)}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleStatusFilter(status)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Submissions List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {t('submissions.list.title')} ({filteredSubmissions.length})
              </h2>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {submissions.length === 0 ? t('submissions.empty.noPipeline') : t('submissions.empty.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {submissions.length === 0 ? t('submissions.empty.noPipelineMessage') : t('submissions.empty.message')}
                </p>
                <Button onClick={() => navigate('/calls')}>
                  {submissions.length === 0 ? t('submissions.empty.noPipelineAction') : t('submissions.empty.action')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSubmissions.map((submission) => {
                  if (!submission) return null;
                  
                  const daysRemaining = getDaysRemaining(submission.deadline);
                  const isUrgent = daysRemaining <= 7;

                  return (
                    <div
                      key={submission.id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-primary">
                              {submission.tenderTitle}
                            </h3>
                            {getStatusBadge(submission.status)}
                            {submission.score && (
                              <Badge className="bg-blue-50 text-blue-700">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {submission.score}%
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {submission.tenderReference}
                            </span>
                            <span className="flex items-center gap-1">
                              {submission.organizationName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary mb-1">
                            {submission.budget.formatted}
                          </div>
                          <div className={`text-sm ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {daysRemaining > 0 ? t('submissions.daysRemaining', { days: daysRemaining.toString() }) : tBase('common.expired')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {submission.submittedAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {t('submissions.submittedOn', { date: submission.submittedAt.toLocaleDateString() })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {t('submissions.lastModified', { date: submission.lastModified.toLocaleDateString() })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/calls/${submission.tenderId}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('submissions.actions.view')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenStatusDialog(submission.tenderId, submission.status)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          {t('submissions.actions.updateStatus')}
                        </Button>
                        {submission.status === SubmissionStatusEnum.DRAFT && (
                          <Button variant="outline" size="sm" onClick={() => handleEditSubmission(submission)}>
                            <Edit className="w-4 h-4 mr-1" />
                            {t('submissions.actions.edit')}
                          </Button>
                        )}
                        {submission.status === SubmissionStatusEnum.DRAFT && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 ml-auto" 
                            onClick={() => handleDeleteSubmission(submission)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {t('submissions.actions.delete')}
                          </Button>
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

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('submissions.statusDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('submissions.statusDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('submissions.statusDialog.newStatus')}
              </label>
              <select
                value={newStatus || ''}
                onChange={(e) => setNewStatus(e.target.value as SubmissionStatusEnum)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">{t('submissions.statusDialog.selectStatus')}</option>
                {Object.values(SubmissionStatusEnum).map((status) => (
                  <option key={status} value={status}>
                    {t(`submissions.status.${status.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              {t('submissions.statusDialog.cancel')}
            </Button>
            <Button onClick={handleSaveStatus} disabled={!newStatus}>
              {t('submissions.statusDialog.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}