import { useState, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { AssistanceSubMenu } from '@app/components/AssistanceSubMenu';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { ContactDialog } from '@app/components/ContactDialog';
import { useAssistance } from '@app/hooks/useAssistance';
import { AssistanceTypeEnum } from '@app/types/assistance.dto';
import { SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '@app/types/tender.dto';
import type { ExpertDTO } from '@app/types/assistance.dto';
import {
  Headphones,
  Search,
  Briefcase,
  ChevronDown,
  CheckCircle,
  X,
  MapPin,
  Star,
} from 'lucide-react';

export default function AssistanceFindExpert() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { experts, kpis, filters, updateFilters, clearFilters, activeFiltersCount } = useAssistance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  
  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertDTO | null>(null);

  const availableSubsectors = useMemo(() => {
    if (!hoveredSector) return [];
    return SECTOR_SUBSECTOR_MAP[hoveredSector] || [];
  }, [hoveredSector]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ searchQuery });
  };

  // Real-time search on input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Update filters in real-time
    updateFilters({ searchQuery: value.trim() === '' ? undefined : value });
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchQuery('');
    setSelectedSectors([]);
    setSelectedSubSectors([]);
  };

  const handleTypeFilter = (type: AssistanceTypeEnum) => {
    const currentTypes = filters.type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleSectorFilter = (sector: SectorEnum) => {
    const currentSectors = filters.sector || [];
    const newSectors = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    updateFilters({ sector: newSectors.length > 0 ? newSectors : undefined });
    
    if (currentSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleSubsectorFilter = (subsector: SubSectorEnum) => {
    const currentSubsectors = filters.subsector || [];
    const newSubsectors = currentSubsectors.includes(subsector)
      ? currentSubsectors.filter(s => s !== subsector)
      : [...currentSubsectors, subsector];
    updateFilters({ subsector: newSubsectors.length > 0 ? newSubsectors : undefined });
    
    if (currentSubsectors.includes(subsector)) {
      setSelectedSubSectors(selectedSubSectors.filter(s => s !== subsector));
    } else {
      setSelectedSubSectors([...selectedSubSectors, subsector]);
    }
  };

  const handleAvailabilityFilter = (availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE') => {
    const currentAvailability = filters.availability || [];
    const newAvailability = currentAvailability.includes(availability)
      ? currentAvailability.filter(a => a !== availability)
      : [...currentAvailability, availability];
    updateFilters({ availability: newAvailability.length > 0 ? newAvailability : undefined });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'BUSY':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'UNAVAILABLE':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('assistance.hub.title')}
        description={t('assistance.hub.subtitle')}
        icon={Headphones}
        stats={[
          { value: kpis.activeRequests.toString(), label: t('assistance.stats.activeRequests') }
        ]}
      />

      {/* Sub Menu */}
      <AssistanceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Helper Text Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 leading-relaxed">
              {t('assistance.findExpert.description')}
            </p>
          </div>

          {/* Horizontal Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search + Filter Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:max-w-md">
                  <Input
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={t('assistance.findExpert.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {t('assistance.filters.type')}
                        {filters.type && filters.type.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.type.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.type')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(AssistanceTypeEnum).map((type) => (
                            <Button
                              key={type}
                              variant={filters.type?.includes(type) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleTypeFilter(type)}
                            >
                              {filters.type?.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`assistance.type.${type}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Availability Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('assistance.filters.availability')}
                        {filters.availability && filters.availability.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.availability.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.availability')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['AVAILABLE', 'BUSY', 'UNAVAILABLE'].map((availability) => (
                            <Button
                              key={availability}
                              variant={filters.availability?.includes(availability as any) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleAvailabilityFilter(availability as any)}
                            >
                              {filters.availability?.includes(availability as any) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`assistance.availability.${availability}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      {t('assistance.filters.clear')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{t('common.filter')}:</span>
                  {filters.type?.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {t(`assistance.type.${type}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleTypeFilter(type)} />
                    </Badge>
                  ))}
                  {filters.availability?.map((availability) => (
                    <Badge key={availability} variant="secondary" className="gap-1">
                      {t(`assistance.availability.${availability}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleAvailabilityFilter(availability)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sector & Subsector Filter - NEW ASSORTIS DESIGN */}
          <div className="mb-6">
            <SectorSubsectorFilter
              selectedSectors={selectedSectors}
              selectedSubSectors={selectedSubSectors}
              hoveredSector={hoveredSector}
              onHoverSector={setHoveredSector}
              onSelectSector={handleSectorFilter}
              onSelectSubSector={handleSubsectorFilter}
              onSelectAllSectors={() => {
                const allSectors = Object.values(SectorEnum);
                const allSelected = allSectors.every(s => selectedSectors.includes(s));
                if (allSelected) {
                  allSectors.forEach(s => handleSectorFilter(s));
                } else {
                  allSectors.filter(s => !selectedSectors.includes(s)).forEach(s => handleSectorFilter(s));
                }
              }}
              onSelectAllSubSectors={(sector: SectorEnum) => {
                const sectorSubs = SECTOR_SUBSECTOR_MAP[sector] || [];
                const allSelected = sectorSubs.every(sub => selectedSubSectors.includes(sub));
                if (allSelected) {
                  sectorSubs.forEach(sub => handleSubsectorFilter(sub));
                } else {
                  sectorSubs.filter(sub => !selectedSubSectors.includes(sub)).forEach(sub => handleSubsectorFilter(sub));
                }
              }}
              t={t}
            />
          </div>

          {/* Experts Grid */}
          {experts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map((expert) => (
                <div key={expert.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {expert.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary mb-1">{expert.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{expert.title}</p>
                      <p className="text-xs text-muted-foreground">{expert.organization}</p>
                    </div>
                    <Badge variant="outline" className={getAvailabilityColor(expert.availability)}>
                      {t(`assistance.availability.${expert.availability}`)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{expert.bio}</p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{t('assistance.expert.expertise')}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expert.expertise.slice(0, 2).map((exp) => (
                          <Badge key={exp} variant="secondary" className="text-xs">
                            {t(`assistance.type.${exp}`)}
                          </Badge>
                        ))}
                        {expert.expertise.length > 2 && (
                          <Badge variant="outline">+{expert.expertise.length - 2}</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{t('assistance.expert.sectors')}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {expert.sectors.slice(0, 2).map((sector) => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {t(`projects.sector.${sector}`)}
                          </Badge>
                        ))}
                        {expert.sectors.length > 2 && (
                          <Badge variant="outline">+{expert.sectors.length - 2}</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {expert.location.city}, {expert.location.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-primary">{expert.rating}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('assistance.expert.completedAssignments')}:</span>
                      <span className="font-semibold text-primary">{expert.completedAssignments}</span>
                    </div>

                    {expert.hourlyRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('assistance.expert.hourlyRate')}:</span>
                        <span className="font-semibold text-primary">${expert.hourlyRate}/hr</span>
                      </div>
                    )}

                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{t('assistance.expert.languages')}:</span>
                      <p className="text-sm mt-1">{expert.languages.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/experts/${expert.id}`)}
                    >
                      {t('assistance.actions.viewProfile')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedExpert(expert as ExpertDTO);
                        setContactDialogOpen(true);
                      }}
                    >
                      {t('assistance.actions.contactExpert')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('assistance.findExpert.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('assistance.findExpert.noResults.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Contact Dialog */}
      <ContactDialog
        open={contactDialogOpen}
        onClose={() => {
          setContactDialogOpen(false);
          setSelectedExpert(null);
        }}
        expert={selectedExpert}
      />
    </div>
  );
}