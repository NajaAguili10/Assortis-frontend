import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Badge } from '@app/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@app/components/ui/radio-group';
import { useTraining } from '@app/hooks/useTraining';
import type { TrainingCourseDTO } from '@app/types/training.dto';
import {
  GraduationCap,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  User,
  Building2,
  Users,
  CheckCircle,
  Minus,
  Plus,
  AlertCircle,
  Clock,
  Calendar,
  TrendingUp,
  Sparkles,
  Mail,
  Bell,
  ArrowRight,
  Shield,
  Target,
  XCircle,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

type EnrollmentType = 'INDIVIDUAL' | 'ORGANIZATION' | 'EXPERTS';
type EnrollmentOption = 'TRAINING_ONLY' | 'CERTIFICATION_ONLY' | 'BOTH';

interface EnrollmentFormData {
  fullName: string;
  email: string;
  phone: string;
  organizationName?: string;
  jobTitle: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  jobTitle?: string;
  organizationName?: string;
}

export default function TrainingEnrollment() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addHistoryEntry } = useAssistanceHistory();
  const { courseId } = useParams<{ courseId: string }>();
  const { courses, kpis } = useTraining();

  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('INDIVIDUAL');
  const [enrollmentOption, setEnrollmentOption] = useState<EnrollmentOption>('BOTH');
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EnrollmentFormData>({
    fullName: '',
    email: '',
    phone: '',
    organizationName: '',
    jobTitle: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const course = useMemo(() => {
    return courses.find(c => c.id === courseId);
  }, [courses, courseId]);

  const recommendedCourses = useMemo(() => {
    if (!course) return [];
    return courses
      .filter(c => c.id !== courseId && (
        c.level === course.level ||
        c.tags.some(tag => course.tags.includes(tag))
      ))
      .slice(0, 3);
  }, [courses, courseId, course]);

  useEffect(() => {
    if (!course) {
      navigate('/training/catalog');
    }
  }, [course, navigate]);

  const handleIncrement = () => {
    setParticipantCount(prev => Math.min(prev + 1, 100));
  };

  const handleDecrement = () => {
    setParticipantCount(prev => Math.max(prev - 1, 1));
  };

  const handleParticipantCountChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setParticipantCount(num);
    }
  };

  const calculateTotalPrice = () => {
    if (!course) return 0;
    
    let basePrice = 0;
    
    // Calculate base price based on selected option
    if (enrollmentOption === 'TRAINING_ONLY') {
      basePrice = course.price;
    } else if (enrollmentOption === 'CERTIFICATION_ONLY') {
      basePrice = course.certificationPrice || 0;
    } else if (enrollmentOption === 'BOTH') {
      // Apply a small discount when buying both
      const combinedPrice = course.price + (course.certificationPrice || 0);
      basePrice = combinedPrice * 0.95; // 5% discount for combined package
    }
    
    // Apply bulk discounts
    if (enrollmentType === 'ORGANIZATION') {
      if (participantCount >= 10) {
        basePrice = basePrice * 0.8;
      } else if (participantCount >= 5) {
        basePrice = basePrice * 0.9;
      }
    } else if (enrollmentType === 'EXPERTS') {
      if (participantCount >= 5) {
        basePrice = basePrice * 0.85;
      }
    }
    
    return basePrice * participantCount;
  };
  
  const getCombinedSavings = () => {
    if (!course || !course.certificationAvailable || enrollmentOption !== 'BOTH') return 0;
    const fullPrice = (course.price + (course.certificationPrice || 0)) * participantCount;
    const bundlePrice = (course.price + (course.certificationPrice || 0)) * 0.95 * participantCount;
    return fullPrice - bundlePrice;
  };

  const getDiscountPercentage = () => {
    if (enrollmentType === 'ORGANIZATION') {
      if (participantCount >= 10) return 20;
      if (participantCount >= 5) return 10;
    } else if (enrollmentType === 'EXPERTS') {
      if (participantCount >= 5) return 15;
    }
    return 0;
  };

  const isFormValid = () => {
    const baseValid = formData.fullName.trim() !== '' && 
                     formData.email.trim() !== '' && 
                     formData.jobTitle.trim() !== '';
    
    if (enrollmentType === 'ORGANIZATION') {
      return baseValid && formData.organizationName?.trim() !== '';
    }
    
    return baseValid;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validate full name
    if (!formData.fullName.trim()) {
      errors.fullName = t('training.enrollment.form.error.fullName');
    }
    
    // Validate email
    if (!formData.email.trim()) {
      errors.email = t('training.enrollment.form.error.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('training.enrollment.form.error.email.invalid');
    }
    
    // Validate job title
    if (!formData.jobTitle.trim()) {
      errors.jobTitle = t('training.enrollment.form.error.jobTitle');
    }
    
    // Validate organization name for ORGANIZATION type
    if (enrollmentType === 'ORGANIZATION' && !formData.organizationName?.trim()) {
      errors.organizationName = t('training.enrollment.form.error.organizationName');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEnroll = async () => {
    if (!course) return;

    // Validate form
    if (!validateForm()) {
      toast.error(t('training.enrollment.form.error.title'), {
        description: t('training.enrollment.form.error.message'),
        icon: <XCircle className="w-5 h-5" />,
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ✅ Enregistrer dans l'historique
    addHistoryEntry({
      type: 'training_enrollment',
      organizationName: 'Assortis Training Platform',
      title: `${t('training.enrollment.title')} - ${course.title}`,
      message: `${t('training.enrollment.form.fullName')}: ${formData.fullName}\n${t('training.enrollment.form.email')}: ${formData.email}${formData.phone ? `\n${t('training.enrollment.form.phone')}: ${formData.phone}` : ''}\n${t('training.enrollment.form.jobTitle')}: ${formData.jobTitle}${enrollmentType === 'ORGANIZATION' && formData.organizationName ? `\n${t('training.enrollment.form.organizationName')}: ${formData.organizationName}` : ''}\n\n${t('training.enrollment.type.label')}: ${t(`training.enrollment.type.${enrollmentType}`)}\n${t('training.enrollment.option.label')}: ${enrollmentOption === 'TRAINING_ONLY' ? t('training.enrollment.option.trainingOnly') : enrollmentOption === 'CERTIFICATION_ONLY' ? t('training.enrollment.option.certificationOnly') : t('training.enrollment.option.both')}\n${t('training.enrollment.numberOfParticipants')}: ${participantCount}\n${t('training.enrollment.totalPrice')}: $${totalPrice.toFixed(2)}`,
      trainingCourse: course.title,
      trainingDuration: `${course.duration}h`,
      trainingInstructor: course.instructor.name,
      status: 'enrolled',
    });
    
    // Show success notification via Assortis Notification System
    const notificationMessage = t('training.enrollment.notification.message')
      .replace('{course}', course.title)
      .replace('{count}', participantCount.toString());
    
    toast.success(t('training.enrollment.notification.title'), {
      description: notificationMessage,
      icon: <Bell className="w-5 h-5" />,
      duration: 5000,
    });

    // Simulate email sent
    const emailMessage = t('training.enrollment.email.sent')
      .replace('{email}', formData.email);
    
    toast.info(t('training.enrollment.email.title'), {
      description: emailMessage,
      icon: <Mail className="w-5 h-5" />,
      duration: 5000,
    });
    
    setIsSubmitting(false);
    
    // Redirect to catalog after 2 seconds
    setTimeout(() => {
      navigate('/training/catalog');
    }, 2000);
  };

  if (!course) return null;

  const totalPrice = calculateTotalPrice();
  const discount = getDiscountPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        title={t('training.hub.title')}
        description={t('training.hub.subtitle')}
        icon={GraduationCap}
        stats={[
          { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
        ]}
      />

      {/* Sub Menu */}
      <SubMenu
        items={[
          { label: t('training.submenu.catalog'), icon: BookOpen, onClick: () => navigate('/training/catalog') },
          { label: t('training.submenu.liveSessions'), icon: Video, onClick: () => navigate('/training/live-sessions') },
          { label: t('training.submenu.trainers'), icon: UserCheck, onClick: () => navigate('/training/trainers') },
          { label: t('training.submenu.certifications'), icon: Award, onClick: () => navigate('/training/certifications') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Enrollment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header Card */}
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-[#3d4654] to-[#B82547]" />
                
                {/* Course Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          {t(`training.level.${course.level}`)}
                        </Badge>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                          {t(`training.format.${course.format}`)}
                        </Badge>
                        {course.certificate && (
                          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Award className="w-3 h-3 mr-1" />
                            {t('training.catalog.certificate')}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-[#3d4654] mb-2">{course.title}</h1>
                      <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                    </div>
                  </div>

                  {/* Course Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t">
                    <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex justify-center mb-1">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.catalog.instructor')}</p>
                      <p className="font-semibold text-sm text-[#3d4654]">{/* Nom masqué pour confidentialité */}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="flex justify-center mb-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.catalog.duration')}</p>
                      <p className="font-semibold text-sm text-[#3d4654]">{course.duration} {t('training.stats.hours')}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex justify-center mb-1">
                        <BookOpen className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.catalog.modules')}</p>
                      <p className="font-semibold text-sm text-[#3d4654]">{course.modules}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-100">
                      <div className="flex justify-center mb-1">
                        <Globe className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.enrollment.language')}</p>
                      <p className="font-semibold text-sm text-[#3d4654]">{course.language}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrollment Type Selection */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.enrollment.selectType')}</h2>
                </div>
                
                <RadioGroup
                  value={enrollmentType}
                  onValueChange={(value) => {
                    setEnrollmentType(value as EnrollmentType);
                    setParticipantCount(1);
                  }}
                >
                  {/* Individual */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="INDIVIDUAL" id="individual" />
                    <label htmlFor="individual" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[#3d4654]" />
                        </div>
                        <div>
                          <p className="font-medium text-primary">{t('training.enrollment.type.INDIVIDUAL')}</p>
                          <p className="text-xs text-muted-foreground">{t('training.enrollment.type.INDIVIDUAL.description')}</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Organization */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="ORGANIZATION" id="organization" />
                    <label htmlFor="organization" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-primary">{t('training.enrollment.type.ORGANIZATION')}</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              {t('training.enrollment.discount.available')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{t('training.enrollment.type.ORGANIZATION.description')}</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Experts */}
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <RadioGroupItem value="EXPERTS" id="experts" />
                    <label htmlFor="experts" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-primary">{t('training.enrollment.type.EXPERTS')}</p>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                              {t('training.enrollment.discount.bulk')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{t('training.enrollment.type.EXPERTS.description')}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Options Selection - Training/Certification */}
              {course.certificationAvailable && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-[#3d4654]" />
                    <h2 className="text-lg font-bold text-primary">{t('training.enrollment.selectOptions')}</h2>
                  </div>
                  
                  <RadioGroup
                    value={enrollmentOption}
                    onValueChange={(value) => setEnrollmentOption(value as EnrollmentOption)}
                  >
                    {/* Training Only */}
                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <RadioGroupItem value="TRAINING_ONLY" id="training-only" />
                      <label htmlFor="training-only" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-[#3d4654]" />
                            </div>
                            <div>
                              <p className="font-medium text-primary">{t('training.enrollment.option.trainingOnly')}</p>
                              <p className="text-xs text-muted-foreground">{t('training.enrollment.option.trainingOnly.description')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">${course.price}</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Certification Only */}
                    <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <RadioGroupItem value="CERTIFICATION_ONLY" id="certification-only" />
                      <label htmlFor="certification-only" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                              <Award className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-primary">{t('training.enrollment.option.certificationOnly')}</p>
                              <p className="text-xs text-muted-foreground">{t('training.enrollment.option.certificationOnly.description')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">${course.certificationPrice}</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Both - Training + Certification */}
                    <div className="flex items-center space-x-3 border-2 border-[#B82547] rounded-lg p-4 hover:bg-[#B82547]/5 cursor-pointer transition-colors">
                      <RadioGroupItem value="BOTH" id="both" />
                      <label htmlFor="both" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#B82547]/10 rounded-full flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-[#B82547]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-primary">{t('training.enrollment.option.both')}</p>
                                <Badge className="bg-[#B82547] text-white border-[#B82547] text-xs">
                                  {t('training.enrollment.option.both.savings').replace('{amount}', `$${getCombinedSavings().toFixed(0)}`)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{t('training.enrollment.option.both.description')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#B82547]">${((course.price + (course.certificationPrice || 0)) * 0.95).toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground line-through">${course.price + (course.certificationPrice || 0)}</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Participant Count */}
              {(enrollmentType === 'ORGANIZATION' || enrollmentType === 'EXPERTS') && (
                <div className="bg-white rounded-lg border p-6">
                  <Label className="text-sm font-semibold text-primary mb-3 block">
                    {t('training.enrollment.participantCount')}
                  </Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleDecrement}
                      disabled={participantCount <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={participantCount}
                      onChange={(e) => handleParticipantCountChange(e.target.value)}
                      className="w-24 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleIncrement}
                      disabled={participantCount >= 100}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {t('training.enrollment.participants')}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          {t('training.enrollment.discount.applied')}
                        </p>
                        <p className="text-xs text-green-700">
                          {t('training.enrollment.discount.message').replace('{percent}', discount.toString())}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Registration Form */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-bold text-primary mb-4">{t('training.enrollment.form.title')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium text-primary">
                        {t('training.enrollment.form.fullName')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder={t('training.enrollment.form.fullName.placeholder')}
                        required
                      />
                      {formErrors.fullName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-primary">
                        {t('training.enrollment.form.email')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t('training.enrollment.form.email.placeholder')}
                        required
                      />
                      {formErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-primary">
                        {t('training.enrollment.form.phone')}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t('training.enrollment.form.phone.placeholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle" className="text-sm font-medium text-primary">
                        {t('training.enrollment.form.jobTitle')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                        placeholder={t('training.enrollment.form.jobTitle.placeholder')}
                        required
                      />
                      {formErrors.jobTitle && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.jobTitle}</p>
                      )}
                    </div>
                  </div>

                  {enrollmentType === 'ORGANIZATION' && (
                    <div>
                      <Label htmlFor="organizationName" className="text-sm font-medium text-primary">
                        {t('training.enrollment.form.organizationName')} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                        placeholder={t('training.enrollment.form.organizationName.placeholder')}
                        required
                      />
                      {formErrors.organizationName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.organizationName}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">
                      {t('training.enrollment.important')}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {t('training.enrollment.important.message')}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleEnroll}
                  disabled={isSubmitting || !isFormValid()}
                  className="w-full bg-[#B82547] hover:bg-[#a01f3c] h-12 text-base text-white"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {t('training.enrollment.processing')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {t('training.enrollment.confirm')} - ${totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right Column - Price Summary & Recommendations */}
            <div className="space-y-6">
              {/* Price Summary - Sticky */}
              <div className="bg-white rounded-lg border p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-primary">{t('training.enrollment.summary.title')}</h3>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Price Breakdown */}
                  {course.certificationAvailable && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-primary mb-2">{t('training.enrollment.priceBreakdown')}:</p>
                      <div className="space-y-1">
                        {(enrollmentOption === 'TRAINING_ONLY' || enrollmentOption === 'BOTH') && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{t('training.enrollment.trainingPrice')}:</span>
                            <span className="font-medium text-primary">${course.price}</span>
                          </div>
                        )}
                        {(enrollmentOption === 'CERTIFICATION_ONLY' || enrollmentOption === 'BOTH') && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{t('training.enrollment.certificationFee')}:</span>
                            <span className="font-medium text-primary">${course.certificationPrice}</span>
                          </div>
                        )}
                        {enrollmentOption === 'BOTH' && (
                          <div className="flex items-center justify-between text-xs pt-1 border-t">
                            <span className="text-muted-foreground">{t('training.enrollment.subtotal')}:</span>
                            <span className="font-medium text-primary">${((course.price + (course.certificationPrice || 0)) * 0.95).toFixed(0)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('training.enrollment.pricePerParticipant')}:</span>
                    <span className="font-medium text-primary">${
                      enrollmentOption === 'TRAINING_ONLY' ? course.price :
                      enrollmentOption === 'CERTIFICATION_ONLY' ? course.certificationPrice :
                      ((course.price + (course.certificationPrice || 0)) * 0.95).toFixed(0)
                    }</span>
                  </div>
                  {enrollmentType !== 'INDIVIDUAL' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('training.enrollment.numberOfParticipants')}:</span>
                      <span className="font-medium text-primary">×{participantCount}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700">{t('training.enrollment.discount.label')}:</span>
                      <span className="font-medium text-green-700">-{discount}%</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-primary">{t('training.enrollment.totalPrice')}:</span>
                    <span className="text-3xl font-bold text-[#B82547]">${totalPrice.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <p className="text-xs text-green-600 text-right">
                      {t('training.enrollment.summary.savings')}: ${((course.price * participantCount) - totalPrice).toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{t('training.enrollment.summary.guarantee')}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-[#3d4654] flex-shrink-0 mt-0.5" />
                    <span>{t('training.enrollment.summary.certificate')}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>{t('training.enrollment.summary.access')}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Courses */}
              {recommendedCourses.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#3d4654]" />
                    <h3 className="font-bold text-primary">{t('training.enrollment.recommended.title')}</h3>
                  </div>
                  <div className="space-y-3">
                    {recommendedCourses.map((recCourse) => (
                      <div
                        key={recCourse.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/training/enroll/${recCourse.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-[#3d4654]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-primary line-clamp-2 mb-2">
                              {recCourse.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {recCourse.duration}h
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#B82547] text-sm">${recCourse.price}</span>
                              <ArrowRight className="w-4 h-4 text-[#3d4654]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}