import { apiClient } from '../api/apiClient';
import { 
  TenderListDTO, 
  TenderKPIsDTO, 
  PaginatedResponseDTO, 
  TenderFilters,
  DonorDTO
} from '../types/tender.dto';

export const tenderService = {
  searchTenders: async (filters: TenderFilters, sortBy: string, page: number, size: number): Promise<PaginatedResponseDTO<TenderListDTO>> => {
    const params: any = {
      sortBy,
      page,
      size,
    };

    if (filters.searchQuery) params.searchQuery = filters.searchQuery;
    if (filters.status && filters.status.length > 0) params.status = filters.status.join(',');
    if (filters.sectors && filters.sectors.length > 0) params.sectors = filters.sectors.join(',');
    if (filters.countries && filters.countries.length > 0) params.countries = filters.countries.join(',');
    if (filters.minBudget) params.minBudget = filters.minBudget;
    if (filters.maxBudget) params.maxBudget = filters.maxBudget;
    if (filters.publishedFrom) params.publishedFrom = filters.publishedFrom.toISOString().split('T')[0];
    if (filters.publishedTo) params.publishedTo = filters.publishedTo.toISOString().split('T')[0];
    
    return apiClient.get<PaginatedResponseDTO<TenderListDTO>>('/tenders/search', params);
  },

  getKPIs: async (organizationId?: string): Promise<TenderKPIsDTO> => {
    return apiClient.get<TenderKPIsDTO>('/tenders/kpis', { organizationId });
  },

  getAllTenders: async (): Promise<TenderListDTO[]> => {
    return apiClient.get<TenderListDTO[]>('/tenders/all');
  },

  getAllDonors: async (): Promise<DonorDTO[]> => {
    return apiClient.get<DonorDTO[]>('/donors');
  },

  getTenderById: async (id: string | number): Promise<TenderListDTO> => {
    return apiClient.get<TenderListDTO>(`/tenders/${id}`);
  },

  discardTender: async (id: string | number, organizationId?: string | number): Promise<any> => {
    const url = organizationId ? `/tenders/${id}/discard?organizationId=${organizationId}` : `/tenders/${id}/discard`;
    return apiClient.post<any>(url, null);
  },

  restoreTender: async (id: string | number, organizationId?: string | number): Promise<any> => {
    const url = organizationId ? `/tenders/${id}/restore?organizationId=${organizationId}` : `/tenders/${id}/restore`;
    return apiClient.post<any>(url, null);
  },

  getDiscardedTenders: async (organizationId?: string | number): Promise<number[]> => {
    return apiClient.get<number[]>('/tenders/discarded', organizationId ? { organizationId } : undefined);
  }
};

