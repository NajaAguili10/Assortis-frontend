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
    projects: mockProjects,
    tasks,
    collaborations,
    templates,
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
  const pageSize = 10;
const [myprojects, setMyprojects] =useState<ProjectListDTO[]>([]);



useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await projectService.getAllProjects();
      setMyprojects(response);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  fetchData();
}, []);
  
  
  // CURRENT_USER_ID is the mock logged-in user
  const CURRENT_USER_ID = 'user-1';

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      // Spring uses 0-based indexing for pages
      const response = await projectService.getProjects(filters, sortBy, currentPage - 1, pageSize);
      if (response && response.data) {
        setProjectsData(response);
      } else {
        throw new Error("Invalid response structure from backend");
      }
    } catch (error) {
      console.error("Failed to fetch projects from backend, falling back to mock data", error);
      
      // Fallback logic for mock data (client-side filtering)
      let filtered = [...myprojects];

      if (viewMode === 'mine') {
        filtered = filtered.filter((project) => (project as any).createdBy === CURRENT_USER_ID);
      } else if (viewMode === 'team') {
        filtered = filtered.filter((project) => (project as any).createdBy !== CURRENT_USER_ID);
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (project) =>
            project.title.toLowerCase().includes(query) ||
            project.code.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query)
        );
      }
      
      if (filters.sector && filters.sector.length > 0) {
        filtered = filtered.filter((project) => filters.sector!.includes(project.sector));
      }

      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      
      setProjectsData({
        data: filtered.slice(start, end),
        meta: {
          page: currentPage,
          pageSize,
          totalItems: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
          hasNextPage: currentPage < Math.ceil(filtered.length / pageSize),
          hasPreviousPage: currentPage > 1,
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, currentPage, mockProjects, viewMode]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // KPIs
  const kpis: ProjectKPIsDTO = useMemo(() => {
    const totalBudget = myprojects.reduce((sum, p) => sum + (p.budget?.total || 0), 0);
    const budgetSpent = myprojects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);
    const avgCompletion = myprojects.length > 0 
      ? myprojects.reduce((sum, p) => sum + (p.timeline?.completionPercentage || 0), 0) / myprojects.length
      : 0;
    
    return {
      totalProjects: myprojects.length,
      activeProjects: myprojects.filter(p => p.status === ProjectStatusEnum.ACTIVE).length,
      completedProjects: myprojects.filter(p => p.status === ProjectStatusEnum.COMPLETED).length,
      onHoldProjects: myprojects.filter(p => p.status === ProjectStatusEnum.ON_HOLD).length,
      totalBudget,
      budgetSpent,
      averageCompletion: Math.round(avgCompletion),
      urgentProjects: myprojects.filter(p => p.priority === ProjectPriorityEnum.URGENT).length,
    };
  }, [mockProjects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...mockProjects];

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
    isLoading,
    refreshProjects: fetchProjects,
    tasks,
    collaborations,
    templates,
    allProjects: myprojects,
    filteredProjects: projectsData.data,
    getProjectById: getProjectByIdFromContext,
    getCollaborationById: (id: string) => collaborations.find(c => c.id === id),
  };
};
