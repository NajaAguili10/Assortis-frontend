import { apiClient } from '../api/apiClient';

export interface OrganizationInvitationApiDTO {
  id: number;
  direction: 'received' | 'sent';
  from: string;
  to: string;
  invitationType: 'partnership' | 'consortium' | 'collaboration' | 'team' | 'consultant' | 'advisor';
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  subject: string;
  message?: string | null;
  inviteeExpertId?: number | null;
  inviteeUserId?: number | null;
  inviteeEmail?: string | null;
  sentDate?: string | null;
  expiryDate?: string | null;
}

export interface OrganizationInvitationStatsApiDTO {
  received: number;
  sent: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
  total: number;
}

export const organizationInvitationService = {
  getCurrentOrganizationInvitations: () =>
    apiClient.get<OrganizationInvitationApiDTO[]>('/organization-invitations'),

  getCurrentOrganizationStats: () =>
    apiClient.get<OrganizationInvitationStatsApiDTO>('/organization-invitations/stats'),

  acceptInvitation: (invitationId: string | number) =>
    apiClient.post<OrganizationInvitationApiDTO>(`/organization-invitations/${invitationId}/accept`, {}),

  rejectInvitation: (invitationId: string | number, rejectionJustification: string) =>
    apiClient.post<OrganizationInvitationApiDTO>(`/organization-invitations/${invitationId}/reject`, {
      rejectionJustification,
    }),

  deleteInvitation: (invitationId: string | number) =>
    apiClient.delete(`/organization-invitations/${invitationId}`),
};
