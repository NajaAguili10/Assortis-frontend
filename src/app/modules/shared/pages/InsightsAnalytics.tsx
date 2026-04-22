import { useState, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { useInsights } from '@app/modules/administrator/hooks/useInsights';
import { TimeRangeEnum } from '@app/types/insights.dto';
import { ProjectSectorEnum } from '@app/types/project.dto';
import { INSIGHTS_SUBSECTORS } from '@app/types/insights.dto';
import {
  Sparkles,
  BarChart3,
  Lightbulb,
  LayoutDashboard,
  ChevronDown,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Target,
  DollarSign,
  Users,
  Download,
  Calendar,
} from 'lucide-react';

export default function InsightsAnalytics() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis, analytics, sectorPerformance, filters, updateFilters, clearFilters, activeFiltersCount } = useInsights();
  const [selectedSector, setSelectedSector] = useState<ProjectSectorEnum | null>(null);

  const availableSubsectors = useMemo(() => {
    if (!selectedSector) return [];
    return INSIGHTS_SUBSECTORS[selectedSector] || [];
  }, [selectedSector]);

  const handleSectorFilter = (sector: ProjectSectorEnum) => {
    const currentSectors = filters.sector || [];
    const newSectors = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    updateFilters({ sector: newSectors.length > 0 ? newSectors : undefined });
    
    if (currentSectors.includes(sector)) {
      setSelectedSector(null);
    } else {
      setSelectedSector(sector);
    }
  };

  const handleSubsectorFilter = (subsector: string) => {
    const currentSubsectors = filters.subsector || [];
    const newSubsectors = currentSubsectors.includes(subsector)
      ? currentSubsectors.filter(s => s !== subsector)
      : [...currentSubsectors, subsector];
    updateFilters({ subsector: newSubsectors.length > 0 ? newSubsectors : undefined });
  };

  const handleTimeRangeFilter = (timeRange: TimeRangeEnum) => {
    updateFilters({ timeRange });
  };

  const getTrendIcon = (direction: 'UP' | 'DOWN' | 'STABLE') => {
    if (direction === 'UP') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (direction === 'DOWN') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <ArrowRight className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (direction: 'UP' | 'DOWN' | 'STABLE') => {
    if (direction === 'UP') return 'text-green-600';
    if (direction === 'DOWN') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('insights.hub.title')}
        description={t('insights.hub.subtitle')}
        icon={Sparkles}
        stats={[
          { value: kpis.totalOpportunities.toString(), label: t('insights.stats.totalOpportunities') }
        ]}
      />

      {/* Sub Menu */}
      <SubMenu
        items={[
          { label: t('insights.submenu.analytics'), active: true, icon: BarChart3 },
          { label: t('insights.submenu.aiInsights'), icon: Lightbulb, onClick: () => navigate('/insights/ai-insights') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('insights.analytics.title')}</h2>
            <p className="text-muted-foreground">{t('insights.analytics.subtitle')}</p>
          </div>

          {/* Horizontal Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Time Range Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('insights.filters.timeRange')}
                      <Badge className="ml-2" variant="secondary">
                        {t(`insights.timeRange.${filters.timeRange || TimeRangeEnum.LAST_90_DAYS}`)}
                      </Badge>
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-3">{t('insights.filters.timeRange')}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.values(TimeRangeEnum).map((range) => (
                          <Button
                            key={range}
                            variant={filters.timeRange === range ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleTimeRangeFilter(range)}
                          >
                            {filters.timeRange === range && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t(`insights.timeRange.${range}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Sector Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Target className="w-4 h-4 mr-2" />
                      {t('insights.filters.sector')}
                      {filters.sector && filters.sector.length > 0 && (
                        <Badge className="ml-2" variant="secondary">{filters.sector.length}</Badge>
                      )}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm mb-3">{t('insights.filters.sector')}</h4>
                      <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                        {Object.values(ProjectSectorEnum).map((sector) => (
                          <Button
                            key={sector}
                            variant={filters.sector?.includes(sector) ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleSectorFilter(sector)}
                          >
                            {filters.sector?.includes(sector) && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t(`projects.sector.${sector}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Subsector Filter */}
                {selectedSector && availableSubsectors.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Target className="w-4 h-4 mr-2" />
                        {t('insights.filters.subsector')}
                        {filters.subsector && filters.subsector.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.subsector.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('insights.filters.subsector')}</h4>
                        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                          {availableSubsectors.map((subsector) => (
                            <Button
                              key={subsector}
                              variant={filters.subsector?.includes(subsector) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleSubsectorFilter(subsector)}
                            >
                              {filters.subsector?.includes(subsector) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`subsectors.${subsector}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  {t('insights.actions.exportData')}
                </Button>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {t('insights.filters.clear')}
                  </Button>
                )}
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{t('common.filter')}:</span>
                  {filters.sector?.map((sector) => (
                    <Badge key={sector} variant="secondary" className="gap-1">
                      {t(`projects.sector.${sector}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleSectorFilter(sector)} />
                    </Badge>
                  ))}
                  {filters.subsector?.map((subsector) => (
                    <Badge key={subsector} variant="secondary" className="gap-1">
                      {t(`subsectors.${subsector}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleSubsectorFilter(subsector)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sector Performance Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-primary mb-4">{t('insights.sectorPerformance.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectorPerformance.map((performance) => (
                <div key={performance.sector} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-primary mb-1">
                        {t(`projects.sector.${performance.sector}`)}
                      </h4>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(performance.trendDirection)}
                        <span className={getTrendColor(performance.trendDirection)}>
                          {t(`insights.analytics.trendDirection`)}: {performance.trendDirection}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('insights.sectorPerformance.opportunities')}:</span>
                      <span className="text-sm font-semibold text-primary">{performance.totalOpportunities}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('insights.sectorPerformance.successRate')}:</span>
                      <span className="text-sm font-semibold text-green-600">{performance.successRate}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('insights.sectorPerformance.avgMatchScore')}:</span>
                      <span className="text-sm font-semibold text-blue-600">{performance.avgMatchScore}%</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">{t('insights.sectorPerformance.totalValue')}:</span>
                      <span className="text-sm font-bold text-primary">${(performance.totalValue / 1000000).toFixed(1)}M</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{t('insights.sectorPerformance.avgBudget')}:</span>
                      <span className="text-sm font-semibold text-primary">${(performance.avgBudget / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics Data */}
          {analytics.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">{t('insights.analytics.trendAnalysis')}</h3>
              <div className="space-y-6">
                {analytics.map((data) => (
                  <div key={data.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                          {t(`projects.sector.${data.sector}`)}
                          {data.subsector && (
                            <Badge variant="outline" className="text-xs">
                              {data.subsector}
                            </Badge>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-sm">
                          {getTrendIcon(data.trendDirection)}
                          <span className={getTrendColor(data.trendDirection)}>
                            {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}% {t('insights.analytics.growthRate')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{t('insights.analytics.totalTenders')}</p>
                        <p className="text-xl font-bold text-primary">{data.totalTenders}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{t('insights.analytics.activeTenders')}</p>
                        <p className="text-xl font-bold text-blue-600">{data.activeTenders}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{t('insights.analytics.successfulBids')}</p>
                        <p className="text-xl font-bold text-green-600">{data.successfulBids}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{t('insights.analytics.avgBudget')}</p>
                        <p className="text-xl font-bold text-purple-600">${(data.avgBudget / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">{t('insights.analytics.avgCompetition')}</p>
                        <p className="text-xl font-bold text-orange-600">{data.avgCompetition}</p>
                      </div>
                    </div>

                    {/* Monthly Chart Data */}
                    {data.monthlyData.length > 0 && (
                      <div>
                        <h5 className="font-medium text-primary mb-3">{t('insights.analytics.monthlyData')}</h5>
                        <div className="grid grid-cols-3 gap-4">
                          {data.monthlyData.map((month) => (
                            <div key={month.month} className="border rounded-lg p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-2">{month.month}</p>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Tenders:</span>
                                  <span className="font-semibold text-primary">{month.tenders}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Submissions:</span>
                                  <span className="font-semibold text-blue-600">{month.submissions}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Wins:</span>
                                  <span className="font-semibold text-green-600">{month.wins}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('insights.analytics.noData')}</h3>
              <p className="text-sm text-muted-foreground">{t('insights.analytics.noData.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}