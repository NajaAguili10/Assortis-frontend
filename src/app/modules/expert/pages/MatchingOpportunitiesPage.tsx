import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import {
  Award,
  Briefcase,
  Building2,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FolderOpen,
  ListChecks,
  PanelRight,
  Plus,
  RotateCcw,
  Search,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { MatchingOpportunitiesSubMenu } from '@app/components/MatchingOpportunitiesSubMenu';
import { PendingMatchesSidebar } from '@app/modules/expert/components/PendingMatchesSidebar';
import { PageTabs } from '@app/components/PageTabs';
import { MatchingTenderListView } from '@app/modules/expert/components/MatchingTenderListView';
import { MatchingVacancyListView } from '@app/modules/expert/components/MatchingVacancyListView';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Checkbox } from '@app/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@app/components/ui/popover';
import { Calendar } from '@app/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';
import {
  CountryEnum,
  FundingAgencyEnum,
  NoticeTypeEnum,
  ProcurementTypeEnum,
  REGION_COUNTRY_MAP,
  RegionEnum,
  SECTOR_SUBSECTOR_MAP,
  SectorEnum,
  SubSectorEnum,
} from '@app/types/tender.dto';
import {
  MatchingTenderFiltersDTO,
  MatchingVacancyFiltersDTO,
  OpportunityTypeEnum,
} from '@app/types/matchingOpportunities.dto';
import { useMatchingOpportunities } from '@app/modules/expert/hooks/useMatchingOpportunities';

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(item => item !== value) : [...arr, value];
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

export default function MatchingOpportunitiesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const {
    pendingMatches,
    saveOpportunity,
    removeOpportunity,
    isSaved,
    getFilteredTenderOpportunities,
    getFilteredVacancyOpportunities,
  } = useMatchingOpportunities();

  const getInitialTab = (): OpportunityTypeEnum => {
    const type = searchParams.get('type');
    if (type === 'shortlist' || type === 'shortlists') return OpportunityTypeEnum.SHORTLIST;
    if (type === 'contract' || type === 'contract-awards') return OpportunityTypeEnum.CONTRACT_AWARD;
    if (type === 'vacancy' || type === 'project-vacancies') return OpportunityTypeEnum.PROJECT_VACANCY;
    if (type === 'in-house-vacancies') return OpportunityTypeEnum.IN_HOUSE_VACANCY;
    return OpportunityTypeEnum.OPEN_PROJECT;
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OpportunityTypeEnum>(getInitialTab);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'shortlist' || type === 'shortlists') setActiveTab(OpportunityTypeEnum.SHORTLIST);
    else if (type === 'contract' || type === 'contract-awards') setActiveTab(OpportunityTypeEnum.CONTRACT_AWARD);
    else if (type === 'vacancy' || type === 'project-vacancies') setActiveTab(OpportunityTypeEnum.PROJECT_VACANCY);
    else if (type === 'in-house-vacancies') setActiveTab(OpportunityTypeEnum.IN_HOUSE_VACANCY);
    else if (!type) setActiveTab(OpportunityTypeEnum.OPEN_PROJECT);
  }, [searchParams]);
  const [showTenderFilters, setShowTenderFilters] = useState(false);
  const [tenderSearchInput, setTenderSearchInput] = useState('');
  const [vacancySearchInput, setVacancySearchInput] = useState('');

  const [tenderFilters, setTenderFilters] = useState<MatchingTenderFiltersDTO>({
    searchInput: '',
    searchMode: 'allWords',
    selectedProcurementTypes: [],
    selectedNoticeTypes: [],
    publishedFrom: undefined,
    publishedTo: undefined,
    budgetMode: 'any',
    budgetValue: '',
    hideMultiCountry: false,
    selectedSectors: [],
    selectedSubSectors: [],
    selectedRegions: [],
    selectedCountries: [],
    selectedFundingAgencies: [],
    activeType: OpportunityTypeEnum.OPEN_PROJECT,
  });

  const [expandedVacancySections, setExpandedVacancySections] = useState({
    sectors: false,
    countries: false,
    fundingAgencies: false,
  });
  const [vacancyFiltersByType, setVacancyFiltersByType] = useState<Record<OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY, MatchingVacancyFiltersDTO>>({
    [OpportunityTypeEnum.PROJECT_VACANCY]: createDefaultVacancyFilters(OpportunityTypeEnum.PROJECT_VACANCY),
    [OpportunityTypeEnum.IN_HOUSE_VACANCY]: createDefaultVacancyFilters(OpportunityTypeEnum.IN_HOUSE_VACANCY),
  });

  const isTenderTab =
    activeTab === OpportunityTypeEnum.OPEN_PROJECT ||
    activeTab === OpportunityTypeEnum.CONTRACT_AWARD ||
    activeTab === OpportunityTypeEnum.SHORTLIST;

  const activeVacancyType = activeTab === OpportunityTypeEnum.IN_HOUSE_VACANCY
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
  }, [activeVacancyType]);

  const tenderRows = useMemo(() => {
    if (!isTenderTab) return [];
    return getFilteredTenderOpportunities({
      ...tenderFilters,
      activeType: activeTab as OpportunityTypeEnum.OPEN_PROJECT | OpportunityTypeEnum.CONTRACT_AWARD | OpportunityTypeEnum.SHORTLIST,
    });
  }, [activeTab, getFilteredTenderOpportunities, isTenderTab, tenderFilters]);

  const vacancyRows = useMemo(() => {
    if (isTenderTab) return [];
    return getFilteredVacancyOpportunities({
      ...vacancyFilters,
      activeType: activeTab as OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY,
    });
  }, [activeTab, getFilteredVacancyOpportunities, isTenderTab, vacancyFilters]);

  const handleApply = (opportunityId: string) => {
    toast.success(t('matching-opportunities.toast.applicationSubmitted'));
  };

  const handleSaveToggle = (opportunityId: string) => {
    if (isSaved(opportunityId)) {
      removeOpportunity(opportunityId);
      toast.success(t('matching-opportunities.toast.opportunityRemoved'));
      return;
    }

    saveOpportunity(opportunityId);
    toast.success(t('matching-opportunities.toast.opportunitySaved'));
  };

  const tenderFilterCount =
    (tenderFilters.searchInput ? 1 : 0) +
    tenderFilters.selectedProcurementTypes.length +
    tenderFilters.selectedNoticeTypes.length +
    (tenderFilters.publishedFrom ? 1 : 0) +
    (tenderFilters.publishedTo ? 1 : 0) +
    (tenderFilters.budgetValue ? 1 : 0) +
    (tenderFilters.hideMultiCountry ? 1 : 0) +
    tenderFilters.selectedSectors.length +
    tenderFilters.selectedSubSectors.length +
    tenderFilters.selectedRegions.length +
    tenderFilters.selectedCountries.length +
    tenderFilters.selectedFundingAgencies.length;

  const vacancyFilterCount =
    (vacancyFilters.searchInput ? 1 : 0) +
    (vacancyFilters.searchMode !== 'allWords' ? 1 : 0) +
    (vacancyFilters.publishedFrom ? 1 : 0) +
    (vacancyFilters.publishedTo ? 1 : 0) +
    vacancyFilters.selectedSectors.length +
    vacancyFilters.selectedCountries.length +
    vacancyFilters.selectedFundingAgencies.length +
    (vacancyFilters.status !== 'all' ? 1 : 0) +
    (vacancyFilters.location !== 'all' ? 1 : 0) +
    (vacancyFilters.department !== 'all' ? 1 : 0) +
    (vacancyFilters.deadline !== 'all' ? 1 : 0) +
    (vacancyFilters.sort !== 'newest' ? 1 : 0);

  const tabs = [
    {
      label: t('matching-opportunities.tabs.openProjects'),
      icon: FolderOpen,
      active: activeTab === OpportunityTypeEnum.OPEN_PROJECT,
      onClick: () => setActiveTab(OpportunityTypeEnum.OPEN_PROJECT),
    },
    {
      label: t('matching-opportunities.tabs.contractAwards'),
      icon: Award,
      active: activeTab === OpportunityTypeEnum.CONTRACT_AWARD,
      onClick: () => setActiveTab(OpportunityTypeEnum.CONTRACT_AWARD),
    },
    {
      label: t('matching-opportunities.tabs.shortlists'),
      icon: ListChecks,
      active: activeTab === OpportunityTypeEnum.SHORTLIST,
      onClick: () => setActiveTab(OpportunityTypeEnum.SHORTLIST),
    },
    {
      label: 'My In-house Vacancies',
      icon: Building2,
      active: activeTab === OpportunityTypeEnum.IN_HOUSE_VACANCY,
      onClick: () => setActiveTab(OpportunityTypeEnum.IN_HOUSE_VACANCY),
    },
    {
      label: 'Project Vacancies',
      icon: Briefcase,
      active: activeTab === OpportunityTypeEnum.PROJECT_VACANCY,
      onClick: () => setActiveTab(OpportunityTypeEnum.PROJECT_VACANCY),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Target}
        title={t('matching-opportunities.page.title')}
        description={t('matching-opportunities.opportunities.subtitle')}
      />

      <PageContainer>
        <MatchingOpportunitiesSubMenu />

        <div className="mt-6 mb-4 flex justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label={t('matching-opportunities.sidebar.toggle')}
          >
            <PanelRight className="w-4 h-4" />
            {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <div className={`mt-2 grid grid-cols-1 ${sidebarOpen ? 'lg:grid-cols-3' : ''} gap-6`}>
          <div className={sidebarOpen ? 'lg:col-span-2 space-y-6' : 'space-y-6'}>
            {isTenderTab ? (
              <div className="bg-white rounded-lg border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{t('matching-opportunities.opportunities.filters')}</h3>
                  {tenderFilterCount > 0 && <Badge>{tenderFilterCount}</Badge>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto_auto] gap-3">
                  <Input
                    value={tenderSearchInput}
                    onChange={event => setTenderSearchInput(event.target.value)}
                    placeholder={t('matching-opportunities.opportunities.searchPlaceholder')}
                    className="min-h-11"
                  />
                  <Select
                    value={tenderFilters.searchMode}
                    onValueChange={(value: 'allWords' | 'anyWords' | 'exactPhrase' | 'boolean') =>
                      setTenderFilters(prev => ({ ...prev, searchMode: value }))
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allWords">All words</SelectItem>
                      <SelectItem value="anyWords">Any words</SelectItem>
                      <SelectItem value="exactPhrase">Exact phrase</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => setShowTenderFilters(prev => !prev)}
                  >
                    {showTenderFilters
                      ? t('matching-opportunities.filters.hide')
                      : t('matching-opportunities.filters.show')}
                  </Button>

                  <Button
                    type="button"
                    className="min-h-11"
                    onClick={() =>
                      setTenderFilters(prev => ({
                        ...prev,
                        searchInput: tenderSearchInput.trim(),
                      }))
                    }
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {t('matching-opportunities.filters.search')}
                  </Button>
                </div>

                {showTenderFilters && (
                  <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start min-h-11">
                        {t('tenders.filters.procurementType')}
                        {tenderFilters.selectedProcurementTypes.length > 0 && (
                          <Badge className="ml-2">{tenderFilters.selectedProcurementTypes.length}</Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72">
                      <div className="space-y-2">
                        {Object.values(ProcurementTypeEnum).map(item => (
                          <label key={item} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={tenderFilters.selectedProcurementTypes.includes(item)}
                              onCheckedChange={() =>
                                setTenderFilters(prev => ({
                                  ...prev,
                                  selectedProcurementTypes: toggleInArray(prev.selectedProcurementTypes, item),
                                }))
                              }
                            />
                            <span>{item.replace(/_/g, ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start min-h-11">
                        {t('tenders.filters.noticeType')}
                        {tenderFilters.selectedNoticeTypes.length > 0 && (
                          <Badge className="ml-2">{tenderFilters.selectedNoticeTypes.length}</Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72">
                      <div className="space-y-2">
                        {Object.values(NoticeTypeEnum).map(item => (
                          <label key={item} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={tenderFilters.selectedNoticeTypes.includes(item)}
                              onCheckedChange={() =>
                                setTenderFilters(prev => ({
                                  ...prev,
                                  selectedNoticeTypes: toggleInArray(prev.selectedNoticeTypes, item),
                                }))
                              }
                            />
                            <span>{item.replace(/_/g, ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start min-h-11">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {tenderFilters.publishedFrom
                          ? tenderFilters.publishedFrom.toLocaleDateString()
                          : t('tenders.filters.publishFrom')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={tenderFilters.publishedFrom} onSelect={(date) => setTenderFilters(prev => ({ ...prev, publishedFrom: date }))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start min-h-11">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {tenderFilters.publishedTo
                          ? tenderFilters.publishedTo.toLocaleDateString()
                          : t('tenders.filters.publishTo')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={tenderFilters.publishedTo} onSelect={(date) => setTenderFilters(prev => ({ ...prev, publishedTo: date }))} initialFocus />
                    </PopoverContent>
                  </Popover>

                  <Select
                    value={tenderFilters.budgetMode}
                    onValueChange={(value: 'any' | 'above' | 'below') => setTenderFilters(prev => ({ ...prev, budgetMode: value }))}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any budget</SelectItem>
                      <SelectItem value="above">Budget above</SelectItem>
                      <SelectItem value="below">Budget below</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    value={tenderFilters.budgetValue}
                    onChange={event => setTenderFilters(prev => ({ ...prev, budgetValue: event.target.value }))}
                    placeholder={t('tenders.filters.budgetValue')}
                    className="min-h-11"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={tenderFilters.hideMultiCountry}
                    onCheckedChange={(checked) => setTenderFilters(prev => ({ ...prev, hideMultiCountry: Boolean(checked) }))}
                  />
                  <span className="text-sm text-gray-700">{t('tenders.filters.hideMultiCountry')}</span>
                </div>

                <SectorSubsectorFilter
                  selectedSectors={tenderFilters.selectedSectors}
                  selectedSubSectors={tenderFilters.selectedSubSectors}
                  hoveredSector={null}
                  onHoverSector={() => null}
                  onSelectSector={(sector) => {
                    setTenderFilters(prev => {
                      const nextSectors = toggleInArray(prev.selectedSectors, sector);
                      const validSubSectors = prev.selectedSubSectors.filter(sub =>
                        nextSectors.some(selected => (SECTOR_SUBSECTOR_MAP[selected] || []).includes(sub))
                      );
                      return {
                        ...prev,
                        selectedSectors: nextSectors,
                        selectedSubSectors: validSubSectors,
                      };
                    });
                  }}
                  onSelectSubSector={(subSector) => {
                    setTenderFilters(prev => ({
                      ...prev,
                      selectedSubSectors: toggleInArray(prev.selectedSubSectors, subSector),
                    }));
                  }}
                  onSelectAllSectors={() => {
                    setTenderFilters(prev => ({
                      ...prev,
                      selectedSectors:
                        prev.selectedSectors.length === Object.values(SectorEnum).length
                          ? []
                          : Object.values(SectorEnum),
                      selectedSubSectors:
                        prev.selectedSectors.length === Object.values(SectorEnum).length
                          ? []
                          : prev.selectedSubSectors,
                    }));
                  }}
                  onSelectAllSubSectors={(sector) => {
                    const subs = SECTOR_SUBSECTOR_MAP[sector] || [];
                    setTenderFilters(prev => {
                      const allSelected = subs.every(sub => prev.selectedSubSectors.includes(sub));
                      return {
                        ...prev,
                        selectedSubSectors: allSelected
                          ? prev.selectedSubSectors.filter(sub => !subs.includes(sub))
                          : [...new Set([...prev.selectedSubSectors, ...subs])],
                      };
                    });
                  }}
                  t={t}
                />

                <RegionCountryFilter
                  selectedRegions={tenderFilters.selectedRegions}
                  selectedCountries={tenderFilters.selectedCountries}
                  onSelectRegion={(region) => {
                    setTenderFilters(prev => {
                      const nextRegions = toggleInArray(prev.selectedRegions, region);
                      const validCountries = prev.selectedCountries.filter(country =>
                        nextRegions.some(selected => (REGION_COUNTRY_MAP[selected] || []).includes(country))
                      );
                      return {
                        ...prev,
                        selectedRegions: nextRegions,
                        selectedCountries: validCountries,
                      };
                    });
                  }}
                  onSelectCountry={(country) => {
                    setTenderFilters(prev => ({
                      ...prev,
                      selectedCountries: toggleInArray(prev.selectedCountries, country),
                    }));
                  }}
                  onSelectAllRegions={() => {
                    setTenderFilters(prev => ({
                      ...prev,
                      selectedRegions:
                        prev.selectedRegions.length === Object.values(RegionEnum).length
                          ? []
                          : Object.values(RegionEnum),
                      selectedCountries:
                        prev.selectedRegions.length === Object.values(RegionEnum).length
                          ? []
                          : prev.selectedCountries,
                    }));
                  }}
                  t={t}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start min-h-11">
                      {t('tenders.filters.fundingAgency')}
                      {tenderFilters.selectedFundingAgencies.length > 0 && (
                        <Badge className="ml-2">{tenderFilters.selectedFundingAgencies.length}</Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 max-h-64 overflow-auto">
                    <div className="space-y-2">
                      {Object.values(FundingAgencyEnum).map(item => (
                        <label key={item} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={tenderFilters.selectedFundingAgencies.includes(item)}
                            onCheckedChange={() =>
                              setTenderFilters(prev => ({
                                ...prev,
                                selectedFundingAgencies: toggleInArray(prev.selectedFundingAgencies, item),
                              }))
                            }
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setTenderFilters(prev => ({
                        ...prev,
                        searchInput: '',
                        searchMode: 'allWords',
                        selectedProcurementTypes: [],
                        selectedNoticeTypes: [],
                        publishedFrom: undefined,
                        publishedTo: undefined,
                        budgetMode: 'any',
                        budgetValue: '',
                        hideMultiCountry: false,
                        selectedSectors: [],
                        selectedSubSectors: [],
                        selectedRegions: [],
                        selectedCountries: [],
                        selectedFundingAgencies: [],
                      }))
                    }
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('matching-opportunities.opportunities.clearFilters')}
                  </Button>
                </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-5 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Job Vacancies</h3>
                    <p className="text-sm text-muted-foreground">Search matching in-house and project vacancies.</p>
                  </div>
                  {vacancyFilterCount > 0 && <Badge>{vacancyFilterCount}</Badge>}
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { type: OpportunityTypeEnum.IN_HOUSE_VACANCY, label: 'My In-house Vacancies', icon: Building2 },
                    { type: OpportunityTypeEnum.PROJECT_VACANCY, label: 'Project Vacancies', icon: Briefcase },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors ${
                          active
                            ? 'border-[#E63462] bg-[#E63462] text-white shadow-sm'
                            : 'border-gray-200 bg-white text-primary hover:border-[#E63462] hover:text-[#E63462]'
                        }`}
                        onClick={() => setActiveTab(item.type)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-lg border border-gray-200">
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
                      <label className="text-xs font-semibold text-gray-600">Published to</label>
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
                        placeholder="Keywords"
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

                <div className="rounded-lg border border-gray-200">
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
                                        onCheckedChange={() =>
                                          setActiveVacancyFilters(prev => ({
                                            ...prev,
                                            selectedSectors: toggleInArray(prev.selectedSectors, item),
                                          }))
                                        }
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
                                        onCheckedChange={() =>
                                          setActiveVacancyFilters(prev => ({
                                            ...prev,
                                            selectedCountries: toggleInArray(prev.selectedCountries, item),
                                          }))
                                        }
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
                                        onCheckedChange={() =>
                                          setActiveVacancyFilters(prev => ({
                                            ...prev,
                                            selectedFundingAgencies: toggleInArray(prev.selectedFundingAgencies, item),
                                          }))
                                        }
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

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[#E63462] hover:text-[#E63462]"
                    onClick={() =>
                      {
                        setVacancySearchInput('');
                        setVacancyFiltersByType(prev => ({
                          ...prev,
                          [activeVacancyType]: createDefaultVacancyFilters(activeVacancyType),
                        }));
                      }
                    }
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear selection
                  </Button>
                  <Button
                    type="button"
                    className="min-h-10"
                    onClick={() =>
                      setActiveVacancyFilters(prev => ({
                        ...prev,
                        searchInput: vacancySearchInput.trim(),
                      }))
                    }
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            )}

            <PageTabs tabs={tabs} />

            {isTenderTab ? (
              <MatchingTenderListView
                opportunities={tenderRows}
                type={activeTab as OpportunityTypeEnum.OPEN_PROJECT | OpportunityTypeEnum.CONTRACT_AWARD | OpportunityTypeEnum.SHORTLIST}
              />
            ) : (
              <MatchingVacancyListView
                opportunities={vacancyRows}
                type={activeTab as OpportunityTypeEnum.PROJECT_VACANCY | OpportunityTypeEnum.IN_HOUSE_VACANCY}
                onApply={handleApply}
                onSave={handleSaveToggle}
                isSaved={isSaved}
              />
            )}
          </div>

          {sidebarOpen && (
            <div className="lg:col-span-1">
              <PendingMatchesSidebar pendingMatches={pendingMatches} />
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
