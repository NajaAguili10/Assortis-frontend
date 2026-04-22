import { AccessDenied } from '@app/components/AccessDenied';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Progress } from '@app/components/ui/progress';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useExpertProjectsScoring } from '@app/modules/expert/hooks/useExpertProjectsScoring';
import { ArrowLeft, Building2, CalendarDays, Handshake, Star } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

const getScoreBadgeClassName = (score: number | null) => {
  if (score === null) return 'bg-gray-100 text-gray-700 border-gray-200';
  if (score >= 8) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 6) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (score >= 4) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

export default function ProjectContractorDetails() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { contractorId } = useParams();
  const { contractorSummaries, getContractorById, getCollaborationsByContractor } = useExpertProjectsScoring();

  const hasAccess = user?.accountType === 'expert';

  const contractor = contractorId ? getContractorById(contractorId) : undefined;
  const summary = contractorId
    ? contractorSummaries.find((entry) => entry.contractorId === contractorId)
    : undefined;
  const collaborations = contractorId ? getCollaborationsByContractor(contractorId) : [];

  const progressValue = summary?.overallScore ? summary.overallScore * 10 : 0;

  const locale = t('common.locale');
  const formatDate = useMemo(
    () => (date: string) => new Date(date).toLocaleDateString(locale),
    [locale],
  );

  return (
    <div className="min-h-screen">
      <PageBanner
        icon={Building2}
        title={t('projects.contractors.details.title')}
        description={t('projects.contractors.subtitle')}
      />

      <ProjectsSubMenu />

      {!hasAccess ? (
        <AccessDenied module="projects" accountType={user?.accountType} />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
            <Button variant="outline" onClick={() => navigate('/projects/contractors')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('projects.contractors.details.back')}
            </Button>

            {!contractor || !summary ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  {t('projects.contractors.details.notFound')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">{contractor.name}</CardTitle>
                      {contractor.description && (
                        <p className="text-sm text-muted-foreground mt-2">{contractor.description}</p>
                      )}
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-primary">
                        {t('projects.contractors.details.historyTitle')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {collaborations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          {t('projects.contractors.details.noHistory')}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {collaborations.map((collaboration) => (
                            <div
                              key={collaboration.id}
                              className="rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3"
                            >
                              <div>
                                <p className="font-medium text-primary">{collaboration.projectName}</p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {t('projects.contractors.details.startDate')}: {formatDate(collaboration.startDate)}
                                  {' • '}
                                  {t('projects.contractors.details.endDate')}: {formatDate(collaboration.endDate)}
                                </p>
                              </div>

                              <Badge variant="outline" className={getScoreBadgeClassName(summary.overallScore)}>
                                <Star className="h-3.5 w-3.5 mr-1" />
                                {collaboration.score
                                  ? `${(
                                      Object.values(collaboration.score).reduce((sum, value) => sum + value, 0) /
                                      Object.values(collaboration.score).length
                                    ).toFixed(1)}/10`
                                  : t('projects.scoring.labels.noEvaluations')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base text-primary flex items-center gap-2">
                        <Handshake className="h-4 w-4 text-blue-500" />
                        {t('projects.contractors.details.scoreSummary')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t('projects.contractors.card.pastCollaborations')}
                        </span>
                        <span className="font-semibold text-primary">{summary.collaborationCount}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            {t('projects.contractors.card.overallScore')}
                          </span>
                          <Badge variant="outline" className={getScoreBadgeClassName(summary.overallScore)}>
                            {summary.overallScore ? `${summary.overallScore}/10` : t('projects.scoring.labels.noEvaluations')}
                          </Badge>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {t('projects.contractors.stats.missingEvaluations')}: {summary.missingEvaluationsCount}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </PageContainer>
      )}
    </div>
  );
}
