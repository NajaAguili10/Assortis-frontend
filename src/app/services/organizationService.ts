import { apiClient } from '../api/apiClient';

export const organizationService = {
  getAllOrganizations: async () => {
    return apiClient.get('/organizations');
  },
  getKPIs: async () => {
    return apiClient.get('/organizations/kpis');
  }
};
