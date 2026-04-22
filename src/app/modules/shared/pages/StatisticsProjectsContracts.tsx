import React, { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { isExpertAccountType } from '@app/services/permissions.service';
import { StatisticsSectionLayout } from '@app/components/StatisticsSectionLayout';
import { StatisticsChartCard } from '@app/components/StatisticsChartCard';
import { StatisticsFilterBar } from '@app/components/StatisticsFilterBar';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { statisticsKpis, projectsOverTime, countryDistribution } from '@app/modules/shared/data/statistics.mock';
import { FolderKanban, Briefcase, FileCheck2, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

export default function StatisticsProjectsContracts() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isExpert = isExpertAccountType(user?.accountType);

  const [sector, setSector] = useState('all');
  const [country, setCountry] = useState('all');
  const [donor, setDonor] = useState('all');

  const pageTitle = isExpert ? 'Market Demand Intelligence' : t('statistics.projectsContracts.title');

  return (
    <StatisticsSectionLayout icon={FolderKanban}>
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-primary">{pageTitle}</h2>
      </div>

      <StatisticsFilterBar>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.sector')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.sector')}</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="energy">Energy</SelectItem>
            <SelectItem value="health">Health</SelectItem>
          </SelectContent>
        </Select>

        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('statistics.filters.country')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('statistics.filters.country')}</SelectItem>
            <SelectItem value="kenya">Kenya</SelectItem>
            <SelectItem value="india">India</SelectItem>
            <SelectItem value="morocco">Morocco</SelectItem>
          </SelectContent>
        </Select>

        {/* Donor filter only for organizations */}
        {!isExpert && (
          <Select value={donor} onValueChange={setDonor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('statistics.filters.donor')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('statistics.filters.donor')}</SelectItem>
              <SelectItem value="world-bank">World Bank</SelectItem>
              <SelectItem value="afd">AFD</SelectItem>
              <SelectItem value="undp">UNDP</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" onClick={() => { setSector('all'); setCountry('all'); setDonor('all'); }}>
          {t('statistics.filters.reset')}
        </Button>
      </StatisticsFilterBar>

      {/* Expert KPI cards for Market Demand */}
      {isExpert ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <StatCard title="Tenders Posted" value={statisticsKpis.totalProjects} icon={Briefcase} />
          <StatCard title="Awards Issued" value={statisticsKpis.totalContracts} icon={FileCheck2} />
          <StatCard title="Shortlists (Expert)" value={statisticsKpis.shortlistsCount} icon={Target} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <StatCard title={t('statistics.kpi.totalProjects')} value={statisticsKpis.totalProjects} icon={Briefcase} />
          <StatCard title={t('statistics.kpi.totalContracts')} value={statisticsKpis.totalContracts} icon={FileCheck2} />
          <StatCard title={t('statistics.kpi.shortlists')} value={statisticsKpis.shortlistsCount} icon={Target} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {!isExpert && (
                  <Line type="monotone" dataKey="contracts" stroke="#10b981" strokeWidth={2.5} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StatisticsChartCard>

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
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StatisticsChartCard>
      </div>
    </StatisticsSectionLayout>
  );
}
