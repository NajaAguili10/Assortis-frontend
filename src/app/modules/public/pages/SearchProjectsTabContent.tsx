import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Badge } from '@app/components/ui/badge';
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
import { ProjectStatusEnum, ProjectPriorityEnum } from '@app/types/project.dto';

export default function SearchProjectsTabContent() {
  const { t, language } = useLanguage();
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
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
    clearFilters();
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
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {projects.meta.totalItems > 0 ? (
              <>Showing {((currentPage - 1) * projects.meta.pageSize + 1)}-{Math.min(currentPage * projects.meta.pageSize, projects.meta.totalItems)} of {projects.meta.totalItems}</>
            ) : (
              <>No projects found</>
            )}
          </p>
        </div>

        {projects.data.length > 0 ? (
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
    </div>
  );
}
