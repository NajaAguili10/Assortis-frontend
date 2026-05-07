import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CalendarDays, Filter, Layers, Lock, RotateCcw, Sparkles } from 'lucide-react';
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

const OPPORTUNITY_TYPE_OPTIONS = [
  { value: 'ALL', labelKey: 'matching-opportunities.projects.filter.all-categories' },
  { value: OpportunityTypeEnum.OPEN_PROJECT, label: 'Open Projects' },
  { value: OpportunityTypeEnum.CONTRACT_AWARD, label: 'Contract Awards' },
  { value: OpportunityTypeEnum.SHORTLIST, label: 'Shortlists' },
];

const FREE_PREVIEW_COUNT = 2;

const DEFAULT_FILTERS: MatchingProjectsFilterDTO = {
  sort: 'relevance',
  category: 'ALL',
  country: 'ALL',
  minScore: 0,
  dateRange: '5days',
};

const TYPE_PARAM_MAP: Record<string, OpportunityTypeEnum | 'ALL'> = {
  'open-projects': OpportunityTypeEnum.OPEN_PROJECT,
  project: OpportunityTypeEnum.OPEN_PROJECT,
  'contract-awards': OpportunityTypeEnum.CONTRACT_AWARD,
  contract: OpportunityTypeEnum.CONTRACT_AWARD,
  shortlists: OpportunityTypeEnum.SHORTLIST,
  shortlist: OpportunityTypeEnum.SHORTLIST,
};

export default function MatchingProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  const [filters, setFilters] = useState<MatchingProjectsFilterDTO>(() => {
    const typeParam = searchParams.get('type');
    return {
      ...DEFAULT_FILTERS,
      category: typeParam ? TYPE_PARAM_MAP[typeParam] ?? 'ALL' : 'ALL',
    };
  });
  const [showCustomDate, setShowCustomDate] = useState(false);

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (!typeParam) return;
    setFilters(prev => ({
      ...prev,
      category: TYPE_PARAM_MAP[typeParam] ?? 'ALL',
    }));
  }, [searchParams]);

  const countries = useMemo(() => {
    return Array.from(new Set(opportunities.map(opportunity => opportunity.country))).sort();
  }, [opportunities]);

  const filteredProjects = useMemo(() => {
    const effectiveFilters = isSubscribed
      ? filters
      : { ...filters, dateRange: '30days' as const, minScore: 0 as const };
    return getFilteredMatchingProjects(effectiveFilters);
  }, [filters, getFilteredMatchingProjects, isSubscribed]);

  const visibleProjects = isSubscribed ? filteredProjects : filteredProjects.slice(0, FREE_PREVIEW_COUNT);
  const hiddenCount = Math.max(filteredProjects.length - visibleProjects.length, 0);

  const isFiltered =
    filters.sort !== 'relevance' ||
    filters.category !== 'ALL' ||
    filters.country !== 'ALL' ||
    filters.minScore !== 0 ||
    filters.dateRange !== '5days';

  const openDetail = (opportunityId: string) => {
    const opportunity = opportunities.find(item => item.id === opportunityId);
    if (!opportunity) return;

    if (opportunity.type === OpportunityTypeEnum.CONTRACT_AWARD) {
      navigate(`/matching-opportunities/opportunities/award/${opportunityId}`);
      return;
    }

    if (opportunity.type === OpportunityTypeEnum.SHORTLIST) {
      navigate(`/matching-opportunities/opportunities/shortlist/${opportunityId}`);
      return;
    }

    if (
      opportunity.type === OpportunityTypeEnum.PROJECT_VACANCY ||
      opportunity.type === OpportunityTypeEnum.IN_HOUSE_VACANCY
    ) {
      navigate(`/matching-opportunities/opportunities/vacancy/${opportunityId}`);
      return;
    }

    navigate(`/matching-opportunities/opportunities/project/${opportunityId}`);
  };

  const dateRangeLabelKey: Record<MatchingProjectsFilterDTO['dateRange'], string> = {
    '5days': 'matching-opportunities.projects.filter.date-5days',
    '7days': 'matching-opportunities.projects.filter.date-7days',
    '30days': 'matching-opportunities.projects.filter.date-30days',
    custom: 'matching-opportunities.projects.filter.date-custom',
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

        <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Filter className="h-5 w-5 text-primary" />
              <span>{t('matching-opportunities.projects.sort.label')}:</span>
            </div>

            <Select
              value={filters.sort}
              onValueChange={(value: 'relevance' | 'date') => setFilters(prev => ({ ...prev, sort: value }))}
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-[180px] bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('matching-opportunities.projects.sort.relevance')}</SelectItem>
                <SelectItem value="date">{t('matching-opportunities.projects.sort.date')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.dateRange}
              onValueChange={(value: MatchingProjectsFilterDTO['dateRange']) => {
                setFilters(prev => ({ ...prev, dateRange: value, customDateFrom: undefined, customDateTo: undefined }));
                setShowCustomDate(value === 'custom');
              }}
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-[190px] bg-gray-50">
                <CalendarDays className="mr-2 h-4 w-4 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5days">{t('matching-opportunities.projects.filter.date-5days')}</SelectItem>
                <SelectItem value="7days">{t('matching-opportunities.projects.filter.date-7days')}</SelectItem>
                <SelectItem value="30days">{t('matching-opportunities.projects.filter.date-30days')}</SelectItem>
                <SelectItem value="custom">{t('matching-opportunities.projects.filter.date-custom')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={String(filters.category)}
              onValueChange={(value: string) => setFilters(prev => ({ ...prev, category: value as MatchingProjectsFilterDTO['category'] }))}
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-[220px] bg-gray-50">
                <SelectValue placeholder={t('matching-opportunities.projects.filter.category')} />
              </SelectTrigger>
              <SelectContent>
                {OPPORTUNITY_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.labelKey ? t(option.labelKey) : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.country}
              onValueChange={(value: string) => setFilters(prev => ({ ...prev, country: value }))}
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-[220px] bg-gray-50">
                <SelectValue placeholder={t('matching-opportunities.projects.filter.location')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Countries</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(filters.minScore)}
              onValueChange={(value: string) => setFilters(prev => ({ ...prev, minScore: Number(value) as 0 | 50 | 70 | 90 }))}
              disabled={!isSubscribed}
            >
              <SelectTrigger className="w-[180px] bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('matching-opportunities.projects.filter.min-score-any')}</SelectItem>
                <SelectItem value="50">{t('matching-opportunities.projects.filter.min-score-50')}</SelectItem>
                <SelectItem value="70">{t('matching-opportunities.projects.filter.min-score-70')}</SelectItem>
                <SelectItem value="90">{t('matching-opportunities.projects.filter.min-score-90')}</SelectItem>
              </SelectContent>
            </Select>

            {showCustomDate && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="h-10 rounded-md border border-gray-200 bg-white px-2 text-sm"
                  value={filters.customDateFrom ?? ''}
                  onChange={event => setFilters(prev => ({ ...prev, customDateFrom: event.target.value || undefined }))}
                  disabled={!isSubscribed}
                  aria-label={t('matching-opportunities.projects.filter.date-from')}
                />
                <input
                  type="date"
                  className="h-10 rounded-md border border-gray-200 bg-white px-2 text-sm"
                  value={filters.customDateTo ?? ''}
                  onChange={event => setFilters(prev => ({ ...prev, customDateTo: event.target.value || undefined }))}
                  disabled={!isSubscribed}
                  aria-label={t('matching-opportunities.projects.filter.date-to')}
                />
              </div>
            )}

            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  setShowCustomDate(false);
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('matching-opportunities.projects.filter.reset')}
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline" className="border-blue-200 text-blue-600">
                {t(dateRangeLabelKey[filters.dateRange])}
              </Badge>
              <span>{visibleProjects.length} {t('matching-opportunities.projects.results')}</span>
            </div>
          </div>
        </div>

        {!isSubscribed && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Subscription preview</p>
                <p className="mt-1">You are seeing a limited preview. Subscribe to unlock all matching projects and advanced filters.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-5">
          {visibleProjects.length === 0 ? (
            <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
              {t('matching-opportunities.projects.empty')}
            </div>
          ) : (
            visibleProjects.map(opportunity => (
              <div key={opportunity.id} onDoubleClick={() => openDetail(opportunity.id)}>
                <MatchingOpportunityCard
                  opportunity={opportunity}
                  isSaved={isSaved(opportunity.id)}
                  onSave={saveOpportunity}
                  onRemove={removeOpportunity}
                  onApply={openDetail}
                  onExpressInterest={openDetail}
                  onNotInterested={dismissOpportunity}
                />
              </div>
            ))
          )}

          {!isSubscribed && hiddenCount > 0 && (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="font-semibold text-primary">{hiddenCount} more matching projects available</p>
              <p className="mt-1 text-sm text-gray-600">Upgrade your subscription to access the full list.</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
