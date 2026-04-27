import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { useOrganizationBookmarks } from '@app/modules/shared/hooks/useOrganizationBookmarks';
import { OrganizationTypeEnum, OrganizationSectorEnum, RegionEnum, CountryEnum } from '@app/types/organization.dto';
import { SubSectorEnum, SectorEnum, REGION_COUNTRY_MAP } from '@app/types/tender.dto';
import { ORGANIZATION_SECTOR_SUBSECTOR_MAP } from '@app/config/organization-sectors.config';
import { Search, Filter, X, ChevronLeft, ChevronRight, Building2, MapPin, Briefcase, Globe, Target, CheckCircle, ChevronDown, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OrganizationSavedPayload {
  searchQuery: string;
  selectedSectors: OrganizationSectorEnum[];
  selectedSubSectors: SubSectorEnum[];
  selectedRegions: RegionEnum[];
  selectedCountries: CountryEnum[];
  type: OrganizationTypeEnum[];
}

interface SavedSearchEntry<TPayload> {
  id: string;
  label: string;
  createdAt: string;
  payload: TPayload;
}

interface OrganizationPartnerState {
  engagements?: string[];
}

export default function SearchOrganizationsTabContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useOrganizationBookmarks();
  const [searchParams] = useSearchParams();
  const {
    organizations,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
  } = useOrganizations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<OrganizationSectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSectorFilters, setShowSectorFilters] = useState(false);
  const [showRegionFilters, setShowRegionFilters] = useState(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry<OrganizationSavedPayload>[]>([]);
  const [compatibilityByOrg, setCompatibilityByOrg] = useState<Record<string, number>>({});
  const [partnerStates, setPartnerStates] = useState<Record<string, OrganizationPartnerState>>({});
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const shouldShowBookmarkButton = user?.accountType !== 'expert';

  const storageKey = 'search.tab.saved.organisations';
  const compatibilityStorageKey = 'search.organisations.compatibility';
  const partnerStateStorageKey = 'search.organisations.partnerStates';

  const availableSubSectors = useMemo(() => {
    if (selectedSectors.length === 0) return [];
    const subs: SubSectorEnum[] = [];
    selectedSectors.forEach((sector) => {
      const sectorSubs = ORGANIZATION_SECTOR_SUBSECTOR_MAP[sector as unknown as keyof typeof ORGANIZATION_SECTOR_SUBSECTOR_MAP] || [];
      subs.push(...sectorSubs);
    });
    return [...new Set(subs)];
  }, [selectedSectors]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (filters.searchQuery || '')) {
        updateFilters({ searchQuery: searchQuery || undefined });
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters.searchQuery, searchQuery, updateFilters]);

  useEffect(() => {
    try {
      const storedCompatibility = JSON.parse(localStorage.getItem(compatibilityStorageKey) || '{}');
      const nextCompatibility = { ...(storedCompatibility || {}) };
      organizations.data.forEach((org) => {
        if (!nextCompatibility[org.id]) {
          nextCompatibility[org.id] = 55 + Math.floor(Math.random() * 44);
        }
      });
      localStorage.setItem(compatibilityStorageKey, JSON.stringify(nextCompatibility));
      setCompatibilityByOrg(nextCompatibility);
    } catch {
      setCompatibilityByOrg({});
    }

    try {
      const storedStates = JSON.parse(localStorage.getItem(partnerStateStorageKey) || '{}');
      setPartnerStates(storedStates || {});
    } catch {
      setPartnerStates({});
    }
  }, [compatibilityStorageKey, organizations.data.length, partnerStateStorageKey]);

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    if (!q) return;
    setSearchQuery(q);
    updateFilters({ searchQuery: q });
  }, [searchParams, updateFilters]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateFilters({ searchQuery });
  };

  const handleTypeFilter = (type: OrganizationTypeEnum) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((item) => item !== type)
      : [...currentTypes, type];
    updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    clearFilters();
  };

  const updatePartnerState = (organizationId: string, patch: OrganizationPartnerState) => {
    const next = {
      ...partnerStates,
      [organizationId]: {
        ...(partnerStates[organizationId] || {}),
        ...patch,
      },
    };
    localStorage.setItem(partnerStateStorageKey, JSON.stringify(next));
    setPartnerStates(next);
  };

  const logEngagement = (organizationId: string) => {
    const current = partnerStates[organizationId]?.engagements || [];
    updatePartnerState(organizationId, { engagements: [...current, new Date().toISOString()] });
  };

  const removeLastEngagement = (organizationId: string) => {
    const current = partnerStates[organizationId]?.engagements || [];
    const next = current.slice(0, -1);
    updatePartnerState(organizationId, { engagements: next.length > 0 ? next : [] });
  };

  const clearEngagements = (organizationId: string) => {
    updatePartnerState(organizationId, { engagements: [] });
  };

  const readSavedSearches = (): SavedSearchEntry<OrganizationSavedPayload>[] => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.payload);
      }

      if (parsed && typeof parsed === 'object') {
        return [{
          id: 'legacy-organisations',
          label: 'Saved organisations',
          createdAt: new Date().toISOString(),
          payload: parsed,
        }];
      }
    } catch {
      return [];
    }

    return [];
  };

  const applySavedSearch = (payload: OrganizationSavedPayload) => {
    setSearchQuery(payload.searchQuery || '');
    setSelectedSectors(payload.selectedSectors || []);
    setSelectedSubSectors(payload.selectedSubSectors || []);
    setSelectedRegions(payload.selectedRegions || []);
    setSelectedCountries(payload.selectedCountries || []);
    updateFilters({
      searchQuery: payload.searchQuery || undefined,
      sectors: (payload.selectedSectors || []).length > 0 ? payload.selectedSectors : undefined,
      subSectors: (payload.selectedSubSectors || []).length > 0 ? payload.selectedSubSectors : undefined,
      regions: (payload.selectedRegions || []).length > 0 ? payload.selectedRegions : undefined,
      countries: (payload.selectedCountries || []).length > 0 ? payload.selectedCountries : undefined,
      type: (payload.type || []).length > 0 ? payload.type : undefined,
    });
  };

  const saveSearch = () => {
    const existing = readSavedSearches();
    const now = new Date();
    const entry: SavedSearchEntry<OrganizationSavedPayload> = {
      id: `saved-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      label: searchQuery.trim() || `Saved organisations ${format(now, 'yyyy-MM-dd HH:mm')}`,
      createdAt: now.toISOString(),
      payload: {
      searchQuery,
      selectedSectors,
      selectedSubSectors,
      selectedRegions,
      selectedCountries,
      type: filters.type || [],
      },
    };

    localStorage.setItem(storageKey, JSON.stringify([entry, ...existing]));
    toast.success('Search saved');
  };

  const openLoadSearchDialog = () => {
    setSavedSearches(readSavedSearches());
    setIsLoadDialogOpen(true);
  };

  const sectionHeadingKey = 'search.section.organisations.filters.heading';
  const sectionDescriptionKey = 'search.section.organisations.filters.description';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-primary">{t(sectionHeadingKey)}</h2>
            <p className="text-sm text-gray-600 mt-1">{t(sectionDescriptionKey)}</p>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{t('activeTenders.filters.active', { count: activeFiltersCount })}</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-1" />
              {t('filters.clear') || t('organizations.filters.clear')}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? 'Hide filters' : 'Show filters'}
          </Button>
          <Button variant="default" size="sm" onClick={() => updateFilters({ searchQuery })}>Search</Button>
          <Button variant="outline" size="sm" onClick={saveSearch}>Save Search</Button>
          <Button variant="outline" size="sm" onClick={openLoadSearchDialog}>Load Search</Button>
        </div>

        {showFilters && (
          <>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">{t('common.search')}</label>
                {organizations.meta.totalItems > 0 && (
                  <span className="text-sm font-medium text-accent">{organizations.meta.totalItems} results</span>
                )}
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t('organizations.filters.search')} className="flex-1" />
                <Button type="submit" size="icon">
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">{t('organizations.filters.type')}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-10 px-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Target className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{filters.type && filters.type.length > 0 ? `${filters.type.length} selected` : 'Select type'}</span>
                      </div>
                      {filters.type && filters.type.length > 0 && <Badge className="ml-2 flex-shrink-0" variant="secondary">{filters.type.length}</Badge>}
                      <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="start">
                    <div className="space-y-2">
                      {Object.values(OrganizationTypeEnum).map((type) => (
                        <Button key={type} variant={filters.type?.includes(type) ? 'default' : 'outline'} size="sm" className="w-full justify-start text-xs" onClick={() => handleTypeFilter(type)}>
                          {filters.type?.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                          {t(`organizations.type.${type}`)}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

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
                selectedSectors={selectedSectors as any}
                selectedSubSectors={selectedSubSectors}
                hoveredSector={hoveredSector}
                onHoverSector={setHoveredSector}
                onSelectSector={(sector: any) => {
                  const next = selectedSectors.includes(sector)
                    ? selectedSectors.filter((item) => item !== sector)
                    : [...selectedSectors, sector];
                  setSelectedSectors(next);
                  if (next.length === 0) {
                    setSelectedSubSectors([]);
                    updateFilters({ sectors: undefined, subSectors: undefined });
                    return;
                  }
                  const validSubSectors = selectedSubSectors.filter((sub) => next.some((sec) => ORGANIZATION_SECTOR_SUBSECTOR_MAP[sec as any]?.includes(sub)));
                  setSelectedSubSectors(validSubSectors);
                  updateFilters({ sectors: next, subSectors: validSubSectors.length > 0 ? validSubSectors : undefined });
                }}
                onSelectSubSector={(subSector) => {
                  const next = selectedSubSectors.includes(subSector)
                    ? selectedSubSectors.filter((item) => item !== subSector)
                    : [...selectedSubSectors, subSector];
                  setSelectedSubSectors(next);
                  updateFilters({ subSectors: next.length > 0 ? next : undefined });
                }}
                onSelectAllSectors={() => {
                  const all = Object.values(OrganizationSectorEnum);
                  if (selectedSectors.length === all.length) {
                    setSelectedSectors([]);
                    setSelectedSubSectors([]);
                    updateFilters({ sectors: undefined, subSectors: undefined });
                  } else {
                    setSelectedSectors(all);
                    updateFilters({ sectors: all });
                  }
                }}
                onSelectAllSubSectors={() => undefined}
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
                onSelectRegion={(region) => {
                  const next = selectedRegions.includes(region)
                    ? selectedRegions.filter((item) => item !== region)
                    : [...selectedRegions, region];
                  setSelectedRegions(next);
                  if (next.length === 0) {
                    setSelectedCountries([]);
                    updateFilters({ regions: undefined, countries: undefined });
                    return;
                  }
                  const validCountries = selectedCountries.filter((country) => next.some((reg) => REGION_COUNTRY_MAP[reg]?.includes(country)));
                  setSelectedCountries(validCountries);
                  updateFilters({ regions: next, countries: validCountries.length > 0 ? validCountries : undefined });
                }}
                onSelectCountry={(country) => {
                  const next = selectedCountries.includes(country)
                    ? selectedCountries.filter((item) => item !== country)
                    : [...selectedCountries, country];
                  setSelectedCountries(next);
                  updateFilters({ countries: next.length > 0 ? next : undefined });
                }}
                onSelectAllRegions={() => {
                  const all = Object.values(RegionEnum);
                  if (selectedRegions.length === all.length) {
                    setSelectedRegions([]);
                    setSelectedCountries([]);
                    updateFilters({ regions: undefined, countries: undefined });
                  } else {
                    setSelectedRegions(all);
                    updateFilters({ regions: all });
                  }
                }}
                t={t}
              />
            </div>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'results' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
            onClick={() => setActiveTab('results')}
          >
            Search Results
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-primary'}`}
            onClick={() => setActiveTab('history')}
          >
            History
            {Object.values(partnerStates).filter((s) => (s.engagements?.length ?? 0) > 0).length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                {Object.values(partnerStates).filter((s) => (s.engagements?.length ?? 0) > 0).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="space-y-4 mb-6">
            {organizations.data.filter((org) => (partnerStates[org.id]?.engagements?.length ?? 0) > 0).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-1">No history yet</h3>
                <p className="text-sm text-muted-foreground">Mark organisations you have worked with to track them here.</p>
              </div>
            ) : (
              organizations.data
                .filter((org) => (partnerStates[org.id]?.engagements?.length ?? 0) > 0)
                .map((org) => (
                  <div key={org.id} className="bg-white rounded-lg border p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">{org.name}{org.acronym && <span className="text-sm text-muted-foreground ml-2">({org.acronym})</span>}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{org.city}, {org.country}</p>
                        {(partnerStates[org.id]?.engagements?.length ?? 0) > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {partnerStates[org.id].engagements!.length} engagement{partnerStates[org.id].engagements!.length > 1 ? 's' : ''} — last: {format(new Date(partnerStates[org.id].engagements!.at(-1)!), 'yyyy-MM-dd')}
                          </p>
                        )}
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => removeLastEngagement(org.id)}
                        >
                          Undo last
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => clearEngagements(org.id)}
                        >
                          Clear all
                        </Button>
                      </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'results' && (<>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * organizations.meta.pageSize + 1)}-{Math.min(currentPage * organizations.meta.pageSize, organizations.meta.totalItems)} of {organizations.meta.totalItems}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">{t('common.sort')}:</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('organizations.sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('organizations.sort.oldest')}</SelectItem>
                  <SelectItem value="name">{t('organizations.sort.name')}</SelectItem>
                  <SelectItem value="partnerships">{t('organizations.sort.partnerships')}</SelectItem>
                  <SelectItem value="projects">{t('organizations.sort.projects')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

        {organizations.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {organizations.data.map((org) => (
              <div key={org.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-blue-500" /></div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">{org.name}{org.acronym && <span className="text-sm text-muted-foreground ml-2">({org.acronym})</span>}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                      {compatibilityByOrg[org.id] || 72}% compatibility
                    </Badge>
                    {shouldShowBookmarkButton && (
                      <Button
                        variant={isBookmarked(org.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleBookmark(org.id)}
                        aria-label="Add to Partners"
                        className="min-h-9"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        {isBookmarked(org.id) ? 'Partner added' : 'Add to Partners'}
                      </Button>
                    )}
                    {org.status === 'VERIFIED' && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('organizations.status.VERIFIED')}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Target className="w-4 h-4" />{t(`organizations.type.${org.type}`)}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{org.city}, {org.country}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{org.activeProjects} {t('organizations.details.projects')}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {org.sectors.slice(0, 3).map((sector, index) => (
                    <Badge key={`${org.id}-sector-${index}`} variant="secondary">{t(`sectors.${sector}`)}</Badge>
                  ))}
                  {org.sectors.length > 3 && <Badge variant="outline">+{org.sectors.length - 3}</Badge>}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    onClick={() => logEngagement(org.id)}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    Worked with this organisation
                  </Button>
                  {(partnerStates[org.id]?.engagements?.length ?? 0) > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-xs font-semibold">
                      {partnerStates[org.id].engagements!.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground"><Globe className="w-4 h-4" />{t(`organizations.region.${org.region}`)}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default" size="sm" onClick={() => navigate(`/search/organizations/${org.id}`)}>{t('actions.viewDetails')}</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary mb-1">{t('organizations.list.noResults')}</h3>
            <p className="text-sm text-muted-foreground">{t('organizations.list.noResults.message')}</p>
          </div>
        )}

        {organizations.meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={!organizations.meta.hasPreviousPage}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('pagination.previous')}
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, organizations.meta.totalPages) }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)}>
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={!organizations.meta.hasNextPage}>
              {t('pagination.next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        </>)}
      </div>

      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Load Search</DialogTitle>
            <DialogDescription>Choose a saved search for organisations.</DialogDescription>
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
