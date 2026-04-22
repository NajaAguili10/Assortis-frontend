import { useState, useMemo } from 'react';
import { useProjectsContext } from '../contexts/ProjectsContext';
import {
  ProjectListDTO,
  TaskDTO,
  CollaborationDTO,
  ProjectTemplateDTO,
  ProjectKPIsDTO,
  ProjectFiltersDTO,
  PaginatedResponseDTO,
  ProjectStatusEnum,
  ProjectPriorityEnum,
  ProjectTypeEnum,
  ProjectSectorEnum,
  RegionEnum,
} from '../types/project.dto';

// Extended type pour l'usage interne avec champs additionnels
interface ProjectListDTOInternal extends ProjectListDTO {
  name: string;
  managerName?: string;
}

export const useProjects = () => {
  const { 
    projects: mockProjects, 
    tasks, 
    collaborations, 
    templates, 
    getProjectById: getProjectByIdFromContext 
  } = useProjectsContext();
  const [filters, setFilters] = useState<ProjectFiltersDTO>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'budget' | 'completion' | 'name'>('newest');
  const pageSize = 10;

  // KPIs
  const kpis: ProjectKPIsDTO = useMemo(() => {
    const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget.total, 0);
    const budgetSpent = mockProjects.reduce((sum, p) => sum + p.budget.spent, 0);
    const avgCompletion = mockProjects.reduce((sum, p) => sum + p.timeline.completionPercentage, 0) / mockProjects.length;
    
    return {
      totalProjects: mockProjects.length,
      activeProjects: mockProjects.filter(p => p.status === ProjectStatusEnum.ACTIVE).length,
      completedProjects: mockProjects.filter(p => p.status === ProjectStatusEnum.COMPLETED).length,
      onHoldProjects: mockProjects.filter(p => p.status === ProjectStatusEnum.ON_HOLD).length,
      totalBudget,
      budgetSpent,
      averageCompletion: Math.round(avgCompletion),
      urgentProjects: mockProjects.filter(p => p.priority === ProjectPriorityEnum.URGENT).length,
    };
  }, [mockProjects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...mockProjects];

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(query) ||
          project.code.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.leadOrganization.toLowerCase().includes(query)
      );
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((project) => filters.status!.includes(project.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filtered = filtered.filter((project) => filters.priority!.includes(project.priority));
    }

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter((project) => filters.type!.includes(project.type));
    }

    if (filters.sector && filters.sector.length > 0) {
      filtered = filtered.filter((project) => filters.sector!.includes(project.sector));
    }

    if (filters.subsector && filters.subsector.length > 0) {
      filtered = filtered.filter((project) =>
        project.subsectors.some((sub) => filters.subsector!.includes(sub))
      );
    }

    if (filters.region && filters.region.length > 0) {
      filtered = filtered.filter((project) => filters.region!.includes(project.region));
    }

    if (filters.minBudget !== undefined) {
      filtered = filtered.filter((project) => project.budget.total >= filters.minBudget!);
    }

    if (filters.maxBudget !== undefined) {
      filtered = filtered.filter((project) => project.budget.total <= filters.maxBudget!);
    }

    // Sort
    switch (sortBy) {
      case 'priority':
        const priorityOrder = {
          [ProjectPriorityEnum.URGENT]: 0,
          [ProjectPriorityEnum.HIGH]: 1,
          [ProjectPriorityEnum.MEDIUM]: 2,
          [ProjectPriorityEnum.LOW]: 3,
        };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'budget':
        filtered.sort((a, b) => b.budget.total - a.budget.total);
        break;
      case 'completion':
        filtered.sort((a, b) => b.timeline.completionPercentage - a.timeline.completionPercentage);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }

    return filtered;
  }, [filters, sortBy, mockProjects]);

  // Pagination
  const paginatedProjects: PaginatedResponseDTO<ProjectListDTO> = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const data = filteredProjects.slice(start, end);

    return {
      data,
      meta: {
        page: currentPage,
        pageSize,
        totalItems: filteredProjects.length,
        totalPages: Math.ceil(filteredProjects.length / pageSize),
        hasNextPage: currentPage < Math.ceil(filteredProjects.length / pageSize),
        hasPreviousPage: currentPage > 1,
      },
    };
  }, [filteredProjects, currentPage]);

  // Filter management
  const updateFilters = (newFilters: Partial<ProjectFiltersDTO>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status && filters.status.length > 0) count += filters.status.length;
    if (filters.priority && filters.priority.length > 0) count += filters.priority.length;
    if (filters.type && filters.type.length > 0) count += filters.type.length;
    if (filters.sector && filters.sector.length > 0) count += filters.sector.length;
    if (filters.subsector && filters.subsector.length > 0) count += filters.subsector.length;
    if (filters.region && filters.region.length > 0) count += filters.region.length;
    if (filters.minBudget !== undefined || filters.maxBudget !== undefined) count += 1;
    return count;
  }, [filters]);

  return {
    projects: paginatedProjects,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    tasks,
    collaborations,
    templates,
    allProjects: mockProjects, // For global search
    getProjectById: getProjectByIdFromContext,
    getCollaborationById: (id: string) => collaborations.find(c => c.id === id),
  };
};