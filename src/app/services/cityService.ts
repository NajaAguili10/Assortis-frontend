import { apiClient } from '../api/apiClient';

export type CityDTO = {
  id: number | string;
  name: string;
  countryId?: number | string | null;
  countryName?: string | null;
  countryCode?: string | null;
};

export const cityService = {
  getCities: async (country?: string): Promise<CityDTO[]> => {
    return apiClient.get<CityDTO[]>('/cities', country ? { country } : undefined);
  },
};
