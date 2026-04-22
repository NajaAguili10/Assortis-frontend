import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { StatCard } from '@app/components/StatCard';
import { ActionCard } from '@app/components/ActionCard';
import { FeatureCard } from '@app/components/FeatureCard';
import { Input } from '@app/components/ui/input';
import { useInsights } from '@app/modules/administrator/hooks/useInsights';
import { useTenders } from '@app/hooks/useTenders';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useProjects } from '@app/hooks/useProjects';
import { useTraining } from '@app/hooks/useTraining';
import { useState, useMemo } from 'react';
import {
  Sparkles,
  BarChart3,
  Lightbulb,
  LayoutDashboard,
  Target,
  TrendingUp,
  AlertCircle,
  FileText,
  Building2,
  Users,
  Briefcase,
  GraduationCap,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Clock,
  Search,
  X,
} from 'lucide-react';

export default function SmartMatching() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis: insightsKpis } = useInsights();
  const { kpis: tendersKpis, allTenders } = useTenders();
  const { kpis: orgsKpis } = useOrganizations();
  const { kpis: expertsKpis } = useExperts();
  const { kpis: projectsKpis } = useProjects();
  const { kpis: trainingKpis, totalPrograms, totalCourses, certifications } = useTraining();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate closing soon tenders (daysRemaining <= 7)
  const closingSoonCount = allTenders?.filter(t => (t.daysRemaining || 999) <= 7).length || 0;

  // Calculate global platform metrics with safe defaults
  const totalActivities = (tendersKpis?.totalTenders || 0) + 
                          (orgsKpis?.totalOrganizations || 0) + 
                          (expertsKpis?.totalExperts || 0) + 
                          (projectsKpis?.totalProjects || 0) + 
                          (totalPrograms || 0);
  const platformScore = 87;
  const engagementRate = 68;
  const growthRate = 15.3;

  // Safe values with defaults for all KPIs
  const safeInsightsKpis = {
    matchingScore: insightsKpis?.matchingScore || 0,
    successRate: insightsKpis?.successRate || 0,
    activeInsights: insightsKpis?.activeInsights || 0,
    trendsIdentified: insightsKpis?.trendsIdentified || 0,
    avgResponseTime: insightsKpis?.avgResponseTime || 0,
    totalOpportunities: insightsKpis?.totalOpportunities || 0,
  };

  const safeTendersKpis = {
    activeTenders: tendersKpis?.activeTenders || 0,
    closingSoon: closingSoonCount,
  };

  const safeOrgsKpis = {
    totalOrganizations: orgsKpis?.totalOrganizations || 0,
    activeOrganizations: orgsKpis?.activeOrganizations || 0,
  };

  const safeExpertsKpis = {
    totalExperts: expertsKpis?.totalExperts || 0,
    verifiedExperts: expertsKpis?.verifiedProfiles || 0,
  };

  const safeProjectsKpis = {
    activeProjects: projectsKpis?.activeProjects || 0,
    totalBudget: projectsKpis?.totalBudget || 0,
  };

  const activePrograms = trainingKpis?.enrolledPrograms || 0;
  const totalStudentsCount = totalCourses || 0;
  const certificationsCount = certifications?.length || 0;

  // Real-time search filtering logic
  const filterBySearch = useMemo(() => {
    return (text: string) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return text.toLowerCase().includes(query);
    };
  }, [searchQuery]);

  // Filter sections visibility based on search
  const showOverviewSection = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return filterBySearch(t('insights.dashboard.overview')) ||
           filterBySearch(t('insights.global.totalActivities')) ||
           filterBySearch(t('insights.global.platformScore')) ||
           filterBySearch(t('insights.global.engagementRate')) ||
           filterBySearch(t('insights.global.growthRate')) ||
           filterBySearch(t('insights.activity.thisMonth')) ||
           filterBySearch('platform') ||
           filterBySearch('overview') ||
           filterBySearch('activities') ||
           filterBySearch('score') ||
           filterBySearch('engagement') ||
           filterBySearch('growth');
  }, [searchQuery, t, filterBySearch]);

  const showModulesSection = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return filterBySearch(t('insights.dashboard.modules')) ||
           filterBySearch(t('insights.modules.tenders')) ||
           filterBySearch(t('insights.modules.organizations')) ||
           filterBySearch(t('insights.modules.experts')) ||
           filterBySearch(t('insights.modules.projects')) ||
           filterBySearch(t('insights.modules.training')) ||
           filterBySearch(t('insights.modules.certifications')) ||
           filterBySearch(t('insights.stats.matchingScore')) ||
           filterBySearch(t('insights.stats.successRate')) ||
           filterBySearch('modules') ||
           filterBySearch('tenders') ||
           filterBySearch('organizations') ||
           filterBySearch('experts') ||
           filterBySearch('projects') ||
           filterBySearch('training') ||
           filterBySearch('certifications') ||
           filterBySearch('matching');
  }, [searchQuery, t, filterBySearch]);

  const showActionsSection = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return filterBySearch(t('actions.quick')) ||
           filterBySearch(t('insights.actions.viewAnalytics')) ||
           filterBySearch(t('insights.actions.viewInsights')) ||
           filterBySearch(t('insights.actions.exportData')) ||
           filterBySearch('actions') ||
           filterBySearch('analytics') ||
           filterBySearch('insights') ||
           filterBySearch('export');
  }, [searchQuery, t, filterBySearch]);

  const showPerformanceSection = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return filterBySearch(t('insights.dashboard.performance')) ||
           filterBySearch(t('insights.modules.tenders')) ||
           filterBySearch(t('insights.modules.organizations')) ||
           filterBySearch(t('insights.modules.experts')) ||
           filterBySearch(t('insights.modules.projects')) ||
           filterBySearch(t('insights.modules.training')) ||
           filterBySearch(t('insights.submenu.aiInsights')) ||
           filterBySearch('performance') ||
           filterBySearch('tenders') ||
           filterBySearch('organizations') ||
           filterBySearch('experts') ||
           filterBySearch('projects') ||
           filterBySearch('training') ||
           filterBySearch('ai');
  }, [searchQuery, t, filterBySearch]);

  const showAnalyticsSection = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return filterBySearch(t('insights.analytics.title')) ||
           filterBySearch(t('insights.analytics.sectorPerformance')) ||
           filterBySearch(t('insights.trends.title')) ||
           filterBySearch(t('insights.stats.totalOpportunities')) ||
           filterBySearch('analytics') ||
           filterBySearch('sector') ||
           filterBySearch('trends') ||
           filterBySearch('opportunities');
  }, [searchQuery, t, filterBySearch]);

  // Check if any content is visible
  const hasVisibleContent = showOverviewSection || showModulesSection || 
                            showActionsSection || showPerformanceSection || 
                            showAnalyticsSection;

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('insights.hub.title')}
        description={t('insights.dashboard.subtitle')}
        icon={Sparkles}
        stats={[
          { value: totalActivities.toString(), label: t('insights.global.totalActivities') }
        ]}
      />

      <SubMenu
        items={[
          { label: t('insights.submenu.overview'), active: true, icon: LayoutDashboard },
          { label: t('insights.submenu.analytics'), icon: BarChart3, onClick: () => navigate('/insights/analytics') },
          { label: t('insights.submenu.aiInsights'), icon: Lightbulb, onClick: () => navigate('/insights/ai-insights') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={handleClearSearch}
                  aria-label={t('search.clear')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Global Platform Stats */}
          {showOverviewSection && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">{t('insights.dashboard.overview')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title={t('insights.global.totalActivities')}
                  value={totalActivities.toString()}
                  trend="+12%"
                  icon={Activity}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                />
                <StatCard
                  title={t('insights.global.platformScore')}
                  value={`${platformScore}%`}
                  trend="+5%"
                  icon={Target}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                />
                <StatCard
                  title={t('insights.global.engagementRate')}
                  value={`${engagementRate}%`}
                  trend="+8%"
                  icon={TrendingUp}
                  iconBgColor="bg-green-50"
                  iconColor="text-green-500"
                />
                <StatCard
                  title={t('insights.global.growthRate')}
                  value={`+${growthRate}%`}
                  subtitle={t('insights.activity.thisMonth')}
                  icon={ArrowUpRight}
                  iconBgColor="bg-orange-50"
                  iconColor="text-orange-500"
                />
              </div>
            </div>
          )}

          {/* Modules Performance */}
          {showModulesSection && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">{t('insights.dashboard.modules')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title={t('insights.modules.tenders')}
                  value={safeTendersKpis.activeTenders.toString()}
                  subtitle={t('insights.performance.activeTenders')}
                  trend="+15%"
                  icon={FileText}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                />
                <StatCard
                  title={t('insights.modules.organizations')}
                  value={safeOrgsKpis.activeOrganizations.toString()}
                  subtitle={t('insights.performance.totalOrganizations')}
                  trend="+8%"
                  icon={Building2}
                  iconBgColor="bg-cyan-50"
                  iconColor="text-cyan-500"
                />
                <StatCard
                  title={t('insights.modules.experts')}
                  value={safeExpertsKpis.verifiedExperts.toString()}
                  subtitle={t('insights.performance.verifiedExperts')}
                  trend="+12%"
                  icon={Users}
                  iconBgColor="bg-green-50"
                  iconColor="text-green-500"
                />
                <StatCard
                  title={t('insights.modules.projects')}
                  value={safeProjectsKpis.activeProjects.toString()}
                  subtitle={t('insights.performance.activeProjects')}
                  trend="+10%"
                  icon={Briefcase}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                />
                <StatCard
                  title={t('insights.modules.training')}
                  value={activePrograms.toString()}
                  subtitle={t('insights.performance.trainingPrograms')}
                  trend="+18%"
                  icon={GraduationCap}
                  iconBgColor="bg-indigo-50"
                  iconColor="text-indigo-500"
                />
                <StatCard
                  title={t('insights.modules.certifications')}
                  value={certificationsCount.toString()}
                  subtitle={t('insights.performance.certifications')}
                  icon={Award}
                  iconBgColor="bg-pink-50"
                  iconColor="text-pink-500"
                />
                <StatCard
                  title={t('insights.stats.matchingScore')}
                  value={`${safeInsightsKpis.matchingScore}%`}
                  subtitle={t('insights.performance.matchingOpportunities')}
                  trend="+6%"
                  icon={Sparkles}
                  iconBgColor="bg-yellow-50"
                  iconColor="text-yellow-600"
                />
                <StatCard
                  title={t('insights.stats.successRate')}
                  value={`${safeInsightsKpis.successRate}%`}
                  subtitle={t('insights.activity.thisMonth')}
                  trend="+4%"
                  icon={BarChart3}
                  iconBgColor="bg-orange-50"
                  iconColor="text-orange-500"
                />
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {showActionsSection && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">{t('actions.quick')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard
                  title={t('insights.actions.viewAnalytics')}
                  icon={BarChart3}
                  onClick={() => navigate('/insights/analytics')}
                />
                <ActionCard
                  title={t('insights.actions.viewInsights')}
                  icon={Sparkles}
                  onClick={() => navigate('/insights/ai-insights')}
                />
                <ActionCard
                  title={t('insights.actions.exportData')}
                  icon={ArrowDownRight}
                  onClick={() => {}}
                />
              </div>
            </div>
          )}

          {/* Performance by Module - Detailed Cards */}
          {showPerformanceSection && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">{t('insights.dashboard.performance')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tenders Performance */}
                <FeatureCard
                  title={t('insights.modules.tenders')}
                  description={t('tenders.hub.subtitle')}
                  icon={FileText}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                  stats={[
                    { label: t('common.active'), value: safeTendersKpis.activeTenders.toString() },
                    { label: t('tenders.stats.closing'), value: safeTendersKpis.closingSoon.toString() },
                  ]}
                  link="/tenders"
                />

                {/* Organizations Performance */}
                <FeatureCard
                  title={t('insights.modules.organizations')}
                  description={t('organizations.hub.subtitle')}
                  icon={Building2}
                  iconBgColor="bg-cyan-50"
                  iconColor="text-cyan-500"
                  stats={[
                    { label: t('common.total'), value: safeOrgsKpis.totalOrganizations.toString() },
                    { label: t('organizations.stats.active'), value: safeOrgsKpis.activeOrganizations.toString() },
                  ]}
                  link="/organizations"
                />

                {/* Experts Performance */}
                <FeatureCard
                  title={t('insights.modules.experts')}
                  description={t('experts.hub.subtitle')}
                  icon={Users}
                  iconBgColor="bg-green-50"
                  iconColor="text-green-500"
                  stats={[
                    { label: t('common.total'), value: safeExpertsKpis.totalExperts.toString() },
                    { label: t('experts.stats.verified'), value: safeExpertsKpis.verifiedExperts.toString() },
                  ]}
                  link="/experts"
                />

                {/* Projects Performance */}
                <FeatureCard
                  title={t('insights.modules.projects')}
                  description={t('projects.hub.subtitle')}
                  icon={Briefcase}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                  stats={[
                    { label: t('common.active'), value: safeProjectsKpis.activeProjects.toString() },
                    { label: t('projects.stats.totalBudget'), value: `$${(safeProjectsKpis.totalBudget / 1000000).toFixed(1)}M` },
                  ]}
                  link="/projects"
                />

                {/* Training Performance */}
                <FeatureCard
                  title={t('insights.modules.training')}
                  description={t('training.hub.subtitle')}
                  icon={GraduationCap}
                  iconBgColor="bg-indigo-50"
                  iconColor="text-indigo-500"
                  stats={[
                    { label: t('training.stats.activePrograms'), value: activePrograms.toString() },
                    { label: t('training.stats.totalStudents'), value: totalStudentsCount.toString() },
                  ]}
                  link="/training"
                />

                {/* AI Insights */}
                <FeatureCard
                  title={t('insights.submenu.aiInsights')}
                  description={t('insights.ai.subtitle')}
                  icon={Sparkles}
                  iconBgColor="bg-yellow-50"
                  iconColor="text-yellow-600"
                  badge="AI"
                  stats={[
                    { label: t('insights.stats.activeInsights'), value: safeInsightsKpis.activeInsights.toString() },
                    { label: t('insights.stats.trendsIdentified'), value: safeInsightsKpis.trendsIdentified.toString() },
                  ]}
                  link="/insights/ai-insights"
                />
              </div>
            </div>
          )}

          {/* Key Metrics Summary */}
          {showAnalyticsSection && (
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">{t('insights.analytics.title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  title={t('insights.analytics.sectorPerformance')}
                  description={t('insights.analytics.subtitle')}
                  icon={BarChart3}
                  iconBgColor="bg-blue-50"
                  iconColor="text-blue-500"
                  stats={[
                    { label: t('insights.stats.avgResponseTime'), value: `${safeInsightsKpis.avgResponseTime}h` },
                  ]}
                  link="/insights/analytics"
                />

                <FeatureCard
                  title={t('insights.trends.title')}
                  description={t('insights.trends.subtitle')}
                  icon={TrendingUp}
                  iconBgColor="bg-green-50"
                  iconColor="text-green-500"
                  stats={[
                    { label: t('insights.trends.RISING'), value: '12' },
                    { label: t('insights.trends.STABLE'), value: '8' },
                  ]}
                  link="/insights/ai-insights"
                />

                <FeatureCard
                  title={t('insights.stats.totalOpportunities')}
                  description={t('insights.opportunities.subtitle')}
                  icon={Target}
                  iconBgColor="bg-purple-50"
                  iconColor="text-purple-500"
                  stats={[
                    { label: t('common.total'), value: safeInsightsKpis.totalOpportunities.toString() },
                    { label: t('insights.opportunities.HIGH'), value: '24' },
                  ]}
                  link="/insights/analytics"
                />
              </div>
            </div>
          )}

          {/* No content found message */}
          {!hasVisibleContent && (
            <div className="text-center mt-10">
              <p className="text-gray-500">{t('common.noResults')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}