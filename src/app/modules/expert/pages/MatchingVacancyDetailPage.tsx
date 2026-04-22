import { useParams, Navigate } from 'react-router';
import { Target } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { MatchingOpportunityDetailContent } from '@app/modules/expert/components/MatchingOpportunityDetailContent';
import { OpportunityTypeEnum } from '@app/types/matchingOpportunities.dto';
import { useTranslation } from '@app/contexts/LanguageContext';

export default function MatchingVacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { getOpportunityById } = useMatchingOpportunities();

  const opportunity = id ? getOpportunityById(id) : undefined;
  if (!opportunity || (opportunity.type !== OpportunityTypeEnum.PROJECT_VACANCY && opportunity.type !== OpportunityTypeEnum.IN_HOUSE_VACANCY)) {
    return <Navigate to="/matching-opportunities/opportunities" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner icon={Target} title={opportunity.title} description={t('matching-opportunities.types.projectVacancy')} />
      <PageContainer>
        <MatchingOpportunitiesSubMenu />
        <div className="mt-8">
          <MatchingOpportunityDetailContent opportunity={opportunity} variant="vacancy" />
        </div>
      </PageContainer>
    </div>
  );
}
