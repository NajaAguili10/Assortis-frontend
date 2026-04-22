import { useNavigate } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Label } from '@app/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Separator } from '@app/components/ui/separator';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { useState, useMemo } from 'react';
import { SUBSECTOR_MAP, SECTOR_SUBSECTOR_MAP } from '@app/config/subsectors.config';
import { SectorEnum, SubSectorEnum, RegionEnum, CountryEnum, REGION_COUNTRY_MAP } from '@app/types/tender.dto';
import { getLocalizedCountryName } from '@app/utils/country-translator';
import {
  Users,
  LayoutDashboard,
  Database,
  FileUser,
  Search,
  MapPin,
  Star,
  Briefcase,
  CheckCircle,
  UserCheck,
  Clock,
  TrendingUp,
  X,
  Filter,
  ChevronDown,
  ChevronRight,
  Globe,
  Target,
  UserCircle,
} from 'lucide-react';

// Expert Database Page - Fixed imports
export default function ExpertsDatabase() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { experts, kpis, allExperts } = useExperts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  
  // State for filters visibility toggle
  const [showFilters, setShowFilters] = useState(true);

  // Extract unique sectors from all experts
  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>();
    allExperts.forEach((expert) => {
      expert.sectors.forEach((sector) => sectors.add(sector));
    });
    return Array.from(sectors).sort();
  }, [allExperts]);

  // Get available subsectors based on selected sectors
  const availableSubSectors = useMemo(() => {
    if (selectedSectors.length === 0) return [];
    const subSectors: string[] = [];
    selectedSectors.forEach(sector => {
      const sectorSubSectors = SUBSECTOR_MAP[sector as SectorEnum] || [];
      subSectors.push(...sectorSubSectors);
    });
    return [...new Set(subSectors)];
  }, [selectedSectors]);

  // Extract unique regions from all experts
  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    allExperts.forEach((expert) => {
      regions.add(expert.region);
    });
    return Array.from(regions).sort();
  }, [allExperts]);

  // Get available countries based on selected regions
  const availableCountries = useMemo(() => {
    if (selectedRegions.length === 0) return [];
    const countries: string[] = [];
    selectedRegions.forEach(region => {
      const regionCountries = REGION_COUNTRY_MAP[region as RegionEnum] || [];
      countries.push(...regionCountries);
    });
    return [...new Set(countries)];
  }, [selectedRegions]);

  // Experience ranges
  const experienceRanges = [
    { value: '0-5', label: '0-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10-15', label: '10-15 years' },
    { value: '15+', label: '15+ years' },
  ];

  // Real-time search and filter
  const filteredExperts = useMemo(() => {
    let filtered = [...experts.data];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((expert) => {
        const fullName = `${expert.firstName} ${expert.lastName}`.toLowerCase();
        const location = `${expert.city} ${expert.country}`.toLowerCase();
        
        return (
          fullName.includes(query) ||
          expert.title?.toLowerCase().includes(query) ||
          location.includes(query) ||
          expert.bio?.toLowerCase().includes(query) ||
          expert.skills?.some(skill => skill.toLowerCase().includes(query)) ||
          expert.sectors?.some(sector => sector.toLowerCase().includes(query))
        );
      });
    }

    // Filter by sectors
    if (selectedSectors.length > 0) {
      filtered = filtered.filter((expert) => 
        expert.sectors?.some(sector => selectedSectors.includes(sector))
      );
    }

    // Filter by subsectors
    if (selectedSubSectors.length > 0) {
      filtered = filtered.filter((expert) => 
        expert.subSectors?.some(sub => selectedSubSectors.includes(sub))
      );
    }

    // Filter by regions
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((expert) => 
        selectedRegions.includes(expert.region)
      );
    }

    // Filter by countries
    if (selectedCountries.length > 0) {
      filtered = filtered.filter((expert) => 
        selectedCountries.includes(expert.country)
      );
    }

    // Filter by years of experience
    if (selectedExperience.length > 0) {
      filtered = filtered.filter((expert) => {
        const years = expert.yearsOfExperience;
        return selectedExperience.some(range => {
          switch (range) {
            case '0-5':
              return years <= 5;
            case '5-10':
              return years > 5 && years <= 10;
            case '10-15':
              return years > 10 && years <= 15;
            case '15+':
              return years > 15;
            default:
              return true;
          }
        });
      });
    }

    return filtered;
  }, [experts.data, searchQuery, selectedSectors, selectedSubSectors, selectedRegions, selectedCountries, selectedExperience]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSectorFilter = (sector: string) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    
    setSelectedSectors(newSectors);
    
    // Clear subsectors if no sectors selected
    if (newSectors.length === 0) {
      setSelectedSubSectors([]);
    } else {
      // Remove invalid subsectors
      const validSubSectors = selectedSubSectors.filter(sub => {
        return newSectors.some(sec => SUBSECTOR_MAP[sec as SectorEnum]?.includes(sub));
      });
      setSelectedSubSectors(validSubSectors);
    }
  };

  const handleSubSectorFilter = (subSector: string) => {
    const newSubSectors = selectedSubSectors.includes(subSector)
      ? selectedSubSectors.filter(s => s !== subSector)
      : [...selectedSubSectors, subSector];
    setSelectedSubSectors(newSubSectors);
  };

  const handleRegionFilter = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    
    setSelectedRegions(newRegions);
    
    // Clear countries if no regions selected
    if (newRegions.length === 0) {
      setSelectedCountries([]);
    } else {
      // Remove invalid countries
      const validCountries = selectedCountries.filter(country => {
        return newRegions.some(reg => REGION_COUNTRY_MAP[reg as RegionEnum]?.includes(country));
      });
      setSelectedCountries(validCountries);
    }
  };

  const handleCountryFilter = (country: string) => {
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];
    setSelectedCountries(newCountries);
  };

  const handleExperienceFilter = (experience: string) => {
    const newExperience = selectedExperience.includes(experience)
      ? selectedExperience.filter(e => e !== experience)
      : [...selectedExperience, experience];
    setSelectedExperience(newExperience);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedExperience([]);
  };

  const activeFiltersCount = selectedSectors.length + selectedSubSectors.length + selectedRegions.length + selectedCountries.length + selectedExperience.length;

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('experts.list.title')}
        description={t('experts.list.subtitle')}
        icon={Database}
        stats={[
          { value: kpis.totalExperts.toString(), label: t('experts.stats.available') },
          { value: kpis.certifiedExperts.toString(), label: t('experts.stats.certified') },
          { value: kpis.activeMissions.toString(), label: t('experts.stats.activeMissions') }
        ]}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <Separator className="my-6" />

          {/* Horizontal Filters Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">
                  {t('tenders.list.filters')}
                </h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    <X className="w-4 h-4 mr-1" />
                    {t('filters.clear')}
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
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t('common.search')}
                  </label>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('experts.filters.search')}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>

                {/* Filters Row 1: Secteur & Sous-secteur - ASSORTIS RED & BLACK DESIGN */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <SectorSubsectorFilter
                    selectedSectors={selectedSectors}
                    selectedSubSectors={selectedSubSectors}
                    hoveredSector={hoveredSector}
                    onHoverSector={setHoveredSector}
                    onSelectSector={(sector) => {
                      const newSectors = selectedSectors.includes(sector)
                        ? selectedSectors.filter(s => s !== sector)
                        : [...selectedSectors, sector];
                      setSelectedSectors(newSectors);
                      if (newSectors.length === 0) {
                        setSelectedSubSectors([]);
                      } else {
                        const validSubSectors = selectedSubSectors.filter(sub => {
                          return newSectors.some(sec => SECTOR_SUBSECTOR_MAP[sec]?.includes(sub));
                        });
                        setSelectedSubSectors(validSubSectors);
                      }
                    }}
                    onSelectSubSector={(subSector) => {
                      const newSubSectors = selectedSubSectors.includes(subSector)
                        ? selectedSubSectors.filter(s => s !== subSector)
                        : [...selectedSubSectors, subSector];
                      setSelectedSubSectors(newSubSectors);
                    }}
                    onSelectAllSectors={() => {
                      const allSectors = Object.values(SectorEnum);
                      if (selectedSectors.length === allSectors.length) {
                        setSelectedSectors([]);
                        setSelectedSubSectors([]);
                      } else {
                        setSelectedSectors(allSectors);
                      }
                    }}
                    onSelectAllSubSectors={(sector) => {
                      const sectorSubs = SECTOR_SUBSECTOR_MAP[sector] || [];
                      const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
                      if (allSelected) {
                        const newSubs = selectedSubSectors.filter(sub => !sectorSubs.includes(sub));
                        setSelectedSubSectors(newSubs);
                      } else {
                        const newSubs = [...new Set([...selectedSubSectors, ...sectorSubs])];
                        setSelectedSubSectors(newSubs);
                      }
                    }}
                    t={t}
                  />
                </div>

                {/* Filters Row 2: Région & Pays - SAME DESIGN AS SECTOR/SUBSECTOR */}
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
                      } else {
                        const validCountries = selectedCountries.filter(country => {
                          return newRegions.some(reg => REGION_COUNTRY_MAP[reg]?.includes(country));
                        });
                        setSelectedCountries(validCountries);
                      }
                    }}
                    onSelectCountry={(country) => {
                      const newCountries = selectedCountries.includes(country)
                        ? selectedCountries.filter(c => c !== country)
                        : [...selectedCountries, country];
                      setSelectedCountries(newCountries);
                    }}
                    onSelectAllRegions={() => {
                      const allRegions = Object.values(RegionEnum);
                      if (selectedRegions.length === allRegions.length) {
                        setSelectedRegions([]);
                        setSelectedCountries([]);
                      } else {
                        setSelectedRegions(allRegions);
                      }
                    }}
                    t={t}
                  />
                </div>

                {/* Filters Row 3: Experience */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('experts.filters.experience')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-10 px-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {selectedExperience.length > 0 
                                ? selectedExperience.length === 1
                                  ? t(`experts.experience.${selectedExperience[0]}`)
                                  : `${selectedExperience.length} sélectionnés`
                                : t('filters.selectExperience') || 'Sélectionner'}
                            </span>
                          </div>
                          {selectedExperience.length > 0 && (
                            <Badge className="ml-2 flex-shrink-0" variant="secondary">
                              {selectedExperience.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">{t('experts.filters.experience')}</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {['0-5', '5-10', '10-15', '15+'].map((exp) => (
                              <Button
                                key={exp}
                                variant={selectedExperience.includes(exp) ? "default" : "outline"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => {
                                  const newExperience = selectedExperience.includes(exp)
                                    ? selectedExperience.filter(e => e !== exp)
                                    : [...selectedExperience, exp];
                                  setSelectedExperience(newExperience);
                                }}
                              >
                                {selectedExperience.includes(exp) && <CheckCircle className="w-3 h-3 mr-2" />}
                                {t(`experts.experience.${exp}`)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-700">
                        {t('filters.active')}:
                      </span>
                      {selectedSectors.map((sector) => (
                        <Badge key={sector} variant="secondary" className="gap-1">
                          {t(`sectors.${sector}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              const newSectors = selectedSectors.filter(s => s !== sector);
                              setSelectedSectors(newSectors);
                              if (newSectors.length === 0) {
                                setSelectedSubSectors([]);
                              }
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedSubSectors.map((subSector) => (
                        <Badge key={subSector} variant="secondary" className="gap-1">
                          {t(`subsectors.${subSector}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSelectedSubSectors(selectedSubSectors.filter(s => s !== subSector));
                            }}
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
                              setSelectedCountries(selectedCountries.filter(c => c !== country));
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedExperience.map((exp) => (
                        <Badge key={exp} variant="secondary" className="gap-1">
                          {t(`experts.experience.${exp}`)}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => {
                              setSelectedExperience(selectedExperience.filter(e => e !== exp));
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

          <Separator className="my-6" />

          {/* Results Summary */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-primary">
              {filteredExperts.length} {t('experts.list.expertsFound')}
            </h3>
          </div>

          {/* Expert Profiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/experts/${expert.id}`)}
              >
                {/* Expert Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {/* Nom masqué pour confidentialité */}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{expert.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {expert.city}, {expert.country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expert Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-600">{t('experts.yearsExp')}</span>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      {expert.yearsOfExperience || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-gray-600">{t('experts.rating')}</span>
                    </div>
                    <p className="text-lg font-semibold text-primary">
                      {expert.clientRating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                </div>

                {/* Certifications & Verification */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {expert.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {t('experts.verified')}
                    </Badge>
                  )}
                  {expert.certifications && expert.certifications.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <UserCheck className="w-3 h-3 mr-1" />
                      {expert.certifications.length} {t('experts.certifications')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {t(`experts.availability.${expert.availability}`)}
                  </Badge>
                </div>

                {/* Sectors */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">{t('experts.sectors')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.sectors && expert.sectors.slice(0, 2).map((sector, index) => (
                      <Badge key={`${expert.id}-sector-${index}-${sector}`} variant="outline" className="text-xs">
                        {t(`sectors.${sector}`)}
                      </Badge>
                    ))}
                    {expert.sectors && expert.sectors.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.sectors.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">{t('experts.skills')}:</p>
                  <div className="flex flex-wrap gap-1">
                    {expert.skills && expert.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={`${expert.id}-skill-${index}-${skill}`} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {expert.skills && expert.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{expert.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stats Footer */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{t('experts.missions')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {expert.completedMissions || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{t('experts.profile')}</span>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      {expert.profileCompleteness || 0}%
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/experts/${expert.id}`);
                  }}
                >
                  {t('actions.viewDetails')}
                </Button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredExperts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">
                {t('experts.list.noResults')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('experts.list.noResults.message')}
              </p>
              <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                {t('filters.clear')}
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}