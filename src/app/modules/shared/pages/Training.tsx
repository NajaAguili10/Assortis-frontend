import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Progress } from '@app/components/ui/progress';
import { useTraining } from '@app/hooks/useTraining';
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { SessionStatusEnum } from '@app/types/training.dto';
import {
  GraduationCap,
  Award,
  BookOpen,
  FolderKanban,
  Video,
  Clock,
} from 'lucide-react';

export default function Training() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis, allCourses, sessions } = useTraining();
  const { activatedTrainings, completedTrainings, certificatesEarned, continueTraining } = useTrainingCommerce();

  const recommendedCourses = useMemo(
    () => allCourses.slice(0, 3),
    [allCourses],
  );

  const upcomingLiveSessions = useMemo(
    () => sessions.filter((session) => session.status === SessionStatusEnum.SCHEDULED || session.status === SessionStatusEnum.LIVE).slice(0, 3),
    [sessions],
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('training.dashboard.activeTrainings')}
              value={activatedTrainings.length.toString()}
              icon={FolderKanban}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('training.dashboard.completedTrainings')}
              value={completedTrainings.length.toString()}
              icon={BookOpen}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('training.stats.upcomingSessions')}
              value={upcomingLiveSessions.length.toString()}
              icon={Video}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('training.dashboard.certificatesEarned')}
              value={certificatesEarned.length.toString()}
              icon={Award}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionCard
                title={t('training.actions.browseCatalog')}
                icon={BookOpen}
                onClick={() => navigate('/training/catalog')}
              />
              <ActionCard
                title={t('training.dashboard.resumeTraining')}
                icon={FolderKanban}
                onClick={() => navigate('/training/activated-pills')}
              />
              <ActionCard
                title={t('training.dashboard.goToCheckout')}
                icon={Award}
                onClick={() => navigate('/training/checkout')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-lg border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">{t('training.dashboard.continueLearning')}</h3>
                <Button variant="outline" size="sm" onClick={() => navigate('/training/activated-pills')}>
                  {t('training.submenu.activatedPills')}
                </Button>
              </div>
              {activatedTrainings.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('training.activated.emptyMessage')}</p>
              ) : (
                <div className="space-y-4">
                  {activatedTrainings.map((item) => (
                    <div key={item.courseId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h4 className="font-medium text-primary">{item.title}</h4>
                        <Badge variant="secondary">{item.progress}%</Badge>
                      </div>
                      <Progress value={item.progress} className="h-2 mb-3" />
                      <Button size="sm" onClick={() => continueTraining(item.courseId)}>
                        {t('training.actions.continue')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-5">
              <h3 className="text-lg font-semibold text-primary mb-4">{t('training.dashboard.recommended')}</h3>
              <div className="space-y-3">
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="rounded-lg border p-3">
                    <p className="font-medium text-primary text-sm mb-1">{course.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{course.duration}h</p>
                    <Button size="sm" variant="outline" onClick={() => navigate('/training/catalog')}>
                      {t('training.actions.browseCatalog')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-5 mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-primary">{t('training.dashboard.upcomingLiveSessions')}</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/training/catalog')}>
                {t('training.submenu.catalog')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingLiveSessions.map((session) => (
                <div key={session.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-primary text-sm">{session.topic}</p>
                    <Badge className="bg-red-50 text-red-700 border-red-200" variant="outline">
                      {t('training.liveBadge')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{new Date(session.date).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {session.duration} {t('training.certifications.minutes')}
                  </p>
                  <Button size="sm" className="w-full" onClick={() => navigate('/training/catalog')}>
                    {t('training.actions.joinSession')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
