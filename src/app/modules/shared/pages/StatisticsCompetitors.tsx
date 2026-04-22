import React from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { competitorsRanking } from '@app/modules/shared/data/statistics.mock';
import { ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function StatisticsCompetitors() {
  const { t } = useLanguage();

  return (
    <StatisticsSectionLayout icon={ShieldAlert}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{t('statistics.competitors.title')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatisticsChartCard
          title={t('statistics.charts.competitorLosses')}
          description={t('statistics.charts.competitorLossesDesc')}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitorsRanking} layout="vertical" margin={{ left: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="losses" fill="#1f4b99" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StatisticsChartCard>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('statistics.tabs.competitors')}</h3>
          <div className="space-y-3">
            {competitorsRanking.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-primary">#{index + 1} {item.name}</p>
                  <p className="text-xs text-gray-500">{item.losses} losses</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${item.delta >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {item.delta >= 0 ? '+' : ''}{item.delta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StatisticsSectionLayout>
  );
}
