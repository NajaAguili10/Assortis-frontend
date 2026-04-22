import React from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { donorTrends, sectorDistribution } from '@app/modules/shared/data/statistics.mock';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

export default function StatisticsMarketTrends() {
  const { t } = useLanguage();

  return (
    <StatisticsSectionLayout icon={TrendingUp}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{t('statistics.marketTrends.title')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StatisticsChartCard
          title={t('statistics.charts.donorEvolution')}
          description={t('statistics.charts.donorEvolutionDesc')}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donorTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="worldBank" stroke="#1f4b99" strokeWidth={2.5} />
                <Line type="monotone" dataKey="afd" stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="undp" stroke="#f59e0b" strokeWidth={2.5} />
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
              <BarChart data={sectorDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1f4b99" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StatisticsChartCard>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">{t('statistics.highlights.emerging')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900 mb-1">Energy</p>
            <p className="text-sm text-emerald-800">+16% growth in the last quarter</p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">Education</p>
            <p className="text-sm text-blue-800">Stable demand with stronger donor diversity</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900 mb-1">Health</p>
            <p className="text-sm text-amber-800">Regional funding rebounding in priority countries</p>
          </div>
        </div>
      </div>
    </StatisticsSectionLayout>
  );
}
