import { apiClient } from '../api/apiClient';
import { SectorDTO, SubsectorDTO } from '../types/organization.dto';

export const sectorService = {
  getAllSectors: async (): Promise<SectorDTO[]> => {
    try {
      const response = await apiClient.get<SectorDTO[]>('/sectors');
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching sectors:', error);
      return [];
    }
  },

  getSubsectorsBySectorId: async (sectorId: number): Promise<SubsectorDTO[]> => {
    try {
      const response = await apiClient.get<SubsectorDTO[]>(`/sectors/${sectorId}/subsectors`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching subsectors for sector ${sectorId}:`, error);
      return [];
    }
  }
};
