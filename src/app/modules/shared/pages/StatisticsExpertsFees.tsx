import React, { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { StatisticsFilterBar } from '@app/components/StatisticsFilterBar';
import { Button } from '@app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  expertsFeesByDomain,
  expertsFeesByCountry,
  expertsFeesTrend,
} from '@app/modules/shared/data/statistics.mock';
import { Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

export default function StatisticsExpertsFees() {
  const { t } = useLanguage();

  const [domain, setDomain] = useState('all');
  const [country, setCountry] = useState('all');

  const filteredDomainData =
    domain === 'all'
      ? expertsFeesByDomain
      : expertsFeesByDomain.filter((d) => d.domain.toLowerCase() === domain);

  const filteredCountryData =
    country === 'all'
      ? expertsFeesByCountry
      : expertsFeesByCountry.filter((c) => c.country.toLowerCase() === country);

  const overallAvg = Math.round(
    expertsFeesByCountry.reduce((sum, c) => sum + c.avgFee, 0) / expertsFeesByCountry.length
  );

  const totalExperts = expertsFeesByCountry.reduce((sum, c) => sum + c.experts, 0);

  const stats = [
    { value: `$${overallAvg}/day`, label: 'Global Average Fee' },
    { value: totalExperts, label: 'Experts Tracked' },
    { value: expertsFeesByDomain.length, label: 'Domains Covered' },
  ];

  return (
    <StatisticsSectionLayout icon={Users} stats={stats}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{t('statistics.expertsFees.title')}</h2>
      </div>

      <StatisticsFilterBar>
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.sector')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.sector')}</SelectItem>
            {expertsFeesByDomain.map((d) => (
              <SelectItem key={d.domain} value={d.domain.toLowerCase()}>
                {d.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.country')}</SelectItem>
            {expertsFeesByCountry.map((c) => (
              <SelectItem key={c.country} value={c.country.toLowerCase()}>
                {c.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setDomain('all');
            setCountry('all');
          }}
        >
          {t('statistics.filters.reset')}
        </Button>
      </StatisticsFilterBar>

      {/* Fee Trend Chart */}
      <StatisticsChartCard
        title={t('statistics.expertsFees.trend')}
        description={t('statistics.expertsFees.trendDesc')}
        className="mb-6"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expertsFeesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis unit="$" />
              <Tooltip formatter={(value: number) => [`$${value}/day`, 'Avg Fee']} />
              <Line
                type="monotone"
                dataKey="avgFee"
                stroke="#1f4b99"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Avg Daily Fee"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </StatisticsChartCard>

      {/* Fees by Domain */}
      <StatisticsChartCard
        title={t('statistics.expertsFees.byDomain')}
        description={t('statistics.expertsFees.domainDesc')}
        className="mb-6"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredDomainData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="domain" tick={{ fontSize: 12 }} />
              <YAxis unit="$" />
              <Tooltip formatter={(value: number) => [`$${value}/day`]} />
              <Legend />
              <Bar dataKey="junior" name="Junior" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mid" name="Mid" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="senior" name="Senior" fill="#1f4b99" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lead" name="Lead" fill="#0f2d66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </StatisticsChartCard>

      {/* Fees by Country Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatisticsChartCard
          title={t('statistics.expertsFees.byCountry')}
          description={t('statistics.expertsFees.countryDesc')}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredCountryData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="$" />
                <YAxis type="category" dataKey="country" width={90} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [`$${value}/day`, 'Avg Fee']} />
                <Bar dataKey="avgFee" fill="#1f4b99" radius={[0, 6, 6, 0]} name="Avg Daily Fee" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StatisticsChartCard>

        {/* Country Summary Cards */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">{t('statistics.expertsFees.byCountry')}</h3>
          <div className="space-y-3 overflow-y-auto max-h-64">
            {filteredCountryData.map((item) => (
              <div
                key={item.country}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-primary">{item.country}</p>
                  <p className="text-xs text-gray-500">{item.experts} experts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">${item.avgFee}/day</p>
                  <p
                    className={`text-xs font-medium ${item.avgFee >= overallAvg ? 'text-emerald-600' : 'text-amber-600'}`}
                  >
                    {item.avgFee >= overallAvg ? 'Above avg' : 'Below avg'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain Summary Cards */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Fee Range by Domain</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDomainData.map((item) => (
            <div key={item.domain} className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-semibold text-primary mb-3">{item.domain}</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Junior</span>
                  <span className="font-medium">${item.junior}/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mid</span>
                  <span className="font-medium">${item.mid}/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Senior</span>
                  <span className="font-medium text-primary">${item.senior}/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lead</span>
                  <span className="font-bold text-primary">${item.lead}/day</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StatisticsSectionLayout>
  );
}
