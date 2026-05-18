import { apiClient } from '../api/apiClient';

export interface OrganizationMatchingDossierDTO {
  id: number;
  organizationId: number;
  createdByUserId: number;
  name: string;
  avgScore: number;
  totalOrganizations: number;
  results: any[];
  filters?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMatchingDossierPayload {
  name: string;
  avgScore: number;
  totalOrganizations: number;
  results: any[];
  filters?: Record<string, any> | null;
}

export interface OrganizationMatchingStatsDTO {
  available: number;
  highMatches: number;
  avgScore: number;
  totalSaved: number;
  thisMonth: number;
  dossierHighMatches: number;
}

export const organizationMatchingDossierService = {
  getDossiers: () =>
    apiClient.get<OrganizationMatchingDossierDTO[]>('/organization-matching-dossiers'),

  getStats: () =>
    apiClient.get<OrganizationMatchingStatsDTO>('/organization-matching-dossiers/stats'),

  getDossier: (id: string | number) =>
    apiClient.get<OrganizationMatchingDossierDTO>(`/organization-matching-dossiers/${id}`),

  createDossier: (payload: OrganizationMatchingDossierPayload) =>
    apiClient.post<OrganizationMatchingDossierDTO>('/organization-matching-dossiers', payload),

  updateDossier: (id: string | number, payload: OrganizationMatchingDossierPayload) =>
    apiClient.put<OrganizationMatchingDossierDTO>(`/organization-matching-dossiers/${id}`, payload),

  deleteDossier: (id: string | number) =>
    apiClient.delete(`/organization-matching-dossiers/${id}`),
};
