import { useState, useMemo } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SubMenu } from '@app/components/SubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { useAssistance } from '@app/hooks/useAssistance';
import { ResourceTypeEnum } from '@app/types/assistance.dto';
import { ProjectSectorEnum, PROJECT_SUBSECTORS } from '@app/types/project.dto';
import { toast } from 'sonner';
import {
  Headphones,
  LayoutDashboard,
  Search,
  FileText,
  Handshake,
  BookOpen,
  Download,
  Star,
  Calendar,
  User,
  ChevronDown,
  CheckCircle,
  X,
  FileType,
  Video,
  Layers,
} from 'lucide-react';

export default function AssistanceResources() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { resources, kpis, filters, updateFilters, clearFilters, activeFiltersCount } = useAssistance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<ProjectSectorEnum | null>(null);

  const availableSubsectors = useMemo(() => {
    if (!selectedSector) return [];
    return PROJECT_SUBSECTORS[selectedSector] || [];
  }, [selectedSector]);

  // Filter resources based on local search query
  const filteredResources = useMemo(() => {
    if (!searchQuery.trim()) return resources;
    
    const query = searchQuery.toLowerCase();
    return resources.filter((resource) => 
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.author.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [resources, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in real-time via filteredResources
  };

  const handleResourceTypeFilter = (type: ResourceTypeEnum) => {
    const currentTypes = filters.resourceType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    updateFilters({ resourceType: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleSectorFilter = (sector: ProjectSectorEnum) => {
    const currentSectors = filters.sector || [];
    const newSectors = currentSectors.includes(sector)
      ? currentSectors.filter(s => s !== sector)
      : [...currentSectors, sector];
    updateFilters({ sector: newSectors.length > 0 ? newSectors : undefined });
    
    if (currentSectors.includes(sector)) {
      setSelectedSector(null);
    } else {
      setSelectedSector(sector);
    }
  };

  const handleSubsectorFilter = (subsector: string) => {
    const currentSubsectors = filters.subsector || [];
    const newSubsectors = currentSubsectors.includes(subsector)
      ? currentSubsectors.filter(s => s !== subsector)
      : [...currentSubsectors, subsector];
    updateFilters({ subsector: newSubsectors.length > 0 ? newSubsectors : undefined });
  };

  const getResourceIcon = (type: ResourceTypeEnum) => {
    switch (type) {
      case ResourceTypeEnum.GUIDE:
        return BookOpen;
      case ResourceTypeEnum.TEMPLATE:
        return FileType;
      case ResourceTypeEnum.TOOLKIT:
        return Layers;
      case ResourceTypeEnum.CASE_STUDY:
        return FileText;
      case ResourceTypeEnum.VIDEO:
      case ResourceTypeEnum.WEBINAR:
        return Video;
      default:
        return FileText;
    }
  };

  const getResourceColor = (type: ResourceTypeEnum) => {
    const colors: Record<ResourceTypeEnum, string> = {
      [ResourceTypeEnum.GUIDE]: 'bg-blue-50 text-blue-700 border-blue-200',
      [ResourceTypeEnum.TEMPLATE]: 'bg-green-50 text-green-700 border-green-200',
      [ResourceTypeEnum.TOOLKIT]: 'bg-purple-50 text-purple-700 border-purple-200',
      [ResourceTypeEnum.CASE_STUDY]: 'bg-orange-50 text-orange-700 border-orange-200',
      [ResourceTypeEnum.CHECKLIST]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      [ResourceTypeEnum.VIDEO]: 'bg-pink-50 text-pink-700 border-pink-200',
      [ResourceTypeEnum.WEBINAR]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[type] || '';
  };

  const handleDownloadResource = (resource: any) => {
    // Simulate download process
    toast.loading(t('assistance.resources.download.starting'), {
      description: resource.title,
      duration: 1500,
    });

    setTimeout(() => {
      toast.success(t('assistance.resources.download.success'), {
        description: t('assistance.resources.download.success.message', { title: resource.title }),
      });
      
      // In a real implementation, this would trigger an actual file download
      // For now, we'll just log the download
      console.log(`Downloading resource: ${resource.title} (${resource.id})`);
    }, 1500);
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
      <SubMenu
        items={[
          { label: t('assistance.submenu.findExpert'), icon: Search, onClick: () => navigate('/assistance/find-expert') },
          { label: t('assistance.submenu.request'), icon: FileText, onClick: () => navigate('/assistance/request') },
          { label: t('assistance.submenu.resources'), active: true, icon: BookOpen },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">{t('assistance.resources.title')}</h2>
            <p className="text-muted-foreground">{t('assistance.resources.subtitle')}</p>
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
                    placeholder={t('assistance.filters.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Resource Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileType className="w-4 h-4 mr-2" />
                        {t('assistance.filters.resourceType')}
                        {filters.resourceType && filters.resourceType.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.resourceType.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.resourceType')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {Object.values(ResourceTypeEnum).map((type) => (
                            <Button
                              key={type}
                              variant={filters.resourceType?.includes(type) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleResourceTypeFilter(type)}
                            >
                              {filters.resourceType?.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`assistance.resourceType.${type}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Sector Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {t('assistance.filters.sector')}
                        {filters.sector && filters.sector.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{filters.sector.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.sector')}</h4>
                        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                          {Object.values(ProjectSectorEnum).map((sector) => (
                            <Button
                              key={sector}
                              variant={filters.sector?.includes(sector) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleSectorFilter(sector)}
                            >
                              {filters.sector?.includes(sector) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`projects.sector.${sector}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Subsector Filter */}
                  {selectedSector && availableSubsectors.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <BookOpen className="w-4 h-4 mr-2" />
                          {t('assistance.filters.subsector')}
                          {filters.subsector && filters.subsector.length > 0 && (
                            <Badge className="ml-2" variant="secondary">{filters.subsector.length}</Badge>
                          )}
                          <ChevronDown className="w-4 h-4 ml-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72" align="start">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.subsector')}</h4>
                          <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                            {availableSubsectors.map((subsector) => (
                              <Button
                                key={subsector}
                                variant={filters.subsector?.includes(subsector) ? "default" : "outline"}
                                size="sm"
                                className="w-full justify-start text-xs"
                                onClick={() => handleSubsectorFilter(subsector)}
                              >
                                {filters.subsector?.includes(subsector) && <CheckCircle className="w-3 h-3 mr-2" />}
                                {t(`subsectors.${subsector}`)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
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
                  {filters.resourceType?.map((type) => (
                    <Badge key={type} variant="secondary" className="gap-1">
                      {t(`assistance.resourceType.${type}`)}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleResourceTypeFilter(type)} />
                    </Badge>
                  ))}
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

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const Icon = getResourceIcon(resource.type);
                return (
                  <div key={resource.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <Badge variant="outline" className={getResourceColor(resource.type)} size="sm">
                          {t(`assistance.resourceType.${resource.type}`)}
                        </Badge>
                        <h3 className="font-semibold text-primary mt-2 mb-1">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{t(`projects.sector.${resource.sector}`)}</Badge>
                      <Badge variant="outline" className="text-xs">{resource.language}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {t('assistance.resources.author')}:
                        </span>
                        <span className="text-primary font-medium text-xs">{resource.author}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {t('assistance.resources.publishDate')}:
                        </span>
                        <span className="text-primary">{new Date(resource.publishDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {t('assistance.resources.downloads')}:
                        </span>
                        <span className="text-primary font-semibold">{resource.downloadCount}</span>
                      </div>

                      {resource.fileSize && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('assistance.resources.fileSize')}:</span>
                          <span className="text-primary">{resource.fileSize}</span>
                        </div>
                      )}

                      {resource.duration && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t('assistance.resources.duration')}:</span>
                          <span className="text-primary">{resource.duration}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-primary">{resource.rating}</span>
                          <span className="text-xs text-muted-foreground">/ 5</span>
                        </span>
                      </div>
                    </div>

                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="outline">+{resource.tags.length - 3}</Badge>
                        )}
                      </div>
                    )}

                    <Button variant="default" size="sm" className="w-full" onClick={() => handleDownloadResource(resource)}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('assistance.actions.downloadResource')}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-primary mb-1">{t('assistance.resources.noResults')}</h3>
              <p className="text-sm text-muted-foreground">{t('assistance.resources.noResults.message')}</p>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}