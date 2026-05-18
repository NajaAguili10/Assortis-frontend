import { apiClient } from '../api/apiClient';
import { ProjectFiltersDTO, ProjectListDTO } from '../types/project.dto';

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

  getProjectById: async (id: string | number) => {
    return apiClient.get(`/projects/${id}`);
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
  }
};
