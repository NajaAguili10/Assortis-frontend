import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { MonEspaceSubMenu } from '../../../components/MonEspaceSubMenu';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { useLanguage } from '../../../contexts/LanguageContext';
import { JobOfferListDTO, JobOfferTypeEnum } from '../types/JobOffer.dto';
import { getJobOfferById } from '../services/jobOfferService';
import { 
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Building2,
  AlertCircle,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

export default function JobOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [job, setJob] = useState<JobOfferListDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadJobOffer(id);
    }
  }, [id]);

  const loadJobOffer = async (jobId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getJobOfferById(jobId);
      setJob(data);
    } catch (err) {
      console.error('Error loading job offer:', err);
      setError(t('monEspace.message.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/mon-espace/job-offer-edit/${id}`);
    }
  };

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Get deadline display text
  const getDeadlineDisplay = () => {
    if (!job) return '';
    
    if (job.daysRemaining === 0) {
      return t('monEspace.deadline.today');
    }
    if (job.daysRemaining < 0) {
      return t('monEspace.deadline.expired');
    }
    return t('monEspace.deadline.days').replace('{days}', job.daysRemaining.toString());
  };

  const isUrgent = job ? job.daysRemaining <= 7 && job.daysRemaining >= 0 : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={Briefcase}
          title={t('monEspace.banner.dashboard.title')}
          description={t('monEspace.banner.dashboard.description')}
        />
        <MonEspaceSubMenu />
        <PageContainer className="p-6">
          <div className="text-center py-12 text-gray-500">
            Loading...
          </div>
        </PageContainer>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={Briefcase}
          title={t('monEspace.banner.dashboard.title')}
          description={t('monEspace.banner.dashboard.description')}
        />
        <MonEspaceSubMenu />
        <PageContainer className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || t('monEspace.message.error')}
            </AlertDescription>
          </Alert>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Briefcase}
        title={job.jobTitle}
        description={
          job.type === JobOfferTypeEnum.PROJECT && job.projectTitle
            ? job.projectTitle
            : job.organizationName || ''
        }
      />
      
      <MonEspaceSubMenu />

      <PageContainer className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-primary mb-2">{job.jobTitle}</h1>
                  {job.organizationName && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building2 className="w-4 h-4 mr-2" />
                      <span className="font-medium">{job.organizationName}</span>
                    </div>
                  )}
                </div>
                {isUrgent && (
                  <Badge variant="secondary" className="bg-badge-warning-bg text-badge-warning-text">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {getDeadlineDisplay()}
                  </Badge>
                )}
                {job.daysRemaining < 0 && (
                  <Badge variant="secondary" className="bg-badge-neutral-bg text-badge-neutral-text">
                    {t('monEspace.deadline.expired')}
                  </Badge>
                )}
              </div>

              {/* Job Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">{t('monEspace.job.location')}:</span> {job.location}
                  </span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">{t('monEspace.job.duration')}:</span> {job.duration}
                  </span>
                </div>

                {job.type === JobOfferTypeEnum.PROJECT && job.projectTitle && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium">{t('monEspace.job.project')}:</span> {job.projectTitle}
                    </span>
                  </div>
                )}

                {job.type === JobOfferTypeEnum.INTERNAL && job.department && (
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium">{t('monEspace.job.department')}:</span> {job.department}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">{t('monEspace.job.published')}:</span> {formatDate(job.publishedAt)}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">{t('monEspace.job.deadline')}:</span> {formatDate(job.deadline)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {t('monEspace.form.description')}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>{job.description || t('monEspace.message.noOffers.description')}</p>
              </div>
            </Card>

            {/* Additional Sections - would be populated from full job data */}
            {job.requirements && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-primary mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t('monEspace.form.requirements')}
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>{job.requirements}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                {t('monEspace.filter.status')}
              </h3>
              <Badge 
                variant={job.status === 'published' ? 'default' : 'secondary'}
                className="w-full justify-center py-2"
              >
                {t(`monEspace.job.status.${job.status.toLowerCase()}`)}
              </Badge>
            </Card>

            {/* Deadline Card */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                {t('monEspace.job.deadline')}
              </h3>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {formatDate(job.deadline)}
                </div>
                <div className={`text-sm font-medium ${
                  job.daysRemaining < 0 
                    ? 'text-gray-500' 
                    : isUrgent 
                      ? 'text-badge-warning-text' 
                      : 'text-gray-600'
                }`}>
                  {getDeadlineDisplay()}
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                Actions
              </h3>
              <div className="space-y-3">
                <Button className="w-full" variant="outline" onClick={handleEdit}>
                  {t('monEspace.action.edit')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}