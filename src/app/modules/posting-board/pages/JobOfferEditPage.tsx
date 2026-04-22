import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { PostingBoardSubMenu } from '../../../components/PostingBoardSubMenu';
import { JobForm } from '../components/JobForm';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { JobOfferDetailDTO, JobOfferCreateDTO } from '../types/JobOffer.dto';
import { getJobOfferById, updateJobOffer } from '../services/jobOfferService';
import { toast } from 'sonner';
import { Briefcase } from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

export default function JobOfferEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [job, setJob] = useState<JobOfferDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadJob(id);
    }
  }, [id]);

  const loadJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      const data = await getJobOfferById(jobId);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
      toast.error(t('monEspace.message.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: JobOfferCreateDTO) => {
    if (!id || !user) return;

    try {
      await updateJobOffer(id, data);
      toast.success(t('monEspace.message.saveSuccess'));
      navigate(`/posting-board/detail/${id}`);
    } catch (error) {
      console.error('Error updating job offer:', error);
      toast.error(t('monEspace.message.error'));
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={Briefcase}
          title={t('monEspace.banner.publish.title')}
          description={t('monEspace.banner.publish.description')}
        />
        <PostingBoardSubMenu />
        <PageContainer className="p-6">
          <div className="text-center py-12 text-gray-500">
            Loading...
          </div>
        </PageContainer>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={Briefcase}
          title={t('monEspace.banner.publish.title')}
          description={t('monEspace.banner.publish.description')}
        />
        <PostingBoardSubMenu />
        <PageContainer className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              {t('monEspace.message.error')}
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
        title={t('monEspace.action.edit')}
        description={job.jobTitle}
      />
      
      <PostingBoardSubMenu />

      <PageContainer className="p-6">
        <JobForm
          initialData={job}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </PageContainer>
    </div>
  );
}