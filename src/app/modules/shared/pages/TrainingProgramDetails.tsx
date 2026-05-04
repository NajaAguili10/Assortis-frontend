import { useMemo, useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
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
  Star,
  Clock,
  Calendar,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  FileText,
  Download,
  Users,
  Globe,
  Target,
  BookMarked,
  AlertCircle,
  Send,
  Mail,
  Loader2,
} from 'lucide-react';
import { Progress } from '@app/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import { Label } from '@app/components/ui/label';
import { toast } from 'sonner';

type ResourceType = 'handbook' | 'exercises' | 'slides';

export default function TrainingProgramDetails() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const { enrolledCourses, allCourses, kpis } = useTraining();

  // Contact Dialog State
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Download State
  const [downloadingResource, setDownloadingResource] = useState<ResourceType | null>(null);

  // Handle Resource Download
  const handleDownload = async (resourceType: ResourceType) => {
    setDownloadingResource(resourceType);

    const resourceNames = {
      handbook: t('training.programDetails.courseHandbook'),
      exercises: t('training.programDetails.exerciseFiles'),
      slides: t('training.programDetails.slides'),
    };

    const resourceFiles = {
      handbook: `${courseDetails.title.replace(/\s+/g, '_')}_Handbook.pdf`,
      exercises: `${courseDetails.title.replace(/\s+/g, '_')}_Exercises.zip`,
      slides: `${courseDetails.title.replace(/\s+/g, '_')}_Slides.pdf`,
    };

    try {
      // Show downloading toast
      toast.loading(t('training.resources.downloading'), {
        description: t('training.resources.downloadingFile').replace('{file}', resourceNames[resourceType]),
        id: `download-${resourceType}`,
      });

      // Simulate download delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dismiss loading toast
      toast.dismiss(`download-${resourceType}`);

      // Show success toast
      toast.success(t('training.resources.downloadSuccess'), {
        description: t('training.resources.downloadComplete').replace('{file}', resourceNames[resourceType]),
      });

      // In production: trigger actual file download
      // const link = document.createElement('a');
      // link.href = `/api/resources/${resourceType}/${programId}`;
      // link.download = resourceFiles[resourceType];
      // link.click();

    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(`download-${resourceType}`);

      // Show error toast
      toast.error(t('training.resources.downloadError'), {
        description: t('training.resources.downloadFailed').replace('{file}', resourceNames[resourceType]),
      });
    } finally {
      setDownloadingResource(null);
    }
  };

  // Handle Continue Learning
  const handleContinueLearning = () => {
    try {
      toast.success(t('training.actions.continue'), {
        description: t('training.programDetails.continueLearning.message')
      });
      // En production: Redirection vers la plateforme LMS
      // navigate(`/training/learning-platform/${enrolledProgram.id}`);
    } catch (error) {
      console.error('Error showing toast:', error);
      // Fallback si le toast ne fonctionne pas
      alert(t('training.programDetails.continueLearning.message'));
    }
  };

  // Handle Contact Trainer
  const handleContactTrainer = async () => {
    // Validation
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error(t('training.contact.error.title'), {
        description: t('training.contact.error.message')
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate sending the contact form
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(t('training.contact.success.title'), {
        description: t('training.contact.success.message').replace('{name}', courseDetails.instructor.name)
      });
      
      // Reset form
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setContactDialogOpen(false);
    } catch (error) {
      toast.error(t('training.contact.error.title'), {
        description: t('training.contact.error.message')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const enrolledProgram = useMemo(() => {
    if (!enrolledCourses || !Array.isArray(enrolledCourses)) return null;
    return enrolledCourses.find(p => p.id === programId);
  }, [enrolledCourses, programId]);

  const courseDetails = useMemo(() => {
    if (!enrolledProgram || !allCourses || !Array.isArray(allCourses)) return null;
    return allCourses.find(c => c.id === enrolledProgram.courseId);
  }, [enrolledProgram, allCourses]);

  const relatedCourses = useMemo(() => {
    if (!courseDetails || !allCourses || !Array.isArray(allCourses)) return [];
    return allCourses
      .filter(c => c.id !== courseDetails.id && (
        c.level === courseDetails.level ||
        c.tags.some(tag => courseDetails.tags.includes(tag))
      ))
      .slice(0, 3);
  }, [allCourses, courseDetails]);

  if (!enrolledProgram || !courseDetails) {
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
        <TrainingSubMenu />
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6">
            <div className="text-center py-12 bg-white rounded-lg border">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('training.programDetails.notFound')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('training.programDetails.notFound.message')}</p>
              <Button onClick={() => navigate('/training/catalog')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('training.enrollment.backToCatalog')}
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  const progressPercentage = Math.round((enrolledProgram.completedModules / courseDetails.modules) * 100);

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
      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/training/catalog')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('training.enrollment.backToCatalog')}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Program Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header Card - Assortis Colors */}
              <div className="bg-gradient-to-r from-[#3d4654] to-[#2d3540] rounded-lg p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-white/20 text-white border-white/30">
                        {t(`training.level.${courseDetails.level}`)}
                      </Badge>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {t(`training.format.${courseDetails.format}`)}
                      </Badge>
                      {enrolledProgram.status === 'COMPLETED' && (
                        <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t(`training.status.${enrolledProgram.status}`)}
                        </Badge>
                      )}
                      {enrolledProgram.certificateEarned && (
                        <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30">
                          <Award className="w-3 h-3 mr-1" />
                          {t('training.programDetails.certified')}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{courseDetails.title}</h1>
                    <p className="text-gray-200 text-sm">{courseDetails.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{courseDetails.rating}</span>
                    </div>
                    <p className="text-xs text-gray-200">{courseDetails.enrolledCount} {t('training.catalog.enrolled')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-xs text-gray-200 mb-1">{t('training.catalog.instructor')}</p>
                    <p className="font-medium text-sm">{/* Nom masqué pour confidentialité */}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-200 mb-1">{t('training.catalog.duration')}</p>
                    <p className="font-medium text-sm">{courseDetails.duration} {t('training.stats.hours')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-200 mb-1">{t('training.catalog.modules')}</p>
                    <p className="font-medium text-sm">{courseDetails.modules}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-200 mb-1">{t('training.programDetails.language')}</p>
                    <p className="font-medium text-sm">{courseDetails.language}</p>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.programDetails.yourProgress')}</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-primary">{t('training.myPrograms.progress')}</span>
                      <span className="text-2xl font-bold text-[#B82547]">{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.myPrograms.completed')}</p>
                      <p className="text-lg font-semibold text-primary">
                        {enrolledProgram.completedModules} / {courseDetails.modules}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.myPrograms.lastAccess')}</p>
                      <p className="text-sm font-medium text-primary">{enrolledProgram.lastAccessDate}</p>
                    </div>
                  </div>

                  {enrolledProgram.nextSession && (
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {t('training.myPrograms.nextSession')}
                        </p>
                        <p className="text-xs text-blue-700">{enrolledProgram.nextSession.date} - {enrolledProgram.nextSession.topic}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.programDetails.courseContent')}</h2>
                </div>

                <div className="space-y-3">
                  {Array.from({ length: courseDetails.modules }).map((_, index) => {
                    const isCompleted = index < enrolledProgram.completedModules;
                    const isCurrent = index === enrolledProgram.completedModules;

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted ? 'bg-green-100' : isCurrent ? 'bg-blue-100' : 'bg-gray-200'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : isCurrent ? (
                            <PlayCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            isCompleted ? 'text-green-900' : isCurrent ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {t('training.programDetails.module')} {index + 1}: {t('training.programDetails.moduleTitle')} {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Math.floor(courseDetails.duration / courseDetails.modules)} {t('training.stats.hours')}
                          </p>
                        </div>
                        {isCurrent && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            {t('training.programDetails.current')}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learning Resources */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.programDetails.resources')}</h2>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{t('training.programDetails.courseHandbook')}</p>
                        <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload('handbook')}
                      disabled={downloadingResource === 'handbook'}
                    >
                      {downloadingResource === 'handbook' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{t('training.programDetails.exerciseFiles')}</p>
                        <p className="text-xs text-muted-foreground">ZIP • 15.8 MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload('exercises')}
                      disabled={downloadingResource === 'exercises'}
                    >
                      {downloadingResource === 'exercises' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{t('training.programDetails.slides')}</p>
                        <p className="text-xs text-muted-foreground">PDF • 8.1 MB</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload('slides')}
                      disabled={downloadingResource === 'slides'}
                    >
                      {downloadingResource === 'slides' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {enrolledProgram.certificateEarned && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="w-full h-12 text-base border-[#3d4654] text-[#3d4654] hover:bg-gray-50"
                      size="lg"
                      onClick={() => navigate('/training/portfolio')}
                    >
                      <Award className="w-5 h-5 mr-2" />
                      {t('training.actions.viewCertificate')}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Instructor & Recommendations */}
            <div className="space-y-6">
              {/* Instructor Info - Sticky */}
              <div className="bg-white rounded-lg border p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-5 h-5 text-[#3d4654]" />
                  <h3 className="font-bold text-primary">{t('training.programDetails.instructor')}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">{/* Nom masqué pour confidentialité */}</h4>
                      <p className="text-xs text-muted-foreground">{courseDetails.instructor.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    {courseDetails.instructor.courses && (
                      <div className="flex items-center gap-2 text-xs">
                        <GraduationCap className="w-4 h-4 text-[#3d4654]" />
                        <span className="text-muted-foreground">
                          {courseDetails.instructor.courses} {t('training.trainers.courses')}
                        </span>
                      </div>
                    )}
                    {courseDetails.instructor.students && (
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-4 h-4 text-[#3d4654]" />
                        <span className="text-muted-foreground">
                          {courseDetails.instructor.students.toLocaleString()} {t('training.trainers.students')}
                        </span>
                      </div>
                    )}
                    {courseDetails.instructor.rating && (
                      <div className="flex items-center gap-2 text-xs">
                        <Star className="w-4 h-4 text-[#3d4654]" />
                        <span className="text-muted-foreground">
                          {courseDetails.instructor.rating} {t('training.programDetails.rating')}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setContactDialogOpen(true)}
                  >
                    {t('training.actions.contactTrainer')}
                  </Button>
                </div>
              </div>

              {/* Related Courses */}
              {relatedCourses.length > 0 && (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#3d4654]" />
                    <h3 className="font-bold text-primary">{t('training.programDetails.relatedCourses')}</h3>
                  </div>
                  <div className="space-y-3">
                    {relatedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/training/enroll/${course.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-[#3d4654]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-primary line-clamp-2 mb-1">
                              {course.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {course.rating}
                              </span>
                              <span>•</span>
                              <span>{course.duration}h</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#B82547] text-sm">${course.price}</span>
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

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('training.contact.title')}</DialogTitle>
            <DialogDescription>
              {t('training.contact.subtitle', { name: courseDetails.instructor.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('training.contact.form.name')}</Label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder={t('training.contact.form.name.placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('training.contact.form.email')}</Label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder={t('training.contact.form.email.placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t('training.contact.form.subject')}</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                placeholder={t('training.contact.form.subject.placeholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t('training.contact.form.message')}</Label>
              <Textarea
                id="message"
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder={t('training.contact.form.message.placeholder')}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setContactDialogOpen(false)}
              disabled={isSubmitting}
            >
              {t('training.contact.form.cancel')}
            </Button>
            <Button
              className="flex-1 bg-[#B82547] hover:bg-[#a01f3c] text-white"
              onClick={handleContactTrainer}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Mail className="w-4 h-4 mr-2 animate-pulse" />
                  {t('training.contact.form.sending')}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('training.contact.form.send')}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
