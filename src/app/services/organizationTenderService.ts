import { apiClient } from '@app/api/apiClient';

export interface TenderQuickCreatePayload {
  title: string;
  description: string;
  sector: string;
  subSector: string;
  country: string;
  donorClient: string;
  budget?: number;
  deadline: string;
}

export interface OrganizationTenderItem extends TenderQuickCreatePayload {
  id: string;
  subSectorLabel?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'AWARDED' | 'CANCELLED';
}

type BackendOrganizationTender = {
  id: number | string;
  title: string;
  description: string;
  sector: string;
  subSector?: string | null;
  subSectorLabel?: string | null;
  country: string;
  donorClient: string;
  budget?: number | null;
  deadline: string;
  status?: string | null;
  createdAt: string;
  updatedAt?: string | null;
};

const normalizeTender = (item: BackendOrganizationTender): OrganizationTenderItem => ({
  id: String(item.id),
  title: item.title || '',
  description: item.description || '',
  sector: item.sector || '',
  subSector: item.subSector || '',
  subSectorLabel: item.subSectorLabel || undefined,
  country: item.country || '',
  donorClient: item.donorClient || '',
  budget: typeof item.budget === 'number' ? item.budget : undefined,
  deadline: item.deadline,
  status: (item.status || 'DRAFT') as OrganizationTenderItem['status'],
  createdAt: item.createdAt,
  updatedAt: item.updatedAt || undefined,
});

export const organizationTenderService = {
  getCurrentOrganizationTenders: async () => {
    const response = await apiClient.get<BackendOrganizationTender[]>('/tenders/current');
    return Array.isArray(response) ? response.map(normalizeTender) : [];
  },

  getCurrentOrganizationTender: async (id: string) => {
    const response = await apiClient.get<BackendOrganizationTender>(`/tenders/current/${id}`);
    return normalizeTender(response);
  },

  createCurrentOrganizationTender: async (payload: TenderQuickCreatePayload) => {
    const response = await apiClient.post<BackendOrganizationTender>('/tenders/current', payload);
    return normalizeTender(response);
  },

  updateCurrentOrganizationTender: async (id: string, payload: TenderQuickCreatePayload) => {
    const response = await apiClient.put<BackendOrganizationTender>(`/tenders/current/${id}`, payload);
    return normalizeTender(response);
  },

  deleteCurrentOrganizationTender: async (id: string) => {
    await apiClient.delete(`/tenders/current/${id}`);
  },
};
