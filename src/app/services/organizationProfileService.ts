import { apiClient } from '@app/api/apiClient';

export type OrganizationProfileStatus = 'active' | 'inactive';

export interface OrganizationProfile {
  id: string;
  organizationId?: string | number;
  fullName: string;
  email: string;
  status: OrganizationProfileStatus;
  savedSearchCount?: number;
  alertCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationProfilePayload {
  fullName: string;
  email: string;
  status?: OrganizationProfileStatus;
}

const STORAGE_KEY = 'assortis.organizationProfiles.fallback.v1';

const normalizeProfile = (value: any): OrganizationProfile => ({
  id: String(value.id),
  organizationId: value.organizationId ?? value.organization_id,
  fullName: value.fullName ?? value.full_name ?? value.name ?? '',
  email: value.email ?? '',
  status: (value.status ?? 'active') === 'inactive' ? 'inactive' : 'active',
  savedSearchCount: Number(value.savedSearchCount ?? value.saved_search_count ?? 0),
  alertCount: Number(value.alertCount ?? value.alert_count ?? 0),
  createdAt: value.createdAt ?? value.created_at,
  updatedAt: value.updatedAt ?? value.updated_at,
});

const readFallbackProfiles = (): OrganizationProfile[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeProfile) : [];
  } catch {
    return [];
  }
};

const writeFallbackProfiles = (profiles: OrganizationProfile[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

const unwrapList = (response: any) => Array.isArray(response) ? response : response?.data ?? [];
const unwrapOne = (response: any) => response?.data ?? response;

export const organizationProfileService = {
  async list(): Promise<OrganizationProfile[]> {
    try {
      const response = await apiClient.get<OrganizationProfile[] | { data?: OrganizationProfile[] }>('/organization-profiles');
      return unwrapList(response).map(normalizeProfile);
    } catch (error) {
      console.warn('Falling back to local organization profiles:', error);
      return readFallbackProfiles();
    }
  },

  async create(payload: OrganizationProfilePayload): Promise<OrganizationProfile> {
    try {
      const response = await apiClient.post<OrganizationProfile | { data?: OrganizationProfile }>('/organization-profiles', payload);
      return normalizeProfile(unwrapOne(response));
    } catch (error) {
      console.warn('Creating local fallback organization profile:', error);
      const now = new Date().toISOString();
      const profile = normalizeProfile({
        ...payload,
        id: `org-profile-${Date.now()}`,
        status: payload.status ?? 'active',
        createdAt: now,
        updatedAt: now,
      });
      writeFallbackProfiles([profile, ...readFallbackProfiles()]);
      return profile;
    }
  },

  async update(id: string, payload: OrganizationProfilePayload): Promise<OrganizationProfile> {
    try {
      const response = await apiClient.put<OrganizationProfile | { data?: OrganizationProfile }>(`/organization-profiles/${encodeURIComponent(id)}`, payload);
      return normalizeProfile(unwrapOne(response));
    } catch (error) {
      console.warn('Updating local fallback organization profile:', error);
      const next = readFallbackProfiles().map((profile) => (
        profile.id === id
          ? { ...profile, ...payload, status: payload.status ?? profile.status, updatedAt: new Date().toISOString() }
          : profile
      ));
      writeFallbackProfiles(next);
      return next.find((profile) => profile.id === id)!;
    }
  },

  async setStatus(id: string, status: OrganizationProfileStatus): Promise<OrganizationProfile> {
    try {
      const response = await apiClient.patch<OrganizationProfile | { data?: OrganizationProfile }>(
        `/organization-profiles/${encodeURIComponent(id)}/status`,
        { status },
      );
      return normalizeProfile(unwrapOne(response));
    } catch (error) {
      console.warn('Updating local fallback organization profile status:', error);
      const next = readFallbackProfiles().map((profile) => (
        profile.id === id ? { ...profile, status, updatedAt: new Date().toISOString() } : profile
      ));
      writeFallbackProfiles(next);
      return next.find((profile) => profile.id === id)!;
    }
  },

  async clearData(id: string): Promise<void> {
    try {
      await apiClient.post(`/organization-profiles/${encodeURIComponent(id)}/clear-data`, {});
    } catch (error) {
      console.warn('Clearing local fallback organization profile data:', error);
      const next = readFallbackProfiles().map((profile) => (
        profile.id === id ? { ...profile, savedSearchCount: 0, alertCount: 0, updatedAt: new Date().toISOString() } : profile
      ));
      writeFallbackProfiles(next);
    }
  },

  async remove(id: string): Promise<void> {
    try {
      await apiClient.delete(`/organization-profiles/${encodeURIComponent(id)}`);
    } catch (error) {
      console.warn('Deleting local fallback organization profile:', error);
      writeFallbackProfiles(readFallbackProfiles().filter((profile) => profile.id !== id));
    }
  },

  async access(id: string): Promise<OrganizationProfile> {
    try {
      const response = await apiClient.post<OrganizationProfile | { data?: OrganizationProfile }>(
        `/organization-profiles/${encodeURIComponent(id)}/access`,
        {},
      );
      return normalizeProfile(unwrapOne(response));
    } catch (error) {
      console.warn('Accessing local fallback organization profile:', error);
      const profile = readFallbackProfiles().find((item) => item.id === id);
      if (!profile) throw error;
      return profile;
    }
  },
};
