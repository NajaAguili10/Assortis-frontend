import { useState, useMemo, useEffect } from 'react';
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
import { useTrainingCommerce } from '@app/contexts/TrainingCommerceContext';
import { TrainingLevelEnum, TrainingFormatEnum, TrainingCourseDTO } from '@app/types/training.dto';
import { SectorEnum, SubSectorEnum, SECTOR_SUBSECTOR_MAP } from '@app/types/tender.dto';
import {
  GraduationCap,
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
  Clock,
  Calendar,
  Globe,
  TrendingUp,
} from 'lucide-react';

export default function TrainingCatalog() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { courses, kpis, filters, updateFilters, clearFilters, activeFiltersCount } = useTraining();
  const { addToCart } = useTrainingCommerce();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectors, setSelectedSectors] = useState<SectorEnum[]>([]);
  const [selectedSubSectors, setSelectedSubSectors] = useState<SubSectorEnum[]>([]);
  const [hoveredSector, setHoveredSector] = useState<SectorEnum | null>(null);
  
  // Enrollment Dialog states
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourseDTO | null>(null);

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

  const handleLevelFilter = (level: TrainingLevelEnum) => {
    const currentLevels = filters.level || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    updateFilters({ level: newLevels.length > 0 ? newLevels : undefined });
  };

  const handleFormatFilter = (format: TrainingFormatEnum) => {
    const currentFormats = filters.format || [];
    const newFormats = currentFormats.includes(format)
      ? currentFormats.filter(f => f !== format)
      : [...currentFormats, format];
    updateFilters({ format: newFormats.length > 0 ? newFormats : undefined });
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

  const handleCertificationFilter = (withCertification: boolean | undefined) => {
    updateFilters({ certificationAvailable: withCertification });
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
            <h2 className="text-2xl font-bold text-primary mb-2">{t('training.catalog.title')}</h2>
            <p className="text-muted-foreground">{t('training.catalog.subtitle')}</p>
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
                    placeholder={t('training.catalog.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Level Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {t('training.filters.level')}
                        {filters.level && filters.level.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.level.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('training.filters.level')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(TrainingLevelEnum).map((level) => (
                            <Button
                              key={level}
                              variant={filters.level?.includes(level) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleLevelFilter(level)}
                            >
                              {filters.level?.includes(level) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`training.level.${level}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Format Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4 mr-2" />
                        {t('training.filters.format')}
                        {filters.format && filters.format.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.format.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('training.filters.format')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(TrainingFormatEnum).map((format) => (
                            <Button
                              key={format}
                              variant={filters.format?.includes(format) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleFormatFilter(format)}
                            >
                              {filters.format?.includes(format) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`training.format.${format}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Certification Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Award className="w-4 h-4 mr-2" />
                        {t('training.filters.certification')}
                        {filters.certificationAvailable !== undefined && (
                          <Badge className="ml-2" variant="secondary">1</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('training.filters.certification')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant={filters.certificationAvailable === true ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleCertificationFilter(true)}
                          >
                            {filters.certificationAvailable === true && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t('training.filters.certification.withCertification')}
                          </Button>
                          <Button
                            variant={filters.certificationAvailable === false ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => handleCertificationFilter(false)}
                          >
                            {filters.certificationAvailable === false && <CheckCircle className="w-3 h-3 mr-2" />}
                            {t('training.filters.certification.withoutCertification')}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

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
                  {filters.level?.map((level) => (
                    <Badge key={level} variant="secondary" className="gap-1">
                      {t(`training.level.${level}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleLevelFilter(level)} />
                    </Badge>
                  ))}
                  {filters.format?.map((format) => (
                    <Badge key={format} variant="secondary" className="gap-1">
                      {t(`training.format.${format}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFormatFilter(format)} />
                    </Badge>
                  ))}
                  {filters.certificationAvailable !== undefined && (
                    <Badge key="certification" variant="secondary" className="gap-1">
                      {filters.certificationAvailable ? t('training.filters.certification.withCertification') : t('training.filters.certification.withoutCertification')}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleCertificationFilter(undefined)} />
                    </Badge>
                  )}
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

          {/* Courses Grid */}
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow flex flex-col">
                  {/* Header Section - Fixed Height */}
                  <div className="p-5 pb-0">
                    <div className="flex items-center gap-2 mb-3 flex-wrap min-h-[28px]">
                      <Badge variant="outline" className="text-xs">
                        {t(`training.level.${course.level}`)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {t(`training.format.${course.format}`)}
                      </Badge>
                      {course.certificate && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
                          <Award className="w-3 h-3 mr-1" />
                          {t('training.catalog.certificate')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Title & Description - Fixed Height */}
                  <div className="px-5 pb-3">
                    <h3 className="font-semibold text-primary mb-2 line-clamp-2 min-h-[48px]">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">{course.description}</p>
                  </div>

                  {/* Instructor */}
                  <div className="px-5 pb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCheck className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{/* Nom masqué pour confidentialité */}</span>
                    </div>
                  </div>

                  {/* Course Info Grid - Uniform Layout */}
                  <div className="px-5 pb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{course.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{course.modules} {t('training.catalog.modules')}</span>
                      </div>
                      {course.startDate && (
                        <>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{new Date(course.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{course.language}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Certification Info - Fixed Height Zone */}
                  <div className="px-5 pb-3">
                    {course.certificationAvailable ? (
                      <div className="bg-blue-50 rounded-md p-3 border border-blue-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-blue-900 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {t('training.catalog.certificationOptional')}
                          </span>
                          <span className="text-sm font-bold text-blue-900">
                            +${course.certificationPrice}
                          </span>
                        </div>
                        {course.certificationValidityMonths !== undefined && (
                          <div className="text-xs text-blue-700">
                            {t('training.catalog.validFor')}: {course.certificationValidityMonths === 0 
                              ? t('training.catalog.lifetime') 
                              : `${course.certificationValidityMonths} ${t('training.catalog.months')}`}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-[72px]"></div>
                    )}
                  </div>

                  {/* Spacer to push bottom content down */}
                  <div className="flex-1"></div>

                  {/* Price & Tags - Bottom Section */}
                  <div className="px-5 pb-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-t pt-3">
                      <span className="text-sm text-muted-foreground">{t('training.catalog.price')}:</span>
                      <span className="text-2xl font-bold text-primary">${course.price}</span>
                    </div>

                    {/* Tags - Fixed Height */}
                    <div className="flex flex-wrap gap-1 mb-4 min-h-[24px]">
                      {course.tags && course.tags.length > 0 && course.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(course)}
                      >
                        {t('training.cart.add')}
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                        onClick={() => navigate(`/training/enroll/${course.id}`)}
                      >
                        {t('training.actions.enroll')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('training.catalog.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('training.catalog.noResults.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}