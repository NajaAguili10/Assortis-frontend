import { AccessDenied } from '@app/components/AccessDenied';
import { CollaborationScoringRow } from '@app/components/CollaborationScoringRow';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { ScoreLegendPanel } from '@app/components/ScoreLegendPanel';
import { StatCard } from '@app/components/StatCard';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useExpertProjectsScoring } from '@app/modules/expert/hooks/useExpertProjectsScoring';
import { toast } from 'sonner';
import { ClipboardList, Star, Target, TriangleAlert } from 'lucide-react';

export default function ProjectsOrganizationsScoring() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    scoringRows,
    overallOrganizationsAverage,
    scoredOrganizationsCount,
    pendingEvaluationsCount,
    recentlyScoredCount,
    saveCollaborationScore,
  } = useExpertProjectsScoring();

  const hasAccess = user?.accountType === 'expert';

  return (
    <div className="min-h-screen">
      <PageBanner
        icon={Star}
        title={t('projects.scoring.title')}
        description={t('projects.scoring.subtitle')}
      />

      <ProjectsSubMenu />

      {!hasAccess ? (
        <AccessDenied module="projects" accountType={user?.accountType} />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title={t('projects.scoring.stats.scoredOrganizations')}
                value={scoredOrganizationsCount}
                icon={Star}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
              />
              <StatCard
                title={t('projects.scoring.stats.pendingEvaluations')}
                value={pendingEvaluationsCount}
                icon={TriangleAlert}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-500"
              />
              <StatCard
                title={t('projects.scoring.stats.recentlyScored')}
                value={recentlyScoredCount}
                icon={Target}
                iconBgColor="bg-green-50"
                iconColor="text-green-500"
              />
              <StatCard
                title={t('projects.scoring.stats.averageScore')}
                value={overallOrganizationsAverage ? `${overallOrganizationsAverage}/10` : '-'}
                icon={ClipboardList}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-primary">
                  {t('projects.scoring.sections.collaborations')}
                </h2>

                {scoringRows.map((row) => (
                  <CollaborationScoringRow
                    key={row.id}
                    collaborationId={row.id}
                    organizationName={row.organizationName}
                    projectName={row.projectName}
                    startDate={row.startDate}
                    endDate={row.endDate}
                    score={row.score}
                    missingEvaluation={row.missingEvaluation}
                    recentlyScored={row.recentlyScored}
                    onSave={(collaborationId, score) => {
                      saveCollaborationScore(collaborationId, score);
                      toast.success(t('projects.scoring.saved'));
                    }}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <ScoreLegendPanel className="xl:sticky xl:top-6" />
              </div>
            </div>
          </div>
        </PageContainer>
      )}
    </div>
  );
}
