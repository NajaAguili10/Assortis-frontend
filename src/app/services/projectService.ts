import { apiClient } from '../api/apiClient';

export const projectService = {
  getAllProjects: async () => {
    return apiClient.get('/projects');
  },

  getPaginatedProjects: async () => {
    return apiClient.get('/projects');
  },

  getProjectById: async (id: string | number) => {
    return apiClient.get(`/projects/${id}`);
  },

  getKPIs: async () => {
    return apiClient.get('/projects/kpis');
  }
};
