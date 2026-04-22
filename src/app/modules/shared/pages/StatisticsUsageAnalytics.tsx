import React from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { isExpertAccountType } from '@app/services/permissions.service';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { usageBreakdown } from '@app/modules/shared/data/statistics.mock';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const USAGE_COLORS = ['#1f4b99', '#cbd5e1'];

export default function StatisticsUsageAnalytics() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isExpert = isExpertAccountType(user?.accountType);

  const usedPercent = usageBreakdown.find((item) => item.name === 'Used')?.value ?? 0;
  const pageTitle = isExpert ? t('statistics.tabs.myInsights') : t('statistics.usageAnalytics.title');

  return (
    <StatisticsSectionLayout icon={Activity}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{pageTitle}</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-600 mb-3">{t('statistics.usage.percentLabel', { percent: usedPercent })}</p>
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${usedPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatisticsChartCard
          title={t('statistics.charts.servicesUsage')}
          description={t('statistics.charts.servicesUsageDesc')}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={usageBreakdown} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95}>
                  {usageBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={USAGE_COLORS[index % USAGE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </StatisticsChartCard>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('statistics.usage.recommendations')}</h3>
          <ul className="space-y-3">
            {/* Expert-specific recommendations */}
            {isExpert ? (
              <>
                <li className="text-sm text-gray-700 rounded-md bg-blue-50 border border-blue-100 p-3">{t('statistics.usage.expert.rec1')}</li>
                <li className="text-sm text-gray-700 rounded-md bg-emerald-50 border border-emerald-100 p-3">{t('statistics.usage.expert.rec2')}</li>
                <li className="text-sm text-gray-700 rounded-md bg-amber-50 border border-amber-100 p-3">{t('statistics.usage.expert.rec3')}</li>
              </>
            ) : (
              <>
                <li className="text-sm text-gray-700 rounded-md bg-blue-50 border border-blue-100 p-3">{t('statistics.usage.rec1')}</li>
                <li className="text-sm text-gray-700 rounded-md bg-emerald-50 border border-emerald-100 p-3">{t('statistics.usage.rec2')}</li>
                <li className="text-sm text-gray-700 rounded-md bg-amber-50 border border-amber-100 p-3">{t('statistics.usage.rec3')}</li>
              </>
            )}
          </ul>

          <h4 className="font-semibold text-primary mt-6 mb-2">{t('statistics.usage.underused')}</h4>
          <div className="space-y-2">
            {isExpert ? (
              <>
                <p className="text-sm text-gray-600">- Regional demand tracking</p>
                <p className="text-sm text-gray-600">- Peer connection insights</p>
                <p className="text-sm text-gray-600">- Advanced pricing analytics</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">- Donor trend alerts</p>
                <p className="text-sm text-gray-600">- Competitor benchmarking exports</p>
                <p className="text-sm text-gray-600">- Advanced shortlist analytics</p>
              </>
            )}
          </div>
        </div>
      </div>
    </StatisticsSectionLayout>
  );
}
