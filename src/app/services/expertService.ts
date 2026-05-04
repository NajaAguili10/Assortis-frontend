import axios from 'axios';
import { apiClient } from '../api/apiClient';
import { ExpertDTO } from '../modules/expert/hooks/useExperts';




export const expertService = {
  getAllExperts: async (): Promise<ExpertDTO[]> => {
    const response = await apiClient.get<ExpertDTO[]>('/experts');
    return response;
  },
};
