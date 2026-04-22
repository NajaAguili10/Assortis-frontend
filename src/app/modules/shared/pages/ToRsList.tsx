import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { StatCard } from '@app/components/StatCard';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { RegionCountryFilter } from '@app/components/RegionCountryFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { Card } from '@app/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { Calendar } from '@app/components/ui/calendar';
import { toast } from 'sonner';
import { usePipeline } from '@app/modules/expert/hooks/usePipeline';
import { useToRs } from '@app/hooks/useToRs';
import { 
  ToRListDTO,
  ToRStatusEnum,
  ToRTypeEnum,
  SectorEnum,
  SubSectorEnum,
  CountryEnum,
  RegionEnum,
  FundingAgencyEnum,
  CurrencyEnum,
  ProcurementTypeEnum,
  SECTOR_SUBSECTOR_MAP,
  REGION_COUNTRY_MAP,
} from '@app/types/tender.dto';
import {
  Search, 
  Filter, 
  FileText,
  Briefcase,
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  TrendingUp,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  CheckCircle,
  Plus,
  Package,
  FileSearch,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';

export default function ToRsList() {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Pipeline hook
  const { addToPipeline, removeFromPipeline, isInPipeline } = usePipeline();

  // ToRs hook - use allToRs from the hook
  const { allToRs } = useToRs();

  // States - SAME ORDER AS ActiveTenders
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcurementTypes, setSelectedProcurementTypes] = useState<ProcurementTypeEnum[]>([]);
  const [publishedFrom, setPublishedFrom] = useState<Date>();
  const [publishedTo, setPublishedTo] = useState<Date>();
  const [budgetMin, setBudgetMin] = useState<string>('');
  const [budgetMax, setBudgetMax] = useState<string>('');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<RegionEnum[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<CountryEnum[]>([]);
  const [selectedFundingAgencies, setSelectedFundingAgencies] = useState<FundingAgencyEnum[]>([]);
  const [fundingAgencySearch, setFundingAgencySearch] = useState<string>('');
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  
  // ToR-specific filters
  const [selectedType, setSelectedType] = useState<ToRTypeEnum | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ToRStatusEnum | 'ALL'>('ALL');
  const [showInPipelineOnly, setShowInPipelineOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Get date locale based on current language
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Get available subsectors based on selected sectors
  const availableSubSectors = useMemo(() => {
    if (selectedSectors.length === 0) return [];
    const subSectors: SubSectorEnum[] = [];
    selectedSectors.forEach(sector => {
      const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];
      subSectors.push(...sectorSubSectors);
    });
    return [...new Set(subSectors)]; // Remove duplicates
  }, [selectedSectors]);

  // Get available countries based on selected regions
  const availableCountries = useMemo(() => {
    if (selectedRegions.length === 0) return [];
    const countries: CountryEnum[] = [];
    selectedRegions.forEach(region => {
      const regionCountries = REGION_COUNTRY_MAP[region] || [];
      countries.push(...regionCountries);
    });
    return [...new Set(countries)]; // Remove duplicates
  }, [selectedRegions]);

  // Filter funding agencies by search
  const filteredFundingAgencies = useMemo(() => {
    if (!fundingAgencySearch) return Object.values(FundingAgencyEnum);
    return Object.values(FundingAgencyEnum).filter(agency => {
      const label = t(`fundingAgencies.${agency}`).toLowerCase();
      return label.includes(fundingAgencySearch.toLowerCase());
    });
  }, [fundingAgencySearch, t]);

  // Handlers - SAME AS ActiveTenders
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleProcurementTypeFilter = (type: ProcurementTypeEnum) => {
    const newTypes = selectedProcurementTypes.includes(type)
      ? selectedProcurementTypes.filter(t => t !== type)
      : [...selectedProcurementTypes, type];
    setSelectedProcurementTypes(newTypes);
  };

  const handleSectorFilter = (sector: SectorEnum) => {
    const newSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter(s => s !== sector)
      : [...selectedSectors, sector];
    
    setSelectedSectors(newSectors);
    
    // If removing all sectors, also clear subsectors
    if (newSectors.length === 0) {
      setSelectedSubSectors([]);
    } else {
      // Remove subsectors that don't belong to any selected sector
      const validSubSectors = selectedSubSectors.filter(sub => {
        return newSectors.some(sec => SECTOR_SUBSECTOR_MAP[sec]?.includes(sub));
      });
      setSelectedSubSectors(validSubSectors);
    }
  };

  const handleSelectAllSectors = () => {
    const allSectors = Object.values(SectorEnum);
    if (selectedSectors.length === allSectors.length) {
      // Unselect all
      setSelectedSectors([]);
      setSelectedSubSectors([]);
    } else {
      // Select all
      setSelectedSectors(allSectors);
    }
  };

  const handleSubSectorFilter = (subSector: SubSectorEnum) => {
    const newSubSectors = selectedSubSectors.includes(subSector)
      ? selectedSubSectors.filter(s => s !== subSector)
      : [...selectedSubSectors, subSector];
    
    setSelectedSubSectors(newSubSectors);
  };

  const handleSelectAllSubSectors = () => {
    if (selectedSubSectors.length === availableSubSectors.length) {
      // Unselect all
      setSelectedSubSectors([]);
    } else {
      // Select all available subsectors
      setSelectedSubSectors(availableSubSectors);
    }
  };

  const handleRegionFilter = (region: RegionEnum) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region];
    
    setSelectedRegions(newRegions);
    
    // If removing all regions, also clear countries
    if (newRegions.length === 0) {
      setSelectedCountries([]);
    } else {
      // Remove countries that don't belong to any selected region
      const validCountries = selectedCountries.filter(country => {
        return newRegions.some(reg => REGION_COUNTRY_MAP[reg]?.includes(country));
      });
      setSelectedCountries(validCountries);
    }
  };

  const handleCountryFilter = (country: CountryEnum) => {
    const newCountries = selectedCountries.includes(country)
      ? selectedCountries.filter(c => c !== country)
      : [...selectedCountries, country];
    setSelectedCountries(newCountries);
  };

  const handleFundingAgencyFilter = (agency: FundingAgencyEnum) => {
    const newAgencies = selectedFundingAgencies.includes(agency)
      ? selectedFundingAgencies.filter(a => a !== agency)
      : [...selectedFundingAgencies, agency];
    setSelectedFundingAgencies(newAgencies);
  };

  const handleBudgetMinChange = (value: string) => {
    setBudgetMin(value);
  };

  const handleBudgetMaxChange = (value: string) => {
    setBudgetMax(value);
  };

  const handlePublishedFromChange = (date: Date | undefined) => {
    setPublishedFrom(date);
  };

  const handlePublishedToChange = (date: Date | undefined) => {
    setPublishedTo(date);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedProcurementTypes([]);
    setPublishedFrom(undefined);
    setPublishedTo(undefined);
    setBudgetMin('');
    setBudgetMax('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
    setSelectedRegions([]);
    setSelectedCountries([]);
    setSelectedFundingAgencies([]);
    setFundingAgencySearch('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setShowInPipelineOnly(false);
  };

  // KPIs
  const kpis = useMemo(() => {
    const activeToRs = allToRs.filter(tor => tor.status === ToRStatusEnum.OPEN);
    const inPipeline = allToRs.filter(tor => tor.inPipeline);
    
    return {
      totalToRs: allToRs.length,
      activeToRs: activeToRs.length,
      inPipeline: inPipeline.length,
    };
  }, [allToRs]);

  // Filtered ToRs
  const filteredToRs = useMemo(() => {
    return allToRs.filter(tor => {
      // Search query
      if (searchQuery && !tor.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !tor.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !tor.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Sector filter
      if (selectedSectors.length > 0 && !tor.sectors.some(sector => selectedSectors.includes(sector))) {
        return false;
      }

      // Subsector filter
      if (selectedSubSectors.length > 0) {
        const hasMatchingSubSector = tor.sectors.some(sector => {
          const sectorSubSectors = SECTOR_SUBSECTOR_MAP[sector] || [];
          return sectorSubSectors.some(sub => selectedSubSectors.includes(sub));
        });
        if (!hasMatchingSubSector) return false;
      }

      // Type filter
      if (selectedType !== 'ALL' && tor.type !== selectedType) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && tor.status !== selectedStatus) {
        return false;
      }

      // Country filter
      if (selectedCountries.length > 0 && !selectedCountries.includes(tor.country)) {
        return false;
      }

      // Region filter
      if (selectedRegions.length > 0 && !selectedRegions.some(region => REGION_COUNTRY_MAP[region]?.includes(tor.country))) {
        return false;
      }

      // Funding agency filter
      if (selectedFundingAgencies.length > 0 && !selectedFundingAgencies.includes(tor.fundingAgency)) {
        return false;
      }

      // Budget filter
      if (budgetMin && tor.budget && tor.budget.amount < parseFloat(budgetMin)) {
        return false;
      }
      if (budgetMax && tor.budget && tor.budget.amount > parseFloat(budgetMax)) {
        return false;
      }

      // Pipeline filter
      if (showInPipelineOnly && !tor.inPipeline) {
        return false;
      }

      return true;
    });
  }, [allToRs, searchQuery, selectedSectors, selectedSubSectors, selectedType, selectedStatus, selectedCountries, selectedRegions, selectedFundingAgencies, budgetMin, budgetMax, showInPipelineOnly]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedProcurementTypes.length > 0) count++;
    if (publishedFrom) count++;
    if (publishedTo) count++;
    if (budgetMin) count++;
    if (budgetMax) count++;
    if (selectedSectors.length > 0) count++;
    if (selectedSubSectors.length > 0) count++;
    if (selectedCountries.length > 0) count++;
    if (selectedRegions.length > 0) count++;
    if (selectedFundingAgencies.length > 0) count++;
    if (selectedType !== 'ALL') count++;
    if (selectedStatus !== 'ALL') count++;
    if (showInPipelineOnly) count++;
    return count;
  }, [searchQuery, selectedProcurementTypes, publishedFrom, publishedTo, budgetMin, budgetMax, selectedSectors, selectedSubSectors, selectedCountries, selectedRegions, selectedFundingAgencies, selectedType, selectedStatus, showInPipelineOnly]);

  const handleTogglePipeline = (torId: string) => {
    if (isInPipeline(torId)) {
      removeFromPipeline(torId);
      toast.success(t('tors.pipeline.removed'));
    } else {
      addToPipeline(torId);
      toast.success(t('tors.pipeline.added'));
    }
  };

  const getStatusColor = (status: ToRStatusEnum) => {
    switch (status) {
      case ToRStatusEnum.OPEN:
        return 'bg-green-100 text-green-800 border-green-200';
      case ToRStatusEnum.CLOSED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ToRStatusEnum.CANCELLED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ToRStatusEnum.FILLED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('tors.title')}
        description={t('tors.subtitle')}
        icon={FileText}
        stats={[
          { value: kpis.totalToRs.toString(), label: t('tors.stats.total') },
          { value: kpis.activeToRs.toString(), label: t('tors.stats.active') },
          { value: kpis.inPipeline.toString(), label: t('tors.stats.inPipeline') },
        ]}
      />

      {/* Sub Menu */}
      <TendersSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <StatCard
              title={t('tors.stats.total')}
              value={kpis.totalToRs.toString()}
              icon={FileText}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('tors.stats.active')}
              value={kpis.activeToRs.toString()}
              icon={CheckCircle2}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('tors.stats.inPipeline')}
              value={kpis.inPipeline.toString()}
              icon={TrendingUp}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Horizontal Filters Section - SAME AS ActiveTenders */}
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
                  <Button variant="ghost" size="sm" onClick={handleClearAllFilters}>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {t('common.search')}
                    </label>
                    {filteredToRs.length > 0 && (
                      <span className="text-sm font-medium text-accent">
                        {filteredToRs.length === 1 
                          ? t('activeTenders.search.resultsCount', { count: filteredToRs.length.toString() })
                          : t('activeTenders.search.resultsCount_plural', { count: filteredToRs.length.toString() })
                        }
                      </span>
                    )}
                  </div>
                  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <Input
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder={t('tors.search.placeholder')}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>

                {/* Filters Row 1: Type d'approvisionnement, Publié du, Au */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* 1. Type d'approvisionnement */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('filters.short.procurementType')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-10 px-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Package className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {selectedProcurementTypes.length > 0 
                                ? selectedProcurementTypes.length === 1
                                  ? t(`procurementTypes.${selectedProcurementTypes[0]}`)
                                  : t('filters.short.selected', { count: selectedProcurementTypes.length })
                                : t('filters.short.selectType')}
                            </span>
                          </div>
                          {selectedProcurementTypes.length > 0 && (
                            <Badge className="ml-2 flex-shrink-0" variant="secondary">
                              {selectedProcurementTypes.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">{t('tenders.filters.procurementType')}</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.values(ProcurementTypeEnum).map((type) => (
                              <Button
                                key={type}
                                variant={selectedProcurementTypes.includes(type) ? "default" : "outline"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => handleProcurementTypeFilter(type)}
                              >
                                {selectedProcurementTypes.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                                {t(`procurementTypes.${type}`)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 3. Publié du */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('filters.short.publishedFrom')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start h-10 px-3">
                          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {publishedFrom 
                              ? format(publishedFrom, 'P', { locale: dateLocale })
                              : t('filters.short.selectDate')}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={publishedFrom}
                          onSelect={handlePublishedFromChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 4. Au */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('filters.short.publishedTo')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start h-10 px-3">
                          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {publishedTo 
                              ? format(publishedTo, 'P', { locale: dateLocale })
                              : t('filters.short.selectDate')}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={publishedTo}
                          onSelect={handlePublishedToChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Filters Row 2: Budget Min, Budget Max */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* 5. Budget Min */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('tenders.filters.budgetMin')}
                    </label>
                    <Input
                      type="number"
                      placeholder={t('filters.enterBudgetMin')}
                      value={budgetMin}
                      onChange={(e) => handleBudgetMinChange(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* 6. Budget Max */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('tenders.filters.budgetMax')}
                    </label>
                    <Input
                      type="number"
                      placeholder={t('filters.enterBudgetMax')}
                      value={budgetMax}
                      onChange={(e) => handleBudgetMaxChange(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Filters Row 3: Secteur & Sous-secteur - ASSORTIS RED & BLACK DESIGN */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <SectorSubsectorFilter
                    selectedSectors={selectedSectors}
                    selectedSubSectors={selectedSubSectors}
                    hoveredSector={hoveredSector}
                    onHoverSector={setHoveredSector}
                    onSelectSector={handleSectorFilter}
                    onSelectSubSector={handleSubSectorFilter}
                    onSelectAllSectors={handleSelectAllSectors}
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

                {/* Filters Row 4: Région & Pays - SAME DESIGN AS SECTOR/SUBSECTOR */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <RegionCountryFilter
                    selectedRegions={selectedRegions}
                    selectedCountries={selectedCountries}
                    onSelectRegion={handleRegionFilter}
                    onSelectCountry={handleCountryFilter}
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

                {/* Filters Row 5: Bailleur de fonds */}
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {/* 11. Bailleur de fonds */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('filters.short.fundingAgency')}
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-10 px-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {selectedFundingAgencies.length > 0 
                                ? selectedFundingAgencies.length === 1
                                  ? t(`fundingAgencies.${selectedFundingAgencies[0]}`)
                                  : t('filters.short.selected', { count: selectedFundingAgencies.length })
                                : t('filters.short.selectDonor')}
                            </span>
                          </div>
                          {selectedFundingAgencies.length > 0 && (
                            <Badge className="ml-2 flex-shrink-0" variant="secondary">
                              {selectedFundingAgencies.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96" align="start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">{t('tenders.filters.fundingAgency')}</h4>
                          {/* Search for funding agencies */}
                          <Input
                            placeholder={t('common.search')}
                            value={fundingAgencySearch}
                            onChange={(e) => setFundingAgencySearch(e.target.value)}
                            className="mb-2"
                          />
                          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                            {filteredFundingAgencies.map((agency) => (
                              <Button
                                key={agency}
                                variant={selectedFundingAgencies.includes(agency) ? "default" : "outline"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => handleFundingAgencyFilter(agency)}
                              >
                                {selectedFundingAgencies.includes(agency) && <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />}
                                <span className="truncate text-left">{t(`fundingAgencies.${agency}`)}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Filters Row 6: ToR-specific filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('tors.filters.type')}
                    </label>
                    <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ToRTypeEnum | 'ALL')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">{t('filters.all')}</SelectItem>
                        {Object.values(ToRTypeEnum).map(type => (
                          <SelectItem key={type} value={type}>
                            {t(`tors.type.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      {t('tors.filters.status')}
                    </label>
                    <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ToRStatusEnum | 'ALL')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">{t('filters.all')}</SelectItem>
                        {Object.values(ToRStatusEnum).map(status => (
                          <SelectItem key={status} value={status}>
                            {t(`tors.status.${status}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pipeline Filter */}
                  <div className="flex items-end">
                    <Button
                      variant={showInPipelineOnly ? 'default' : 'outline'}
                      onClick={() => setShowInPipelineOnly(!showInPipelineOnly)}
                      className="w-full"
                    >
                      {t('tors.filters.inPipeline')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ToRs List */}
          {filteredToRs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">{t('tors.empty.title')}</h3>
              <p className="text-muted-foreground">{t('tors.empty.message')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredToRs.map((tor) => (
                <Card key={tor.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(tor.status)}>
                          {t(`tors.status.${tor.status}`)}
                        </Badge>
                        <Badge variant="outline">
                          {t(`tors.type.${tor.type}`)}
                        </Badge>
                        {isInPipeline(tor.id) && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            {t('tors.card.inPipeline')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-primary mb-1">{tor.title}</h3>
                      <p className="text-sm text-muted-foreground">{tor.referenceNumber}</p>
                    </div>
                    {tor.matchScore && (
                      <div className="text-center ml-4">
                        <div className="text-2xl font-bold text-[#B82547]">{tor.matchScore}%</div>
                        <div className="text-xs text-muted-foreground">{t('common.match')}</div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{tor.organizationName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{tor.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(tor.deadline, 'PPP', { locale: dateLocale })} ({tor.daysRemaining}d)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{tor.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {tor.budget && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-primary">{tor.budget.formatted}</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        {tor.experienceYears} {t('tors.card.years')} {t('tors.card.experience')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePipeline(tor.id)}
                      >
                        {isInPipeline(tor.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('tors.card.inPipeline')}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            {t('tors.card.addToPipeline')}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => navigate(`/calls/tors/${tor.id}`)}
                      >
                        {t('tors.card.viewDetails')}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>

                  {/* Related Tender */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      {t('tors.card.relatedTender')}: <span className="text-primary font-medium">{tor.tenderTitle}</span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}