import axios from 'axios';
import { apiClient } from '../api/apiClient';
import { CountryDTO, ExpertDTO } from '../modules/expert/hooks/useExperts';




export const countryService = {
  getAllCountries: async (): Promise<CountryDTO[]> => {
    const response = await apiClient.get<CountryDTO[]>('/countries');
    return response;
  },
};
