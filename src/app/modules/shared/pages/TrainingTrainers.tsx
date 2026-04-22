import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TrainingSubMenu } from '@app/components/TrainingSubMenu';
import { SectorSubsectorFilter } from '@app/components/SectorSubsectorFilter';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { useTraining } from '@app/hooks/useTraining';
import { SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '@app/types/tender.dto';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Video,
  UserCheck,
  Award,
  Search,
  ChevronDown,
  CheckCircle,
  X,
  Users,
  Briefcase,
  Globe,
  Mail,
} from 'lucide-react';

export default function TrainingTrainers() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { trainers, kpis, filters, updateFilters, clearFilters, activeFiltersCount } = useTraining();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);

  const availableSubsectors = useMemo(() => {
    if (!hoveredSector) return [];
    return SECTOR_SUBSECTOR_MAP[hoveredSector] || [];
  }, [hoveredSector]);

  // Real-time search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ searchQuery: searchQuery.trim() || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, updateFilters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ searchQuery: searchQuery.trim() || undefined });
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

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t('training.hub.title')}
        description={t('training.hub.subtitle')}
        icon={GraduationCap}
        stats={[
          { value: kpis.enrolledPrograms.toString(), label: t('training.stats.enrolledPrograms') }
        ]}
      />

      {/* Sub Menu */}
      <TrainingSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('training.trainers.title')}</h2>
            <p className="text-muted-foreground">{t('training.trainers.subtitle')}</p>
          </div>

          {/* Horizontal Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search + Filter Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:max-w-md">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('training.trainers.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-1" />
                      {t('training.filters.clear')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{t('common.filter')}:</span>
                  {filters.sector?.map((sector) => (
                    <Badge key={sector} variant="secondary" className="gap-1">
                      {t(`projects.sector.${sector}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleSectorFilter(sector)} />
                    </Badge>
                  ))}
                  {filters.subsector?.map((subsector) => (
                    <Badge key={subsector} variant="secondary" className="gap-1">
                      {t(`subsectors.${subsector}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleSubsectorFilter(subsector)} />
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

          {/* Trainers Grid */}
          {trainers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainers.map((trainer) => (
                <div key={trainer.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {trainer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary mb-1">{/* Nom masqué pour confidentialité */}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{trainer.title}</p>
                      <p className="text-xs text-muted-foreground">{trainer.organization}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{trainer.bio}</p>

                  <div className="space-y-3 mb-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-primary">{trainer.coursesCount}</p>
                        <p className="text-xs text-muted-foreground">{t('training.trainers.courses')}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-primary">{trainer.yearsExperience}</p>
                        <p className="text-xs text-muted-foreground">{t('training.trainers.experience')}</p>
                      </div>
                    </div>

                    {/* Expertise */}
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{t('training.trainers.expertise')}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trainer.expertise.slice(0, 2).map((exp, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Sectors */}
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{t('training.trainers.sectors')}:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trainer.sectors.slice(0, 2).map((sector) => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {t(`projects.sector.${sector}`)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {t('training.trainers.languages')}:
                      </span>
                      <span className="text-xs font-medium text-primary">{trainer.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="w-full bg-[#B82547] hover:bg-[#a01f3c] text-white"
                      onClick={() => navigate(`/training/trainer-details/${trainer.id}`)}
                    >
                      {t('actions.viewDetails')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('training.trainers.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('training.trainers.noResults.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}