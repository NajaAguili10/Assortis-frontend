import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { organizationService } from '@app/services/organizationService';
import { ProjectStatusEnum, ProjectPriorityEnum, ProjectSectorEnum } from '@app/types/project.dto';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import {
  SavedSearchEditorDialog,
  type SavedSearchEditorSavePayload,
  type SavedSearchReviewItem,
} from '@app/components/SavedSearchEditorDialog';
import { useProjects } from '@app/hooks/useProjects';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ProjectStatusEnum, ProjectPriorityEnum, type ProjectFiltersDTO } from '@app/types/project.dto';
import { savedSearchService, type SavedSearchAlertSettings } from '@app/services/savedSearchService';
import { toast } from 'sonner';

interface ProjectSavedPayload {
  searchQuery: string;
  filters: ProjectFiltersDTO;
  sortBy: 'newest' | 'priority' | 'budget' | 'completion' | 'name';
}

interface SavedSearchEntry<TPayload> {
  id: string;
  label: string;
  createdAt: string;
  payload: TPayload;
}

export default function SearchProjectsTabContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    projects,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    isLoading,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const [subscriptionSectors, setSubscriptionSectors] = useState<string[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);

  useEffect(() => {
    if (user?.organizationId) {
      organizationService.getSubscriptionSectors(user.organizationId)
        .then(setSubscriptionSectors)
        .catch(err => console.error("Error fetching subscription sectors:", err));
    }
  }, [user]);

  const handleSectorToggle = (sector: string) => {
    const next = selectedSectors.includes(sector)
      ? selectedSectors.filter((s) => s !== sector)
      : [...selectedSectors, sector];
    setSelectedSectors(next);
    updateFilters({ sector: next as ProjectSectorEnum[] });
  };
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isSaveSearchDialogOpen, setIsSaveSearchDialogOpen] = useState(false);
  const [editingSavedSearch, setEditingSavedSearch] = useState<SavedSearchEntry<ProjectSavedPayload> | null>(null);
  const [savedSearches, setSavedSearches] = useState<SavedSearchEntry<ProjectSavedPayload>[]>([]);

  const readSavedSearches = (): SavedSearchEntry<ProjectSavedPayload>[] => savedSearchService.list(user?.id, 'projects').map((item) => ({
    id: item.id,
    label: item.name,
    createdAt: item.created_at,
    payload: item.filters as ProjectSavedPayload,
  }));

  useEffect(() => {
    setSavedSearches(readSavedSearches());
  }, [user?.id]);

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

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSectors([]);
    clearFilters();
  };

  const buildPayload = (): ProjectSavedPayload => ({
    searchQuery,
    filters: {
      ...filters,
      searchQuery: searchQuery || filters.searchQuery,
    },
    sortBy,
  });

  const applySavedSearch = (payload: ProjectSavedPayload) => {
    setSearchQuery(payload.searchQuery || payload.filters?.searchQuery || '');
    updateFilters(payload.filters || {});
    setSortBy(payload.sortBy || 'newest');
  };

  useEffect(() => {
    const savedSearchId = searchParams.get('savedSearchId');
    if (!savedSearchId) return;
    const saved = savedSearchService.get(savedSearchId);
    if (saved?.context.type === 'projects') {
      applySavedSearch(saved.filters as ProjectSavedPayload);
      toast.success('Search loaded');
    }
  }, [searchParams]);

  const buildSummary = () => {
    const payload = buildPayload();
    const projectFilters = payload.filters || {};
    return [
      payload.searchQuery ? `Keywords: ${payload.searchQuery}` : '',
      projectFilters.status?.length ? `Status: ${projectFilters.status.length}` : '',
      projectFilters.priority?.length ? `Priority: ${projectFilters.priority.length}` : '',
      projectFilters.type?.length ? `Type: ${projectFilters.type.length}` : '',
      projectFilters.sector?.length ? `Sectors: ${projectFilters.sector.length}` : '',
      projectFilters.region?.length ? `Regions: ${projectFilters.region.length}` : '',
      projectFilters.minBudget !== undefined ? `Min budget: ${projectFilters.minBudget}` : '',
      projectFilters.maxBudget !== undefined ? `Max budget: ${projectFilters.maxBudget}` : '',
    ].filter(Boolean);
  };

  const formatList = (items?: string[]) => (items || []).map((item) => item.replace(/_/g, ' '));

  const buildReviewItemsFromPayload = (payload: ProjectSavedPayload): SavedSearchReviewItem[] => {
    const projectFilters = payload.filters || {};
    return [
      { label: 'Type', value: 'Projects' },
      { label: 'Keywords', value: payload.searchQuery || projectFilters.searchQuery },
      { label: 'Search Type', value: payload.sortBy ? `Sorted by ${payload.sortBy}` : '' },
      { label: 'Notice Type', value: formatList(projectFilters.status as string[]) },
      { label: 'Procurement Type', value: formatList(projectFilters.type as string[]) },
      { label: 'Sectors', value: formatList(projectFilters.sector as string[]) },
      { label: 'Countries / Regions', value: formatList(projectFilters.region as string[]) },
      { label: 'Budget', value: projectFilters.minBudget !== undefined || projectFilters.maxBudget !== undefined ? `${projectFilters.minBudget ?? 'Any'} - ${projectFilters.maxBudget ?? 'Any'}` : '' },
      { label: 'Organisation Name', value: projectFilters.leadOrganization },
    ];
  };

  const getAlertSettingsForEntry = (entry?: SavedSearchEntry<ProjectSavedPayload> | null): Partial<SavedSearchAlertSettings> => {
    if (!entry) return { alertFrequency: 'daily', alertDays: ['Every day'], alertHour: '08:00', emailFormat: 'summary', status: 'active' };
    const saved = savedSearchService.get(entry.id);
    return {
      alertFrequency: saved?.alertFrequency || 'daily',
      alertDays: saved?.alertDays || ['Every day'],
      alertHour: saved?.alertHour || '08:00',
      emailFormat: saved?.emailFormat || 'summary',
      status: saved?.status || 'active',
    };
  };

  const openCreateSavedSearch = () => {
    setEditingSavedSearch(null);
    setIsSaveSearchDialogOpen(true);
  };

  const openEditSavedSearch = (entry: SavedSearchEntry<ProjectSavedPayload>) => {
    setEditingSavedSearch(entry);
    setIsSaveSearchDialogOpen(true);
  };

  const saveSearch = ({ name, alertSettings, useCurrentCriteria }: SavedSearchEditorSavePayload) => {
    if (editingSavedSearch) {
      const nextPayload = useCurrentCriteria ? buildPayload() : editingSavedSearch.payload;
      savedSearchService.update(editingSavedSearch.id, {
        name,
        filters: nextPayload,
        context: useCurrentCriteria
          ? {
              type: 'projects',
              route: '/search/projects',
              label: 'Projects',
              summary: buildSummary(),
              language,
              accountType: user?.accountType,
            }
          : savedSearchService.get(editingSavedSearch.id)?.context,
        alertsEnabled: alertSettings.alertFrequency !== 'unsubscribe' && alertSettings.status === 'active',
        alertFrequency: alertSettings.alertFrequency,
        alertDays: alertSettings.alertDays,
        alertHour: alertSettings.alertHour,
        emailFormat: alertSettings.emailFormat,
        status: alertSettings.status,
      });
      setSavedSearches(readSavedSearches());
      setIsSaveSearchDialogOpen(false);
      setEditingSavedSearch(null);
      toast.success('Saved search updated');
      return;
    }

    savedSearchService.save({
      userId: user?.id,
      name,
      filters: buildPayload(),
      context: {
        type: 'projects',
        route: '/search/projects',
        label: 'Projects',
        summary: buildSummary(),
        language,
        accountType: user?.accountType,
      },
      alertsEnabled: alertSettings.alertFrequency !== 'unsubscribe' && alertSettings.status === 'active',
      alertFrequency: alertSettings.alertFrequency,
      alertDays: alertSettings.alertDays,
      alertHour: alertSettings.alertHour,
      emailFormat: alertSettings.emailFormat,
      status: alertSettings.status,
    });
    setSavedSearches(readSavedSearches());
    setIsSaveSearchDialogOpen(false);
    setEditingSavedSearch(null);
    toast.success('Search saved');
  };

  const deleteSavedSearch = (id: string) => {
    savedSearchService.remove(id);
    setSavedSearches(readSavedSearches());
  };

  const formatProjectBudget = (amount: number, currency: string) => new Intl.NumberFormat(
    language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-GB',
    { style: 'currency', currency, maximumFractionDigits: 0 }
  ).format(amount);

  const getStatusColor = (status: ProjectStatusEnum) => {
    switch (status) {
      case ProjectStatusEnum.ACTIVE: return 'bg-green-100 text-green-700 border-green-200';
      case ProjectStatusEnum.PLANNING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ProjectStatusEnum.ON_HOLD: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ProjectStatusEnum.COMPLETED: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sectionHeadingKey = 'search.section.projects.filters.heading';
  const sectionDescriptionKey = 'search.section.projects.filters.description';

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
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('projects.search.placeholder') || "Search projects..."}
                className="pl-9"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-1" />
              {t('filters.clear') || "Clear filters"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={openCreateSavedSearch}>Save Search</Button>
          <Button variant="outline" size="sm" onClick={() => {
            setSavedSearches(readSavedSearches());
            setIsLoadDialogOpen(true);
          }}>Load Search</Button>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('projects.sort.newest') || "Newest"}</SelectItem>
              <SelectItem value="priority">{t('projects.sort.priority') || "Priority"}</SelectItem>
              <SelectItem value="budget">{t('projects.sort.budget') || "Budget"}</SelectItem>
              <SelectItem value="completion">{t('projects.sort.completion') || "Completion"}</SelectItem>
              <SelectItem value="name">{t('projects.sort.name') || "Name"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {subscriptionSectors.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-medium text-gray-700">{t('projects.filters.sectors') || "Sectors"}</h3>
            <div className="flex flex-wrap gap-2">
              {subscriptionSectors.map((sector) => (
                <Badge
                  key={sector}
                  variant={selectedSectors.includes(sector) ? 'default' : 'outline'}
                  className={`cursor-pointer px-3 py-1.5 transition-colors ${selectedSectors.includes(sector)
                      ? 'bg-primary text-white border-primary hover:bg-primary/90'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  onClick={() => handleSectorToggle(sector)}
                >
                  {t(`projects.sectors.${sector}`) || sector}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading projects...
              </span>
            ) : projects.meta.totalItems > 0 ? (
              <>Showing {((currentPage - 1) * projects.meta.pageSize + 1)}-{Math.min(currentPage * projects.meta.pageSize, projects.meta.totalItems)} of {projects.meta.totalItems}</>
            ) : (
              <>No projects found</>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-200">
             <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-gray-500 font-medium">Fetching projects from server...</p>
          </div>
        ) : projects.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {projects.data.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(project.status)}>
                    {t(`projects.status.${project.status}`)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span className="truncate">{project.leadOrganization}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{project.country}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    {formatProjectBudget(project.budget.total, project.budget.currency)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {format(new Date(project.timeline.endDate), 'PP', { locale: language === 'fr' ? undefined : undefined })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-medium text-gray-500 mb-1">
                        <span>{t('projects.stats.completion')}</span>
                        <span>{project.timeline.completionPercentage}%</span>
                      </div>
                      <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${project.timeline.completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button variant="default" size="sm" onClick={() => navigate(`/search/projects/${project.id}`)}>
                    {t('actions.viewDetails')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary mb-1">{t('projects.list.noResults') || "No projects found"}</h3>
            <p className="text-sm text-muted-foreground">{t('projects.list.noResults.message') || "Try adjusting your search query or filters."}</p>
          </div>
        )}

        {projects.meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!projects.meta.hasPreviousPage}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('pagination.previous')}
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, projects.meta.totalPages) }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!projects.meta.hasNextPage}
            >
              {t('pagination.next')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Load Search</DialogTitle>
            <DialogDescription>Choose a saved search for projects.</DialogDescription>
          </DialogHeader>
          {savedSearches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved searches found for this page.</p>
          ) : (
            <div className="max-h-80 overflow-auto space-y-2">
              {savedSearches.map((entry) => (
                <div key={entry.id} className="rounded-md border border-gray-200 p-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-primary">{entry.label}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(entry.createdAt), 'yyyy-MM-dd HH:mm')}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          applySavedSearch(entry.payload);
                          setIsLoadDialogOpen(false);
                          toast.success('Search loaded');
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsLoadDialogOpen(false);
                          openEditSavedSearch(entry);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteSavedSearch(entry.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <SavedSearchEditorDialog
        open={isSaveSearchDialogOpen}
        mode={editingSavedSearch ? 'edit' : 'create'}
        searchType="projects"
        initialName={editingSavedSearch?.label || searchQuery.trim() || 'Saved projects search'}
        reviewItems={buildReviewItemsFromPayload(editingSavedSearch?.payload || buildPayload())}
        initialAlertSettings={getAlertSettingsForEntry(editingSavedSearch)}
        onOpenChange={(open) => {
          setIsSaveSearchDialogOpen(open);
          if (!open) setEditingSavedSearch(null);
        }}
        onSave={saveSearch}
      />
    </div>
  );
}
