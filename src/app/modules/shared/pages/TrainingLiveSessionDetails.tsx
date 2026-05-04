import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate, useParams } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useTraining } from '@app/hooks/useTraining';
import { SessionStatusEnum } from '@app/types/training.dto';
import {
  GraduationCap,
  BookOpen,
  Video,
  UserCheck,
  Award,
  Calendar,
  Clock,
  Users,
  Play,
  Globe,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function TrainingLiveSessionDetails() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, kpis } = useTraining();

  // Find the session
  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
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
            <div className="text-center py-12 bg-white rounded-lg border">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('common.notFound')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('training.liveSessions.noResults.message')}</p>
              <Button onClick={() => navigate('/training/catalog')}>
                {t('actions.back')}
              </Button>
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

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

  const isFull = session.registeredCount >= session.maxCapacity;

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

      {/* Sub Menu */}
      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Session Header */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Badge variant="outline" className={getSessionStatusColor(session.status)}>
                    {session.status === SessionStatusEnum.LIVE && (
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
                    )}
                    {t(`training.sessionStatus.${session.status}`)}
                  </Badge>
                  {session.recordingUrl && (
                    <Badge variant="secondary" className="text-xs">
                      {t('training.liveSessions.recording')}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-primary mb-3">{session.topic}</h1>
                <p className="text-lg text-muted-foreground mb-4">{session.courseTitle}</p>
                <p className="text-base text-muted-foreground leading-relaxed">{session.description}</p>
              </div>

              {/* Session Details */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('training.liveSessions.sessionDetails')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.liveSessions.date')}</p>
                      <p className="text-sm font-semibold text-primary">
                        {new Date(session.date).toLocaleDateString(getLocale(), { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.date).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.liveSessions.duration')}</p>
                      <p className="text-sm font-semibold text-primary">{session.duration} {t('training.certifications.minutes')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{t('training.filters.language')}</p>
                      <p className="text-sm font-semibold text-primary">{session.language}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">{t('training.liveSessions.registered')}</p>
                      <p className="text-sm font-semibold text-primary mb-2">
                        {session.registeredCount} / {session.maxCapacity}
                      </p>
                      <Progress value={(session.registeredCount / session.maxCapacity) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('training.liveSessions.instructor')}</h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-lg">{/* Nom masqué pour confidentialité */}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{session.instructor.title}</p>
                    <p className="text-sm text-muted-foreground">{session.instructor.bio}</p>
                  </div>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('training.liveSessions.whatYouLearn')}</h2>
                <ul className="space-y-3">
                  {[
                    t('training.liveSessions.learn.point1'),
                    t('training.liveSessions.learn.point2'),
                    t('training.liveSessions.learn.point3'),
                    t('training.liveSessions.learn.point4'),
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold text-primary mb-4">{t('training.liveSessions.prerequisites')}</h2>
                <ul className="space-y-3">
                  {[
                    t('training.liveSessions.prerequisite.point1'),
                    t('training.liveSessions.prerequisite.point2'),
                    t('training.liveSessions.prerequisite.point3'),
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Materials */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-bold text-primary mb-4">{t('training.liveSessions.materials')}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{t('training.liveSessions.sessionSlides')}</p>
                        <p className="text-xs text-muted-foreground">PDF • 3.2 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{t('training.liveSessions.handout')}</p>
                        <p className="text-xs text-muted-foreground">PDF • 1.8 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Related Course */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-bold text-primary mb-4">{t('training.liveSessions.relatedCourse')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">{session.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">{t('training.catalog.subtitle')}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/training/catalog')}
                  >
                    {t('training.actions.viewDetails')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
