import { useMemo, useState } from 'react';
import {
  Award,
  Briefcase,
  Building2,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  ListChecks,
  PanelRight,
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

export default function MatchingOpportunitiesPage() {
  const { t } = useTranslation();
  const {
    pendingMatches,
    saveOpportunity,
    removeOpportunity,
    isSaved,
    getFilteredTenderOpportunities,
    getFilteredVacancyOpportunities,
  } = useMatchingOpportunities();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OpportunityTypeEnum>(OpportunityTypeEnum.OPEN_PROJECT);
  const [showTenderFilters, setShowTenderFilters] = useState(false);
  const [showVacancyFilters, setShowVacancyFilters] = useState(false);
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

  const [vacancyFilters, setVacancyFilters] = useState<MatchingVacancyFiltersDTO>({
    searchInput: '',
    status: 'all',
    location: 'all',
    department: 'all',
    deadline: 'all',
    sort: 'newest',
    activeType: OpportunityTypeEnum.PROJECT_VACANCY,
  });

  const isTenderTab =
    activeTab === OpportunityTypeEnum.OPEN_PROJECT ||
    activeTab === OpportunityTypeEnum.CONTRACT_AWARD ||
    activeTab === OpportunityTypeEnum.SHORTLIST;

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
      label: t('matching-opportunities.tabs.projectVacancies'),
      icon: Briefcase,
      active: activeTab === OpportunityTypeEnum.PROJECT_VACANCY,
      onClick: () => setActiveTab(OpportunityTypeEnum.PROJECT_VACANCY),
    },
    {
      label: t('matching-opportunities.tabs.inHouseVacancies'),
      icon: Building2,
      active: activeTab === OpportunityTypeEnum.IN_HOUSE_VACANCY,
      onClick: () => setActiveTab(OpportunityTypeEnum.IN_HOUSE_VACANCY),
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
              <div className="bg-white rounded-lg border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{t('matching-opportunities.opportunities.filters')}</h3>
                  {vacancyFilterCount > 0 && <Badge>{vacancyFilterCount}</Badge>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
                  <Input
                    value={vacancySearchInput}
                    onChange={event => setVacancySearchInput(event.target.value)}
                    placeholder={t('matching-opportunities.opportunities.searchPlaceholder')}
                    className="min-h-11"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11"
                    onClick={() => setShowVacancyFilters(prev => !prev)}
                  >
                    {showVacancyFilters
                      ? t('matching-opportunities.filters.hide')
                      : t('matching-opportunities.filters.show')}
                  </Button>

                  <Button
                    type="button"
                    className="min-h-11"
                    onClick={() =>
                      setVacancyFilters(prev => ({
                        ...prev,
                        searchInput: vacancySearchInput.trim(),
                      }))
                    }
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {t('matching-opportunities.filters.search')}
                  </Button>
                </div>

                {showVacancyFilters && (
                  <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">

                  <Select
                    value={vacancyFilters.status}
                    onValueChange={(value: 'all' | 'active' | 'closing-soon' | 'closed') =>
                      setVacancyFilters(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder={t('matching-opportunities.vacancies.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closing-soon">Closing soon</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={vacancyFilters.location} onValueChange={(value) => setVacancyFilters(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder={t('matching-opportunities.vacancies.location')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {[...new Set(vacancyRows.map(item => item.location ?? item.country))].map(item => (
                        <SelectItem key={item} value={item}>{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {activeTab === OpportunityTypeEnum.IN_HOUSE_VACANCY ? (
                    <Select value={vacancyFilters.department} onValueChange={(value) => setVacancyFilters(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger className="min-h-11">
                        <SelectValue placeholder={t('matching-opportunities.vacancies.department')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All departments</SelectItem>
                        {[...new Set(vacancyRows.map(item => item.sector.toLowerCase()))].map(item => (
                          <SelectItem key={item} value={item}>{item.replace(/_/g, ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div />
                  )}

                  <Select
                    value={vacancyFilters.deadline}
                    onValueChange={(value: 'all' | 'urgent' | 'month' | 'expired') => setVacancyFilters(prev => ({ ...prev, deadline: value }))}
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder={t('matching-opportunities.vacancies.deadline')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All deadlines</SelectItem>
                      <SelectItem value="urgent">Urgent (7 days)</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={vacancyFilters.sort}
                    onValueChange={(value: 'newest' | 'oldest' | 'deadline' | 'title') =>
                      setVacancyFilters(prev => ({ ...prev, sort: value }))
                    }
                  >
                    <SelectTrigger className="min-h-11">
                      <SelectValue placeholder={t('matching-opportunities.vacancies.sort')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setVacancyFilters(prev => ({
                        ...prev,
                        searchInput: '',
                        status: 'all',
                        location: 'all',
                        department: 'all',
                        deadline: 'all',
                        sort: 'newest',
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
