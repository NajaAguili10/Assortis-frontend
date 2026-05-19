import { useState, useMemo, useEffect, useCallback } from 'react';
import { useProjectsContext } from '../contexts/ProjectsContext';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import {
  ProjectListDTO,
  TaskDTO,
  CollaborationDTO,
  ProjectTemplateDTO,
  ProjectKPIsDTO,
  TaskKPIsDTO,
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
const todayIso = () => new Date().toISOString().split('T')[0];
const asArray = <T,>(value: T[] | undefined | null): T[] => Array.isArray(value) ? value : [];
const getBudgetValue = (project: ProjectListDTO, key: 'total' | 'spent' | 'remaining' = 'total') => {
  const budget = (project as any).budget;
  if (typeof budget === 'number') return key === 'total' ? budget : 0;
  return Number(budget?.[key] ?? 0);
};
const getBudgetCurrency = (project: ProjectListDTO) => {
  const budget = (project as any).budget;
  return typeof budget === 'object' && budget?.currency ? budget.currency : 'USD';
};
const getCompletion = (project: ProjectListDTO) => Number((project as any).timeline?.completionPercentage ?? 0);
const getEndDate = (project: ProjectListDTO) => (project as any).timeline?.endDate || todayIso();
const getCreatedDate = (project: ProjectListDTO) => (project as any).createdDate || (project as any).updatedDate || todayIso();
const getCodeValue = (value: unknown) => {
  if (value && typeof value === 'object') {
    const record = value as { code?: string; name?: string };
    return record.code || record.name || '';
  }
  return String(value ?? '');
};

const normalizeProject = (project: ProjectListDTO): ProjectListDTO => {
  const budgetTotal = getBudgetValue(project, 'total');
  const budgetSpent = getBudgetValue(project, 'spent');
  const timeline = (project as any).timeline || {};

  return {
    ...project,
    id: String((project as any).id ?? ''),
    code: (project as any).code || (project as any).referenceCode || '',
    title: project.title || 'Untitled project',
    description: project.description || '',
    status: project.status || ProjectStatusEnum.ACTIVE,
    priority: project.priority || ProjectPriorityEnum.MEDIUM,
    type: project.type || ProjectTypeEnum.DEVELOPMENT,
    country: (project as any).country || '',
    region: (project as any).region || RegionEnum.EUROPE,
    sector: (project as any).sector || ProjectSectorEnum.OTHER,
    subsectors: asArray((project as any).subsectors),
    budget: {
      total: budgetTotal,
      spent: budgetSpent,
      remaining: getBudgetValue(project, 'remaining') || Math.max(0, budgetTotal - budgetSpent),
      currency: getBudgetCurrency(project),
    } as any,
    timeline: {
      startDate: timeline.startDate || getCreatedDate(project),
      endDate: timeline.endDate || getCreatedDate(project),
      duration: Number(timeline.duration ?? 0),
      completionPercentage: Number(timeline.completionPercentage ?? 0),
    },
    leadOrganization: project.leadOrganization || '',
    partners: asArray(project.partners),
    teamSize: Number(project.teamSize ?? 0),
    tasksCompleted: Number(project.tasksCompleted ?? 0),
    totalTasks: Number(project.totalTasks ?? 0),
    createdDate: getCreatedDate(project),
    updatedDate: (project as any).updatedDate || getCreatedDate(project),
  } as ProjectListDTO;
};

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
  const [taskKPIs, setTaskKPIs] = useState<TaskKPIsDTO>({
    todo: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    total: 0,
  });



useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await projectService.getAllProjects();
      setAllProjects(Array.isArray(response) ? response.map(normalizeProject) : []);
    } catch (error) {
      setAllProjects([]);
      console.error("Error fetching projects:", error);
    }
  };

  fetchData();
}, []);

useEffect(() => {
  const fetchTaskKPIs = async () => {
    try {
      const response = await taskService.getTaskKPIs();
      setTaskKPIs(response);
    } catch (error) {
      setTaskKPIs({ todo: 0, inProgress: 0, review: 0, completed: 0, total: 0 });
      console.error('Error fetching task KPIs from backend:', error);
    }
  };

  fetchTaskKPIs();
}, []);

  // CURRENT_USER_ID is the mock logged-in user
  const CURRENT_USER_ID = 'user-1';

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setProjectsError(null);
    try {
      // Spring uses 0-based indexing for pages
      const response = await projectService.getProjects(filters, sortBy, currentPage - 1, pageSize);
      if (response && Array.isArray(response.data)) {
        setProjectsData({
          ...response,
          data: response.data.map(normalizeProject),
        });
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
    const totalBudget = allProjects.reduce((sum, p) => sum + getBudgetValue(p, 'total'), 0);
    const budgetSpent = allProjects.reduce((sum, p) => sum + getBudgetValue(p, 'spent'), 0);
    const avgCompletion = allProjects.length > 0
      ? allProjects.reduce((sum, p) => sum + getCompletion(p), 0) / allProjects.length
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
  }, [allProjects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = asArray(contextProjects).map(normalizeProject);

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
      filtered = filtered.filter((project) => filters.sector!.includes(getCodeValue(project.sector) as ProjectSectorEnum));
    }

    if (filters.subsector && filters.subsector.length > 0) {
      filtered = filtered.filter((project) =>
        asArray((project as any).subsectors).some((sub) => filters.subsector!.includes((sub as any).code || (sub as any).name || sub as any))
      );
    }

    if (filters.region && filters.region.length > 0) {
      filtered = filtered.filter((project) => filters.region!.includes(getCodeValue(project.region)));
    }

    if (filters.minBudget !== undefined) {
      filtered = filtered.filter((project) => getBudgetValue(project, 'total') >= filters.minBudget!);
    }

    if (filters.maxBudget !== undefined) {
      filtered = filtered.filter((project) => getBudgetValue(project, 'total') <= filters.maxBudget!);
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
        filtered.sort((a, b) => (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99));
        break;
      case 'budget':
        filtered.sort((a, b) => getBudgetValue(b, 'total') - getBudgetValue(a, 'total'));
        break;
      case 'completion':
        filtered.sort((a, b) => getCompletion(b) - getCompletion(a));
        break;
      case 'name':
        filtered.sort((a, b) => String(a.title ?? '').localeCompare(String(b.title ?? '')));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(getCreatedDate(b)).getTime() - new Date(getCreatedDate(a)).getTime());
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
    taskKPIs,
    collaborations,
    templates,
    allProjects,
    filteredProjects,
    getProjectById: getProjectByIdFromContext,
    getCollaborationById: (id: string) => collaborations.find(c => c.id === id),
  };
};
