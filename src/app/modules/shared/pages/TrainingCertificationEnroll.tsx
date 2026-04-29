import { useState, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { useTraining } from '@app/hooks/useTraining';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  Repeat,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TrainingCertificationEnroll() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addHistoryEntry } = useAssistanceHistory();
  const { certificationId } = useParams<{ certificationId: string }>();
  const { certifications, kpis } = useTraining();

  const certification = useMemo(() => {
    return certifications.find(cert => cert.id === certificationId);
  }, [certifications, certificationId]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    organizationName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t('training.enrollment.form.error.fullName');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('training.enrollment.form.error.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('training.enrollment.form.error.email.invalid');
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = t('training.enrollment.form.error.jobTitle');
    }

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = t('training.enrollment.form.error.organizationName');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('training.enrollment.form.error.title'), {
        description: t('training.enrollment.form.error.message'),
      });
      return;
    }

    setIsSubmitting(true);

    const loadingToast = toast.loading(t('training.certificationEnroll.submitting'));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // ✅ Enregistrer dans l'historique
      addHistoryEntry({
        type: 'training_enrollment',
        organizationName: 'Assortis Training Platform',
        title: `${t('training.certifications.title')} - ${certification.title}`,
        message: `${t('training.enrollment.fullName')}: ${formData.fullName}\n${t('training.enrollment.email')}: ${formData.email}${formData.phone ? `\n${t('training.enrollment.phone')}: ${formData.phone}` : ''}\n${t('training.enrollment.jobTitle')}: ${formData.jobTitle}\n${t('training.enrollment.organizationName')}: ${formData.organizationName}\n\n${t('training.level.label')}: ${t(`training.level.${certification.level}`)}\n${t('training.certifications.examDuration')}: ${certification.examDuration} ${t('training.certifications.minutes')}\n${t('training.certifications.passingScore')}: ${certification.passingScore}%\n${t('training.certificationEnroll.fee')}: $${certification.price}`,
        trainingTitle: certification.title,
        trainingCourse: certification.title,
        trainingDuration: `${certification.examDuration} ${t('training.certifications.minutes')}`,
        status: 'enrolled',
      });

      toast.success(t('training.certificationEnroll.success.title'), {
        id: loadingToast,
        description: t('training.certificationEnroll.success.message'),
        duration: 4000,
      });

      setTimeout(() => {
        navigate('/training/portfolio');
      }, 1000);
    } catch (error) {
      toast.error(t('training.certificationEnroll.error.title'), {
        id: loadingToast,
        description: t('training.certificationEnroll.error.message'),
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
              onClick={() => navigate('/training/portfolio')}
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
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/training/portfolio')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('training.certificationDetails.backToCertifications')}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Enrollment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-2xl font-bold text-primary mb-2">{t('training.certificationEnroll.title')}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t('training.certificationEnroll.subtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-2">
                      {t('training.enrollment.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder={t('training.enrollment.fullNamePlaceholder')}
                      className={errors.fullName ? 'border-red-500' : ''}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                      {t('training.enrollment.email')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('training.enrollment.emailPlaceholder')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                      {t('training.enrollment.phone')}
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('training.enrollment.phonePlaceholder')}
                    />
                  </div>

                  {/* Job Title */}
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-primary mb-2">
                      {t('training.enrollment.jobTitle')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="jobTitle"
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      placeholder={t('training.enrollment.jobTitlePlaceholder')}
                      className={errors.jobTitle ? 'border-red-500' : ''}
                    />
                    {errors.jobTitle && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.jobTitle}
                      </p>
                    )}
                  </div>

                  {/* Organization Name */}
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-primary mb-2">
                      {t('training.enrollment.organizationName')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange('organizationName', e.target.value)}
                      placeholder={t('training.enrollment.organizationPlaceholder')}
                      className={errors.organizationName ? 'border-red-500' : ''}
                    />
                    {errors.organizationName && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.organizationName}
                      </p>
                    )}
                  </div>

                  {/* Security Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">{t('training.enrollment.secureRegistration')}</p>
                        <p className="text-xs text-blue-700">{t('training.enrollment.dataProtection')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('common.loading') : t('training.certificationEnroll.submitButton')}
                  </Button>
                </form>
              </div>
            </div>

            {/* Right Column - Certification Summary */}
            <div className="space-y-6">
              {/* Certification Card */}
              <div className="bg-white rounded-lg border p-5 sticky top-6">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-yellow-50 rounded-lg flex items-center justify-center mb-3">
                    <Award className="w-8 h-8 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-primary mb-2">{certification.title}</h3>
                  <Badge variant="outline" className="text-xs mb-3">
                    {t(`training.level.${certification.level}`)}
                  </Badge>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{certification.description}</p>
                </div>

                {/* Price */}
                <div className="pt-4 border-t mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{t('training.certificationEnroll.fee')}:</span>
                    <span className="text-2xl font-bold text-[#B82547]">${certification.price}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t('training.certifications.examDuration')}:
                    </span>
                    <span className="font-medium text-primary">{certification.examDuration} {t('training.certifications.minutes')}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {t('training.certifications.passingScore')}:
                    </span>
                    <span className="font-medium text-primary">{certification.passingScore}%</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Repeat className="w-4 h-4" />
                      {t('training.certifications.attempts')}:
                    </span>
                    <span className="font-medium text-primary">{certification.attempts}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('training.certifications.validity')}:
                    </span>
                    <span className="font-medium text-primary">
                      {certification.validityPeriod === 0 ? t('training.certifications.lifetime') : `${certification.validityPeriod} ${t('training.certifications.months')}`}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{t('training.certificationEnroll.includes')}:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{t('training.certificationEnroll.benefit1')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{t('training.certificationEnroll.benefit2')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{t('training.certificationEnroll.benefit3')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
