import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Card } from '@app/components/ui/card';
import { toast } from 'sonner';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { useToRs } from '@app/hooks/useToRs';
import {
  ToRDetailDTO,
  ToRStatusEnum,
  ToRTypeEnum,
  SectorEnum,
  CountryEnum,
  FundingAgencyEnum,
  CurrencyEnum,
} from '@app/types/tender.dto';
import {
  FileText,
  Calendar,
  DollarSign,
  Clock,
  Briefcase,
  MapPin,
  GraduationCap,
  Languages,
  Target,
  CheckCircle,
  FileCheck,
  Download,
  ExternalLink,
  Plus,
  Minus,
  TrendingUp,
  Award,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';

export default function ToRDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Pipeline hook
  const { addToPipeline, removeFromPipeline, isInPipeline } = usePipeline();

  // ToRs hook
  const { getToRById } = useToRs();

  // Try to get ToR from hook, fallback to mock
  const baseToR = id ? getToRById(id) : null;

  // Mock data - ToR Detail (enhanced data not available from hook)
  const mockToR: ToRDetailDTO = baseToR ? {
    ...baseToR,
    description: `Seeking experienced professional for ${baseToR.title} position. The consultant will provide technical assistance and strategic guidance.`,
    objectives: [
      'Develop comprehensive strategy',
      'Conduct baseline assessments',
      'Design capacity building programs',
      'Establish monitoring and evaluation framework',
    ],
    responsibilities: [
      'Lead technical assessments',
      'Facilitate stakeholder consultations and workshops',
      'Develop policy recommendations and implementation roadmaps',
      'Prepare quarterly progress reports and technical documentation',
      'Provide training to local staff and counterparts',
    ],
    qualifications: [
      `Master's degree in relevant field`,
      `Minimum ${baseToR.experienceYears} years of experience`,
      'Proven track record with international development projects',
      'Strong analytical and strategic planning skills',
      'Excellent communication and stakeholder engagement abilities',
    ],
    deliverables: [
      'Inception report within 2 weeks of contract start',
      'Baseline assessment report (Month 3)',
      'Draft strategy (Month 6)',
      'Final strategy and implementation plan (Month 9)',
      'Quarterly progress reports',
      'Final project report with lessons learned',
    ],
    countries: [baseToR.country],
    languages: ['English', 'French (preferred)'],
    educationLevel: "Master's degree or higher",
    specificSkills: [
      'Strategic planning',
      'Stakeholder engagement',
      'Policy development',
      'Capacity building',
      'M&E frameworks',
    ],
    documents: [
      {
        id: 'doc-1',
        fileName: `ToR_${baseToR.referenceNumber}_Full.pdf`,
        fileSize: 245600,
        url: '#',
      },
      {
        id: 'doc-2',
        fileName: 'Application_Guidelines.pdf',
        fileSize: 156800,
        url: '#',
      },
    ],
    applicationCount: Math.floor(Math.random() * 20) + 5,
    updatedAt: new Date(baseToR.createdAt.getTime() + 86400000 * 5), // 5 days after creation
  } : {
    id: id || 'tor-001',
    referenceNumber: 'WB-TOR-2024-001',
    title: 'Senior Water Resources Management Consultant',
    tenderId: 'tender-1',
    tenderTitle: 'Sustainable Water Management Project - Phase II',
    tenderReference: 'WB-2024-123',
    organizationName: 'World Bank',
    country: CountryEnum.KENYA,
    deadline: new Date('2024-12-31'),
    daysRemaining: 45,
    budget: { amount: 85000, currency: CurrencyEnum.USD, formatted: '$85,000' },
    status: ToRStatusEnum.OPEN,
    type: ToRTypeEnum.CONSULTANT,
    sectors: [SectorEnum.WATER_SANITATION, SectorEnum.ENVIRONMENT],
    fundingAgency: FundingAgencyEnum.WB,
    experienceYears: 10,
    duration: '12 months',
    inPipeline: false,
    createdAt: new Date('2024-01-15'),
    matchScore: 92,
    description: 'The consultant will provide technical expertise and strategic guidance on sustainable water resources management practices, working closely with government agencies and local stakeholders to develop and implement comprehensive water management strategies.',
    objectives: [
      'Develop comprehensive water resource management strategy',
      'Conduct baseline assessments of current water infrastructure',
      'Design capacity building programs for local institutions',
      'Establish monitoring and evaluation framework',
    ],
    responsibilities: [
      'Lead technical assessments of water resources and infrastructure',
      'Facilitate stakeholder consultations and workshops',
      'Develop policy recommendations and implementation roadmaps',
      'Prepare quarterly progress reports and technical documentation',
      'Provide training to local staff and counterparts',
    ],
    qualifications: [
      'Master\'s degree in Water Resources Management, Environmental Engineering, or related field',
      'Minimum 10 years of experience in water resources management',
      'Proven track record with international development projects',
      'Strong analytical and strategic planning skills',
      'Excellent communication and stakeholder engagement abilities',
    ],
    deliverables: [
      'Inception report within 2 weeks of contract start',
      'Baseline assessment report (Month 3)',
      'Draft water management strategy (Month 6)',
      'Final strategy and implementation plan (Month 9)',
      'Quarterly progress reports',
      'Final project report with lessons learned (Month 12)',
    ],
    countries: [CountryEnum.KENYA, CountryEnum.TANZANIA, CountryEnum.UGANDA],
    languages: ['English', 'Swahili (preferred)'],
    educationLevel: 'Master\'s degree or higher',
    specificSkills: [
      'Water resources modeling',
      'GIS and remote sensing',
      'Stakeholder engagement',
      'Policy development',
      'Capacity building',
      'M&E frameworks',
    ],
    documents: [
      {
        id: 'doc-1',
        fileName: 'ToR_Water_Consultant_Full.pdf',
        fileSize: 245600,
        url: '#',
      },
      {
        id: 'doc-2',
        fileName: 'Application_Guidelines.pdf',
        fileSize: 156800,
        url: '#',
      },
    ],
    applicationCount: 12,
    updatedAt: new Date('2024-01-20'),
  };

  const getStatusColor = (status: ToRStatusEnum) => {
    switch (status) {
      case ToRStatusEnum.OPEN:
        return 'bg-green-100 text-green-800 border-green-200';
      case ToRStatusEnum.CLOSED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ToRStatusEnum.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ToRStatusEnum.FILLED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={mockToR.title}
        description={mockToR.referenceNumber}
        icon={FileText}
        stats={[
          { value: format(mockToR.deadline, 'PP', { locale: dateLocale }), label: t('tors.detail.deadline') },
          { value: mockToR.daysRemaining.toString() + 'd', label: t('common.remaining') },
          { value: mockToR.applicationCount.toString(), label: t('tors.detail.applicationCount') },
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/calls/tors')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('tors.detail.backToList')}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(mockToR.status)}>
                      {t(`tors.status.${mockToR.status}`)}
                    </Badge>
                    <Badge variant="outline">
                      {t(`tors.type.${mockToR.type}`)}
                    </Badge>
                    {isInPipeline(mockToR.id) && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        {t('tors.card.inPipeline')}
                      </Badge>
                    )}
                  </div>
                  {mockToR.matchScore && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#B82547]">{mockToR.matchScore}%</div>
                      <div className="text-xs text-muted-foreground">{t('common.match')}</div>
                    </div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-primary mb-4">{mockToR.title}</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tors.detail.reference')}:</span>
                    <span className="font-medium">{mockToR.referenceNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tors.detail.organization')}:</span>
                    <span className="font-medium">{mockToR.organizationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tors.detail.countries')}:</span>
                    <span className="font-medium">{mockToR.countries.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('tors.detail.duration')}:</span>
                    <span className="font-medium">{mockToR.duration}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    {t('tors.detail.description')}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{mockToR.description}</p>
                </div>

                {/* Objectives */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {t('tors.detail.objectives')}
                  </h3>
                  <ul className="space-y-2">
                    {mockToR.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Responsibilities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    {t('tors.detail.responsibilities')}
                  </h3>
                  <ul className="space-y-2">
                    {mockToR.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B82547] mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Qualifications */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    {t('tors.detail.qualifications')}
                  </h3>
                  <ul className="space-y-2">
                    {mockToR.qualifications.map((qualification, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{qualification}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    {t('tors.detail.deliverables')}
                  </h3>
                  <ul className="space-y-2">
                    {mockToR.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#B82547] mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    {t('tors.detail.documents')}
                  </h3>
                  <div className="space-y-2">
                    {mockToR.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Related Tender Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      {t('tors.detail.relatedTender')}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-1">{mockToR.tenderReference}</p>
                    <p className="font-medium text-primary">{mockToR.tenderTitle}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/calls/${mockToR.tenderId}`)}
                  >
                    {t('tors.detail.viewTender')}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Key Details Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{t('tors.card.viewDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('tors.detail.deadline')}</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{format(mockToR.deadline, 'PPP', { locale: dateLocale })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{mockToR.daysRemaining} {language === 'fr' ? 'jours restants' : language === 'es' ? 'días restantes' : 'days remaining'}</p>
                  </div>

                  {mockToR.budget && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('tors.detail.budget')}</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-lg text-[#B82547]">{mockToR.budget.formatted}</span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('tors.detail.experienceYears')}</p>
                    <p className="font-semibold">{mockToR.experienceYears} {language === 'fr' ? 'années minimum' : language === 'es' ? 'años mínimo' : 'years minimum'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('tors.detail.educationLevel')}</p>
                    <p className="font-semibold">{mockToR.educationLevel}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t('tors.detail.languages')}</p>
                    <div className="flex flex-wrap gap-1">
                      {mockToR.languages.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Sectors Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{t('tors.detail.sectors')}</h3>
                <div className="flex flex-wrap gap-2">
                  {mockToR.sectors.map((sector) => (
                    <Badge key={sector} variant="secondary">
                      {t(`tenders.sector.${sector}`)}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Specific Skills Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">{t('tors.detail.specificSkills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {mockToR.specificSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Actions Card */}
              <Card className="p-6 bg-gradient-to-br from-[#B82547]/5 to-purple-50 border-[#B82547]/20">
                <Button
                  variant={isInPipeline(mockToR.id) ? 'outline' : 'secondary'}
                  className="w-full"
                  size="lg"
                  onClick={() => isInPipeline(mockToR.id) ? removeFromPipeline(mockToR.id) : addToPipeline(mockToR.id)}
                >
                  {isInPipeline(mockToR.id) ? (
                    <>
                      <Minus className="w-4 h-4 mr-2" />
                      {t('tors.detail.removeFromPipeline')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('tors.detail.addToPipeline')}
                    </>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}