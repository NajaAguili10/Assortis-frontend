import axios from 'axios';
import { apiClient } from '../api/apiClient';
import { ExpertDTO } from '../modules/expert/hooks/useExperts';




export const expertService = {
  getAllExperts: async (): Promise<ExpertDTO[]> => {
    const response = await apiClient.get<ExpertDTO[]>('/experts');
    return response;
  },
  getExpertsByOrganizationId: async (orgId: number | string): Promise<ExpertDTO[]> => {
    const response = await apiClient.get<ExpertDTO[]>(`/experts/organization/${orgId}`);
    return response;
  },
  getSavedSearches: async (userId: number | string) => {
    return apiClient.get<any[]>(`/experts/saved-searches/${userId}`);
  },
  saveSearch: async (userId: number | string, name: string, criteria: any) => {
    return apiClient.post<any>(`/experts/saved-searches/${userId}?name=${encodeURIComponent(name)}`, criteria);
  },
  deleteSavedSearch: async (id: string | number) => {
    return apiClient.delete(`/experts/saved-searches/${id}`);
  }
};
