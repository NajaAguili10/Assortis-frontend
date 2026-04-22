import { useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { useTraining } from '@app/hooks/useTraining';
import { CertificationStatusEnum } from '@app/types/training.dto';
import {
  GraduationCap,
  BookOpen,
  Video,
  UserCheck,
  Award,
  ArrowLeft,
  Calendar,
  Target,
  Repeat,
  AlertCircle,
  CheckCircle,
  Download,
  Clock,
  FileCheck,
  BookMarked,
  Users,
  Building2,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingCertificationDetails() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { certificationId } = useParams<{ certificationId: string }>();
  const { certifications, kpis } = useTraining();
  const [isDownloading, setIsDownloading] = useState(false);

  const certification = useMemo(() => {
    return certifications.find(cert => cert.id === certificationId);
  }, [certifications, certificationId]);

  const getCertStatusColor = (status: CertificationStatusEnum | undefined) => {
    if (!status) return '';
    switch (status) {
      case CertificationStatusEnum.NOT_STARTED:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case CertificationStatusEnum.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case CertificationStatusEnum.PASSED:
        return 'bg-green-50 text-green-700 border-green-200';
      case CertificationStatusEnum.FAILED:
        return 'bg-red-50 text-red-700 border-red-200';
      case CertificationStatusEnum.EXPIRED:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return '';
    }
  };

  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    
    // Toast de chargement
    const loadingToast = toast.loading(t('training.certifications.download.loading'));

    try {
      // Simuler le téléchargement (dans un cas réel, appel API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simuler la création d'un PDF (dans un cas réel, récupérer le PDF depuis l'API)
      const blob = new Blob(['PDF Certificate Content'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${certification?.title.replace(/\s+/g, '_')}_${certification?.credentialId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Toast de succès
      toast.success(t('training.certifications.download.success'), {
        id: loadingToast,
        duration: 3000,
      });
    } catch (error) {
      // Toast d'erreur
      toast.error(t('training.certifications.download.error'), {
        id: loadingToast,
        duration: 4000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEnroll = () => {
    navigate(`/training/certification-enroll/${certificationId}`);
  };

  if (!certification) {
    return (
      <div className="min-h-screen">
        <PageBanner
          title={t('training.hub.title')}
          description={t('training.hub.subtitle')}
          icon={GraduationCap}
          stats={[
            { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
          ]}
        />
        <TrainingSubMenu />
        <PageContainer className="my-6">
          <div className="text-center py-12 bg-white rounded-lg border">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary mb-1">{t('training.certificationDetails.notFound')}</h3>
            <p className="text-sm text-muted-foreground">{t('training.certificationDetails.notFound.message')}</p>
            <Button
              variant="default"
              size="lg"
              className="mt-4 bg-[#B82547] hover:bg-[#a01f3c] text-white"
              onClick={() => navigate('/training/certifications')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('training.certificationDetails.backToCertifications')}
            </Button>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.hub.title')}
        description={t('training.hub.subtitle')}
        icon={GraduationCap}
        stats={[
          { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
        ]}
      />

      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Certification Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header Card - Clear & Modern Design */}
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-[#3d4654] to-[#B82547]" />
                
                {/* Certification Content */}
                <div className="p-6">
                  <div className="flex items-start gap-6 mb-6">
                    {/* Award Icon with Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#3d4654] to-[#B82547] rounded-xl flex items-center justify-center shadow-lg">
                        <Award className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-white flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Certification Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {t(`training.level.${certification.level}`)}
                        </Badge>
                        {certification.status && (
                          <Badge className={getCertStatusColor(certification.status)}>
                            {t(`training.certStatus.${certification.status}`)}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-[#3d4654] mb-2">{certification.title}</h1>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{t('training.certifications.issuer')}: <span className="font-medium text-[#3d4654]">{certification.issuer}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t">
                    <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="flex justify-center mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.certifications.examDuration')}</p>
                      <p className="text-xl font-bold text-[#3d4654]">{certification.examDuration}</p>
                      <p className="text-xs text-muted-foreground">{t('training.certifications.minutes')}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex justify-center mb-1">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.certifications.passingScore')}</p>
                      <p className="text-xl font-bold text-[#3d4654]">{certification.passingScore}%</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex justify-center mb-1">
                        <Repeat className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.certifications.attempts')}</p>
                      <p className="text-xl font-bold text-[#3d4654]">{certification.attempts}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-100">
                      <div className="flex justify-center mb-1">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.certifications.validity')}</p>
                      <p className="text-sm font-bold text-[#3d4654]">
                        {certification.validityPeriod === 0 ? t('training.certifications.lifetime') : `${certification.validityPeriod} ${t('training.certifications.months')}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earned Certification Card */}
              {certification.status === CertificationStatusEnum.PASSED && certification.credentialId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h2 className="text-lg font-bold text-green-900">{t('training.certificationDetails.congratulations')}</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">{t('training.certifications.credentialId')}:</p>
                      <p className="text-lg font-bold text-green-900">{certification.credentialId}</p>
                    </div>
                    {certification.earnedDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">{t('training.certifications.earnedDate')}:</span>
                        <span className="font-semibold text-green-900">{new Date(certification.earnedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {certification.expiryDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">{t('training.certifications.expiryDate')}:</span>
                        <span className="font-semibold text-green-900">{new Date(certification.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <Button
                      variant="default"
                      size="lg"
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleDownloadCertificate}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloading ? t('common.loading') : t('training.actions.downloadCertificate')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.certificationDetails.description')}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{certification.description}</p>
              </div>

              {/* Requirements */}
              {certification.requirements.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-[#3d4654]" />
                    <h2 className="text-lg font-bold text-primary">{t('training.certifications.requirements')}</h2>
                  </div>
                  <ul className="space-y-3">
                    {certification.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exam Format */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.certificationDetails.examFormat')}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-[#B82547] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">{t('training.certifications.examDuration')}</p>
                      <p className="text-sm text-muted-foreground">{certification.examDuration} {t('training.certifications.minutes')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Target className="w-5 h-5 text-[#B82547] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">{t('training.certifications.passingScore')}</p>
                      <p className="text-sm text-muted-foreground">{certification.passingScore}%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Repeat className="w-5 h-5 text-[#B82547] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">{t('training.certifications.attempts')}</p>
                      <p className="text-sm text-muted-foreground">{certification.attempts} {t('training.certificationDetails.attemptsAllowed')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#B82547] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary mb-1">{t('training.certifications.validity')}</p>
                      <p className="text-sm text-muted-foreground">
                        {certification.validityPeriod === 0 ? t('training.certifications.lifetime') : `${certification.validityPeriod} ${t('training.certifications.months')}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Price & Enroll Card */}
              {certification.status !== CertificationStatusEnum.PASSED && (
                <div className="bg-white rounded-lg border p-5 sticky top-6">
                  <div className="text-center mb-6">
                    <p className="text-sm text-muted-foreground mb-2">{t('training.certificationDetails.certificationFee')}</p>
                    <p className="text-4xl font-bold text-[#B82547]">${certification.price}</p>
                  </div>
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                    onClick={handleEnroll}
                  >
                    {t('training.actions.enroll')}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    {t('training.certificationDetails.enrollmentIncludes')}
                  </p>
                </div>
              )}

              {/* Issuer Card */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4">{t('training.certifications.issuer')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {certification.issuer.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{certification.issuer}</p>
                      <p className="text-xs text-muted-foreground">{t('training.certificationDetails.accreditedIssuer')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sector Card */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4">{t('training.certificationDetails.sector')}</h3>
                <Badge variant="secondary" className="text-sm">
                  {t(`projects.sector.${certification.sector}`)}
                </Badge>
              </div>

              {/* Subsectors Card */}
              {certification.subsectors.length > 0 && (
                <div className="bg-white rounded-lg border p-5">
                  <h3 className="font-bold text-primary mb-4">{t('training.certificationDetails.subsectors')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {certification.subsectors.map((subsector, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {t(`subsectors.${subsector}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits Card */}
              <div className="bg-gradient-to-br from-[#3d4654] to-[#B82547] rounded-lg p-5 text-white">
                <h3 className="font-bold text-lg mb-4">{t('training.certificationDetails.benefits.title')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('training.certificationDetails.benefits.recognition')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('training.certificationDetails.benefits.career')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('training.certificationDetails.benefits.skills')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{t('training.certificationDetails.benefits.network')}</span>
                  </li>
                </ul>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4">{t('training.certificationDetails.statistics')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {t('training.certificationDetails.certified')}
                    </span>
                    <span className="font-semibold text-primary">2,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('training.certificationDetails.passRate')}</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{t('training.certificationDetails.avgPreparation')}</span>
                    <span className="font-semibold text-primary">3-4 {t('training.certificationDetails.weeks')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}