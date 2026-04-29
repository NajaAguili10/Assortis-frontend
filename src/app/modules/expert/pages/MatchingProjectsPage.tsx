import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Filter, RotateCcw, Layers, Lock, CalendarDays, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { MatchingOpportunityCard } from '@app/components/MatchingOpportunityCard';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import {
  MatchingProjectsFilterDTO,
  OpportunityTypeEnum,
} from '@app/types/matchingOpportunities.dto';

const OPPORTUNITY_TYPE_OPTIONS: { value: OpportunityTypeEnum | 'ALL'; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'matching-opportunities.projects.filter.all-categories' },
  { value: OpportunityTypeEnum.OPEN_PROJECT, labelKey: 'matching-opportunities.types.openProject' },
  { value: OpportunityTypeEnum.CONTRACT_AWARD, labelKey: 'matching-opportunities.types.contractAward' },
  { value: OpportunityTypeEnum.SHORTLIST, labelKey: 'matching-opportunities.types.shortlist' },
  { value: OpportunityTypeEnum.PROJECT_VACANCY, labelKey: 'matching-opportunities.types.projectVacancy' },
  { value: OpportunityTypeEnum.IN_HOUSE_VACANCY, labelKey: 'matching-opportunities.types.inHouseVacancy' },
];

const FREE_PREVIEW_COUNT = 3;

const DEFAULT_FILTERS: MatchingProjectsFilterDTO = {
  sort: 'relevance',
  category: 'ALL',
  country: 'ALL',
  minScore: 0,
  dateRange: '5days',
};

export default function MatchingProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSubscribed = user?.isSubscribed !== false;

  const {
    opportunities,
    saveOpportunity,
    removeOpportunity,
    isSaved,
    dismissOpportunity,
    getFilteredMatchingProjects,
  } = useMatchingOpportunities();

  const [filters, setFilters] = useState<MatchingProjectsFilterDTO>(DEFAULT_FILTERS);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const countries = useMemo(() => {
    const unique = Array.from(new Set(opportunities.map(o => o.country))).sort();
    return unique;
  }, [opportunities]);

  // For non-subscribers, skip the date filter so they still see something
  const effectiveFilters = useMemo<MatchingProjectsFilterDTO>(() => {
    if (!isSubscribed) return { ...filters, dateRange: '30days', minScore: 0 };
    return filters;
  }, [filters, isSubscribed]);

  const allFilteredProjects = useMemo(
    () => getFilteredMatchingProjects(effectiveFilters),
    [effectiveFilters, getFilteredMatchingProjects, opportunities]
  );

  // Subscribers see everything; non-subscribers see the first FREE_PREVIEW_COUNT
  const visibleProjects = isSubscribed
    ? allFilteredProjects
    : allFilteredProjects.slice(0, FREE_PREVIEW_COUNT);
  const lockedCount = isSubscribed ? 0 : Math.max(0, allFilteredProjects.length - FREE_PREVIEW_COUNT);

  const handleDismiss = (id: string) => {
    dismissOpportunity(id);
    toast.info(t('matching-opportunities.toast.dismissed'));
  };

  const handleApply = (id: string) => {
    toast.success(t('matching-opportunities.toast.applicationSubmitted'));
  };

  const handleExpressInterest = (id: string) => {
    toast.success(t('matching-opportunities.toast.interestExpressed'));
  };

  const handleSave = (id: string) => {
    saveOpportunity(id);
    toast.success(t('matching-opportunities.toast.opportunitySaved'));
  };

  const handleRemove = (id: string) => {
    removeOpportunity(id);
    toast.info(t('matching-opportunities.toast.opportunityRemoved'));
  };

  const isFiltered =
    filters.sort !== 'relevance' ||
    filters.category !== 'ALL' ||
    filters.country !== 'ALL' ||
    filters.minScore !== 0 ||
    filters.dateRange !== '5days';

  const dateRangeLabelKey: Record<string, string> = {
    '5days': 'matching-opportunities.projects.filter.date-5days',
    '7days': 'matching-opportunities.projects.filter.date-7days',
    '30days': 'matching-opportunities.projects.filter.date-30days',
    'custom': 'matching-opportunities.projects.filter.date-custom',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Layers}
        title={t('matching-opportunities.projects.title')}
        description={t('matching-opportunities.projects.subtitle')}
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        {/* Non-subscriber banner */}
        {!isSubscribed && (
          <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold text-lg">{t('matching-opportunities.gate.title')}</span>
              </div>
              <p className="text-blue-100 text-sm">{t('matching-opportunities.gate.description')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
                onClick={() => navigate('/account/subscription')}
              >
                {t('matching-opportunities.gate.cta-primary')}
              </Button>
            </div>
          </div>
        )}

        {/* Filter bar — advanced filters locked for non-subscribers */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          {!isSubscribed && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs text-amber-700">{t('matching-opportunities.gate.filters-locked')}</span>
              <Badge className="ml-auto text-xs bg-amber-100 text-amber-800 border-0">
                {t('matching-opportunities.gate.limited-badge')}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="w-4 h-4 text-gray-500 shrink-0" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {t('matching-opportunities.projects.sort.label')}:
              </span>
              <Select
                value={filters.sort}
                onValueChange={(v: 'relevance' | 'date') =>
                  setFilters(f => ({ ...f, sort: v }))
                }
                disabled={!isSubscribed}
              >
                <SelectTrigger className="w-36 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">
                    {t('matching-opportunities.projects.sort.relevance')}
                  </SelectItem>
                  <SelectItem value="date">
                    {t('matching-opportunities.projects.sort.date')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
              <Select
                value={filters.dateRange}
                onValueChange={(v: MatchingProjectsFilterDTO['dateRange']) => {
                  setFilters(f => ({ ...f, dateRange: v, customDateFrom: undefined, customDateTo: undefined }));
                  setShowCustomDate(v === 'custom');
                }}
                disabled={!isSubscribed}
              >
                <SelectTrigger className="w-40 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5days">{t('matching-opportunities.projects.filter.date-5days')}</SelectItem>
                  <SelectItem value="7days">{t('matching-opportunities.projects.filter.date-7days')}</SelectItem>
                  <SelectItem value="30days">{t('matching-opportunities.projects.filter.date-30days')}</SelectItem>
                  <SelectItem value="custom">{t('matching-opportunities.projects.filter.date-custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom date inputs */}
            {showCustomDate && isSubscribed && (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{t('matching-opportunities.projects.filter.date-from')}</span>
                  <input
                    type="date"
                    className="border border-gray-200 rounded h-8 px-2 text-sm"
                    value={filters.customDateFrom ?? ''}
                    onChange={e => setFilters(f => ({ ...f, customDateFrom: e.target.value || undefined }))}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{t('matching-opportunities.projects.filter.date-to')}</span>
                  <input
                    type="date"
                    className="border border-gray-200 rounded h-8 px-2 text-sm"
                    value={filters.customDateTo ?? ''}
                    onChange={e => setFilters(f => ({ ...f, customDateTo: e.target.value || undefined }))}
                  />
                </div>
              </>
            )}

            {/* Category — locked for non-subscribers */}
            <Select
              value={filters.category}
              onValueChange={(v: OpportunityTypeEnum | 'ALL') =>
                setFilters(f => ({ ...f, category: v }))
              }
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue placeholder={t('matching-opportunities.projects.filter.category')} />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location — locked for non-subscribers */}
            <Select
              value={filters.country}
              onValueChange={(v: string) => setFilters(f => ({ ...f, country: v }))}
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue
                  placeholder={t('matching-opportunities.opportunities.allCountries')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t('matching-opportunities.opportunities.allCountries')}
                </SelectItem>
                {countries.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Min score — locked for non-subscribers */}
            <Select
              value={String(filters.minScore)}
              onValueChange={(v: string) =>
                setFilters(f => ({ ...f, minScore: Number(v) as 0 | 50 | 70 | 90 }))
              }
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue
                  placeholder={t('matching-opportunities.projects.filter.min-score')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">
                  {t('matching-opportunities.projects.filter.min-score-any')}
                </SelectItem>
                <SelectItem value="50">
                  {t('matching-opportunities.projects.filter.min-score-50')}
                </SelectItem>
                <SelectItem value="70">
                  {t('matching-opportunities.projects.filter.min-score-70')}
                </SelectItem>
                <SelectItem value="90">
                  {t('matching-opportunities.projects.filter.min-score-90')}
                </SelectItem>
              </SelectContent>
            </Select>

            {isFiltered && isSubscribed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilters(DEFAULT_FILTERS); setShowCustomDate(false); }}
                className="flex items-center gap-1 text-gray-500 h-8"
              >
                <RotateCcw className="w-3 h-3" />
                {t('matching-opportunities.projects.filter.reset')}
              </Button>
            )}

            <span className="ml-auto text-sm text-gray-500 flex items-center gap-1">
              {isSubscribed && filters.dateRange !== 'custom' && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 mr-1">
                  {t(dateRangeLabelKey[filters.dateRange])}
                </Badge>
              )}
              {allFilteredProjects.length} {t('matching-opportunities.projects.results')}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {allFilteredProjects.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-200 rounded-lg bg-white">
              <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('matching-opportunities.projects.empty')}</p>
              {isFiltered && isSubscribed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFilters(DEFAULT_FILTERS); setShowCustomDate(false); }}
                  className="mt-3 text-blue-600"
                >
                  {t('matching-opportunities.projects.filter.reset')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {visibleProjects.map(opp => (
                  <MatchingOpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    isSaved={isSaved(opp.id)}
                    onSave={handleSave}
                    onRemove={handleRemove}
                    onApply={handleApply}
                    onExpressInterest={handleExpressInterest}
                    onNotInterested={isSubscribed ? handleDismiss : undefined}
                  />
                ))}
              </div>

              {/* Subscription gate — locked results */}
              {!isSubscribed && lockedCount > 0 && (
                <div className="relative mt-4">
                  {/* Blurred preview cards */}
                  <div className="space-y-4 pointer-events-none select-none blur-sm opacity-60">
                    {allFilteredProjects.slice(FREE_PREVIEW_COUNT, FREE_PREVIEW_COUNT + 2).map(opp => (
                      <MatchingOpportunityCard
                        key={opp.id}
                        opportunity={opp}
                        isSaved={false}
                      />
                    ))}
                  </div>

                  {/* CTA overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-white/80 to-white rounded-lg">
                    <div className="bg-white border border-gray-200 shadow-lg rounded-xl p-6 max-w-md text-center mx-4">
                      <Lock className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('matching-opportunities.gate.title')}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        {t('matching-opportunities.gate.preview-label').replace('{count}', String(lockedCount))}
                      </p>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        onClick={() => navigate('/account/subscription')}
                      >
                        {t('matching-opportunities.gate.cta-primary')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
