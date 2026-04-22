import { useState, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Progress } from '@app/components/ui/progress';
import { useInsights } from '@app/modules/administrator/hooks/useInsights';
import { InsightTypeEnum, InsightPriorityEnum } from '@app/types/insights.dto';
import { ProjectSectorEnum } from '@app/types/project.dto';
import { INSIGHTS_SUBSECTORS } from '@app/types/insights.dto';
import {
  Sparkles,
  BarChart3,
  Lightbulb,
  LayoutDashboard,
  Search,
  ChevronDown,
  CheckCircle,
  X,
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Clock,
  DollarSign,
  ChevronRight,
} from 'lucide-react';

export default function InsightsAI() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { kpis, aiInsights, trends, filters, updateFilters, clearFilters, activeFiltersCount } = useInsights();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<ProjectSectorEnum | null>(null);

  const availableSubsectors = useMemo(() => {
    if (!selectedSector) return [];
    return INSIGHTS_SUBSECTORS[selectedSector] || [];
  }, [selectedSector]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ searchQuery });
  };

  const handleTypeFilter = (type: InsightTypeEnum) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handlePriorityFilter = (priority: InsightPriorityEnum) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    updateFilters({ priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

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

  const getTypeColor = (type: InsightTypeEnum) => {
    switch (type) {
      case InsightTypeEnum.OPPORTUNITY:
        return 'bg-green-50 text-green-700 border-green-200';
      case InsightTypeEnum.TREND:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case InsightTypeEnum.PREDICTION:
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case InsightTypeEnum.RECOMMENDATION:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case InsightTypeEnum.ALERT:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: InsightPriorityEnum) => {
    switch (priority) {
      case InsightPriorityEnum.LOW:
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case InsightPriorityEnum.MEDIUM:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case InsightPriorityEnum.HIGH:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case InsightPriorityEnum.CRITICAL:
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  const getTrendDirectionColor = (direction: 'RISING' | 'DECLINING' | 'STABLE') => {
    switch (direction) {
      case 'RISING':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'DECLINING':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'STABLE':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return '';
    }
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
          { label: t('insights.submenu.analytics'), icon: BarChart3, onClick: () => navigate('/insights/analytics') },
          { label: t('insights.submenu.aiInsights'), active: true, icon: Lightbulb },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('insights.ai.title')}</h2>
            <p className="text-muted-foreground">{t('insights.ai.subtitle')}</p>
          </div>

          {/* Horizontal Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search + Filter Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:max-w-md">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('insights.filters.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        {t('insights.filters.type')}
                        {filters.type && filters.type.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.type.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('insights.filters.type')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(InsightTypeEnum).map((type) => (
                            <Button
                              key={type}
                              variant={filters.type?.includes(type) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleTypeFilter(type)}
                            >
                              {filters.type?.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`insights.type.${type}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Priority Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {t('insights.filters.priority')}
                        {filters.priority && filters.priority.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.priority.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('insights.filters.priority')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(InsightPriorityEnum).map((priority) => (
                            <Button
                              key={priority}
                              variant={filters.priority?.includes(priority) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handlePriorityFilter(priority)}
                            >
                              {filters.priority?.includes(priority) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`insights.priority.${priority}`)}
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

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      {t('insights.filters.clear')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{t('common.filter')}:</span>
                  {filters.type?.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {t(`insights.type.${type}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleTypeFilter(type)} />
                    </Badge>
                  ))}
                  {filters.priority?.map((priority) => (
                    <Badge key={priority} variant="secondary" className="gap-1">
                      {t(`insights.priority.${priority}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handlePriorityFilter(priority)} />
                    </Badge>
                  ))}
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

          {/* AI Insights List */}
          {aiInsights.length > 0 ? (
            <div className="space-y-6 mb-8">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${insight.type === InsightTypeEnum.OPPORTUNITY ? 'bg-green-50' : insight.type === InsightTypeEnum.ALERT ? 'bg-red-50' : 'bg-purple-50'}`}>
                        <Sparkles className={`w-6 h-6 ${insight.type === InsightTypeEnum.OPPORTUNITY ? 'text-green-500' : insight.type === InsightTypeEnum.ALERT ? 'text-red-500' : 'text-purple-500'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-primary mb-2">{insight.title}</h3>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className={getTypeColor(insight.type)}>
                                {t(`insights.type.${insight.type}`)}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                                {t(`insights.priority.${insight.priority}`)}
                              </Badge>
                              <Badge variant="outline">
                                {t(`projects.sector.${insight.sector}`)}
                              </Badge>
                              {insight.actionRequired && (
                                <Badge variant="default" className="bg-red-500">
                                  {t('insights.ai.actionRequired')}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex flex-col p-3 bg-purple-50 rounded-lg">
                            <span className="text-xs text-muted-foreground mb-1">{t('insights.ai.confidenceScore')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-purple-600">{insight.confidenceScore}%</span>
                              <Progress value={insight.confidenceScore} className="h-2 flex-1" />
                            </div>
                          </div>
                          <div className="flex flex-col p-3 bg-green-50 rounded-lg">
                            <span className="text-xs text-muted-foreground mb-1">{t('insights.ai.potentialValue')}</span>
                            <span className="text-lg font-bold text-green-600">${(insight.potentialValue / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex flex-col p-3 bg-blue-50 rounded-lg">
                            <span className="text-xs text-muted-foreground mb-1">{t('insights.ai.relatedOpportunities')}</span>
                            <span className="text-lg font-bold text-blue-600">{insight.relatedOpportunities}</span>
                          </div>
                          <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
                            <span className="text-xs text-muted-foreground mb-1">Created</span>
                            <span className="text-xs font-semibold text-primary">
                              {new Date(insight.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Recommendations */}
                        {insight.recommendations.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-primary mb-2">{t('insights.ai.recommendations')}:</h5>
                            <ul className="space-y-1">
                              {insight.recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Tags */}
                        {insight.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {insight.tags.map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Expiry */}
                        {insight.expiresAt && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 mb-3">
                            <Clock className="w-4 h-4" />
                            {t('insights.ai.expiresAt')}: {new Date(insight.expiresAt).toLocaleDateString()}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="default" size="sm">
                            {t('insights.actions.takeAction')}
                          </Button>
                          <Button variant="outline" size="sm">
                            {t('insights.actions.viewDetails')}
                          </Button>
                          <Button variant="ghost" size="sm">
                            {t('insights.actions.dismiss')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border mb-8">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('insights.ai.noInsights')}</h3>
              <p className="text-sm text-muted-foreground">{t('insights.ai.noInsights.message')}</p>
            </div>
          )}

          {/* Trends Section */}
          {trends.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4">{t('insights.trends.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trends.map((trend) => (
                  <div key={trend.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-primary mb-1">{trend.trendName}</h4>
                        <Badge variant="outline" className="text-xs">
                          {t(`projects.sector.${trend.sector}`)}
                        </Badge>
                      </div>
                      <Badge variant="outline" className={getTrendDirectionColor(trend.direction)}>
                        {t(`insights.trends.${trend.direction}`)}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{t('insights.trends.strength')}:</span>
                          <span className="text-xs font-semibold text-primary">{trend.strength}%</span>
                        </div>
                        <Progress value={trend.strength} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('insights.trends.volume')}:</span>
                        <span className="font-semibold text-primary">{trend.volume}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('insights.analytics.growthRate')}:</span>
                        <span className="font-semibold text-green-600">+{trend.growthRate.toFixed(1)}%</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('insights.trends.relatedTenders')}:</span>
                        <span className="font-semibold text-blue-600">{trend.relatedTenders}</span>
                      </div>
                    </div>

                    {/* Key Factors */}
                    {trend.keyFactors.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-muted-foreground mb-2 block">{t('insights.trends.keyFactors')}:</span>
                        <div className="flex flex-wrap gap-1">
                          {trend.keyFactors.map((factor, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full">
                      {t('insights.actions.viewDetails')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}