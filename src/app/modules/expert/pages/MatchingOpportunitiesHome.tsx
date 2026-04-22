import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { SIPCard } from '@app/modules/expert/components/SIPCard';
import { MyCVCard } from '@app/modules/expert/components/MyCVCard';
import { OrgsScoringCard } from '@app/modules/expert/components/OrgsScoringCard';
import { MyVacanciesCard } from '@app/modules/expert/components/MyVacanciesCard';
import { OtherServicesCard } from '@app/modules/expert/components/OtherServicesCard';
import { PendingMatchesSidebar } from '@app/modules/expert/components/PendingMatchesSidebar';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { Target } from 'lucide-react';
import { toast } from 'sonner';

export default function MatchingOpportunitiesHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    sipInfo,
    cvStats,
    pendingMatches,
    getOpportunitiesByType,
  } = useMatchingOpportunities();

  const handleShowDetails = () => {
    toast.info('SIP Details feature coming soon');
  };

  const handleUpdateCV = () => {
    navigate('/experts/my-cv/info');
  };

  const handleOrgsScoringDetails = () => {
    navigate('/projects/organizations-scoring');
  };

  const handleJobBoardClick = () => {
    navigate('/matching-opportunities/opportunities');
  };

  const handleInHouseVacanciesClick = () => {
    navigate('/matching-opportunities/opportunities');
  };

  const handleTrainingAcademy = () => {
    toast.info('Training Academy coming soon');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Target}
        title={t('matching-opportunities.page.title')}
        description={t('matching-opportunities.page.subtitle')}
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area with cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Row 1: SIP and CV Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SIPCard sipInfo={sipInfo} onShowDetails={handleShowDetails} />
              <MyCVCard cvStats={cvStats} onUpdateCV={handleUpdateCV} />
            </div>

            {/* Row 2: Orgs Scoring Card */}
            <OrgsScoringCard onShowDetails={handleOrgsScoringDetails} />

            {/* Row 3: My Vacancies Card */}
            <MyVacanciesCard
              onSeeJobBoard={handleJobBoardClick}
              onSeeInHouseVacancies={handleInHouseVacanciesClick}
            />

            {/* Row 4: Other Services Card */}
            <OtherServicesCard onTrainingAcademy={handleTrainingAcademy} />
          </div>

          {/* Sidebar with Pending Matches */}
          <div className="lg:col-span-1">
            <PendingMatchesSidebar pendingMatches={pendingMatches} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
