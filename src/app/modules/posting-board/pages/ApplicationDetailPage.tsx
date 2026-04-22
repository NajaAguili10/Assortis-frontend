import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { PageBanner } from '../../../components/PageBanner';
import { PageContainer } from '../../../components/PageContainer';
import { PostingBoardSubMenu } from '../../../components/PostingBoardSubMenu';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

// Mock application detail
interface ApplicationDetail {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLocation: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  coverLetter: string;
  cvUrl?: string;
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
  languages: string[];
}

const mockApplicationDetail: ApplicationDetail = {
  id: 'app-1',
  applicantName: 'Jean Dupont',
  applicantEmail: 'jean.dupont@example.com',
  applicantPhone: '+33 6 12 34 56 78',
  applicantLocation: 'Paris, France',
  appliedDate: '2026-02-28',
  status: 'new',
  coverLetter:
    'I am very interested in this position and believe my experience aligns well with the requirements. I have over 5 years of experience in international development and project management, working on various initiatives across Africa and Asia. My expertise includes stakeholder engagement, budget management, and results-based monitoring.',
  education: [
    {
      degree: 'Master in International Development',
      institution: 'Sciences Po Paris',
      year: '2018',
    },
    {
      degree: 'Bachelor in Economics',
      institution: 'Université Paris 1 Panthéon-Sorbonne',
      year: '2016',
    },
  ],
  experience: [
    {
      title: 'Project Manager',
      company: 'International NGO',
      duration: '2020 - Present',
      description:
        'Leading multi-country development projects with budgets over €2M. Managing teams of 15+ staff across 5 countries.',
    },
    {
      title: 'Program Officer',
      company: 'United Nations Development Programme',
      duration: '2018 - 2020',
      description:
        'Coordinated sustainable development initiatives in West Africa. Developed monitoring and evaluation frameworks.',
    },
  ],
  skills: [
    'Project Management',
    'Budget Management',
    'Stakeholder Engagement',
    'M&E Frameworks',
    'Grant Writing',
    'Team Leadership',
  ],
  languages: ['French (Native)', 'English (Fluent)', 'Spanish (Intermediate)'],
};

export default function ApplicationDetailPage() {
  const { id, applicationId } = useParams<{ id: string; applicationId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      loadApplication(applicationId);
    }
  }, [applicationId]);

  const loadApplication = async (appId: string) => {
    setIsLoading(true);
    try {
      // Mock data - in real app, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setApplication(mockApplicationDetail);
    } catch (error) {
      console.error('Error loading application:', error);
      toast.error(t('monEspace.message.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadCV = () => {
    if (!application) return;
    toast.success(`CV of ${application.applicantName} downloaded successfully`);
  };

  const handleContact = () => {
    if (!application) return;
    const subject = encodeURIComponent('Re: Your Application');
    const body = encodeURIComponent(
      `Dear ${application.applicantName},\n\nThank you for your application.\n\nBest regards`
    );
    window.location.href = `mailto:${application.applicantEmail}?subject=${subject}&body=${body}`;
  };

  const handleUpdateStatus = (newStatus: ApplicationDetail['status']) => {
    if (!application) return;
    setApplication({ ...application, status: newStatus });
    toast.success(t('monEspace.application.statusUpdated'));
  };

  const getStatusBadge = (status: ApplicationDetail['status']) => {
    const statusConfig = {
      new: {
        label: t('monEspace.application.status.new'),
        className: 'bg-badge-info-bg text-badge-info-text',
      },
      reviewed: {
        label: t('monEspace.application.status.reviewed'),
        className: 'bg-badge-neutral-bg text-badge-neutral-text',
      },
      shortlisted: {
        label: t('monEspace.application.status.shortlisted'),
        className: 'bg-badge-success-bg text-badge-success-text',
      },
      rejected: {
        label: t('monEspace.application.status.rejected'),
        className: 'bg-badge-neutral-bg text-badge-neutral-text',
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
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
          icon={User}
          title="Application Details"
          description=""
        />
        <PostingBoardSubMenu />
        <PageContainer className="p-6">
          <div className="text-center py-12 text-gray-500">Loading...</div>
        </PageContainer>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageBanner
          icon={User}
          title="Application Details"
          description=""
        />
        <PostingBoardSubMenu />
        <PageContainer className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{t('monEspace.message.error')}</AlertDescription>
          </Alert>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={User}
        title="Application Details"
        description={application.applicantName}
      />

      <PostingBoardSubMenu />

      <PageContainer className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Info */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-primary mb-2">
                    {application.applicantName}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {application.applicantEmail}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {application.applicantPhone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {application.applicantLocation}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Applied on {formatDate(application.appliedDate)}
                    </div>
                  </div>
                </div>
                <div>{getStatusBadge(application.status)}</div>
              </div>

              {/* Cover Letter */}
              <div className="mb-6">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-3">
                  <FileText className="w-5 h-5 mr-2" />
                  Cover Letter
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {application.coverLetter}
                  </p>
                </div>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-3">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Professional Experience
                </h3>
                <div className="space-y-4">
                  {application.experience.map((exp, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-primary mb-1">{exp.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {exp.company} • {exp.duration}
                      </p>
                      <p className="text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="mb-6">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-3">
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Education
                </h3>
                <div className="space-y-3">
                  {application.education.map((edu, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-primary">{edu.degree}</h4>
                      <p className="text-sm text-gray-600">
                        {edu.institution} • {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="flex items-center text-lg font-semibold text-primary mb-3">
                  <Award className="w-5 h-5 mr-2" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {application.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="flex items-center text-lg font-semibold text-primary mb-3">
                  <Languages className="w-5 h-5 mr-2" />
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {application.languages.map((lang, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Actions</h3>
              
              {/* Primary Actions */}
              <div className="space-y-3 mb-6">
                <Button onClick={handleDownloadCV} className="w-full" variant="default">
                  <Download className="w-4 h-4 mr-2" />
                  Download CV
                </Button>
                <Button onClick={handleContact} className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Applicant
                </Button>
              </div>

              {/* Status Update */}
              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleUpdateStatus('reviewed')}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={application.status === 'reviewed'}
                  >
                    Mark as Reviewed
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('shortlisted')}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={application.status === 'shortlisted'}
                  >
                    Shortlist
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus('rejected')}
                    className="w-full"
                    variant="outline"
                    size="sm"
                    disabled={application.status === 'rejected'}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}