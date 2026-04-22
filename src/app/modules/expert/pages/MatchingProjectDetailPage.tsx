import { useParams, Navigate } from 'react-router';
import { Target } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { MatchingOpportunityDetailContent } from '@app/modules/expert/components/MatchingOpportunityDetailContent';
import { OpportunityTypeEnum } from '@app/types/matchingOpportunities.dto';
import { useTranslation } from '@app/contexts/LanguageContext';

export default function MatchingProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { getOpportunityById } = useMatchingOpportunities();

  const opportunity = id ? getOpportunityById(id) : undefined;
  if (!opportunity || opportunity.type !== OpportunityTypeEnum.OPEN_PROJECT) {
    return <Navigate to="/matching-opportunities/opportunities" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner icon={Target} title={opportunity.title} description={t('matching-opportunities.types.openProject')} />
      <PageContainer>
        <MatchingOpportunitiesSubMenu />
        <div className="mt-8">
          <MatchingOpportunityDetailContent opportunity={opportunity} variant="project" />
        </div>
      </PageContainer>
    </div>
  );
}
