import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@app/components/ui/tooltip';
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { Organization, OrganizationTypeEnum, OrganizationStatusEnum, OrganizationSectorEnum, RegionEnum, CountryEnum } from '@app/types/organization.dto';
import { SubSectorEnum, SectorEnum } from '@app/types/tender.dto';
import { ORGANIZATION_SECTOR_SUBSECTOR_MAP } from '@app/config/organization-sectors.config';
import { REGION_COUNTRY_MAP } from '@app/types/tender.dto';
import {
  Database,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Briefcase,
  Globe,
  Target,
  CheckCircle,
  ChevronDown,
  UserPlus,
  Handshake,
  CalendarDays,
  Users2,
  Star,
  Layers,
  ExternalLink,
  Clock,
  Mail,
  Award,
  TrendingUp,
} from 'lucide-react';
import { getLocalizedCountryName } from '@app/utils/country-translator';

type EmployeeSizeFilter = 'micro' | 'small' | 'medium' | 'large';

/** Compute a 0–5 profile completeness score based on present fields. */
function computeProfileScore(org: Organization): number {
  return [
    (org.description?.length ?? 0) > 50,
    !!org.website,
    (org.sectors?.length ?? 0) > 0,
    !!org.employeeCount,
    !!org.yearEstablished,
  ].filter(Boolean).length;
}

function matchesEmployeeSize(org: Organization, size: EmployeeSizeFilter | null): boolean {
  if (!size) return true;
  const n = org.employeeCount ?? 0;
  if (size === 'micro') return n > 0 && n < 10;
  if (size === 'small') return n >= 10 && n < 50;
  if (size === 'medium') return n >= 50 && n < 200;
  if (size === 'large') return n >= 200;
  return true;
}

export default function OrganizationsDatabase() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const {
    organizations,
    isLoading,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    saveOrganization,
    unsaveOrganization,
    isOrganizationSaved,
  } = useOrganizations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<OrganizationSectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<OrganizationStatusEnum[]>([]);
  const [selectedEmployeeSize, setSelectedEmployeeSize] = useState<EmployeeSizeFilter | null>(null);
  
  // State for filters visibility toggle
  const [showFilters, setShowFilters] = useState(true);

  // Get available subsectors based on selected sectors
  const availableSubSectors = useMemo(() => {
    if (selectedSectors.length === 0) return [];
    const subSectors: SubSectorEnum[] = [];
    selectedSectors.forEach(sector => {
      // Cast OrganizationSectorEnum to SectorEnum since they share the same values
      const sectorSubSectors = ORGANIZATION_SECTOR_SUBSECTOR_MAP[sector as unknown as keyof typeof ORGANIZATION_SECTOR_SUBSECTOR_MAP] || [];
      subSectors.push(...sectorSubSectors);
    });
    return [...new Set(subSectors)]; // Remove duplicates
  }, [selectedSectors]);

  // Client-side filter for employee size (not a server filter)
  const displayedOrganizations = useMemo(() => {
    if (!selectedEmployeeSize) return organizations.data;
    return organizations.data.filter(org => matchesEmployeeSize(org, selectedEmployeeSize));
  }, [organizations.data, selectedEmployeeSize]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (filters.searchQuery || '')) {
        updateFilters({ searchQuery: searchQuery || undefined });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ searchQuery });
  };

  const handleTypeFilter = (type: OrganizationTypeEnum) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleRegionFilter = (region: RegionEnum) => {
    const currentRegions = filters.region || [];
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter(r => r !== region)
      : [...currentRegions, region];
    updateFilters({ region: newRegions.length > 0 ? newRegions : undefined });
  };

  const handleStatusFilter = (status: OrganizationStatusEnum) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    updateFilters({ status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleSectorFilter = (sector: OrganizationSectorEnum) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    
    setSelectedSectors(newSectors);
    
    // If removing all sectors, also clear subsectors
    if (newSectors.length === 0) {
      setSelectedSubSectors([]);
      updateFilters({ sectors: undefined, subSectors: undefined });
    } else {
      // Remove subsectors that don't belong to any selected sector
      const validSubSectors = selectedSubSectors.filter(sub => {
        return newSectors.some(sec => ORGANIZATION_SECTOR_SUBSECTOR_MAP[sec]?.includes(sub));
      });
      setSelectedSubSectors(validSubSectors);
      updateFilters({ 
        sectors: newSectors, 
        subSectors: validSubSectors.length > 0 ? validSubSectors : undefined 
      });
    }
  };

  const handleSubSectorFilter = (subSector: SubSectorEnum) => {
    const newSubSectors = selectedSubSectors.includes(subSector)
      ? selectedSubSectors.filter(s => s !== subSector)
      : [...selectedSubSectors, subSector];
    
    setSelectedSubSectors(newSubSectors);
    updateFilters({ subSectors: newSubSectors.length > 0 ? newSubSectors : undefined });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedStatuses([]);
    setSelectedEmployeeSize(null);
    clearFilters();
  };

  const getTranslatedTypeLabel = (type?: string) => {
    if (!type) return '-';
    const translation = t(`organizations.type.${type}`);
    return translation === `organizations.type.${type}` ? type.replace(/_/g, ' ') : translation;
  };

  const getTranslatedRegionLabel = (region?: string) => {
    if (!region) return '-';
    const translation = t(`organizations.region.${region}`);
    return translation === `organizations.region.${region}` ? region.replace(/_/g, ' ') : translation;
  };

  const getLocationLabel = (org: { city?: string | { name: string }; country?: string | { name: string } }) => {
    const city = typeof org.city === 'string' ? org.city : org.city?.name;
    const country = typeof org.country === 'string' ? org.country : org.country?.name;
    return [city, country].filter(Boolean).join(', ') || '-';
  };

  // Total including client-side filters (status handled by server, employee size is local)
  const totalActiveFiltersCount = activeFiltersCount + (selectedEmployeeSize ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('organizations.hub.title')}
        description={t('organizations.hub.subtitle')}
        icon={Building2}
        stats={[
          { value: kpis.totalOrganizations.toString(), label: t('organizations.kpis.totalOrganizations') },
          { value: kpis.activeOrganizations.toString(), label: t('organizations.kpis.activeOrganizations') },
          { value: kpis.partnerships.toString(), label: t('organizations.kpis.partnerships') }
        ]}
      />

      {/* Sub Menu */}
      <OrganizationsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">{t('organizations.list.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('organizations.list.subtitle')}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/organizations/invite')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t('organizations.actions.invite')}
            </Button>
          </div>

          {/* Horizontal Filters Bar */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  {t('organizations.filters.title') || t('common.filter')}
                </h3>
                {totalActiveFiltersCount > 0 && (
                  <Badge variant="secondary">{totalActiveFiltersCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {totalActiveFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {t('filters.clear') || t('organizations.filters.clear')}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="ml-2"
                >
                  {showFilters ? (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {t('filters.toggle.hide')}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-1" />
                      {t('filters.toggle.show')}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <>
                {/* Search Row */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('common.search')}
                    </label>
                    {organizations.meta && organizations.meta.totalItems > 0 && (
                      <span className="text-sm font-medium text-accent">
                        {organizations.meta.totalItems === 1 
                          ? `${organizations.meta.totalItems} résultat`
                          : `${organizations.meta.totalItems} résultats`
                        }
                      </span>
                    )}
                  </div>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('organizations.filters.search')}
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>

                {/* Filters Row 1: Type d'organisation */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('organizations.filters.type')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-10 px-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Target className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {filters.type && filters.type.length > 0 
                                ? filters.type.length === 1
                                  ? t(`organizations.type.${filters.type[0]}`)
                                  : `${filters.type.length} sélectionnés`
                                : t('organizations.filters.selectType') || 'Sélectionner'}
                            </span>
                          </div>
                          {filters.type && filters.type.length > 0 && (
                            <Badge className="ml-2 flex-shrink-0" variant="secondary">
                              {filters.type.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">{t('organizations.filters.type')}</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.values(OrganizationTypeEnum).map((type) => (
                              <Button
                                key={type}
                                variant={filters.type?.includes(type) ? "default" : "outline"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => handleTypeFilter(type)}
                              >
                                {filters.type?.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                                {t(`organizations.type.${type}`)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Filters Row 1b: Status + Employee Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('organizations.filters.status')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(OrganizationStatusEnum).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusFilter(status)}
                          className={[
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            selectedStatuses.includes(status)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary',
                          ].join(' ')}
                        >
                          {t(`organizations.status.${status}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Employee Size Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('organizations.filters.employeeSize')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['micro', 'small', 'medium', 'large'] as EmployeeSizeFilter[]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedEmployeeSize(selectedEmployeeSize === size ? null : size)}
                          className={[
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            selectedEmployeeSize === size
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary',
                          ].join(' ')}
                        >
                          {t(`organizations.filters.employeeSize.${size}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filters Row 2: Secteur & Sous-secteur - ASSORTIS RED & BLACK DESIGN */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <SectorSubsectorFilter
                    selectedSectors={selectedSectors as any}
                    selectedSubSectors={selectedSubSectors}
                    hoveredSector={hoveredSector}
                    onHoverSector={setHoveredSector}
                    onSelectSector={handleSectorFilter as any}
                    onSelectSubSector={handleSubSectorFilter}
                    onSelectAllSectors={() => {
                      const allSectors = Object.values(OrganizationSectorEnum);
                      if (selectedSectors.length === allSectors.length) {
                        setSelectedSectors([]);
                        setSelectedSubSectors([]);
                        updateFilters({ sectors: undefined, subSectors: undefined });
                      } else {
                        setSelectedSectors(allSectors);
                        updateFilters({ sectors: allSectors });
                      }
                    }}
                    onSelectAllSubSectors={(sector) => {
                      const sectorSubs = ORGANIZATION_SECTOR_SUBSECTOR_MAP[sector as any] || [];
                      const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
                      if (allSelected) {
                        const newSubs = selectedSubSectors.filter(sub => !sectorSubs.includes(sub));
                        setSelectedSubSectors(newSubs);
                        updateFilters({ subSectors: newSubs.length > 0 ? newSubs : undefined });
                      } else {
                        const newSubs = [...new Set([...selectedSubSectors, ...sectorSubs])];
                        setSelectedSubSectors(newSubs);
                        updateFilters({ subSectors: newSubs });
                      }
                    }}
                    t={t}
                  />
                </div>

                {/* Filters Row 3: Région & Pays - SAME DESIGN AS SECTOR/SUBSECTOR */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <RegionCountryFilter
                    selectedRegions={selectedRegions}
                    selectedCountries={selectedCountries}
                    onSelectRegion={(region) => {
                      const newRegions = selectedRegions.includes(region)
                        ? selectedRegions.filter(r => r !== region)
                        : [...selectedRegions, region];
                      
                      setSelectedRegions(newRegions);
                      
                      if (newRegions.length === 0) {
                        setSelectedCountries([]);
                        updateFilters({ regions: undefined, countries: undefined });
                      } else {
                        const validCountries = selectedCountries.filter(country => {
                          return newRegions.some(reg => REGION_COUNTRY_MAP[reg]?.includes(country));
                        });
                        setSelectedCountries(validCountries);
                        updateFilters({ 
                          regions: newRegions, 
                          countries: validCountries.length > 0 ? validCountries : undefined 
                        });
                      }
                    }}
                    onSelectCountry={(country) => {
                      const newCountries = selectedCountries.includes(country)
                        ? selectedCountries.filter(c => c !== country)
                        : [...selectedCountries, country];
                      setSelectedCountries(newCountries);
                      updateFilters({ countries: newCountries.length > 0 ? newCountries : undefined });
                    }}
                    onSelectAllRegions={() => {
                      const allRegions = Object.values(RegionEnum);
                      if (selectedRegions.length === allRegions.length) {
                        setSelectedRegions([]);
                        setSelectedCountries([]);
                        updateFilters({ regions: undefined, countries: undefined });
                      } else {
                        setSelectedRegions(allRegions);
                        updateFilters({ regions: allRegions });
                      }
                    }}
                    t={t}
                  />
                </div>

                {/* Active Filters Display */}
                {totalActiveFiltersCount > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">
                        {t('filters.active')}:
                      </span>
                      {filters.type?.map((type) => (
                        <Badge key={type} variant="secondary" className="gap-1">
                          {t(`organizations.type.${type}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleTypeFilter(type)}
                          />
                        </Badge>
                      ))}
                      {selectedStatuses.map((status) => (
                        <Badge key={status} variant="secondary" className="gap-1">
                          {t(`organizations.status.${status}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleStatusFilter(status)}
                          />
                        </Badge>
                      ))}
                      {selectedEmployeeSize && (
                        <Badge variant="secondary" className="gap-1">
                          {t(`organizations.filters.employeeSize.${selectedEmployeeSize}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => setSelectedEmployeeSize(null)}
                          />
                        </Badge>
                      )}
                      {selectedSectors.map((sector) => (
                        <Badge key={sector} variant="secondary" className="gap-1">
                          {t(`sectors.${sector}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleSectorFilter(sector)}
                          />
                        </Badge>
                      ))}
                      {selectedSubSectors.map((subSector) => (
                        <Badge key={subSector} variant="secondary" className="gap-1">
                          {t(`subsectors.${subSector}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => handleSubSectorFilter(subSector)}
                          />
                        </Badge>
                      ))}
                      {selectedRegions.map((region) => (
                        <Badge key={region} variant="secondary" className="gap-1">
                          {t(`regions.${region}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              const newRegions = selectedRegions.filter(r => r !== region);
                              setSelectedRegions(newRegions);
                              if (newRegions.length === 0) {
                                setSelectedCountries([]);
                                updateFilters({ regions: undefined, countries: undefined });
                              } else {
                                const validCountries = selectedCountries.filter(country => {
                                  return newRegions.some(reg => REGION_COUNTRY_MAP[reg]?.includes(country));
                                });
                                setSelectedCountries(validCountries);
                                updateFilters({ 
                                  regions: newRegions, 
                                  countries: validCountries.length > 0 ? validCountries : undefined 
                                });
                              }
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedCountries.map((country) => (
                        <Badge key={country} variant="secondary" className="gap-1">
                          {getLocalizedCountryName(country, t('language'))}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              const newCountries = selectedCountries.filter(c => c !== country);
                              setSelectedCountries(newCountries);
                              updateFilters({ countries: newCountries.length > 0 ? newCountries : undefined });
                            }}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Organizations List */}
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {organizations.meta
                  ? organizations.meta.totalItems > 0
                    ? t('organizations.list.showing', {
                        from: ((currentPage - 1) * organizations.meta.pageSize + 1).toString(),
                        to: Math.min(currentPage * organizations.meta.pageSize, organizations.meta.totalItems).toString(),
                        total: organizations.meta.totalItems.toString()
                      })
                    : `0 ${t('organizations.kpis.totalOrganizations').toLowerCase()}`
                  : 'Chargement...'}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  {t('common.sort')}:
                </label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)} disabled={isLoading}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
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

            {/* Organizations Grid */}
            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">{t('common.loading') || 'Chargement...'}</p>
              </div>
            ) : displayedOrganizations.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 mb-6">
                {displayedOrganizations.map((org) => {
                  const score = computeProfileScore(org);
                  const sharedSectors = selectedSectors.filter(s =>
                    (org.sectors || []).includes(s as unknown as string)
                  );
                  const countryName = typeof org.country === 'string'
                    ? org.country
                    : org.country?.name ?? '';
                  const totalEngagements = (org.partnerships ?? 0) + (org.activeProjects ?? 0) + (org.completedProjects ?? 0);
                  const lastUpdated = org.updatedAt
                    ? new Date(org.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : null;
                  const initials = org.name
                    .split(' ')
                    .slice(0, 2)
                    .map((w: string) => w[0]?.toUpperCase() ?? '')
                    .join('');
                  const statusColors: Record<string, string> = {
                    VERIFIED: 'bg-green-100 text-green-700 border-green-300',
                    ACTIVE: 'bg-blue-100 text-blue-700 border-blue-300',
                    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
                    INACTIVE: 'bg-gray-100 text-gray-500 border-gray-300',
                  };
                  const statusColor = statusColors[org.status ?? ''] ?? 'bg-gray-100 text-gray-500 border-gray-300';
                  const yearsActive = org.yearEstablished ? new Date().getFullYear() - org.yearEstablished : null;

                  return (
                    <div
                      key={org.id}
                      className="bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Main body: 2-column on desktop */}
                      <div className="p-5 flex flex-col md:flex-row gap-5">

                        {/* ── LEFT: Identity ── */}
                        <div className="flex-1 min-w-0">

                          {/* Name + avatar row */}
                          <div className="flex items-start gap-4 mb-3">
                            {/* Avatar */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/25 border border-primary/15 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg select-none overflow-hidden">
                              {org.logoUrl
                                ? <img src={org.logoUrl} alt={org.name} className="w-full h-full object-cover" />
                                : initials || <Building2 className="w-6 h-6" />
                              }
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Name + acronym */}
                              <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                                <h3 className="font-bold text-gray-900 text-base leading-tight">{org.name}</h3>
                                {org.acronym && (
                                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded tracking-wide">
                                    {org.acronym}
                                  </span>
                                )}
                                {org.legalName && org.legalName !== org.name && (
                                  <span className="text-xs text-gray-400 italic">{org.legalName}</span>
                                )}
                              </div>

                              {/* Badges row: type + status + profile score */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="text-xs font-medium gap-1">
                                  <Target className="w-3 h-3" />
                                  {getTranslatedTypeLabel(org.type)}
                                </Badge>
                                {org.status && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}>
                                    {org.status === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                                    {t(`organizations.status.${org.status}`)}
                                  </span>
                                )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-0.5 cursor-default">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${i < score ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                                        />
                                      ))}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={4}>
                                    {t('organizations.card.profileScore')}: {score}/5
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {org.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                              {org.description}
                            </p>
                          )}

                          {/* Meta: location / region / year / employees / website */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {getLocationLabel(org)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5" />
                              {getTranslatedRegionLabel(org.region)}
                              {countryName && ` · ${countryName}`}
                            </span>
                            {org.yearEstablished && (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {t('organizations.card.established')} {org.yearEstablished}
                                {yearsActive !== null && yearsActive > 0 && (
                                  <span className="text-gray-400 ml-0.5">({yearsActive} ans)</span>
                                )}
                              </span>
                            )}
                            {org.employeeCount && (
                              <span className="flex items-center gap-1">
                                <Users2 className="w-3.5 h-3.5" />
                                ~{org.employeeCount} {t('organizations.card.employees')}
                              </span>
                            )}
                            {org.website && (
                              <a
                                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                {org.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                              </a>
                            )}
                            {org.contactEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {org.contactEmail}
                              </span>
                            )}
                          </div>

                          {/* Sectors */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(org.sectors || []).slice(0, 4).map((sector, index) => {
                              const isShared = selectedSectors.includes(sector as unknown as OrganizationSectorEnum);
                              return (
                                <Badge
                                  key={`${org.id}-sector-${index}`}
                                  variant={isShared ? 'default' : 'secondary'}
                                  className={`text-xs ${isShared ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
                                >
                                  {isShared && <Layers className="w-3 h-3 mr-1" />}
                                  {t(`sectors.${sector}`)}
                                </Badge>
                              );
                            })}
                            {(org.sectors || []).length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{(org.sectors || []).length - 4}
                              </Badge>
                            )}
                            {sharedSectors.length > 0 && (
                              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 ml-1">
                                <Layers className="w-3 h-3" />
                                {sharedSectors.length} {t('organizations.card.sharedSectors')}
                              </span>
                            )}
                          </div>

                          {/* Certifications */}
                          {org.certifications && org.certifications.length > 0 && (
                            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                              <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              {org.certifications.slice(0, 3).map((cert, i) => (
                                <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                                  {cert}
                                </span>
                              ))}
                              {org.certifications.length > 3 && (
                                <span className="text-xs text-amber-600">+{org.certifications.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ── Vertical divider ── */}
                        <div className="hidden md:block w-px bg-gray-100 self-stretch flex-shrink-0" />

                        {/* ── RIGHT: Collaboration Stats Panel ── */}
                        <div className="md:w-60 flex-shrink-0">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 h-full flex flex-col">
                            {/* Panel header */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                                <Handshake className="w-3.5 h-3.5 text-primary" />
                                {t('organizations.card.collaborationHistory')}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${totalEngagements > 0 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {totalEngagements}
                              </span>
                            </div>

                            {/* Stat rows */}
                            <div className="space-y-2.5 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Handshake className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <span>{t('organizations.card.partnerships')}</span>
                                </div>
                                <span className="text-sm font-bold text-blue-700">{org.partnerships ?? 0}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <span>{t('organizations.card.activeProjects')}</span>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">{org.activeProjects ?? 0}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
                                  </div>
                                  <span>{t('organizations.card.completedProjects')}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-700">{org.completedProjects ?? 0}</span>
                              </div>
                            </div>

                            {/* Activity distribution bar */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {t('organizations.card.distribution')}
                                </span>
                                <span className="text-emerald-600 font-semibold">
                                  {org.activeProjects ?? 0} actifs
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                                {totalEngagements > 0 ? (
                                  <>
                                    <div
                                      className="h-full bg-blue-400 transition-all"
                                      style={{ width: `${((org.partnerships ?? 0) / totalEngagements) * 100}%` }}
                                      title={`${t('organizations.card.partnerships')}: ${org.partnerships ?? 0}`}
                                    />
                                    <div
                                      className="h-full bg-emerald-500 transition-all"
                                      style={{ width: `${((org.activeProjects ?? 0) / totalEngagements) * 100}%` }}
                                      title={`${t('organizations.card.activeProjects')}: ${org.activeProjects ?? 0}`}
                                    />
                                    <div
                                      className="h-full bg-gray-400 transition-all"
                                      style={{ width: `${((org.completedProjects ?? 0) / totalEngagements) * 100}%` }}
                                      title={`${t('organizations.card.completedProjects')}: ${org.completedProjects ?? 0}`}
                                    />
                                  </>
                                ) : (
                                  <div className="h-full w-full bg-gray-200" />
                                )}
                              </div>
                              {totalEngagements > 0 && (
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Partenariats</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Actifs</span>
                                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />Terminés</span>
                                </div>
                              )}
                            </div>

                            {/* Last engagement */}
                            {lastUpdated && (
                              <div className="mt-2.5 pt-2.5 border-t border-gray-200 flex items-center gap-1.5 text-xs text-gray-500">
                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>
                                  {t('organizations.card.lastEngagement')}:{' '}
                                  <span className="font-semibold text-gray-700">{lastUpdated}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── Card footer ── */}
                      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {org.budget?.formatted && (
                            <span className="font-medium text-gray-700">{org.budget.formatted}</span>
                          )}
                          {org.teamMembers && (
                            <span className="flex items-center gap-1">
                              <Users2 className="w-3.5 h-3.5" />
                              {org.teamMembers} membres
                            </span>
                          )}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs flex-shrink-0"
                          onClick={() => navigate(`/organizations/${org.id}`)}
                        >
                          {t('actions.viewDetails')}
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-1">
                  {t('organizations.list.noResults')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('organizations.list.noResults.message')}
                </p>
              </div>
            )}

            {/* Pagination */}
            {organizations.meta && organizations.meta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!organizations.meta.hasPreviousPage || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {t('pagination.previous')}
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, organizations.meta.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={isLoading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {organizations.meta.totalPages > 5 && (
                    <React.Fragment>
                      <span className="text-muted-foreground">...</span>
                      <Button
                        variant={currentPage === organizations.meta.totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(organizations.meta.totalPages)}
                        disabled={isLoading}
                      >
                        {organizations.meta.totalPages}
                      </Button>
                    </React.Fragment>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!organizations.meta.hasNextPage || isLoading}
                >
                  {t('pagination.next')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
