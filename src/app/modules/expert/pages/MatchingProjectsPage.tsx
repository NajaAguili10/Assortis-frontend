import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Briefcase, Building2, CalendarDays, CalendarIcon, ChevronRight, ChevronUp, Filter, Layers, Lock, Plus, RotateCcw, Search, Sparkles } from 'lucide-react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { MatchingOpportunityCard } from '@app/components/MatchingOpportunityCard';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import { Checkbox } from '@app/components/ui/checkbox';
import { Calendar } from '@app/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@app/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import {
  MatchingProjectsFilterDTO,
  MatchingVacancyFiltersDTO,
  OpportunityTypeEnum,
} from '@app/types/matchingOpportunities.dto';
import {
  CountryEnum,
  FundingAgencyEnum,
  SectorEnum,
} from '@app/types/tender.dto';
import {
  PUBLIC_VISIBLE_ITEM_LIMIT,
  getMatchingProjectsAccessMode,
} from '@app/services/permissions.service';
import { toast } from 'sonner';

const OPPORTUNITY_TYPE_OPTIONS = [
  { value: 'ALL', labelKey: 'matching-opportunities.projects.filter.all-categories' },
  { value: OpportunityTypeEnum.OPEN_PROJECT, label: 'Open Projects' },
  { value: OpportunityTypeEnum.CONTRACT_AWARD, label: 'Contract Awards' },
  { value: OpportunityTypeEnum.SHORTLIST, label: 'Shortlists' },
  { value: OpportunityTypeEnum.IN_HOUSE_VACANCY, label: 'My In-house Vacancies' },
  { value: OpportunityTypeEnum.PROJECT_VACANCY, label: 'Project Vacancies' },
];

const FREE_PREVIEW_COUNT = PUBLIC_VISIBLE_ITEM_LIMIT;

const DEFAULT_FILTERS: MatchingProjectsFilterDTO = {
  sort: 'relevance',
  category: OpportunityTypeEnum.OPEN_PROJECT,
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
  'project-vacancies': OpportunityTypeEnum.PROJECT_VACANCY,
  vacancy: OpportunityTypeEnum.PROJECT_VACANCY,
  vacancies: OpportunityTypeEnum.PROJECT_VACANCY,
  'in-house-vacancies': OpportunityTypeEnum.IN_HOUSE_VACANCY,
  'in-house': OpportunityTypeEnum.IN_HOUSE_VACANCY,
};

function readSavedProjectIds(): string[] {
  try {
    const stored = localStorage.getItem('projects.favouriteIds');
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed.filter((value): value is string => typeof value === 'string');
    }

    if (parsed && typeof parsed === 'object') {
      return Object.entries(parsed)
        .filter(([, isSaved]) => Boolean(isSaved))
        .map(([projectId]) => projectId);
    }
  } catch {
    return [];
  }

  return [];
}

function writeSavedProjectIds(projectIds: string[]) {
  try {
    localStorage.setItem('projects.favouriteIds', JSON.stringify(projectIds));
  } catch {
    // Ignore storage errors; pipeline state remains available in memory.
  }
}

function toIsoString(value: Date | string | number | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

function toggleInArray<T>(items: T[], value: T): T[] {
  return items.includes(value) ? items.filter(item => item !== value) : [...items, value];
}

const createDefaultVacancyFilters = (
  activeType: OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY,
): MatchingVacancyFiltersDTO => ({
  searchInput: '',
  searchMode: 'allWords',
  publishedFrom: undefined,
  publishedTo: undefined,
  selectedSectors: [],
  selectedCountries: [],
  selectedFundingAgencies: [],
  status: 'all',
  location: 'all',
  department: 'all',
  deadline: 'all',
  sort: 'newest',
  activeType,
});

export default function MatchingProjectsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const subscriptionActive = user?.isSubscribed !== false;
  const accessMode = getMatchingProjectsAccessMode(user?.accountType, subscriptionActive);
  const isSubscribed = accessMode === 'full';
  const isPreviewMode = accessMode === 'preview';
  const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(() => new Set(readSavedProjectIds()));
  const { addToPipeline, isInPipeline } = usePipeline();
  const {
    opportunities,
    saveOpportunity,
    removeOpportunity,
    isSaved,
    dismissOpportunity,
    getFilteredMatchingProjects,
    getFilteredVacancyOpportunities,
  } = useMatchingOpportunities();

  const [filters, setFilters] = useState<MatchingProjectsFilterDTO>(() => {
    const typeParam = searchParams.get('type');
    return {
      ...DEFAULT_FILTERS,
      category: typeParam ? TYPE_PARAM_MAP[typeParam] ?? OpportunityTypeEnum.OPEN_PROJECT : OpportunityTypeEnum.OPEN_PROJECT,
    };
  });
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [vacancySearchInput, setVacancySearchInput] = useState('');
  const [expandedVacancySections, setExpandedVacancySections] = useState({
    sectors: false,
    countries: false,
    fundingAgencies: false,
  });
  const [vacancyFiltersByType, setVacancyFiltersByType] = useState<Record<OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY, MatchingVacancyFiltersDTO>>({
    [OpportunityTypeEnum.PROJECT_VACANCY]: createDefaultVacancyFilters(OpportunityTypeEnum.PROJECT_VACANCY),
    [OpportunityTypeEnum.IN_HOUSE_VACANCY]: createDefaultVacancyFilters(OpportunityTypeEnum.IN_HOUSE_VACANCY),
  });

  useEffect(() => {
    const typeParam = searchParams.get('type');
    setFilters(prev => ({
      ...prev,
      category: typeParam ? TYPE_PARAM_MAP[typeParam] ?? OpportunityTypeEnum.OPEN_PROJECT : OpportunityTypeEnum.OPEN_PROJECT,
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

  const isVacancyView =
    filters.category === OpportunityTypeEnum.PROJECT_VACANCY ||
    filters.category === OpportunityTypeEnum.IN_HOUSE_VACANCY;
  const activeVacancyType = filters.category === OpportunityTypeEnum.IN_HOUSE_VACANCY
    ? OpportunityTypeEnum.IN_HOUSE_VACANCY
    : OpportunityTypeEnum.PROJECT_VACANCY;
  const vacancyFilters = vacancyFiltersByType[activeVacancyType];
  const setActiveVacancyFilters = (updater: (current: MatchingVacancyFiltersDTO) => MatchingVacancyFiltersDTO) => {
    setVacancyFiltersByType(prev => ({
      ...prev,
      [activeVacancyType]: updater(prev[activeVacancyType]),
    }));
  };

  useEffect(() => {
    setVacancySearchInput(vacancyFilters.searchInput);
  }, [activeVacancyType, vacancyFilters.searchInput]);

  const vacancyProjects = useMemo(() => {
    if (!isVacancyView) return [];
    return getFilteredVacancyOpportunities({
      ...vacancyFilters,
      activeType: activeVacancyType,
    });
  }, [activeVacancyType, getFilteredVacancyOpportunities, isVacancyView, vacancyFilters]);

  const resultProjects = isVacancyView ? vacancyProjects : filteredProjects;
  const visibleProjects = isSubscribed ? resultProjects : resultProjects.slice(0, FREE_PREVIEW_COUNT);
  const hiddenCount = Math.max(resultProjects.length - visibleProjects.length, 0);

  const isFiltered =
    filters.sort !== 'relevance' ||
    filters.category !== 'ALL' ||
    filters.country !== 'ALL' ||
    filters.minScore !== 0 ||
    filters.dateRange !== '5days';

  const vacancyFilterCount =
    (vacancyFilters.searchInput ? 1 : 0) +
    (vacancyFilters.searchMode !== 'allWords' ? 1 : 0) +
    (vacancyFilters.publishedFrom ? 1 : 0) +
    (vacancyFilters.publishedTo ? 1 : 0) +
    vacancyFilters.selectedSectors.length +
    vacancyFilters.selectedCountries.length +
    vacancyFilters.selectedFundingAgencies.length;

  const selectVacancyType = (type: OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY) => {
    setFilters(prev => ({ ...prev, category: type }));
  };

  const openDetail = (opportunityId: string) => {
    if (isPreviewMode) {
      setIsUpgradePromptOpen(true);
      return;
    }

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

  const handleAddToMyProjects = (opportunityId: string) => {
    const opportunity = opportunities.find(item => item.id === opportunityId);
    if (!opportunity || opportunity.type !== OpportunityTypeEnum.OPEN_PROJECT) return;

    if (favouriteIds.has(opportunity.id) && isInPipeline(opportunity.id)) {
      toast.success('Project is already in My Projects');
      return;
    }

    setFavouriteIds(prev => {
      const next = new Set(prev);
      next.add(opportunity.id);
      writeSavedProjectIds(Array.from(next));
      return next;
    });

    addToPipeline(opportunity.id, undefined, undefined, 50, {
      tenderTitle: opportunity.title,
      tenderReference: opportunity.id,
      organizationName: opportunity.organization || opportunity.donor,
      country: opportunity.country,
      donor: opportunity.donor,
      status: opportunity.status,
      expectedValue: opportunity.budget || opportunity.contractValue || 0,
      currency: opportunity.currency || 'USD',
      deadline: toIsoString(opportunity.deadline),
      sectors: [opportunity.sector],
      matchScore: opportunity.relevanceScore,
    });

    saveOpportunity(opportunity.id);
    toast.success('Project added to My Projects as EOI Preparation');
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

        {isVacancyView && (
          <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Job Vacancies</h3>
                <p className="text-sm text-muted-foreground">Search matching in-house and project vacancies.</p>
              </div>
              {vacancyFilterCount > 0 && <Badge>{vacancyFilterCount} active filters</Badge>}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { type: OpportunityTypeEnum.IN_HOUSE_VACANCY, label: 'My In-house Vacancies', icon: Building2 },
                { type: OpportunityTypeEnum.PROJECT_VACANCY, label: 'Project Vacancies', icon: Briefcase },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeVacancyType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
                      active
                        ? 'border-[#E63462] bg-[#E63462] text-white shadow-sm'
                        : 'border-gray-200 bg-white text-primary hover:border-[#E63462] hover:text-[#E63462]'
                    }`}
                    onClick={() => selectVacancyType(item.type)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-lg border border-gray-200">
              <div className="border-b px-4 py-3">
                <h4 className="text-sm font-bold uppercase tracking-wide text-[#E63462]">Search Criteria</h4>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-[180px_180px_minmax(0,1fr)_240px]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Published from</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start min-h-10">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {vacancyFilters.publishedFrom ? vacancyFilters.publishedFrom.toLocaleDateString() : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={vacancyFilters.publishedFrom} onSelect={(date) => setActiveVacancyFilters(prev => ({ ...prev, publishedFrom: date }))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">To</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start min-h-10">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {vacancyFilters.publishedTo ? vacancyFilters.publishedTo.toLocaleDateString() : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={vacancyFilters.publishedTo} onSelect={(date) => setActiveVacancyFilters(prev => ({ ...prev, publishedTo: date }))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Keywords</label>
                  <Input
                    value={vacancySearchInput}
                    onChange={event => setVacancySearchInput(event.target.value)}
                    placeholder="Enter keywords to search"
                    className="min-h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Keyword match type</label>
                  <Select
                    value={vacancyFilters.searchMode}
                    onValueChange={(value: 'allWords' | 'anyWords' | 'exactPhrase') =>
                      setActiveVacancyFilters(prev => ({ ...prev, searchMode: value }))
                    }
                  >
                    <SelectTrigger className="min-h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allWords">Search all of the words</SelectItem>
                      <SelectItem value="anyWords">Search any of the words</SelectItem>
                      <SelectItem value="exactPhrase">Exact phrase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-gray-200">
              <div className="border-b px-4 py-3">
                <h4 className="text-sm font-bold uppercase tracking-wide text-[#E63462]">Selection</h4>
              </div>
              <div className="space-y-3 p-4">
                {[
                  { key: 'sectors' as const, label: 'Sectors', count: vacancyFilters.selectedSectors.length },
                  { key: 'countries' as const, label: 'Countries', count: vacancyFilters.selectedCountries.length },
                  { key: 'fundingAgencies' as const, label: 'Funding Agencies', count: vacancyFilters.selectedFundingAgencies.length },
                ].map((section) => {
                  const expanded = expandedVacancySections[section.key];
                  return (
                    <div key={section.key} className="rounded-md border border-gray-200">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between bg-[#E63462] px-4 py-2.5 text-left text-sm font-semibold text-white transition-colors hover:bg-[#cf2c55]"
                        onClick={() => setExpandedVacancySections(prev => ({ ...prev, [section.key]: !expanded }))}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Plus className={`h-4 w-4 transition-transform ${expanded ? 'rotate-45' : ''}`} />
                          {section.label}
                          {section.count > 0 && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{section.count}</span>}
                        </span>
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {expanded && (
                        <div className="max-h-64 overflow-auto bg-white p-3">
                          {section.key === 'sectors' && (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {Object.values(SectorEnum).map(item => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={vacancyFilters.selectedSectors.includes(item)}
                                    onCheckedChange={() => setActiveVacancyFilters(prev => ({ ...prev, selectedSectors: toggleInArray(prev.selectedSectors, item) }))}
                                  />
                                  <span>{item.replace(/_/g, ' ')}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {section.key === 'countries' && (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              {Object.values(CountryEnum).map(item => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={vacancyFilters.selectedCountries.includes(item)}
                                    onCheckedChange={() => setActiveVacancyFilters(prev => ({ ...prev, selectedCountries: toggleInArray(prev.selectedCountries, item) }))}
                                  />
                                  <span>{item}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {section.key === 'fundingAgencies' && (
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {Object.values(FundingAgencyEnum).map(item => (
                                <label key={item} className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={vacancyFilters.selectedFundingAgencies.includes(item)}
                                    onCheckedChange={() => setActiveVacancyFilters(prev => ({ ...prev, selectedFundingAgencies: toggleInArray(prev.selectedFundingAgencies, item) }))}
                                  />
                                  <span>{item}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-[#E63462] hover:text-[#E63462]"
                onClick={() => {
                  setVacancySearchInput('');
                  setVacancyFiltersByType(prev => ({
                    ...prev,
                    [activeVacancyType]: createDefaultVacancyFilters(activeVacancyType),
                  }));
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear selection
              </Button>
              <Button
                type="button"
                className="min-h-10"
                onClick={() => setActiveVacancyFilters(prev => ({ ...prev, searchInput: vacancySearchInput.trim() }))}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        )}

        {isPreviewMode && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">Limited preview</p>
                <p className="mt-1">You can preview up to {FREE_PREVIEW_COUNT} matching projects. Upgrade your account to unlock details, actions, and advanced filters.</p>
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
                  onAddToMyProjects={opportunity.type === OpportunityTypeEnum.OPEN_PROJECT ? handleAddToMyProjects : undefined}
                  onNotInterested={dismissOpportunity}
                  onOrganizationClick={(organizationId) => navigate(`/organizations/${organizationId}`)}
                  previewMode={isPreviewMode}
                  onPreviewRestrictedAction={() => setIsUpgradePromptOpen(true)}
                />
              </div>
            ))
          )}

          {isPreviewMode && hiddenCount > 0 && (
            <div className="rounded-xl border border-dashed bg-white p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
              <p className="font-semibold text-primary">{hiddenCount} more matching projects available</p>
              <p className="mt-1 text-sm text-gray-600">Upgrade your subscription to access the full list.</p>
            </div>
          )}
        </div>

        <Dialog open={isUpgradePromptOpen} onOpenChange={setIsUpgradePromptOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upgrade required</DialogTitle>
              <DialogDescription>
                Advanced matching details, saved actions, applications, expressions of interest, and full opportunity access require an upgraded account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpgradePromptOpen(false)}>Keep previewing</Button>
              <Button onClick={() => navigate('/account/subscription')}>View upgrade options</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </div>
  );
}
