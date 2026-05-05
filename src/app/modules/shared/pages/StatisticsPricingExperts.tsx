import React, { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { isExpertAccountType } from '@app/services/permissions.service';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { StatisticsFilterBar } from '@app/components/StatisticsFilterBar';
import { Button } from '@app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  competitorPricing,
  discountRangeDistribution,
  aiDiscountSamples,
  pricingPositioning,
} from '@app/modules/shared/data/statistics.mock';
import { DollarSign, Sparkles, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function StatisticsPricingExperts() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isExpert = isExpertAccountType(user?.accountType);

  const [country, setCountry] = useState('all');
  const [sector, setSector] = useState('all');
  const [seniority, setSeniority] = useState('all');

  const pageTitle = isExpert ? t('statistics.tabs.pricingBenchmark') : t('statistics.pricingPolicy.title');

  const positioningColor =
    pricingPositioning.position === 'competitive'
      ? 'text-emerald-600'
      : pricingPositioning.position === 'premium'
        ? 'text-indigo-600'
        : 'text-amber-600';

  return (
    <StatisticsSectionLayout icon={DollarSign}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{pageTitle}</h2>
      </div>

      <StatisticsFilterBar>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.country')}</SelectItem>
            <SelectItem value="morocco">Morocco</SelectItem>
            <SelectItem value="kenya">Kenya</SelectItem>
            <SelectItem value="india">India</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.sector')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.sector')}</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="health">Health</SelectItem>
          </SelectContent>
        </Select>

        <Select value={seniority} onValueChange={setSeniority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.seniority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.seniority')}</SelectItem>
            <SelectItem value="junior">Junior</SelectItem>
            <SelectItem value="mid">Mid</SelectItem>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => { setCountry('all'); setSector('all'); setSeniority('all'); }}>
          {t('statistics.filters.reset')}
        </Button>
      </StatisticsFilterBar>

      {/* Expert-only: Personal Benchmark Section */}
      {isExpert && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">{t('statistics.expert.benchmark.title')}</h3>
            <p className="text-sm text-gray-600 mb-6">{t('statistics.expert.benchmark.description')}</p>

            {/* Your Rate vs Market Average Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Your Daily Rate</p>
                <p className="text-2xl font-bold text-primary">$450</p>
                <p className="text-xs text-gray-500 mt-2">Senior Level</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">Market Average</p>
                <p className="text-2xl font-bold text-emerald-600">$420</p>
                <p className="text-xs text-emerald-600 mt-2">All Levels</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Position</p>
                  <p className="font-semibold text-indigo-600">{t('statistics.expert.benchmark.within')}</p>
                </div>
                <p className="text-xs text-indigo-600 mt-2">+$30 above market avg</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-4 text-center">Adjust your rate in your profile settings to see updated benchmarking.</p>
          </div>
        </div>
      )}

      {/* Organization-only: Competitor Pricing & Positioning */}
      {!isExpert && (
        <>
          {/* Discount Range Distribution */}
          <div className="mt-8">
            <StatisticsChartCard
              title="Discount Range Distribution"
              description="How frequently each discount range appears across your contracts."
              className="mb-6"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={discountRangeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contracts" fill="#1f4b99" radius={[6, 6, 0, 0]} name="Contracts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>

            {/* Positioning Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{t('statistics.pricingPolicy.avgMarketDiscount')}</p>
                <p className="text-2xl font-bold text-primary">{pricingPositioning.avgMarketDiscount}%</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{t('statistics.pricingPolicy.yourAvgDiscount')}</p>
                <p className="text-2xl font-bold text-emerald-600">{pricingPositioning.yourAvgDiscount}%</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">{t('statistics.pricingPolicy.positioning')}</p>
                <p className={`text-lg font-bold capitalize ${positioningColor}`}>
                  {pricingPositioning.position}
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">{t('statistics.pricingPolicy.recommendation')}</p>
                  <p className="text-sm text-blue-800">{pricingPositioning.recommendation}</p>
                </div>
              </div>
            </div>

            {/* Competitor Pricing Comparison */}
            <StatisticsChartCard
              title="Competitor Pricing Comparison"
              description="Average daily rates and discount ranges by competitor."
              className="mb-6"
            >
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={competitorPricing}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis unit="$" />
                    <Tooltip formatter={(value: number) => [`$${value}/day`]} />
                    <Bar dataKey="avgRate" fill="#1f4b99" radius={[6, 6, 0, 0]} name="Avg Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </StatisticsChartCard>

            {/* AI Discount Analysis */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-primary">{t('statistics.pricingPolicy.aiSection')}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-5">{t('statistics.pricingPolicy.aiDesc')}</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase">Project</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        {t('statistics.pricingPolicy.initialBudget')}
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        {t('statistics.pricingPolicy.finalContract')}
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 uppercase">
                        {t('statistics.pricingPolicy.aiDiscountLabel')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiDiscountSamples.map((row) => (
                      <tr key={row.projectName} className="border-b border-indigo-100 hover:bg-white/60 transition-colors">
                        <td className="py-2.5 px-3 text-primary font-medium">{row.projectName}</td>
                        <td className="py-2.5 px-3 text-right text-gray-700">
                          ${row.initialBudget.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-700">
                          ${row.finalContract.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              row.realDiscount > 15
                                ? 'bg-red-100 text-red-700'
                                : row.realDiscount > 10
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            -{row.realDiscount}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                * Discount calculated as: (Initial Budget − Final Contract) ÷ Initial Budget × 100
              </p>
            </div>
          </div>
        </>
      )}
    </StatisticsSectionLayout>
  );
}
