import { apiClient } from '../api/apiClient';
import { CountryDTO } from '../types/organization.dto';
import { ProjectDetailDTO, ProjectFiltersDTO, ProjectListDTO, RegionDTO, SectorDTO } from '../types/project.dto';

export interface CreateProjectPayload {
  /** Required */
  title: string;
  /** Optional */
  referenceCode?: string;
  description?: string;
  /** e.g. "DEVELOPMENT" | "INFRASTRUCTURE" | "CAPACITY_BUILDING" | "RESEARCH" | "TECHNICAL_ASSISTANCE" | "HUMANITARIAN" | "PILOT" | "PROGRAM" */
  type?: string;
  /** e.g. "ACTIVE" | "DRAFT" | "PLANNING" */
  status?: string;
  /** e.g. "LOW" | "MEDIUM" | "HIGH" | "URGENT" */
  priority?: string;
  /** e.g. "LOCAL" | "NATIONAL" | "REGIONAL" | "INTERNATIONAL" */
  scope?: string;
  region?: string;
  /** Country code or name */
  country?: string;
  city?: string;
  /** Sector code */
  sector?: string;
  budget?: number;
  currency?: string;
  fundingType?: string;
  /** ISO date string e.g. "2025-01-15" */
  startDate?: string;
  endDate?: string;
  donorId?: number;
}

export const projectService = {

  getAllProjects: async (): Promise<ProjectListDTO[]> => {
    return await apiClient.get<ProjectListDTO[]>('/projects/all');
  },

  getPaginatedProjects: async (page: number = 0, size: number = 10) => {
    return apiClient.get('/projects', { page, size });
  },

  getProjects: async (filters: ProjectFiltersDTO = {}, sortBy: string = 'newest', page: number = 0, size: number = 10) => {
    const params: any = {
      sortBy,
      page,
      size,
    };

    if (filters.searchQuery) params.searchQuery = filters.searchQuery;
    if (filters.status && filters.status.length > 0) params.status = filters.status.join(',');
    if (filters.priority && filters.priority.length > 0) params.priority = filters.priority.join(',');
    if (filters.type && filters.type.length > 0) params.type = filters.type.join(',');
    if (filters.sector && filters.sector.length > 0) params.sector = filters.sector.join(',');
    if (filters.subsector && filters.subsector.length > 0) params.subsector = filters.subsector.join(',');
    if (filters.region && filters.region.length > 0) params.region = filters.region.join(',');
    if (filters.minBudget !== undefined) params.minBudget = filters.minBudget;
    if (filters.maxBudget !== undefined) params.maxBudget = filters.maxBudget;
    if (filters.notIncludedInMembershipSubscription !== undefined) {
      params.notIncludedInMembershipSubscription = filters.notIncludedInMembershipSubscription;
    }

    return apiClient.get<PaginatedResponseDTO<ProjectListDTO>>('/projects', params);
  },

  getProjectById: async (id: string | number): Promise<ProjectDetailDTO> => {
    return apiClient.get<ProjectDetailDTO>(`/projects/${id}`);
  },

  getCountries: async (): Promise<CountryDTO[]> => {
    return apiClient.get('/countries');
  },

  getRegions: async (): Promise<RegionDTO[]> => {
    return apiClient.get('/regions');
  },

  getSectors: async (): Promise<SectorDTO[]> => {
    return apiClient.get('/sectors');
  },

  createProject: async (payload: CreateProjectPayload) => {
    return apiClient.post('/projects', payload);
  },

  updateProject: async (id: string | number, payload: CreateProjectPayload) => {
    return apiClient.put(`/projects/${id}`, payload);
  },

  getKPIs: async () => {
    return apiClient.get('/projects/kpis');
  },
  getSavedSearches: async (userId: number) => {
    return apiClient.get(`/projects/saved-searches/${userId}`, { _t: Date.now() });
  },
  saveSearch: async (userId: number, name: string, payload: any) => {
    return apiClient.post(`/projects/saved-searches/${userId}?name=${encodeURIComponent(name)}`, payload);
  },
  updateSavedSearch: async (id: number, name: string, payload: any) => {
    return apiClient.put(`/projects/saved-searches/${id}?name=${encodeURIComponent(name)}`, payload);
  },
  deleteSavedSearch: async (id: number) => {
    return apiClient.delete(`/projects/saved-searches/${id}`);
  },
  deleteProject: async (id: string | number) => {
    return apiClient.delete(`/projects/${id}`);
  },
  restoreProject: async (id: string | number) => {
    return apiClient.put(`/projects/${id}/restore`);
  }
};

