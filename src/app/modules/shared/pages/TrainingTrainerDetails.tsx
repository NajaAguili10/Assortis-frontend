import { useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { useTraining } from '@app/hooks/useTraining';
import {
  GraduationCap,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  Globe,
  CheckCircle,
  Clock,
  Target,
  Briefcase,
  TrendingUp,
} from 'lucide-react';

export default function TrainingTrainerDetails() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { trainerId } = useParams<{ trainerId: string }>();
  const { trainers, courses, kpis } = useTraining();

  const trainer = useMemo(() => {
    return trainers.find(tr => tr.id === trainerId);
  }, [trainers, trainerId]);

  const trainerCourses = useMemo(() => {
    if (!trainer) return [];
    return courses.filter(course => course.instructor.name === trainer.name);
  }, [courses, trainer]);

  if (!trainer) {
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
        <SubMenu
          items={[
            { label: t('training.submenu.catalog'), icon: BookOpen, onClick: () => navigate('/training/catalog') },
            { label: t('training.submenu.liveSessions'), icon: Video, onClick: () => navigate('/training/live-sessions') },
            { label: t('training.submenu.trainers'), active: true, icon: UserCheck },
            { label: t('training.submenu.certifications'), icon: Award, onClick: () => navigate('/training/certifications') },
          ]}
        />
        <PageContainer className="my-6">
          <div className="text-center py-12 bg-white rounded-lg border">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary mb-1">{t('training.trainerDetails.notFound')}</h3>
            <p className="text-sm text-muted-foreground">{t('training.trainerDetails.notFound.message')}</p>
            <Button
              variant="default"
              size="lg"
              className="mt-4 bg-[#B82547] hover:bg-[#a01f3c] text-white"
              onClick={() => navigate('/training/trainers')}
            >
              {t('training.trainerDetails.backToTrainers')}
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

      <SubMenu
        items={[
          { label: t('training.submenu.catalog'), icon: BookOpen, onClick: () => navigate('/training/catalog') },
          { label: t('training.submenu.liveSessions'), icon: Video, onClick: () => navigate('/training/live-sessions') },
          { label: t('training.submenu.trainers'), active: true, icon: UserCheck },
          { label: t('training.submenu.certifications'), icon: Award, onClick: () => navigate('/training/certifications') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Trainer Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trainer Header Card */}
              <div className="bg-white rounded-lg border overflow-hidden">
                {/* Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-[#3d4654] to-[#B82547]" />
                
                {/* Profile Content */}
                <div className="p-6">
                  <div className="flex items-start gap-6 mb-6">
                    {/* Avatar with shadow */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#3d4654] to-[#B82547] rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                        {trainer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-2xl font-bold text-[#3d4654] mb-2">{/* Nom masqué pour confidentialité */}</h1>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-[#B82547] flex-shrink-0" />
                        <p className="text-base text-[#3d4654] font-medium">{trainer.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{trainer.organization}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-5 border-t">
                    <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <div className="flex justify-center mb-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-[#3d4654] mb-1">{trainer.coursesCount}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('training.trainers.courses')}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="flex justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-[#3d4654] mb-1">{trainer.yearsExperience}+</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('training.trainers.experience')}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex justify-center mb-2">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-[#3d4654] mb-1">{trainer.certifications.length}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('training.trainers.certifications')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.trainerDetails.about')}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{trainer.bio}</p>
              </div>

              {/* Expertise Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.trainers.expertise')}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainer.expertise.map((exp, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Courses Section */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#3d4654]" />
                  <h2 className="text-lg font-bold text-primary">{t('training.trainerDetails.coursesTaught')}</h2>
                </div>
                {trainerCourses.length > 0 ? (
                  <div className="space-y-3">
                    {trainerCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/training/enroll/${course.id}`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-primary">{course.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {t(`training.level.${course.level}`)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {course.duration} {t('training.stats.hours')}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {course.modules} {t('training.catalog.modules')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#B82547]">${course.price}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {t('training.trainerDetails.noCourses')}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Sectors Card */}
              <div className="bg-white rounded-lg border p-5 sticky top-6">
                <h3 className="font-bold text-primary mb-4">{t('training.trainers.sectors')}</h3>
                <div className="space-y-2">
                  {trainer.sectors.map((sector) => (
                    <div key={sector} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{t(`projects.sector.${sector}`)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Card */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t('training.trainers.languages')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.languages.map((lang, idx) => (
                    <Badge key={idx} variant="secondary">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications Card */}
              <div className="bg-white rounded-lg border p-5">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  {t('training.trainers.certifications')}
                </h3>
                <div className="space-y-2">
                  {trainer.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[#3d4654] to-[#B82547] rounded-lg p-5 text-white">
                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2">{t('training.trainerDetails.cta.title')}</h3>
                  <p className="text-sm text-white/90">{t('training.trainerDetails.cta.subtitle')}</p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-white text-[#3d4654] hover:bg-gray-100"
                  onClick={() => navigate('/training/catalog')}
                >
                  {t('training.actions.browseCatalog')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}