import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
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
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  Calendar,
  Clock,
  Users,
  Play,
  Globe,
  Info,
} from 'lucide-react';

export default function TrainingLiveSessions() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { sessions, kpis } = useTraining();

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

  const upcomingSessions = sessions.filter(s => s.status === SessionStatusEnum.SCHEDULED || s.status === SessionStatusEnum.LIVE);
  const pastSessions = sessions.filter(s => s.status === SessionStatusEnum.ENDED);

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
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('training.liveSessions.title')}</h2>
            <p className="text-muted-foreground">{t('training.liveSessions.subtitle')}</p>
          </div>

          {/* Upcoming Sessions */}
          {upcomingSessions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-4">{t('training.status.UPCOMING')}</h3>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-primary">{session.topic}</h3>
                              <Badge variant="outline" className={getSessionStatusColor(session.status)}>
                                {session.status === SessionStatusEnum.LIVE && (
                                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />
                                )}
                                {session.status === SessionStatusEnum.LIVE ? t('training.liveBadge') : t(`training.sessionStatus.${session.status}`)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{session.courseTitle}</p>
                            <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
                          </div>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-2 mb-3">
                          <UserCheck className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-primary">{/* Nom masqué pour confidentialité */}</span>
                          <span className="text-sm text-muted-foreground">• {session.instructor.title}</span>
                        </div>

                        {/* Session Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                            <Progress value={(session.registeredCount / session.maxCapacity) * 100} className="h-1 mt-1" />
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground mb-1">{t('training.filters.language')}</span>
                            <span className="text-sm font-semibold text-primary flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              {session.language}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/training/live-session-details/${session.id}`)}
                          >
                            <Info className="w-4 h-4 mr-2" />
                            {t('training.actions.viewDetails')}
                          </Button>
                          {session.status === SessionStatusEnum.LIVE ? (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="bg-red-500 hover:bg-red-600"
                              onClick={() => navigate(`/training/live-session-details/${session.id}`)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {t('training.actions.joinLiveSession')}
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                              onClick={() => navigate(`/training/session-enroll/${session.id}`)}
                            >
                              {t('training.actions.register')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Sessions (with recordings) */}
          {pastSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">{t('training.status.COMPLETED')}</h3>
              <div className="space-y-4">
                {pastSessions.map((session) => (
                  <div key={session.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow opacity-75">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-primary">{session.topic}</h3>
                              <Badge variant="outline" className={getSessionStatusColor(session.status)}>
                                {t(`training.sessionStatus.${session.status}`)}
                              </Badge>
                              {session.recordingUrl && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('training.liveSessions.recording')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{session.courseTitle}</p>
                          </div>
                        </div>

                        {/* Instructor & Date */}
                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4" />
                            {/* Nom masqué pour confidentialité */}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(session.date).toLocaleDateString(getLocale())}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.duration} min
                          </span>
                        </div>

                        {/* Action Button */}
                        {session.recordingUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/training/recording-player/${session.id}`)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {t('training.actions.watchRecording')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('training.liveSessions.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('training.liveSessions.noResults.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}