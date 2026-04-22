import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { PostingBoardSubMenu } from '../../../components/PostingBoardSubMenu';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getJobOfferById } from '../services/jobOfferService';
import { JobOfferListDTO } from '../types/JobOffer.dto';
import { toast } from 'sonner';
import { 
  Users,
  Mail,
  Calendar,
  FileText,
  Download,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

// Mock application data
interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  coverLetter: string;
  cvUrl?: string;
}

const mockApplications: Application[] = [
  {
    id: 'app-1',
    applicantName: 'Jean Dupont',
    applicantEmail: 'jean.dupont@example.com',
    appliedDate: '2026-02-28',
    status: 'new',
    coverLetter: 'I am very interested in this position and believe my experience aligns well with the requirements.',
  },
  {
    id: 'app-2',
    applicantName: 'Marie Martin',
    applicantEmail: 'marie.martin@example.com',
    appliedDate: '2026-02-27',
    status: 'reviewed',
    coverLetter: 'With 5 years of experience in the field, I am confident I can contribute to your team.',
  },
  {
    id: 'app-3',
    applicantName: 'Pierre Bernard',
    applicantEmail: 'pierre.bernard@example.com',
    appliedDate: '2026-02-26',
    status: 'shortlisted',
    coverLetter: 'I have been following your organization for years and would love to be part of your mission.',
  },
];

export default function JobApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [job, setJob] = useState<JobOfferListDTO | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (jobId: string) => {
    setIsLoading(true);
    try {
      const jobData = await getJobOfferById(jobId);
      setJob(jobData);
      // Mock applications - in real app, fetch from API
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = (applicationId: string) => {
    navigate(`/posting-board/detail/${id}/applications/${applicationId}`);
  };

  const handleDownloadCV = (application: Application) => {
    // In a real app, this would download the actual CV file
    // For now, we'll create a mock download
    const link = document.createElement('a');
    link.href = '#'; // In real app: application.cvUrl || '#'
    link.download = `CV_${application.applicantName.replace(/\s/g, '_')}.pdf`;
    
    // Simulate download with toast notification
    toast.success(`CV of ${application.applicantName} downloaded successfully`);
  };

  const handleContact = (application: Application) => {
    // Open email client with pre-filled email
    const subject = encodeURIComponent(`Re: Application for ${job?.jobTitle || 'Position'}`);
    const body = encodeURIComponent(`Dear ${application.applicantName},\n\nThank you for your application.\n\nBest regards`);
    window.location.href = `mailto:${application.applicantEmail}?subject=${subject}&body=${body}`;
  };

  const getStatusBadge = (status: Application['status']) => {
    const statusColors = {
      new: 'bg-badge-info-bg text-badge-info-text',
      reviewed: 'bg-badge-neutral-bg text-badge-neutral-text',
      shortlisted: 'bg-badge-success-bg text-badge-success-text',
      rejected: 'bg-badge-neutral-bg text-badge-neutral-text',
    };

    const statusLabels = {
      new: t('monEspace.application.status.new'),
      reviewed: t('monEspace.application.status.reviewed'),
      shortlisted: t('monEspace.application.status.shortlisted'),
      rejected: t('monEspace.application.status.rejected'),
    };

    return (
      <Badge variant="secondary" className={statusColors[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={Users}
          title={t('monEspace.action.viewApplications')}
          description=""
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
          icon={Users}
          title={t('monEspace.action.viewApplications')}
          description=""
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
        icon={Users}
        title={t('monEspace.action.viewApplications')}
        description={job.jobTitle}
        stats={[
          {
            value: applications.length,
            label: t('monEspace.kpi.totalApplications'),
          },
        ]}
      />
      
      <PostingBoardSubMenu />

      <PageContainer className="p-6">
        {/* Applications List */}
        {applications.length === 0 ? (
          <Alert>
            <AlertDescription>
              No applications received yet.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      {application.applicantName}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Mail className="w-4 h-4 mr-2" />
                      {application.applicantEmail}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Applied on {formatDate(application.appliedDate)}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(application.status)}
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    Cover Letter
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {application.coverLetter}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button variant="default" size="sm" onClick={() => handleViewApplication(application.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Application
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadCV(application)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleContact(application)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}