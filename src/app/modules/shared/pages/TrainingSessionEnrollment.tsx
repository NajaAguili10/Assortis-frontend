import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useTraining } from '@app/hooks/useTraining';
import { SessionStatusEnum } from '@app/types/training.dto';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Globe,
  AlertCircle,
  Sparkles,
  Shield,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SessionEnrollmentFormData {
  fullName: string;
  email: string;
  phone: string;
  organizationName: string;
  jobTitle: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
}

export default function TrainingSessionEnrollment() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, kpis } = useTraining();
  const { addEntry } = useAssistanceHistory();

  // Get locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'fr':
        return 'fr-FR';
      case 'es':
        return 'es-ES';
      default:
        return 'en-US';
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SessionEnrollmentFormData>({
    fullName: '',
    email: '',
    phone: '',
    organizationName: '',
    jobTitle: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const session = useMemo(() => {
    return sessions.find(s => s.id === sessionId);
  }, [sessions, sessionId]);

  useEffect(() => {
    if (!session) {
      navigate('/training/live-sessions');
    }
  }, [session, navigate]);

  if (!session) {
    return null;
  }

  const isFull = session.registeredCount >= session.maxCapacity;
  const spotsLeft = session.maxCapacity - session.registeredCount;
  const capacityPercentage = (session.registeredCount / session.maxCapacity) * 100;

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = t('training.enrollment.validation.fullNameRequired');
    }

    if (!formData.email.trim()) {
      errors.email = t('training.enrollment.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('training.enrollment.validation.emailInvalid');
    }

    if (!formData.phone.trim()) {
      errors.phone = t('training.enrollment.validation.phoneRequired');
    }

    if (!formData.jobTitle.trim()) {
      errors.jobTitle = t('training.enrollment.validation.jobTitleRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t('training.liveSessions.registration.error.title'), {
        description: t('training.enrollment.validation.fillRequired'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // ✅ Enregistrer dans l'historique
      addEntry({
        type: 'training_enrollment',
        organizationName: 'Assortis Training Platform',
        title: `${t('training.liveSessions.title')} - ${session.topic}`,
        message: `${t('training.enrollment.fullName')}: ${formData.fullName}\n${t('training.enrollment.email')}: ${formData.email}\n${t('training.enrollment.phone')}: ${formData.phone}\n${t('training.enrollment.jobTitle')}: ${formData.jobTitle}${formData.organizationName ? `\n${t('training.enrollment.organizationName')}: ${formData.organizationName}` : ''}\n\n${t('training.liveSessions.date')}: ${new Date(session.date).toLocaleString(getLocale())}\n${t('training.liveSessions.duration')}: ${session.duration} ${t('training.certifications.minutes')}\n${t('training.liveSessions.instructor')}: ${session.instructor.name}`,
        trainingCourse: session.courseTitle,
        trainingSession: session.topic,
        trainingInstructor: session.instructor.name,
        status: 'enrolled',
      });

      toast.success(t('training.liveSessions.registration.success.title'), {
        description: t('training.liveSessions.registration.success.message').replace('{topic}', session.topic),
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        organizationName: '',
        jobTitle: '',
      });

      // Redirect after success
      setTimeout(() => {
        navigate('/training/live-sessions');
      }, 1500);
    } catch (error) {
      toast.error(t('training.liveSessions.registration.error.title'), {
        description: t('training.liveSessions.registration.error.message'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof SessionEnrollmentFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors({ ...formErrors, [field]: undefined });
    }
  };

  const getSessionStatusColor = (status: SessionStatusEnum) => {
    switch (status) {
      case SessionStatusEnum.SCHEDULED:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case SessionStatusEnum.LIVE:
        return 'bg-red-50 text-red-700 border-red-200';
      case SessionStatusEnum.ENDED:
        return 'bg-green-50 text-green-700 border-green-200';
      case SessionStatusEnum.CANCELLED:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return '';
    }
  };

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
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Header */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Video className="w-7 h-7 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-primary">{session.topic}</h1>
                      <Badge variant="outline" className={getSessionStatusColor(session.status)}>
                        {session.status === SessionStatusEnum.LIVE && (
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
                        )}
                        {t(`training.sessionStatus.${session.status}`)}
                      </Badge>
                    </div>
                    <p className="text-base text-muted-foreground mb-2">{session.courseTitle}</p>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </div>
                </div>

                {/* Session Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">{t('training.liveSessions.date')}</span>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(session.date).toLocaleDateString(getLocale())}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">{t('training.liveSessions.duration')}</span>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {session.duration} {t('training.certifications.minutes')}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">{t('training.liveSessions.registered')}</span>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {session.registeredCount} / {session.maxCapacity}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground mb-1">{t('training.filters.language')}</span>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      {session.language}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enrollment Form */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-primary mb-1">{t('training.enrollment.title')}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t('training.liveSessions.enrollment.subtitle')}</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      {t('training.enrollment.fullName')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange('fullName')}
                      placeholder={t('training.enrollment.fullNamePlaceholder')}
                      className={formErrors.fullName ? 'border-red-500' : ''}
                    />
                    {formErrors.fullName && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" />
                      {t('training.enrollment.email')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      placeholder={t('training.enrollment.emailPlaceholder')}
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4" />
                      {t('training.enrollment.phone')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      placeholder={t('training.enrollment.phonePlaceholder')}
                      className={formErrors.phone ? 'border-red-500' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Job Title */}
                  <div>
                    <Label htmlFor="jobTitle" className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4" />
                      {t('training.enrollment.jobTitle')}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="jobTitle"
                      type="text"
                      value={formData.jobTitle}
                      onChange={handleInputChange('jobTitle')}
                      placeholder={t('training.enrollment.jobTitlePlaceholder')}
                      className={formErrors.jobTitle ? 'border-red-500' : ''}
                    />
                    {formErrors.jobTitle && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.jobTitle}
                      </p>
                    )}
                  </div>

                  {/* Organization Name (Optional) */}
                  <div>
                    <Label htmlFor="organizationName" className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4" />
                      {t('training.enrollment.organizationName')}
                      <span className="text-xs text-muted-foreground ml-1">({t('common.optional')})</span>
                    </Label>
                    <Input
                      id="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={handleInputChange('organizationName')}
                      placeholder={t('training.enrollment.organizationPlaceholder')}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex gap-3">
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 h-12 bg-[#B82547] hover:bg-[#a01f3c] text-white"
                      disabled={isSubmitting || isFull}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {t('training.liveSessions.registration.registering')}
                        </>
                      ) : isFull ? (
                        <>
                          <XCircle className="w-5 h-5 mr-2" />
                          {t('training.liveSessions.registration.full')}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {t('training.actions.register')}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="h-12 border-[#3d4654] text-[#3d4654] hover:bg-[#3d4654] hover:text-white"
                      onClick={() => navigate('/training/catalog')}
                    >
                      {t('training.actions.browseCatalog')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Instructor Card */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4">{t('training.liveSessions.instructor')}</h3>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{/* Nom masqué pour confidentialité */}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{session.instructor.title}</p>
                    <p className="text-xs text-muted-foreground">{session.instructor.bio}</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4">{t('training.enrollment.benefits')}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">{t('training.liveSessions.learn.point1')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">{t('training.liveSessions.learn.point2')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">{t('training.liveSessions.learn.point3')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary">{t('training.liveSessions.learn.point4')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-br from-[#3d4654] to-[#B82547] rounded-lg p-5 text-white">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">{t('training.enrollment.secureRegistration')}</h3>
                    <p className="text-sm text-white/90">{t('training.enrollment.dataProtection')}</p>
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