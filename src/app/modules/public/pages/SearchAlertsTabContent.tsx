import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { format, isAfter, startOfToday } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { useLanguage } from '@app/contexts/LanguageContext';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Calendar } from '@app/components/ui/calendar';
import { EmailTemplatePreview } from '@app/components/EmailTemplatePreview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { useTenders } from '@app/hooks/useTenders';
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
import { toast } from 'sonner';

type AlertsTab = 'projects' | 'awards' | 'shortlists';
type SearchMode = 'allWords' | 'anyWords' | 'exactPhrase' | 'boolean';
type BudgetMode = 'any' | 'above' | 'below';
type SortField = 'title' | 'location' | 'donor' | 'budget' | 'published' | 'deadline';
type SortDirection = 'asc' | 'desc' | 'none';

interface SearchAlertsTabContentProps {
  tab: AlertsTab;
}

interface AlertsSavedPayload {
  showFilters: boolean;
  showSectorFilters: boolean;
  showRegionFilters: boolean;
  searchInput: string;
  searchQuery: string;
  searchMode: SearchMode;
  selectedProcurementTypes: ProcurementTypeEnum[];
  selectedNoticeTypes: NoticeTypeEnum[];
  publishedFrom: string | null;
  publishedTo: string | null;
  budgetMode: BudgetMode;
  budgetValue: string;
  hideMultiCountry: boolean;
  selectedSectors: SectorEnum[];
  selectedSubSectors: SubSectorEnum[];
  selectedRegions: RegionEnum[];
  selectedCountries: CountryEnum[];
  selectedFundingAgencies: FundingAgencyEnum[];
  fundingAgencySearch: string;
  sortField: SortField | null;
  sortDirection: SortDirection;
  locationFilters: string[];
  donorFilters: string[];
}

interface SavedSearchEntry<TPayload> {
  id: string;
  label: string;
  createdAt: string;
  payload: TPayload;
}

interface SavedAlertPreference {
  searchId: string;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  intervalDays: number;
}

export default function SearchAlertsTabContent({ tab }: SearchAlertsTabContentProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { allTenders } = useTenders();
  const storageKey = `search.tab.saved.${tab}`;
  const alertsStorageKey = `search.tab.alerts.${tab}`;

  const [showFilters, setShowFilters] = useState(tab === 'projects');
  const [showSectorFilters, setShowSectorFilters] = useState(tab === 'projects');
  const [showRegionFilters, setShowRegionFilters] = useState(tab === 'projects');
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
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('none');
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [donorFilters, setDonorFilters] = useState<string[]>([]);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry<AlertsSavedPayload>[]>([]);
  const [hasSearched, setHasSearched] = useState(tab !== 'projects');
  const [alertPreferences, setAlertPreferences] = useState<SavedAlertPreference[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;
  const today = startOfToday();

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    if (!q) return;
    setSearchInput(q);
    setSearchQuery(q);
    setHasSearched(true);
  }, [searchParams]);

  useEffect(() => {
    setSavedSearches(readSavedSearches());
    if (tab !== 'projects') return;

    try {
      const parsed = JSON.parse(localStorage.getItem(alertsStorageKey) || '[]');
      setAlertPreferences(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAlertPreferences([]);
    }
  }, [alertsStorageKey, tab]);

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

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
    setHasSearched(true);
  };

  const filteredFundingAgencies = useMemo(() => {
    if (!fundingAgencySearch) return Object.values(FundingAgencyEnum);
    return Object.values(FundingAgencyEnum).filter(agency =>
      t(`fundingAgencies.${agency}`).toLowerCase().includes(fundingAgencySearch.toLowerCase())
    );
  }, [fundingAgencySearch, t]);

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
  };

  const readSavedSearches = (): SavedSearchEntry<AlertsSavedPayload>[] => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.payload);
      }

      if (parsed && typeof parsed === 'object') {
        return [{
          id: `legacy-${tab}`,
          label: `Saved ${tab}`,
          createdAt: new Date().toISOString(),
          payload: parsed,
        }];
      }
    } catch {
      return [];
    }

    return [];
  };

  const applySavedSearch = (payload: AlertsSavedPayload) => {
    setShowFilters(Boolean(payload.showFilters));
    setShowSectorFilters(Boolean(payload.showSectorFilters));
    setShowRegionFilters(Boolean(payload.showRegionFilters));
    setSearchInput(payload.searchInput || '');
    setSearchQuery(payload.searchQuery || '');
    setSearchMode(payload.searchMode || 'allWords');
    setSelectedProcurementTypes(payload.selectedProcurementTypes || []);
    setSelectedNoticeTypes(payload.selectedNoticeTypes || []);
    setPublishedFrom(payload.publishedFrom ? new Date(payload.publishedFrom) : undefined);
    setPublishedTo(payload.publishedTo ? new Date(payload.publishedTo) : undefined);
    setBudgetMode(payload.budgetMode || 'any');
    setBudgetValue(payload.budgetValue || '');
    setHideMultiCountry(Boolean(payload.hideMultiCountry));
    setSelectedSectors(payload.selectedSectors || []);
    setSelectedSubSectors(payload.selectedSubSectors || []);
    setSelectedRegions(payload.selectedRegions || []);
    setSelectedCountries(payload.selectedCountries || []);
    setSelectedFundingAgencies(payload.selectedFundingAgencies || []);
    setFundingAgencySearch(payload.fundingAgencySearch || '');
    setSortField(payload.sortField || null);
    setSortDirection(payload.sortDirection || 'none');
    setLocationFilters(payload.locationFilters || []);
    setDonorFilters(payload.donorFilters || []);
    setHasSearched(true);
  };

  const buildPayload = (): AlertsSavedPayload => ({
      showFilters,
      showSectorFilters,
      showRegionFilters,
      searchInput,
      searchQuery,
      searchMode,
      selectedProcurementTypes,
      selectedNoticeTypes,
      publishedFrom: publishedFrom ? publishedFrom.toISOString() : null,
      publishedTo: publishedTo ? publishedTo.toISOString() : null,
      budgetMode,
      budgetValue,
      hideMultiCountry,
      selectedSectors,
      selectedSubSectors,
      selectedRegions,
      selectedCountries,
      selectedFundingAgencies,
      fundingAgencySearch,
      sortField,
      sortDirection,
      locationFilters,
      donorFilters,
  });

  const saveSearch = () => {
    const existing = readSavedSearches();
    const now = new Date();
    const labelBase = (searchInput || searchQuery).trim();
    const label = labelBase || `Saved ${tab} ${format(now, 'yyyy-MM-dd HH:mm')}`;
    const nextEntry: SavedSearchEntry<AlertsSavedPayload> = {
      id: `saved-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      createdAt: now.toISOString(),
      payload: buildPayload(),
    };

    const next = [nextEntry, ...existing];
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedSearches(next);
    toast.success('Search saved');
  };

  const openLoadSearchDialog = () => {
    setSavedSearches(readSavedSearches());
    setIsLoadDialogOpen(true);
  };

  const updateSavedSearch = (entry: SavedSearchEntry<AlertsSavedPayload>) => {
    const next = readSavedSearches().map((item) =>
      item.id === entry.id ? { ...item, label: entry.label, payload: buildPayload() } : item
    );
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedSearches(next);
    toast.success('Saved search updated');
  };

  const deleteSavedSearch = (id: string) => {
    const next = readSavedSearches().filter((entry) => entry.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setSavedSearches(next);
    const nextAlerts = alertPreferences.filter((preference) => preference.searchId !== id);
    localStorage.setItem(alertsStorageKey, JSON.stringify(nextAlerts));
    setAlertPreferences(nextAlerts);
  };

  const activeAlertCount = alertPreferences.filter((p) => p.enabled).length;

  const setAlertEnabled = (searchId: string, enabled: boolean) => {
    const existing = alertPreferences.find((p) => p.searchId === searchId);
    let next: SavedAlertPreference[];
    if (enabled) {
      if (activeAlertCount >= 5) return; // limit enforced inline in UI
      if (existing) {
        next = alertPreferences.map((p) => p.searchId === searchId ? { ...p, enabled: true } : p);
      } else {
        next = [...alertPreferences, { searchId, enabled: true, frequency: 'weekly', intervalDays: 7 }];
      }
    } else {
      if (existing) {
        next = alertPreferences.map((p) => p.searchId === searchId ? { ...p, enabled: false } : p);
      } else {
        next = alertPreferences;
      }
    }
    localStorage.setItem(alertsStorageKey, JSON.stringify(next));
    setAlertPreferences(next);
  };

  const updateAlertConfig = (searchId: string, config: Partial<Omit<SavedAlertPreference, 'searchId'>>) => {
    const existing = alertPreferences.find((p) => p.searchId === searchId);
    let next: SavedAlertPreference[];
    if (existing) {
      next = alertPreferences.map((p) => p.searchId === searchId ? { ...p, ...config } : p);
    } else {
      next = [...alertPreferences, { searchId, enabled: false, frequency: 'weekly', intervalDays: 7, ...config }];
    }
    localStorage.setItem(alertsStorageKey, JSON.stringify(next));
    setAlertPreferences(next);
  };

  // Keep legacy alias for deleteSavedSearch compatibility
  const setAlertPreference = setAlertEnabled;

  const baseRows = useMemo(() => {
    if (tab === 'projects') return allTenders.filter(item => item.alertCategory === MatchingAlertCategoryEnum.PROJECTS);
    if (tab === 'awards') return allTenders.filter(item => item.alertCategory === MatchingAlertCategoryEnum.AWARDS);
    return allTenders.filter(item => item.alertCategory === MatchingAlertCategoryEnum.SHORTLISTS);
  }, [allTenders, tab]);

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
      if (selectedProcurementTypes.length > 0 && (!row.procurementType || !selectedProcurementTypes.includes(row.procurementType))) return false;
      if (selectedNoticeTypes.length > 0 && (!row.noticeType || !selectedNoticeTypes.includes(row.noticeType))) return false;
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
    publishedFrom,
    publishedTo,
    searchMode,
    searchQuery,
    selectedCountries,
    selectedFundingAgencies,
    selectedNoticeTypes,
    selectedProcurementTypes,
    selectedRegions,
    selectedSectors,
    selectedSubSectors,
    t,
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
      if (sortField === 'published') return ((a.publishedDate?.getTime() || 0) - (b.publishedDate?.getTime() || 0)) * directionFactor;
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
      t('activeTenders.table.location'),
      t('activeTenders.table.donor'),
      t('activeTenders.table.budget'),
      t('activeTenders.table.published'),
      t('activeTenders.table.deadline'),
      t('activeTenders.filters.noticeType'),
      t('activeTenders.filters.procurementType'),
    ];

    const csvRows = sortedRows.map(row => {
      const location = row.isMultiCountry ? t('activeTenders.multiCountryLabel') : getLocalizedCountryName(row.country, language);
      const published = row.publishedDate ? format(row.publishedDate, 'yyyy-MM-dd') : '';
      const deadline = format(row.deadline, 'yyyy-MM-dd');
      return [row.title, location, row.organizationName, row.budget.formatted, published, deadline, row.noticeType || '', row.procurementType || '']
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-${tab}.csv`;
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
    locationFilters.length,
    donorFilters.length,
  ].reduce((sum, value) => sum + value, 0);

  const sectionHeadingKey = `search.section.${tab}.filters.heading`;
  const sectionDescriptionKey = `search.section.${tab}.filters.description`;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-primary">{t(sectionHeadingKey)}</h2>
            <p className="text-sm text-gray-600 mt-1">{t(sectionDescriptionKey)}</p>
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{t('activeTenders.filters.active', { count: activeFilterCount })}</Badge>
          )}
        </div>
        <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto_auto_auto_auto_auto] gap-3 mb-4">
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
          <Button type="button" variant="outline" className="min-h-11" onClick={saveSearch}>
            Save Search
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={openLoadSearchDialog}>
            Load Search
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

      {tab === 'projects' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-primary">Saved Searches</h3>
              <span className="text-xs text-muted-foreground">{activeAlertCount}/5 email alerts active</span>
            </div>
            <div className="mt-3 space-y-3">
              {savedSearches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved searches yet.</p>
              ) : (
                savedSearches.map((entry) => {
                  const alertPref = alertPreferences.find((p) => p.searchId === entry.id);
                  const isExpanded = expandedAlertId === entry.id;
                  const isAlertEnabled = alertPref?.enabled ?? false;
                  const atLimit = activeAlertCount >= 5 && !isAlertEnabled;
                  return (
                    <div key={entry.id} className="rounded-md border border-gray-100 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-primary truncate">{entry.label}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                          </div>
                          <Badge className={isAlertEnabled ? 'shrink-0 bg-green-100 text-green-700 border-green-200 hover:bg-green-100' : 'shrink-0 bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'}>
                            {isAlertEnabled ? 'Email ON' : 'Email OFF'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => applySavedSearch(entry.payload)}>Load</Button>
                          <Button size="sm" variant="outline" onClick={() => updateSavedSearch(entry)}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteSavedSearch(entry.id)}>Delete</Button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mt-2 flex w-full items-center gap-1 rounded px-1 py-1 text-xs font-medium text-muted-foreground hover:bg-gray-50 hover:text-primary transition-colors"
                        onClick={() => setExpandedAlertId(isExpanded ? null : entry.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        Email Alert Settings
                      </button>

                      {isExpanded && (
                        <div className="mt-2 rounded-md border border-gray-100 bg-gray-50/60 p-3 space-y-3">
                          {atLimit && (
                            <p className="text-xs text-red-600 font-medium">You have reached the maximum of 5 email alerts. Disable another alert to enable this one.</p>
                          )}

                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[#E63462]"
                              checked={isAlertEnabled}
                              disabled={atLimit}
                              onChange={(e) => setAlertEnabled(entry.id, e.target.checked)}
                            />
                            <span className={atLimit ? 'text-muted-foreground' : 'text-primary font-medium'}>
                              Enable email alerts for this search
                            </span>
                          </label>

                          {isAlertEnabled && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-20 shrink-0">Frequency</span>
                                <Select
                                  value={alertPref?.frequency ?? 'weekly'}
                                  onValueChange={(value: SavedAlertPreference['frequency']) => updateAlertConfig(entry.id, { frequency: value, intervalDays: value === 'custom' ? (alertPref?.intervalDays ?? 7) : 7 })}
                                >
                                  <SelectTrigger className="h-8 w-36 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="custom">Custom interval</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {alertPref?.frequency === 'custom' && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-20 shrink-0">Every</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    className="h-8 w-24 text-xs"
                                    value={alertPref.intervalDays}
                                    onChange={(e) => {
                                      const days = Math.max(1, parseInt(e.target.value, 10) || 1);
                                      updateAlertConfig(entry.id, { intervalDays: days });
                                    }}
                                  />
                                  <span className="text-xs text-muted-foreground">day(s)</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <EmailTemplatePreview
            title="Saved search alert"
            frequency={alertPreferences.find((p) => p.enabled)?.frequency || 'not enabled'}
            query={searchQuery || searchInput}
            filtersSummary={`${activeFilterCount} active filters`}
          />
        </div>
      )}

      {tab === 'projects' && !hasSearched ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-primary">Run a search to view project results</h3>
          <p className="mt-1 text-sm text-muted-foreground">Filters are ready. Results stay hidden until you search.</p>
        </div>
      ) : (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[2.2fr_1.1fr_1.3fr_0.95fr_0.95fr_0.95fr_1.2fr] items-center gap-2 px-5 py-3.5 border-b border-gray-200 bg-gray-50/80 text-xs font-semibold tracking-wide text-gray-600">
              <button className={getHeaderClassName('title')} onClick={() => toggleSort('title')}>
                {t('activeTenders.table.projectTitle')}
                {renderSortIcon('title')}
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
                      <div className="grid grid-cols-[2.2fr_1.1fr_1.3fr_0.95fr_0.95fr_0.95fr_1.2fr] gap-2 items-center text-sm">
                        <div className="font-semibold text-gray-900 leading-snug pr-1">{row.title}</div>
                        <div className="text-gray-700 leading-snug">{location}</div>
                        <div className="text-gray-700 leading-snug">{row.organizationName}</div>
                        <div className="text-gray-700 font-medium">{row.budget.formatted}</div>
                        <div className="text-gray-700">{row.publishedDate ? format(row.publishedDate, 'dd MMM yyyy', { locale: dateLocale }) : '-'}</div>
                        <div className="text-gray-700">{format(row.deadline, 'dd MMM yyyy', { locale: dateLocale })}</div>
                        <div className="flex flex-wrap gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="min-h-10 w-10 border-gray-300 p-0"
                                aria-label={t('activeTenders.button.viewDetails')}
                                onClick={() => navigate(`/search/calls/${row.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={4}>{t('activeTenders.button.viewDetails')}</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className="grid grid-cols-[2.3fr_1.2fr_1.5fr_1fr_1fr_1fr_1.8fr] gap-3 mt-3 text-xs text-gray-600">
                        <div className="col-span-4 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full border border-blue-100 bg-blue-50 text-blue-700 px-2.5 py-1 font-medium">
                            {formatPillLabel(row.noticeType || NoticeTypeEnum.PROJECT_NOTICE)}
                          </Badge>
                          <Badge variant="secondary" className="rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 px-2.5 py-1 font-medium">
                            {formatPillLabel(row.procurementType || ProcurementTypeEnum.SERVICES)}
                          </Badge>
                        </div>
                        <div className="col-span-3">
                          {tab === 'projects' && (
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

                          {tab === 'awards' && (
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

                          {tab === 'shortlists' && (
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
      )}

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Load Search</DialogTitle>
            <DialogDescription>Choose a saved search for this page.</DialogDescription>
          </DialogHeader>
          {savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved searches found for this page.</p>
          ) : (
            <div className="max-h-80 overflow-auto space-y-2">
              {savedSearches.map(entry => (
                <Button
                  key={entry.id}
                  type="button"
                  variant="outline"
                  className="w-full justify-between h-auto py-2"
                  onClick={() => {
                    applySavedSearch(entry.payload);
                    setIsLoadDialogOpen(false);
                    toast.success('Search loaded');
                  }}
                >
                  <span className="truncate text-left max-w-[70%]">{entry.label}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                </Button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
