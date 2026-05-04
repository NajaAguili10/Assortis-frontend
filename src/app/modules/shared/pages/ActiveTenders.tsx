import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { format, isAfter, startOfToday } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { ArrowDown, ArrowUp, ArrowUpDown, CalendarIcon, Check, ChevronDown, ChevronUp, Clock, DollarSign, Download, Eye, FileText, Globe, Heart, Plus, RotateCcw, Search, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { StatCard } from '@app/components/StatCard';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Separator } from '@app/components/ui/separator';
import { Calendar } from '@app/components/ui/calendar';
import { useTenders } from '@app/hooks/useTenders';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import {
  CountryEnum,
  FundingAgencyEnum,
  MatchingAlertCategoryEnum,
  NoticeTypeEnum,
  ProcurementTypeEnum,
  RegionEnum,
  REGION_COUNTRY_MAP,
  SectorEnum,
  SECTOR_SUBSECTOR_MAP,
  SubSectorEnum,
  TenderListDTO,
} from '@app/types/tender.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';

type AlertsTab = 'projects' | 'awards' | 'shortlists' | 'profile' | 'bin';
type SearchMode = 'allWords' | 'anyWords' | 'exactPhrase' | 'boolean';
type BudgetMode = 'any' | 'above' | 'below';
type SortField = 'title' | 'location' | 'donor' | 'budget' | 'published' | 'deadline';
type SortDirection = 'asc' | 'desc' | 'none';

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
  } catch (error) {
    return [];
  }

  return [];
}

function writeSavedProjectIds(projectIds: string[]) {
  try {
    localStorage.setItem('projects.favouriteIds', JSON.stringify(projectIds));
  } catch (error) {
    // Ignore storage errors to preserve current behavior.
  }
}

export default function ActiveTenders() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { allTenders, kpis } = useTenders();
  const { addToPipeline, removeFromPipeline } = usePipeline();

  const [activeTab, setActiveTab] = useState<AlertsTab>('projects');
  const [showFilters, setShowFilters] = useState(false);
  const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [showRegionFilters, setShowRegionFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('allWords');
  const [selectedProcurementTypes, setSelectedProcurementTypes] = useState<ProcurementTypeEnum[]>([]);
  const [selectedNoticeTypes, setSelectedNoticeTypes] = useState<NoticeTypeEnum[]>([]);
  const [publishedFrom, setPublishedFrom] = useState<Date | undefined>(undefined);
  const [publishedTo, setPublishedTo] = useState<Date | undefined>(undefined);
  const [publishToTooltipOpen, setPublishToTooltipOpen] = useState(false);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('any');
  const [budgetValue, setBudgetValue] = useState<string>('');
  const [hideMultiCountry, setHideMultiCountry] = useState(false);
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [selectedFundingAgencies, setSelectedFundingAgencies] = useState<FundingAgencyEnum[]>([]);
  const [fundingAgencySearch, setFundingAgencySearch] = useState('');
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedQuickDay, setSelectedQuickDay] = useState<string | null>(null);
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set());
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(() => new Set(readSavedProjectIds()));
  const [isMyProjectsDialogOpen, setIsMyProjectsDialogOpen] = useState(false);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [donorFilters, setDonorFilters] = useState<string[]>([]);

  const today = startOfToday();
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const handlePublishedFromSelect = (date: Date | undefined) => {
    if (!date) {
      setPublishedFrom(undefined);
      setPublishedTo(undefined);
      return;
    }

    if (isAfter(date, today)) {
      return;
    }

    setPublishedFrom(date);
    if (publishedTo && isAfter(date, publishedTo)) {
      setPublishedTo(undefined);
    }
  };

  const handlePublishedToSelect = (range: DateRange | undefined) => {
    setPublishedTo(range?.to);
  };

  const quickDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - index);
      return {
        id: format(date, 'yyyy-MM-dd'),
        weekdayLabel: format(date, 'eee', { locale: dateLocale }),
        dayNumber: format(date, 'd', { locale: dateLocale }),
        date,
      };
    });
  }, [dateLocale]);

  const toggleProcurementType = (value: ProcurementTypeEnum) => {
    setSelectedProcurementTypes(prev => (
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    ));
  };

  const toggleNoticeType = (value: NoticeTypeEnum) => {
    setSelectedNoticeTypes(prev => (
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    ));
  };

  const toggleFundingAgency = (value: FundingAgencyEnum) => {
    setSelectedFundingAgencies(prev => (
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    ));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const resetQuickDay = () => setSelectedQuickDay(null);

  const filteredFundingAgencies = useMemo(() => {
    if (!fundingAgencySearch) return Object.values(FundingAgencyEnum);
    return Object.values(FundingAgencyEnum).filter(agency =>
      t(`fundingAgencies.${agency}`).toLowerCase().includes(fundingAgencySearch.toLowerCase())
    );
  }, [fundingAgencySearch, t]);

  const availableSubSectors = useMemo(() => {
    if (selectedSectors.length === 0) return [];
    const subs: SubSectorEnum[] = [];
    selectedSectors.forEach(sector => {
      subs.push(...(SECTOR_SUBSECTOR_MAP[sector] || []));
    });
    return [...new Set(subs)];
  }, [selectedSectors]);

  const toggleSector = (sector: SectorEnum) => {
    const next = selectedSectors.includes(sector)
      ? selectedSectors.filter(item => item !== sector)
      : [...selectedSectors, sector];
    setSelectedSectors(next);

    if (next.length === 0) {
      setSelectedSubSectors([]);
      return;
    }

    const validSubSectors = selectedSubSectors.filter(sub =>
      next.some(selected => (SECTOR_SUBSECTOR_MAP[selected] || []).includes(sub))
    );
    setSelectedSubSectors(validSubSectors);
  };

  const toggleSubSector = (subSector: SubSectorEnum) => {
    setSelectedSubSectors(prev => (
      prev.includes(subSector) ? prev.filter(item => item !== subSector) : [...prev, subSector]
    ));
  };

  const toggleRegion = (region: RegionEnum) => {
    const next = selectedRegions.includes(region)
      ? selectedRegions.filter(item => item !== region)
      : [...selectedRegions, region];
    setSelectedRegions(next);

    if (next.length === 0) {
      setSelectedCountries([]);
      return;
    }

    const validCountries = selectedCountries.filter(country =>
      next.some(selected => (REGION_COUNTRY_MAP[selected] || []).includes(country))
    );
    setSelectedCountries(validCountries);
  };

  const toggleCountry = (country: CountryEnum) => {
    setSelectedCountries(prev => (
      prev.includes(country) ? prev.filter(item => item !== country) : [...prev, country]
    ));
  };

  const clearFilters = () => {
    setSelectedProcurementTypes([]);
    setSelectedNoticeTypes([]);
    setPublishedFrom(undefined);
    setPublishedTo(undefined);
    setBudgetMode('any');
    setBudgetValue('');
    setHideMultiCountry(false);
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedFundingAgencies([]);
    setFundingAgencySearch('');
    setLocationFilters([]);
    setDonorFilters([]);
    setSelectedQuickDay(null);
  };

  const topByTab = useMemo(() => {
    const projects = allTenders.filter(item => item.alertCategory === MatchingAlertCategoryEnum.PROJECTS);
    const awards = allTenders.filter(item => item.alertCategory === MatchingAlertCategoryEnum.AWARDS);
    const shortlists = allTenders.filter(item => item.alertCategory === MatchingAlertCategoryEnum.SHORTLISTS);
    const bin = projects.filter(item => discardedIds.has(item.id));
    const profile = allTenders.filter(item => favouriteIds.has(item.id));

    return { projects, awards, shortlists, profile, bin };
  }, [allTenders, discardedIds, favouriteIds]);

  const baseRows = useMemo(() => {
    if (activeTab === 'projects') return topByTab.projects.filter(item => !discardedIds.has(item.id));
    if (activeTab === 'awards') return topByTab.awards;
    if (activeTab === 'shortlists') return topByTab.shortlists;
    if (activeTab === 'profile') return topByTab.profile;
    return topByTab.bin;
  }, [activeTab, topByTab, discardedIds]);

  const passesSearch = (row: TenderListDTO) => {
    if (!searchQuery) return true;
    const haystack = `${row.title} ${row.referenceNumber} ${row.organizationName}`.toLowerCase();
    const query = searchQuery.toLowerCase();

    if (searchMode === 'exactPhrase') {
      return haystack.includes(query);
    }

    if (searchMode === 'anyWords') {
      const words = query.split(/\s+/).filter(Boolean);
      return words.some(word => haystack.includes(word));
    }

    if (searchMode === 'boolean') {
      if (query.includes(' and ')) {
        const words = query.split(' and ').map(item => item.trim()).filter(Boolean);
        return words.every(word => haystack.includes(word));
      }
      if (query.includes(' or ')) {
        const words = query.split(' or ').map(item => item.trim()).filter(Boolean);
        return words.some(word => haystack.includes(word));
      }
      return haystack.includes(query);
    }

    const words = query.split(/\s+/).filter(Boolean);
    return words.every(word => haystack.includes(word));
  };

  const filteredRows = useMemo(() => {
    const budgetNumber = Number(budgetValue);

    return baseRows.filter(row => {
      if (!passesSearch(row)) return false;

      if (selectedProcurementTypes.length > 0 && (!row.procurementType || !selectedProcurementTypes.includes(row.procurementType))) {
        return false;
      }

      if (selectedNoticeTypes.length > 0 && (!row.noticeType || !selectedNoticeTypes.includes(row.noticeType))) {
        return false;
      }

      if (publishedFrom && row.publishedDate && row.publishedDate < publishedFrom) return false;
      if (publishedTo && row.publishedDate && row.publishedDate > publishedTo) return false;

      if (!Number.isNaN(budgetNumber) && budgetValue) {
        if (budgetMode === 'above' && row.budget.amount < budgetNumber) return false;
        if (budgetMode === 'below' && row.budget.amount > budgetNumber) return false;
      }

      if (hideMultiCountry && row.isMultiCountry) return false;

      if (selectedSectors.length > 0 && !row.sectors.some(sector => selectedSectors.includes(sector))) return false;
      if (selectedSubSectors.length > 0 && !row.subsectors?.some(sub => selectedSubSectors.includes(sub))) return false;
      if (selectedRegions.length > 0 && (!row.region || !selectedRegions.includes(row.region))) return false;
      if (selectedCountries.length > 0 && !selectedCountries.includes(row.country)) return false;
      if (selectedFundingAgencies.length > 0 && (!row.fundingAgency || !selectedFundingAgencies.includes(row.fundingAgency))) return false;

      if (selectedQuickDay && row.publishedDate && format(row.publishedDate, 'yyyy-MM-dd') !== selectedQuickDay) return false;

      const locationLabel = row.isMultiCountry
        ? t('activeTenders.multiCountryLabel')
        : getLocalizedCountryName(row.country, language);
      if (locationFilters.length > 0 && !locationFilters.includes(locationLabel)) return false;
      if (donorFilters.length > 0 && !donorFilters.includes(row.organizationName)) return false;

      return true;
    });
  }, [
    baseRows,
    budgetMode,
    budgetValue,
    donorFilters,
    hideMultiCountry,
    language,
    locationFilters,
    passesSearch,
    publishedFrom,
    publishedTo,
    searchQuery,
    selectedCountries,
    selectedFundingAgencies,
    selectedNoticeTypes,
    selectedProcurementTypes,
    selectedQuickDay,
    selectedRegions,
    selectedSectors,
    selectedSubSectors,
  ]);

  const sortedRows = useMemo(() => {
    const rows = [...filteredRows];

    if (!sortField || sortDirection === 'none') {
      return rows;
    }

    rows.sort((a, b) => {
      const directionFactor = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'title') return a.title.localeCompare(b.title) * directionFactor;
      if (sortField === 'location') return a.country.localeCompare(b.country) * directionFactor;
      if (sortField === 'donor') return a.organizationName.localeCompare(b.organizationName) * directionFactor;
      if (sortField === 'budget') return (a.budget.amount - b.budget.amount) * directionFactor;
      if (sortField === 'published') {
        return ((a.publishedDate?.getTime() || 0) - (b.publishedDate?.getTime() || 0)) * directionFactor;
      }
      return (a.deadline.getTime() - b.deadline.getTime()) * directionFactor;
    });

    return rows;
  }, [filteredRows, sortDirection, sortField]);

  const toggleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection('asc');
      return;
    }

    if (sortDirection === 'asc') {
      setSortDirection('desc');
      return;
    }

    if (sortDirection === 'desc') {
      setSortField(null);
      setSortDirection('none');
      return;
    }

    setSortDirection('asc');
  };

  const isColumnSorted = (field: SortField) => sortField === field && sortDirection !== 'none';

  const getHeaderClassName = (field?: SortField) => {
    if (!field) {
      return 'text-left inline-flex items-center gap-1 text-accent';
    }
    return `text-left inline-flex items-center gap-1 transition-colors ${
      isColumnSorted(field) ? 'text-accent' : 'text-accent hover:text-accent/90'
    }`;
  };

  const renderSortIcon = (field: SortField) => {
    if (!isColumnSorted(field)) {
      return <ArrowUpDown className="h-3.5 w-3.5" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };

  const columnOptions = useMemo(() => {
    const locations = [...new Set(baseRows.map(row => (
      row.isMultiCountry ? t('activeTenders.multiCountryLabel') : getLocalizedCountryName(row.country, language)
    )))];
    const donors = [...new Set(baseRows.map(row => row.organizationName))];
    return { locations, donors };
  }, [baseRows, language, t]);

  const exportCsv = () => {
    const header = [
      t('activeTenders.table.projectTitle'),
      t('activeTenders.table.sector'),
      t('activeTenders.table.location'),
      t('activeTenders.table.donor'),
      t('activeTenders.table.budget'),
      t('activeTenders.table.published'),
      t('activeTenders.table.deadline'),
      t('activeTenders.filters.noticeType'),
      t('activeTenders.filters.procurementType'),
      'Category',
    ];

    const csvRows = sortedRows.map(row => {
      const location = row.isMultiCountry
        ? t('activeTenders.multiCountryLabel')
        : getLocalizedCountryName(row.country, language);
      const published = row.publishedDate ? format(row.publishedDate, 'yyyy-MM-dd') : '';
      const deadline = format(row.deadline, 'yyyy-MM-dd');
      return [
        row.title,
        row.sectors.map(sector => t(`sectors.${sector}`)).join(' | '),
        location,
        row.organizationName,
        row.budget.formatted,
        published,
        deadline,
        row.noticeType || '',
        row.procurementType || '',
        row.alertCategory || '',
      ]
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matching-projects-${activeTab}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatPillLabel = (value: string) => value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const getSectorLabel = (sector: SectorEnum) => t(`sectors.${sector}`);

  const renderSectorCell = (row: TenderListDTO) => {
    const sectorLabels = row.sectors.map(getSectorLabel);
    const [primarySector] = sectorLabels;
    const extraCount = sectorLabels.length - 1;

    if (!primarySector) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="truncate text-gray-700">{primarySector}</span>
        {extraCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="inline-flex h-6 min-w-7 items-center justify-center rounded-full border border-accent/20 bg-accent/10 px-2 text-xs font-semibold text-accent hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label={t('activeTenders.table.viewAllSectors')}
              >
                +{extraCount}
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={6} className="max-w-64">
              <div className="space-y-1 text-left">
                {sectorLabels.map(label => (
                  <div key={label}>{label}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const handleDiscard = (id: string) => {
    setDiscardedIds(prev => new Set(prev).add(id));
  };

  const handleRestore = (id: string) => {
    setDiscardedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const saveToProfile = (id: string) => {
    if (favouriteIds.has(id)) return;

    setFavouriteIds(prev => {
      const next = new Set(prev);
      next.add(id);
      writeSavedProjectIds(Array.from(next));
      return next;
    });
    addToPipeline(id);
  };

  const openMyProjectsConfirmation = (id: string) => {
    setPendingProjectId(id);
    setIsMyProjectsDialogOpen(true);
  };

  const closeMyProjectsDialog = () => {
    setIsMyProjectsDialogOpen(false);
    setPendingProjectId(null);
  };

  const confirmMyProjectsAction = () => {
    if (!pendingProjectId) return;

    const isCurrentlyFavorited = favouriteIds.has(pendingProjectId);

    setFavouriteIds(prev => {
      const next = new Set(prev);
      if (next.has(pendingProjectId)) {
        next.delete(pendingProjectId);
      } else {
        next.add(pendingProjectId);
      }
      writeSavedProjectIds(Array.from(next));
      return next;
    });

    // Sync with Pipeline page
    if (isCurrentlyFavorited) {
      removeFromPipeline(pendingProjectId);
    } else {
      addToPipeline(pendingProjectId);
    }

    closeMyProjectsDialog();
  };

  const activeFilterCount = [
    selectedProcurementTypes.length,
    selectedNoticeTypes.length,
    publishedFrom ? 1 : 0,
    publishedTo ? 1 : 0,
    budgetValue ? 1 : 0,
    hideMultiCountry ? 1 : 0,
    selectedSectors.length,
    selectedSubSectors.length,
    selectedRegions.length,
    selectedCountries.length,
    selectedFundingAgencies.length,
    selectedQuickDay ? 1 : 0,
    locationFilters.length,
    donorFilters.length,
  ].reduce((sum, value) => sum + value, 0);

  const closingSoonCount = Math.floor(kpis.activeTenders * 0.15);
  const avgBudget = allTenders.length > 0
    ? allTenders.reduce((sum, row) => sum + row.budget.amount, 0) / allTenders.length
    : 0;
  const internationalCount = Math.floor(kpis.activeTenders * 0.65);

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('activeTenders.title')}
        description={t('activeTenders.subtitle')}
        icon={FileText}
        stats={[{ value: kpis.activeTenders.toString(), label: t('tenders.kpis.activeTenders') }]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('activeTenders.kpis.total')}
              value={kpis.activeTenders.toString()}
              subtitle={t('activeTenders.kpis.totalSubtitle')}
              icon={FileText}
              iconBgColor="bg-red-50"
              iconColor="text-red-500"
            />
            <StatCard
              title={t('activeTenders.kpis.closingSoon')}
              value={closingSoonCount.toString()}
              subtitle={t('activeTenders.kpis.closingSoonSubtitle')}
              icon={Clock}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
            <StatCard
              title={t('activeTenders.kpis.avgBudget')}
              value={`$${(avgBudget / 1000).toFixed(0)}K`}
              subtitle={t('activeTenders.kpis.avgBudgetSubtitle')}
              icon={DollarSign}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('activeTenders.kpis.international')}
              value={internationalCount.toString()}
              subtitle={t('activeTenders.kpis.internationalSubtitle')}
              icon={Globe}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between shadow-sm">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{t('activeTenders.recent.title')}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('activeTenders.recent.description')}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {quickDays.map(day => {
                const isSelected = selectedQuickDay === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedQuickDay(day.id)}
                    className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-white border-white text-primary shadow-md' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'}`}
                  >
                    <span className="text-[8px] font-bold uppercase">{day.weekdayLabel}</span>
                    <span className="text-sm font-black leading-none">{day.dayNumber}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={resetQuickDay}
                className="h-10 px-4 bg-primary/10 hover:bg-primary/20 rounded-xl text-xs font-bold transition-all ml-1 flex items-center justify-center text-primary cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-primary">{t('activeTenders.filters.heading')}</h2>
                <p className="text-sm text-gray-600 mt-1">{t('activeTenders.filters.description')}</p>
              </div>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{t('activeTenders.filters.active', { count: activeFilterCount })}</Badge>
              )}
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto_auto_auto] gap-3 mb-4">
              <Input
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder={t('activeTenders.search.placeholder')}
                className="min-h-11"
              />
              <Select value={searchMode} onValueChange={(value: SearchMode) => setSearchMode(value)}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allWords">{t('activeTenders.searchMode.allWords')}</SelectItem>
                  <SelectItem value="anyWords">{t('activeTenders.searchMode.anyWords')}</SelectItem>
                  <SelectItem value="exactPhrase">{t('activeTenders.searchMode.exactPhrase')}</SelectItem>
                  <SelectItem value="boolean">{t('activeTenders.searchMode.boolean')}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" className="min-h-11" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" />
                {t('activeTenders.action.csv')}
              </Button>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setShowFilters(prev => !prev)}>
                {showFilters ? <><ChevronUp className="h-4 w-4 mr-2" />{t('activeTenders.action.hideFilters')}</> : <><ChevronDown className="h-4 w-4 mr-2" />{t('activeTenders.action.showFilters')}</>}
              </Button>
              <Button type="submit" className="min-h-11">
                <Search className="h-4 w-4 mr-2" />
                {t('activeTenders.action.search')}
              </Button>
            </form>

            {showFilters && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-between min-h-11">
                        {t('activeTenders.filters.procurementType')} ({selectedProcurementTypes.length})
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        {[
                          { value: ProcurementTypeEnum.SERVICES, label: t('activeTenders.filters.procurementTypeOptions.services') },
                          { value: ProcurementTypeEnum.EQUIPMENT, label: t('activeTenders.filters.procurementTypeOptions.supplies') },
                          { value: ProcurementTypeEnum.WORKS, label: t('activeTenders.filters.procurementTypeOptions.works') },
                          { value: ProcurementTypeEnum.GRANTS, label: t('activeTenders.filters.procurementTypeOptions.grants') },
                          { value: ProcurementTypeEnum.INDIVIDUAL_CONSULTANTS, label: t('activeTenders.filters.procurementTypeOptions.individualContracts') },
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedProcurementTypes.includes(option.value)}
                              onChange={() => toggleProcurementType(option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-between min-h-11">
                        {t('activeTenders.filters.noticeType')} ({selectedNoticeTypes.length})
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        {[
                          { value: NoticeTypeEnum.EARLY_INTELLIGENCE, label: t('activeTenders.filters.noticeTypeOptions.earlyIntelligence') },
                          { value: NoticeTypeEnum.FORECAST_PRIOR_NOTICE, label: t('activeTenders.filters.noticeTypeOptions.forecastPriorNotice') },
                          { value: NoticeTypeEnum.PROJECT_NOTICE, label: t('activeTenders.filters.noticeTypeOptions.projectNotice') },
                        ].map(option => (
                          <label key={option.value} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedNoticeTypes.includes(option.value)}
                              onChange={() => toggleNoticeType(option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="grid grid-cols-2 gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start min-h-11">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {publishedFrom ? format(publishedFrom, 'P', { locale: dateLocale }) : t('activeTenders.filters.publishFrom')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={publishedFrom}
                          onSelect={handlePublishedFromSelect}
                          initialFocus
                          disabled={[{ after: today }]}
                          defaultMonth={publishedFrom ?? today}
                        />
                      </PopoverContent>
                    </Popover>

                    {publishedFrom ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start min-h-11">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {publishedTo ? format(publishedTo, 'P', { locale: dateLocale }) : t('activeTenders.filters.publishTo')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={{ from: publishedFrom, to: publishedTo }}
                            onSelect={handlePublishedToSelect}
                            initialFocus
                            disabled={[{ before: publishedFrom }]}
                            defaultMonth={publishedTo ?? publishedFrom ?? today}
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Tooltip open={publishToTooltipOpen} onOpenChange={setPublishToTooltipOpen}>
                        <TooltipTrigger asChild>
                          <span className="inline-flex w-full">
                            <Button
                              variant="outline"
                              className="justify-start min-h-11 cursor-not-allowed"
                              type="button"
                              aria-disabled="true"
                              onClick={() => setPublishToTooltipOpen(true)}
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {t('activeTenders.filters.publishTo')}
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>{t('activeTenders.filters.publishToTooltip')}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[170px_1fr] gap-3">
                  <Select value={budgetMode} onValueChange={(value: BudgetMode) => setBudgetMode(value)}>
                    <SelectTrigger className="min-h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{t('activeTenders.filters.budget.any')}</SelectItem>
                      <SelectItem value="above">{t('activeTenders.filters.budget.above')}</SelectItem>
                      <SelectItem value="below">{t('activeTenders.filters.budget.below')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={t('activeTenders.filters.budget.placeholder')}
                    value={budgetValue}
                    onChange={event => setBudgetValue(event.target.value)}
                    className="min-h-11"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={hideMultiCountry}
                    onChange={event => setHideMultiCountry(event.target.checked)}
                  />
                  <span>{t('activeTenders.filters.hideMultiCountry')}</span>
                </label>

                <div className="flex items-center gap-3 py-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`min-h-9 inline-flex items-center gap-2 border transition-all ${showSectorFilters ? 'bg-white text-accent border-accent shadow-sm hover:bg-slate-50 hover:text-accent' : 'bg-accent text-white border-accent hover:bg-accent/90'}`}
                    onClick={() => setShowSectorFilters(prev => !prev)}
                  >
                    <Plus className={`h-3.5 w-3.5 transition-transform ${showSectorFilters ? 'rotate-45' : ''}`} />
                    {t('activeTenders.filters.sectors')} ({selectedSubSectors.length})
                  </Button>
                </div>

                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showSectorFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <SectorSubsectorFilter
                    selectedSectors={selectedSectors}
                    selectedSubSectors={selectedSubSectors}
                    hoveredSector={hoveredSector}
                    onHoverSector={setHoveredSector}
                    onSelectSector={toggleSector}
                    onSelectSubSector={toggleSubSector}
                    onSelectAllSectors={() => {
                      if (selectedSectors.length === Object.values(SectorEnum).length) {
                        setSelectedSectors([]);
                        setSelectedSubSectors([]);
                      } else {
                        setSelectedSectors(Object.values(SectorEnum));
                      }
                    }}
                    onSelectAllSubSectors={(sector) => {
                      const subs = SECTOR_SUBSECTOR_MAP[sector] || [];
                      const allSelected = subs.every(item => selectedSubSectors.includes(item));
                      if (allSelected) {
                        setSelectedSubSectors(prev => prev.filter(item => !subs.includes(item)));
                      } else {
                        setSelectedSubSectors(prev => [...new Set([...prev, ...subs])]);
                      }
                    }}
                    t={t}
                  />
                </div>

                <div className="flex items-center gap-3 py-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`min-h-9 inline-flex items-center gap-2 border transition-all ${showRegionFilters ? 'bg-white text-accent border-accent shadow-sm hover:bg-slate-50 hover:text-accent' : 'bg-accent text-white border-accent hover:bg-accent/90'}`}
                    onClick={() => setShowRegionFilters(prev => !prev)}
                  >
                    <Plus className={`h-3.5 w-3.5 transition-transform ${showRegionFilters ? 'rotate-45' : ''}`} />
                    {t('activeTenders.filters.regions')} ({selectedCountries.length})
                  </Button>
                </div>

                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${showRegionFilters ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <RegionCountryFilter
                    selectedRegions={selectedRegions}
                    selectedCountries={selectedCountries}
                    onSelectRegion={toggleRegion}
                    onSelectCountry={toggleCountry}
                    onSelectAllRegions={() => {
                      if (selectedRegions.length === Object.values(RegionEnum).length) {
                        setSelectedRegions([]);
                        setSelectedCountries([]);
                      } else {
                        setSelectedRegions(Object.values(RegionEnum));
                      }
                    }}
                    t={t}
                  />
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-between min-h-11">
                      {t('activeTenders.filters.donor')} ({selectedFundingAgencies.length})
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96" align="start">
                    <Input
                      className="mb-3"
                      value={fundingAgencySearch}
                      onChange={event => setFundingAgencySearch(event.target.value)}
                      placeholder={t('common.search')}
                    />
                    <div className="max-h-64 overflow-auto space-y-2">
                      {filteredFundingAgencies.map(agency => (
                        <label key={agency} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedFundingAgencies.includes(agency)}
                            onChange={() => toggleFundingAgency(agency)}
                          />
                          <span>{t(`fundingAgencies.${agency}`)}</span>
                        </label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>{t('activeTenders.filters.resetAll')}</Button>
                </div>
              </div>
            )}

          </div>

          <div className="mb-4 flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            {[
              { id: 'projects', label: t('activeTenders.tabs.projects') },
              { id: 'shortlists', label: t('activeTenders.tabs.shortlists') },
              { id: 'awards', label: t('activeTenders.tabs.awards') },
              { id: 'profile', label: t('activeTenders.tabs.profile') },
              { id: 'bin', label: t('activeTenders.tabs.bin') },
            ].map(tab => (
              <Button
                key={tab.id}
                variant="ghost"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-accent shadow-sm hover:bg-white hover:text-accent'
                    : 'bg-transparent text-slate-700 hover:bg-accent hover:text-white'
                }`}
                onClick={() => setActiveTab(tab.id as AlertsTab)}
              >
                {tab.label}
                <Badge
                  variant="secondary"
                  className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id
                      ? 'bg-accent/10 text-accent'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.id === 'projects' ? topByTab.projects.filter(item => !discardedIds.has(item.id)).length :
                    tab.id === 'awards' ? topByTab.awards.length :
                    tab.id === 'shortlists' ? topByTab.shortlists.length :
                    tab.id === 'profile' ? topByTab.profile.length :
                    topByTab.bin.length}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[2.1fr_1fr_1.05fr_1.25fr_0.9fr_0.9fr_0.9fr_1.45fr] items-center gap-2 px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-600">
              <button className={getHeaderClassName('title')} onClick={() => toggleSort('title')}>
                {t('activeTenders.table.projectTitle')}
                {renderSortIcon('title')}
              </button>
              <button type="button" className={getHeaderClassName()}>
                {t('activeTenders.table.sector')}
              </button>
              <Popover>
                <div className="inline-flex items-center gap-1">
                  <button className={getHeaderClassName('location')} onClick={() => toggleSort('location')}>
                    {t('activeTenders.table.location')}
                    {renderSortIcon('location')}
                  </button>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-accent/30 text-accent hover:bg-accent/10"
                      aria-label={t('activeTenders.table.location')}
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent className="w-64" align="start">
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {columnOptions.locations.map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={locationFilters.includes(item)}
                          onChange={() => setLocationFilters(prev => (
                            prev.includes(item) ? prev.filter(value => value !== item) : [...prev, item]
                          ))}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <div className="inline-flex items-center gap-1">
                  <button className={getHeaderClassName('donor')} onClick={() => toggleSort('donor')}>
                    {t('activeTenders.table.donor')}
                    {renderSortIcon('donor')}
                  </button>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-accent/30 text-accent hover:bg-accent/10"
                      aria-label={t('activeTenders.table.donor')}
                    >
                      <SlidersHorizontal className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                </div>
                <PopoverContent className="w-64" align="start">
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {columnOptions.donors.map(item => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={donorFilters.includes(item)}
                          onChange={() => setDonorFilters(prev => (
                            prev.includes(item) ? prev.filter(value => value !== item) : [...prev, item]
                          ))}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <button className={getHeaderClassName('budget')} onClick={() => toggleSort('budget')}>
                {t('activeTenders.table.budget')}
                {renderSortIcon('budget')}
              </button>
              <button className={getHeaderClassName('published')} onClick={() => toggleSort('published')}>
                {t('activeTenders.table.published')}
                {renderSortIcon('published')}
              </button>
              <button className={getHeaderClassName('deadline')} onClick={() => toggleSort('deadline')}>
                {t('activeTenders.table.deadline')}
                {renderSortIcon('deadline')}
              </button>
              <button type="button" className={getHeaderClassName()}>
                {t('activeTenders.table.actions')}
              </button>
            </div>

            {sortedRows.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700 mb-1">{t('activeTenders.empty.title')}</p>
                <p className="text-sm">{t('activeTenders.empty.description')}</p>
                <Button variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>
                  {t('activeTenders.filters.resetAll')}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedRows.map((row, rowIndex) => {
                  const location = row.isMultiCountry
                    ? t('activeTenders.multiCountryLabel')
                    : getLocalizedCountryName(row.country, language);

                  return (
                    <div key={row.id} className={`px-5 py-4 transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-50/80`}>
                      <div className="grid grid-cols-[2.1fr_1fr_1.05fr_1.25fr_0.9fr_0.9fr_0.9fr_1.45fr] gap-2 items-center text-sm">
                        <div className="font-semibold text-gray-900 leading-snug pr-1">{row.title}</div>
                        {renderSectorCell(row)}
                        <div className="text-gray-700 leading-snug">{location}</div>
                        <div className="text-gray-700 leading-snug">{row.organizationName}</div>
                        <div className="text-gray-700 font-medium">{row.budget.formatted}</div>
                        <div className="text-gray-700">{row.publishedDate ? format(row.publishedDate, 'dd MMM yyyy', { locale: dateLocale }) : '-'}</div>
                        <div className="text-gray-700">{format(row.deadline, 'dd MMM yyyy', { locale: dateLocale })}</div>
                        <div className="flex flex-wrap gap-2">
                          {activeTab !== 'bin' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="min-h-10 w-10 border-gray-300 p-0"
                                    aria-label={t('activeTenders.button.viewDetails')}
                                    onClick={() => navigate(`/calls/${row.id}`, { state: { accessSource: 'my-alerts', isFavorited: favouriteIds.has(row.id) } })}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4}>{t('activeTenders.button.viewDetails')}</TooltipContent>
                              </Tooltip>

                              {activeTab === 'projects' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-10 w-10 border-gray-300 p-0"
                                      aria-label={t('activeTenders.button.discard')}
                                      onClick={() => handleDiscard(row.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={4}>{t('activeTenders.button.discard')}</TooltipContent>
                                </Tooltip>
                              )}

                              {activeTab !== 'profile' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={favouriteIds.has(row.id) ? 'default' : 'outline'}
                                      size="sm"
                                      className="min-h-10 w-10 border-gray-300 p-0"
                                      aria-label={t(favouriteIds.has(row.id) ? 'activeTenders.button.savedToProfile' : 'activeTenders.button.saveToProfile')}
                                      onClick={() => saveToProfile(row.id)}
                                      disabled={favouriteIds.has(row.id)}
                                    >
                                      {favouriteIds.has(row.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={4}>
                                    {t(favouriteIds.has(row.id) ? 'activeTenders.button.savedToProfile' : 'activeTenders.button.saveToProfile')}
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={favouriteIds.has(row.id) ? 'destructive' : 'outline'}
                                    size="sm"
                                    className="min-h-10 w-10 p-0"
                                    aria-label={t(favouriteIds.has(row.id) ? 'activeTenders.button.removeFromMyProjects' : 'activeTenders.button.addToMyProjects')}
                                    onClick={() => openMyProjectsConfirmation(row.id)}
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent sideOffset={4}>
                                  {t(favouriteIds.has(row.id) ? 'activeTenders.button.removeFromMyProjects' : 'activeTenders.button.addToMyProjects')}
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}

                          {activeTab === 'bin' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="min-h-10 w-10 border-gray-300 p-0"
                                  aria-label={t('activeTenders.button.restore')}
                                  onClick={() => handleRestore(row.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={4}>{t('activeTenders.button.restore')}</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-[2.1fr_1fr_1.05fr_1.25fr_0.9fr_0.9fr_0.9fr_1.45fr] gap-3 mt-3 text-xs text-gray-600">
                        <div className="col-span-5 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full border border-blue-100 bg-blue-50 text-blue-700 px-2.5 py-1 font-medium">
                            {formatPillLabel(row.noticeType || NoticeTypeEnum.PROJECT_NOTICE)}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 px-2.5 py-1 font-medium">
                            {formatPillLabel(row.procurementType || ProcurementTypeEnum.SERVICES)}
                          </Badge>
                        </div>
                        <div className="col-span-3">
                          {activeTab === 'bin' && (
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1">
                                <span className="text-[11px] font-medium text-amber-700">{t('activeTenders.badge.mostRelevant')}</span>
                                <span className="text-xs font-semibold text-amber-900">{row.mostRelevantPartnersCount || 0}</span>
                              </div>
                              <div className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1">
                                <span className="text-[11px] font-medium text-sky-700">{t('activeTenders.badge.other')}</span>
                                <span className="text-xs font-semibold text-sky-900">{row.otherPossiblePartnersCount || 0}</span>
                              </div>
                            </div>
                          )}

                          {activeTab === 'awards' && (
                            <div className="space-y-1.5">
                              {(row.awardCompanies || []).map(company => (
                                <div key={company.name} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                                  <p className="text-xs font-semibold text-gray-900 leading-tight">{company.name}</p>
                                  <p className="mt-0.5 text-[11px] text-gray-600">
                                    <span className="font-medium">{company.budget.formatted}</span>
                                    <span className="mx-1 text-gray-400">|</span>
                                    <span>{format(company.date, 'dd MMM yyyy', { locale: dateLocale })}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {activeTab === 'shortlists' && (
                            <div className="space-y-1.5">
                              {(row.shortlistCompanies || []).map(company => (
                                <div key={company.name} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
                                  <p className="text-xs font-semibold text-gray-900 leading-tight">{company.name}</p>
                                  <p className="mt-0.5 text-[11px] text-gray-600">{format(company.date, 'dd MMM yyyy', { locale: dateLocale })}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <Dialog
            open={isMyProjectsDialogOpen}
            onOpenChange={(open) => {
              if (open) {
                setIsMyProjectsDialogOpen(true);
                return;
              }
              closeMyProjectsDialog();
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {t(
                    pendingProjectId && favouriteIds.has(pendingProjectId)
                      ? 'activeTenders.modal.myProjects.titleRemove'
                      : 'activeTenders.modal.myProjects.titleAdd'
                  )}
                </DialogTitle>
                <DialogDescription>
                  {t(
                    pendingProjectId && favouriteIds.has(pendingProjectId)
                      ? 'activeTenders.modal.myProjects.descriptionRemove'
                      : 'activeTenders.modal.myProjects.descriptionAdd'
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={closeMyProjectsDialog}>
                  {t('activeTenders.modal.myProjects.cancel')}
                </Button>
                <Button
                  variant={pendingProjectId && favouriteIds.has(pendingProjectId) ? 'destructive' : 'default'}
                  onClick={confirmMyProjectsAction}
                >
                  {t('activeTenders.modal.myProjects.confirm')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageContainer>
    </div>
  );
}
