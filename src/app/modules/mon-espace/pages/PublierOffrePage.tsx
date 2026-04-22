import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { JobForm } from '../components/JobForm';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { JobOfferCreateDTO, JobOfferListDTO, JobOfferStatusEnum } from '../types/JobOffer.dto';
import { createJobOffer, getJobOffersByRecruiter, deleteJobOffer } from '../services/jobOfferService';
import { PlusCircle, AlertCircle, Briefcase, MapPin, Calendar, Users, Clock, Eye, Trash2 } from 'lucide-react';
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

export default function PublierOffrePage() {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [publishedOffers, setPublishedOffers] = useState<JobOfferListDTO[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load user's published offers
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      loadPublishedOffers();
    }
  }, [user?.id, isAuthenticated]);

  // Scroll to published offers history if hash is present in URL
  useEffect(() => {
    if (window.location.hash === '#published-offers-history') {
      // Add a slight delay to ensure the content is rendered
      setTimeout(() => {
        const element = document.getElementById('published-offers-history');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [publishedOffers]);

  const loadPublishedOffers = async () => {
    if (!user?.id) return;
    
    setIsLoadingOffers(true);
    try {
      const offers = await getJobOffersByRecruiter(user.id);
      // Sort by creation date (newest first) and take only the first 5
      const sortedOffers = offers.sort((a, b) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      ).slice(0, 5);
      setPublishedOffers(sortedOffers);
    } catch (error) {
      console.error('Error loading published offers:', error);
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
      // Reload published offers to show the new one
      await loadPublishedOffers();
      // Scroll to the history section
      setTimeout(() => {
        const historySection = document.getElementById('published-offers-history');
        if (historySection) {
          historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Error creating job offer:', error);
      toast.error(t('monEspace.message.error'));
    }
  };

  const handleCancel = () => {
    navigate('/mon-espace');
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteJobOffer(offerToDelete);
      toast.success(t('monEspace.message.deleteSuccess'));
      // Reload offers after deletion
      await loadPublishedOffers();
      setOfferToDelete(null);
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error(t('monEspace.message.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeColor = (status: JobOfferStatusEnum) => {
    switch (status) {
      case JobOfferStatusEnum.PUBLISHED:
        return 'bg-green-50 text-green-700 border-green-200';
      case JobOfferStatusEnum.DRAFT:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case JobOfferStatusEnum.CLOSED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case JobOfferStatusEnum.CANCELLED:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDeadlineUrgency = (daysRemaining: number) => {
    if (daysRemaining < 0) {
      return { text: t('monEspace.deadline.expired'), color: 'text-red-600' };
    } else if (daysRemaining === 0) {
      return { text: t('monEspace.deadline.today'), color: 'text-orange-600' };
    } else {
      return { 
        text: t('monEspace.deadline.days', { days: daysRemaining.toString() }), 
        color: daysRemaining <= 7 ? 'text-orange-600' : 'text-muted-foreground' 
      };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={PlusCircle}
          title={t('monEspace.banner.publish.title')}
          description={t('monEspace.banner.publish.description')}
        />
        <MonEspaceSubMenu />
        <PageContainer className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('monEspace.access.loginRequired')}
            </AlertDescription>
          </Alert>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={PlusCircle}
        title={t('monEspace.banner.publish.title')}
        description={t('monEspace.banner.publish.description')}
      />
      
      <MonEspaceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Job Offer Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
              <JobForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel={t('monEspace.action.publish')}
              />
            </div>

            {/* Published Offers History Section */}
            {publishedOffers.length > 0 && (
              <div id="published-offers-history" className="mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Section Header */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                      <Briefcase className="w-6 h-6 text-[#B82547]" />
                      {t('monEspace.publishedOffers.recentOffers')}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('monEspace.publishedOffers.description')}
                    </p>
                  </div>

                  {/* Offers List */}
                  <div className="space-y-4">
                    {publishedOffers.map((offer) => {
                      const urgency = getDeadlineUrgency(offer.daysRemaining || 0);
                      const hasApplications = (offer.totalApplications || 0) > 0;
                      
                      return (
                        <div
                          key={offer.id}
                          className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-all duration-200 bg-white"
                        >
                          <div className="flex items-start justify-between gap-4">
                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                              {/* Title & Status */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-primary mb-1 truncate">
                                    {offer.jobTitle}
                                  </h3>
                                  {offer.projectTitle && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {offer.projectTitle}
                                    </p>
                                  )}
                                  {offer.department && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {offer.department}
                                    </p>
                                  )}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={getStatusBadgeColor(offer.status)}
                                >
                                  {t(`monEspace.job.status.${offer.status.toLowerCase()}`)}
                                </Badge>
                              </div>

                              {/* Offer Details Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{offer.location}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">
                                    {t('monEspace.job.published')}: {offer.publishedAt}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                  <span className={`font-medium truncate ${urgency.color}`}>
                                    {urgency.text}
                                  </span>
                                </div>
                                
                                {hasApplications && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                      {offer.totalApplications} {t('monEspace.job.applications')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50"
                                onClick={() => navigate(`/mon-espace/job-offer-detail/${offer.id}`)}
                                title={t('monEspace.action.view')}
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-red-50"
                                onClick={() => setOfferToDelete(offer.id)}
                                title={t('monEspace.action.delete')}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {publishedOffers.length === 0 && !isLoadingOffers && (
              <div className="mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {t('monEspace.publishedOffers.empty')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('monEspace.publishedOffers.empty.description')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!offerToDelete} onOpenChange={() => setOfferToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('monEspace.action.delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('monEspace.message.closeConfirm')}
            </AlertDialogDescription>
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