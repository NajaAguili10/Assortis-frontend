import { AccessDenied } from '@app/components/AccessDenied';
import { ContractorSummaryCard } from '@app/components/ContractorSummaryCard';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ProjectsSubMenu } from '@app/components/ProjectsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { useAuth } from '@app/contexts/AuthContext';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useExpertProjectsScoring } from '@app/modules/expert/hooks/useExpertProjectsScoring';
import { Bookmark, Handshake, Star, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function ProjectsContractors() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    bookmarkedContractors,
    discoverableContractors,
    overallOrganizationsAverage,
    scoringRows,
    toggleBookmark,
  } = useExpertProjectsScoring();

  const hasAccess = user?.accountType === 'expert';

  return (
    <div className="min-h-screen">
      <PageBanner
        icon={Handshake}
        title={t('projects.contractors.title')}
        description={t('projects.contractors.subtitle')}
      />

      <ProjectsSubMenu />

      {!hasAccess ? (
        <AccessDenied module="projects" accountType={user?.accountType} />
      ) : (
        <PageContainer className="my-6">
          <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title={t('projects.contractors.stats.bookmarked')}
                value={bookmarkedContractors.length}
                icon={Bookmark}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-500"
              />
              <StatCard
                title={t('projects.contractors.stats.pastCollaborations')}
                value={scoringRows.length}
                icon={Handshake}
                iconBgColor="bg-green-50"
                iconColor="text-green-500"
              />
              <StatCard
                title={t('projects.contractors.stats.averageScore')}
                value={overallOrganizationsAverage ? `${overallOrganizationsAverage}/10` : '-'}
                icon={Star}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-500"
              />
              <StatCard
                title={t('projects.contractors.stats.missingEvaluations')}
                value={scoringRows.filter((entry) => entry.missingEvaluation).length}
                icon={TriangleAlert}
                iconBgColor="bg-amber-50"
                iconColor="text-amber-500"
              />
            </div>

            <section>
              <h2 className="text-xl font-bold text-primary mb-4">
                {t('projects.contractors.sections.bookmarked')}
              </h2>

              {bookmarkedContractors.length === 0 ? (
                <div className="bg-white border rounded-lg p-6 text-sm text-muted-foreground">
                  {t('projects.contractors.empty.bookmarked')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {bookmarkedContractors.map((contractor) => (
                    <ContractorSummaryCard
                      key={contractor.contractorId}
                      contractor={contractor}
                      onToggleBookmark={toggleBookmark}
                      onViewDetails={(contractorId) => navigate(`/projects/contractors/${contractorId}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-4">
                {t('projects.contractors.sections.discover')}
              </h2>

              {discoverableContractors.length === 0 ? (
                <div className="bg-white border rounded-lg p-6 text-sm text-muted-foreground">
                  {t('projects.contractors.empty.discover')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {discoverableContractors.map((contractor) => (
                    <ContractorSummaryCard
                      key={contractor.contractorId}
                      contractor={contractor}
                      onToggleBookmark={toggleBookmark}
                      onViewDetails={(contractorId) => navigate(`/projects/contractors/${contractorId}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </PageContainer>
      )}
    </div>
  );
}
