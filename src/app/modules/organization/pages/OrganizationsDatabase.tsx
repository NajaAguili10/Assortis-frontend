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
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { OrganizationTypeEnum, OrganizationStatusEnum, OrganizationSectorEnum, RegionEnum, CountryEnum } from '@app/types/organization.dto';
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
  Users,
  Briefcase,
  Globe,
  Target,
  CheckCircle,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { getLocalizedCountryName } from '@app/utils/country-translator';

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
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
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
                {activeFiltersCount > 0 && (
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
            ) : organizations.data.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 mb-6">
                {organizations.data.map((org) => (
                  <div
                    key={org.id}
                    className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary mb-1">
                            {org.name}
                            {org.acronym && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({org.acronym})
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {org.description}
                          </p>
                        </div>
                      </div>
                      {org.status === 'VERIFIED' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('organizations.status.VERIFIED')}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {getTranslatedTypeLabel(org.type)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {getLocationLabel(org)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {org.activeProjects || 0} {t('organizations.details.projects')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {(org.sectors || []).slice(0, 3).map((sector, index) => (
                        <Badge key={`${org.id}-sector-${index}`} variant="secondary">
                          {t(`sectors.${sector}`)}
                        </Badge>
                      ))}
                      {(org.sectors || []).length > 3 && (
                        <Badge variant="outline">
                          +{(org.sectors || []).length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          {getTranslatedRegionLabel(org.region)}
                        </span>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/organizations/${org.id}`)}
                      >
                        {t('actions.viewDetails')}
                      </Button>
                    </div>
                  </div>
                ))}
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
