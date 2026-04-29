import React from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { isExpertAccountType } from '@app/services/permissions.service';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { StatCard } from '@app/components/StatCard';
import {
  statisticsKpis,
  projectsOverTime,
  sectorDistribution,
  countryDistribution,
} from '@app/modules/shared/data/statistics.mock';
import { BarChart3, Briefcase, FileCheck2, Trophy, Target, Eye, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

const PIE_COLORS = ['#1f4b99', '#2563eb', '#06b6d4', '#10b981', '#f59e0b'];

export default function StatisticsDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const isExpert = isExpertAccountType(user?.accountType);

  // Expert KPIs: market demand, profile views, average pricing
  const expertStats = [
    { value: statisticsKpis.totalProjects, label: t('statistics.kpi.marketDemand') },
    { value: '12', label: t('statistics.kpi.profileViews') },
    { value: '$450/day', label: t('statistics.kpi.averagePricing') },
  ];

  // Organization KPIs: total projects, total contracts, shortlists
  const orgStats = [
    { value: statisticsKpis.totalProjects, label: t('statistics.kpi.totalProjects') },
    { value: statisticsKpis.totalContracts, label: t('statistics.kpi.totalContracts') },
    { value: statisticsKpis.shortlistsCount, label: t('statistics.kpi.shortlists') },
    { value: `${statisticsKpis.winRate}%`, label: t('statistics.kpi.winRate') },
  ];

  return (
    <StatisticsSectionLayout
      icon={BarChart3}
      stats={isExpert ? expertStats : orgStats}
    >
      {/* =========================== EXPERT VIEW =========================== */}
      {isExpert ? (
        <>
          {/* Expert KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('statistics.kpi.marketDemand')}
              value={statisticsKpis.totalProjects}
              icon={TrendingUp}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
              subtitle="Active opportunities"
            />
            <StatCard
              title={t('statistics.kpi.profileViews')}
              value="12"
              icon={Eye}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
              subtitle="Last 30 days"
            />
            <StatCard
              title={t('statistics.kpi.averagePricing')}
              value="$450/day"
              icon={FileCheck2}
              iconBgColor="bg-yellow-50"
              iconColor="text-yellow-500"
              subtitle="By seniority"
            />
            <StatCard
              title={t('statistics.kpi.opportunities')}
              value={statisticsKpis.shortlistsCount}
              icon={Trophy}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
              subtitle="Matched"
            />
          </div>

          {/* Expert Charts: Demand Trends & Sector Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StatisticsChartCard
              title={t('statistics.charts.projectsOverTime')}
              description={t('statistics.charts.projectsOverTimeDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="projects" stroke="#1f4b99" strokeWidth={2.5} name="Demand" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>

            <StatisticsChartCard
              title={t('statistics.charts.distributionSector')}
              description={t('statistics.charts.distributionSectorDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95}>
                      {sectorDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>
          </div>

          {/* Expert Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StatisticsChartCard
              title={t('statistics.charts.countryDistribution')}
              description={t('statistics.charts.countryDistributionDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1f4b99" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-primary mb-1">{t('statistics.dashboard.section.highlights')}</h3>
              <p className="text-sm text-gray-600 mb-5">{t('statistics.dashboard.section.quickInsights')}</p>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">High-demand sectors</p>
                  <p className="text-sm text-blue-800">Healthcare, Energy, Infrastructure</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900 mb-1">Growing regions</p>
                  <p className="text-sm text-emerald-800">West Africa, South Asia, East Africa</p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-1">{t('statistics.highlights.emerging')}</p>
                  <p className="text-sm text-amber-800">Climate adaptation expertise in high demand globally.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* =========================== ORGANIZATION VIEW =========================== */}
          {/* Organization KPI Cards - Unchanged */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('statistics.kpi.totalProjects')}
              value={statisticsKpis.totalProjects}
              icon={Briefcase}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('statistics.kpi.totalContracts')}
              value={statisticsKpis.totalContracts}
              icon={FileCheck2}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('statistics.kpi.shortlists')}
              value={statisticsKpis.shortlistsCount}
              icon={Target}
              iconBgColor="bg-yellow-50"
              iconColor="text-yellow-500"
            />
            <StatCard
              title={t('statistics.kpi.winRate')}
              value={`${statisticsKpis.winRate}%`}
              trend="+4%"
              icon={Trophy}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
          </div>

          {/* Organization Charts - Unchanged */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StatisticsChartCard
              title={t('statistics.charts.projectsOverTime')}
              description={t('statistics.charts.projectsOverTimeDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="projects" stroke="#1f4b99" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="contracts" stroke="#10b981" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>

            <StatisticsChartCard
              title={t('statistics.charts.distributionSector')}
              description={t('statistics.charts.distributionSectorDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95}>
                      {sectorDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StatisticsChartCard
              title={t('statistics.charts.countryDistribution')}
              description={t('statistics.charts.countryDistributionDesc')}
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1f4b99" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-primary mb-1">{t('statistics.dashboard.section.highlights')}</h3>
              <p className="text-sm text-gray-600 mb-5">{t('statistics.dashboard.section.quickInsights')}</p>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900 mb-1">{t('statistics.highlights.topSectors')}</p>
                  <p className="text-sm text-blue-800">Infrastructure, Energy, Education</p>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-900 mb-1">{t('statistics.highlights.topCountries')}</p>
                  <p className="text-sm text-emerald-800">India, Kenya, Morocco</p>
                </div>
                <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-1">{t('statistics.highlights.emerging')}</p>
                  <p className="text-sm text-amber-800">{t('statistics.highlights.emergingText')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation to Dashboard sections */}
          <div className="mt-2">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('statistics.dashboard.section.quickInsights')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: t('statistics.tabs.marketTrends'), path: '/statistics/market-trends', color: 'bg-blue-50 border-blue-100', icon: '📈' },
                { label: t('statistics.tabs.projectsContracts'), path: '/statistics/projects-contracts', color: 'bg-green-50 border-green-100', icon: '📁' },
                { label: t('statistics.tabs.pricingPolicy'), path: '/statistics/pricing-experts', color: 'bg-indigo-50 border-indigo-100', icon: '💰' },
                { label: t('statistics.tabs.expertsFees'), path: '/statistics/experts-fees', color: 'bg-purple-50 border-purple-100', icon: '👥' },
                { label: t('statistics.tabs.competitors'), path: '/statistics/competitors', color: 'bg-orange-50 border-orange-100', icon: '🏆' },
                { label: t('statistics.tabs.mapInsights'), path: '/statistics/map-insights', color: 'bg-teal-50 border-teal-100', icon: '🗺️' },
              ].map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => window.location.href = item.path}
                  className={`flex items-center gap-3 rounded-lg border p-4 text-left hover:shadow-md transition-shadow ${item.color}`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-primary">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </StatisticsSectionLayout>
  );
}
