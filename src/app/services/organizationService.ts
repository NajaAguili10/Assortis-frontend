import { apiClient } from '../api/apiClient';
import { Organization } from '../types/organization.dto';

export const organizationService = {

  getAllOrganizations(): Promise<Organization[]> {
    return apiClient.get<Organization[]>('/organizations');
  },
  getKPIs: async () => {
    return apiClient.get('/organizations/kpis');
  },
  getFilters: async () => {
    return apiClient.get('/organizations/filters');
  },
  getSectors: async () => {
    return apiClient.get('/sectors');
  },
  getSubSectors: async () => {
    return apiClient.get('/sectors/subsectors');
  },
  getRegions: async () => {
    return apiClient.get('/regions');
  },
  getCountries: async () => {
    return apiClient.get('/countries');
  },
  getOrganizationTypes: async () => {
    return apiClient.get('/organization-types');
  },
  getSavedSearches: async (userId: number) => {
    return apiClient.get(`/organizations/saved-searches/${userId}`);
  },
  saveSearch: async (userId: number, name: string, payload: any) => {
    return apiClient.post(`/organizations/saved-searches/${userId}?name=${encodeURIComponent(name)}`, payload);
  },
  deleteSavedSearch: async (id: number) => {
    return apiClient.delete(`/organizations/saved-searches/${id}`);
  }
};
