import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { PendingMatchesSidebar } from '@app/modules/expert/components/PendingMatchesSidebar';
import { StatCard } from '@app/components/StatCard';
import { MatchingOpportunityCard } from '@app/components/MatchingOpportunityCard';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { Button } from '@app/components/ui/button';
import { LayoutDashboard, Percent, CalendarDays, ArrowRight, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAfter, subDays } from 'date-fns';

export default function MatchingOpportunitiesHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    opportunities,
    stats,
    pendingMatches,
    saveOpportunity,
    removeOpportunity,
    isSaved,
  } = useMatchingOpportunities();

  const recentMatches = useMemo(() => {
    const oneWeekAgo = subDays(new Date(), 7);
    return [...opportunities]
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }, [opportunities]);

  const newThisWeek = useMemo(() => {
    const oneWeekAgo = subDays(new Date(), 7);
    return opportunities.filter(opp => isAfter(opp.postedDate, oneWeekAgo)).length;
  }, [opportunities]);

  const handleApply = (id: string) => {
    toast.success(t('matching-opportunities.toast.applicationSubmitted'));
  };

  const handleExpressInterest = (id: string) => {
    toast.success(t('matching-opportunities.toast.interestExpressed'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={LayoutDashboard}
        title={t('matching-opportunities.page.title')}
        description={t('matching-opportunities.page.subtitle')}
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title={t('matching-opportunities.dashboard.stats.total')}
                value={stats.matchingOpportunities}
                icon={LayoutDashboard}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                title={t('matching-opportunities.dashboard.stats.average-score')}
                value={`${stats.averageRelevance}%`}
                icon={Percent}
                iconBgColor="bg-green-50"
                iconColor="text-green-600"
              />
              <StatCard
                title={t('matching-opportunities.dashboard.stats.new-this-week')}
                value={newThisWeek}
                icon={CalendarDays}
                iconBgColor="bg-purple-50"
                iconColor="text-purple-600"
              />
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate('/matching-opportunities/projects')}
                className="flex items-center gap-2"
              >
                {t('matching-opportunities.dashboard.actions.view-all')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/account/my-account')}
                className="flex items-center gap-2"
              >
                <Settings2 className="w-4 h-4" />
                {t('matching-opportunities.dashboard.actions.update-prefs')}
              </Button>
            </div>

            {/* Recent matches */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {t('matching-opportunities.dashboard.recent.title')}
              </h2>
              {recentMatches.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-200 rounded-lg">
                  {t('matching-opportunities.dashboard.recent.empty')}
                </p>
              ) : (
                <div className="space-y-4">
                  {recentMatches.map(opp => (
                    <MatchingOpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      isSaved={isSaved(opp.id)}
                      onSave={saveOpportunity}
                      onRemove={removeOpportunity}
                      onApply={handleApply}
                      onExpressInterest={handleExpressInterest}
                    />
                  ))}
                </div>
              )}
              {recentMatches.length > 0 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/matching-opportunities/projects')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {t('matching-opportunities.dashboard.actions.view-all')}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PendingMatchesSidebar pendingMatches={pendingMatches} />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
