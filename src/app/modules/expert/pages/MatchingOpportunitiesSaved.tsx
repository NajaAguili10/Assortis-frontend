import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { MatchingOpportunityCard } from '@app/components/MatchingOpportunityCard';
import { PendingMatchesSidebar } from '@app/modules/expert/components/PendingMatchesSidebar';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { Target } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function MatchingOpportunitiesSaved() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getSavedOpportunities, removeOpportunity, pendingMatches, isSaved } =
    useMatchingOpportunities();

  const savedOpportunities = getSavedOpportunities();

  const handleApply = (opportunityId: string) => {
    toast.success('Application submitted. We will notify you about next steps.');
  };

  const handleExpressInterest = (opportunityId: string) => {
    toast.success('Interest expressed. Organizations will be notified.');
  };

  const handleRemove = (opportunityId: string) => {
    removeOpportunity(opportunityId);
    toast.success('Opportunity removed from saved list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Target}
        title={t('matching-opportunities.page.title')}
        description="Your saved opportunities"
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {savedOpportunities.length === 0 ? (
              // Empty state
              <div className="bg-white p-12 rounded-lg text-center border border-gray-200">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">
                  No saved opportunities yet
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Browse opportunities and save the ones that interest you
                </p>
                <Button
                  variant="default"
                  onClick={() => navigate('/matching-opportunities/opportunities')}
                >
                  Browse Opportunities
                </Button>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Saved Opportunities{' '}
                    <span className="text-gray-600 font-normal">
                      ({savedOpportunities.length})
                    </span>
                  </h2>
                </div>

                {/* Saved opportunities cards */}
                <div className="space-y-4">
                  {savedOpportunities.map(opp => (
                    <MatchingOpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={true}
                      onSave={() => {}}
                      onRemove={handleRemove}
                      onApply={handleApply}
                      onExpressInterest={handleExpressInterest}
                    />
                  ))}
                </div>
              </>
            )}
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
