import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { PostingBoardSubMenu } from '../../../components/PostingBoardSubMenu';
import { JobForm } from '../components/JobForm';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { JobOfferCreateDTO, JobOfferListDTO, JobOfferStatusEnum } from '../types/JobOffer.dto';
import { createJobOffer, getJobOffersByRecruiter, deleteJobOffer } from '../services/jobOfferService';
import {
  PlusCircle, AlertCircle, Briefcase, MapPin, Calendar, Users,
  Clock, Eye, Trash2, Edit2, Copy, Search, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

type MainTab = 'publish' | 'jobs';

export default function PublierOffrePage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<MainTab>(
    (searchParams.get('tab') as MainTab) || 'publish'
  );

  // Sync tab state when URL search params change (e.g. sub-menu navigation)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as MainTab | null;
    const next = tabParam === 'jobs' ? 'jobs' : 'publish';
    setActiveTab(next);
  }, [searchParams]);

  // ── Offers state ───────────────────────────────────────────────────────────
  const [publishedOffers, setPublishedOffers] = useState<JobOfferListDTO[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Duplicate state ────────────────────────────────────────────────────────
  const [duplicateData, setDuplicateData] = useState<Partial<JobOfferCreateDTO> | null>(null);
  const [formKey, setFormKey] = useState(0);

  // ── Search / filter state (Job Offers tab) ─────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    if (user?.id && isAuthenticated) {
      loadPublishedOffers();
    }
  }, [user?.id, isAuthenticated]);

  const handleTabChange = (value: string) => {
    const tab = value as MainTab;
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadPublishedOffers = async () => {
    if (!user?.id) return;
    setIsLoadingOffers(true);
    setOffersError(null);
    try {
      const offers = await getJobOffersByRecruiter(user.id);
      const sorted = offers.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      setPublishedOffers(sorted);
    } catch (error) {
      console.error('Error loading published offers:', error);
      setOffersError(t('monEspace.message.error'));
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const handleSubmit = async (data: JobOfferCreateDTO) => {
    if (!user) {
      toast.error(t('monEspace.message.unauthorized'));
      return;
    }
    try {
      await createJobOffer(data, user.id);
      toast.success(t('monEspace.message.publishSuccess'));
      setDuplicateData(null);
      await loadPublishedOffers();
    } catch (error) {
      console.error('Error creating job offer:', error);
      toast.error(t('monEspace.message.error'));
    }
  };

  const handleCancel = () => {
    setDuplicateData(null);
    setFormKey(k => k + 1);
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    try {
      await deleteJobOffer(offerToDelete);
      toast.success(t('monEspace.message.deleteSuccess'));
      await loadPublishedOffers();
      setOfferToDelete(null);
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error(t('monEspace.message.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Prefill the create form from an existing offer and switch to Publish tab
  const handleDuplicate = (offer: JobOfferListDTO) => {
    const prefilled: Partial<JobOfferCreateDTO> = {
      jobTitle: offer.jobTitle,
      location: offer.location,
      projectTitle: offer.projectTitle,
      department: offer.department,
      type: offer.type,
      duration: offer.duration,
      description: offer.description,
      // deadline intentionally cleared – user must pick a new one
    };
    setDuplicateData(prefilled);
    setFormKey(k => k + 1);
    setActiveTab('publish');
    setSearchParams({ tab: 'publish' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Filtered offers for Job Offers tab ─────────────────────────────────────
  const filteredOffers = useMemo(() => {
    let result = [...publishedOffers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.jobTitle.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.projectTitle?.toLowerCase().includes(q) ||
        o.department?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.status === statusFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':  return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'deadline':return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'title':   return a.jobTitle.localeCompare(b.jobTitle);
        default:        return 0;
      }
    });
    return result;
  }, [publishedOffers, searchQuery, statusFilter, sortBy]);

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSortBy('newest');
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getStatusBadgeColor = (status: JobOfferStatusEnum) => {
    switch (status) {
      case JobOfferStatusEnum.PUBLISHED:  return 'bg-green-50 text-green-700 border-green-200';
      case JobOfferStatusEnum.DRAFT:      return 'bg-gray-50 text-gray-700 border-gray-200';
      case JobOfferStatusEnum.CLOSED:     return 'bg-blue-50 text-blue-700 border-blue-200';
      case JobOfferStatusEnum.CANCELLED:  return 'bg-red-50 text-red-700 border-red-200';
      default:                            return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineUrgency = (daysRemaining: number) => {
    if (daysRemaining < 0) return { text: t('monEspace.deadline.expired'), color: 'text-red-600' };
    if (daysRemaining === 0) return { text: t('monEspace.deadline.today'), color: 'text-orange-600' };
    return {
      text: t('monEspace.deadline.days', { days: daysRemaining.toString() }),
      color: daysRemaining <= 7 ? 'text-orange-600' : 'text-muted-foreground',
    };
  };

  // Shared offer row renderer
  const renderOfferRow = (offer: JobOfferListDTO, showManageActions: boolean) => {
    const urgency = getDeadlineUrgency(offer.daysRemaining || 0);
    return (
      <div
        key={offer.id}
        className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 bg-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-primary mb-1 truncate">{offer.jobTitle}</h3>
                {offer.projectTitle && (
                  <p className="text-sm text-muted-foreground truncate">{offer.projectTitle}</p>
                )}
                {offer.department && (
                  <p className="text-sm text-muted-foreground truncate">{offer.department}</p>
                )}
              </div>
              <Badge variant="outline" className={getStatusBadgeColor(offer.status)}>
                {t(`monEspace.job.status.${offer.status.toLowerCase()}`)}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{offer.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t('monEspace.job.published')}: {offer.publishedAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <span className={`font-medium truncate ${urgency.color}`}>{urgency.text}</span>
              </div>
              {(offer.applicationsCount || 0) > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{offer.applicationsCount} {t('monEspace.job.applications')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost" size="sm" className="hover:bg-blue-50"
              onClick={() => navigate(`/posting-board/detail/${offer.id}`)}
              title={t('monEspace.action.view')}
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </Button>
            {showManageActions && (
              <>
                <Button
                  variant="ghost" size="sm" className="hover:bg-amber-50"
                  onClick={() => navigate(`/posting-board/edit/${offer.id}`)}
                  title={t('monEspace.action.edit')}
                >
                  <Edit2 className="w-4 h-4 text-amber-600" />
                </Button>
                <Button
                  variant="ghost" size="sm" className="hover:bg-violet-50"
                  onClick={() => handleDuplicate(offer)}
                  title={t('monEspace.action.duplicate')}
                >
                  <Copy className="w-4 h-4 text-violet-600" />
                </Button>
                <Button
                  variant="ghost" size="sm" className="hover:bg-red-50"
                  onClick={() => setOfferToDelete(offer.id)}
                  title={t('monEspace.action.delete')}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Unauthenticated guard ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={PlusCircle}
          title={t('monEspace.banner.publish.title')}
          description={t('monEspace.banner.publish.description')}
        />
        <PostingBoardSubMenu />
        <PageContainer className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('monEspace.access.loginRequired')}</AlertDescription>
          </Alert>
        </PageContainer>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={PlusCircle}
        title={t('monEspace.banner.publish.title')}
        description={t('monEspace.banner.publish.description')}
      />
      <PostingBoardSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            {/* ── Tab 1: Publish Offers ─────────────────────────────────────── */}
            <TabsContent value="publish" className="space-y-6 mt-6">
              {/* Duplicate notice */}
              {duplicateData && (
                <Alert className="border-violet-200 bg-violet-50">
                  <Copy className="h-4 w-4 text-violet-600" />
                  <AlertDescription className="text-violet-700">
                    {t('monEspace.action.duplicateNotice')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Create form */}
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                <JobForm
                  key={formKey}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  initialData={duplicateData || undefined}
                  submitLabel={t('monEspace.action.publish')}
                />
              </div>

            </TabsContent>

            {/* ── Tab 2: Job Offers ─────────────────────────────────────────── */}
            <TabsContent value="jobs" className="space-y-6 mt-6">
              {/* Search + filters bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={t('monEspace.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder={t('monEspace.filters.allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('monEspace.filters.allStatuses')}</SelectItem>
                      <SelectItem value={JobOfferStatusEnum.PUBLISHED}>{t('monEspace.status.published')}</SelectItem>
                      <SelectItem value={JobOfferStatusEnum.DRAFT}>{t('monEspace.status.draft')}</SelectItem>
                      <SelectItem value={JobOfferStatusEnum.CLOSED}>{t('monEspace.status.closed')}</SelectItem>
                      <SelectItem value={JobOfferStatusEnum.CANCELLED}>{t('monEspace.status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{t('monEspace.sort.newest')}</SelectItem>
                      <SelectItem value="oldest">{t('monEspace.sort.oldest')}</SelectItem>
                      <SelectItem value="deadline">{t('monEspace.sort.deadline')}</SelectItem>
                      <SelectItem value="title">{t('monEspace.sort.title')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground shrink-0">
                      <X className="w-4 h-4" />
                      {t('monEspace.filters.clearAll')}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('monEspace.filter.results', { count: filteredOffers.length.toString() })}
                </p>
              </div>

              {/* Offers list */}
              {isLoadingOffers && (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
                  <p className="mt-3 text-gray-500">{t('monEspace.message.loading')}</p>
                </div>
              )}
              {!isLoadingOffers && offersError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{offersError}</AlertDescription>
                </Alert>
              )}
              {!isLoadingOffers && filteredOffers.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {hasActiveFilters
                      ? t('monEspace.message.noResults')
                      : t('monEspace.publishedOffers.empty.description')}
                  </AlertDescription>
                </Alert>
              )}
              {!isLoadingOffers && filteredOffers.length > 0 && (
                <div className="space-y-4">
                  {filteredOffers.map(offer => renderOfferRow(offer, true))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageContainer>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!offerToDelete} onOpenChange={() => setOfferToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('monEspace.action.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('monEspace.message.closeConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} onClick={() => setOfferToDelete(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOffer}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? t('loading') : t('monEspace.action.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
