import { useState, useMemo, useEffect, useCallback } from 'react';
import { useProjectsContext } from '../contexts/ProjectsContext';
import { projectService } from '../services/projectService';
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
import React from 'react';

// Extended type pour l'usage interne avec champs additionnels
interface ProjectListDTOInternal extends ProjectListDTO {
  name: string;
  managerName?: string;
}

const normalizeSearchValue = (value: unknown) => String(value ?? '').toLowerCase();

export const useProjects = () => {
  const {
    projects: contextProjects,
    tasks,
    collaborations,
    templates,
    isProjectsLoading,
    projectsError: contextProjectsError,
    getProjectById: getProjectByIdFromContext
  } = useProjectsContext();

  const [projectsData, setProjectsData] = useState<PaginatedResponseDTO<ProjectListDTO>>({
    data: [],
    meta: {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });

  const [filters, setFilters] = useState<ProjectFiltersDTO>({});
  const [viewMode, setViewMode] = useState<'mine' | 'team' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'budget' | 'completion' | 'name'>('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const pageSize = 10;
const [allProjects, setAllProjects] = useState<ProjectListDTO[]>([]);



useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await projectService.getAllProjects();
      setAllProjects(response);
    } catch (error) {
      setAllProjects([]);
      console.error("Error fetching projects:", error);
    }
  };

  fetchData();
}, []);
  
  
  // CURRENT_USER_ID is the mock logged-in user
  const CURRENT_USER_ID = 'user-1';

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setProjectsError(null);
    try {
      // Spring uses 0-based indexing for pages
      const response = await projectService.getProjects(filters, sortBy, currentPage - 1, pageSize);
      if (response && response.data) {
        setProjectsData(response);
      } else {
        throw new Error("Invalid response structure from backend");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch projects from backend';
      setProjectsError(message);
      setProjectsData({
        data: [],
        meta: {
          page: currentPage,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      });
      console.error("Failed to fetch projects from backend:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // KPIs
  const kpis: ProjectKPIsDTO = useMemo(() => {
    const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget?.total || 0), 0);
    const budgetSpent = allProjects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);
    const avgCompletion = allProjects.length > 0
      ? allProjects.reduce((sum, p) => sum + (p.timeline?.completionPercentage || 0), 0) / allProjects.length
      : 0;
    
    return {
      totalProjects: allProjects.length,
      activeProjects: allProjects.filter(p => p.status === ProjectStatusEnum.ACTIVE).length,
      completedProjects: allProjects.filter(p => p.status === ProjectStatusEnum.COMPLETED).length,
      onHoldProjects: allProjects.filter(p => p.status === ProjectStatusEnum.ON_HOLD).length,
      totalBudget,
      budgetSpent,
      averageCompletion: Math.round(avgCompletion),
      urgentProjects: allProjects.filter(p => p.priority === ProjectPriorityEnum.URGENT).length,
    };
  }, [myprojects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...contextProjects];

    // Apply filters
    // Team visibility filter
    if (viewMode === 'mine') {
      filtered = filtered.filter((project) => (project as ProjectListDTO & { createdBy?: string }).createdBy === CURRENT_USER_ID);
    } else if (viewMode === 'team') {
      filtered = filtered.filter((project) => (project as ProjectListDTO & { createdBy?: string }).createdBy !== CURRENT_USER_ID);
    }

    if (filters.searchQuery) {
      const query = normalizeSearchValue(filters.searchQuery);
      filtered = filtered.filter(
        (project) =>
          normalizeSearchValue(project.title).includes(query) ||
          normalizeSearchValue(project.code).includes(query) ||
          normalizeSearchValue(project.description).includes(query) ||
          normalizeSearchValue(project.leadOrganization).includes(query) ||
          ((project as ProjectListDTO & { tags?: unknown[] }).tags || []).some((tag) => normalizeSearchValue(tag).includes(query))
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
        filtered.sort((a, b) => String(a.title ?? '').localeCompare(String(b.title ?? '')));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }

    return filtered;
  }, [filters, sortBy, contextProjects]);

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
    projects: projectsData,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    isLoading: isLoading || isProjectsLoading,
    projectsError: projectsError || contextProjectsError,
    refreshProjects: fetchProjects,
    tasks,
    collaborations,
    templates,
    allProjects,
    getProjectById: getProjectByIdFromContext,
    getCollaborationById: (id: string) => collaborations.find(c => c.id === id),
  };
};
