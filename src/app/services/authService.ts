import { apiClient } from '@app/api/apiClient';
import { API_BASE_URL } from '@app/config/api.config';

export { API_BASE_URL };

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  roles: string[];
  permissions?: string[];
  organizationId?: number;
}

export interface ConnectedOrganizationResponse {
  userId: number;
  userEmail: string;
  organizationId: number;
  organizationName: string;
  organizationLegalName: string;
  organizationType: string;
  logoUrl: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  organizationActive: boolean;
  organizationValidated: boolean;
  membershipRole: string;
  isAdmin: boolean;
  department: string;
  membershipStatus: string;
  joinedAt: string;
}

export const getAuthToken = () => localStorage.getItem('assortis_token');

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>('/auth/login', data);
};

export const saveAuthData = (authData: LoginResponse) => {
  localStorage.setItem('assortis_auth_response', JSON.stringify(authData));
  localStorage.setItem('assortis_token', authData.token);
  localStorage.setItem('assortis_user_id', String(authData.id));
  localStorage.setItem('assortis_email', authData.email);
  localStorage.setItem('assortis_roles', JSON.stringify(authData.roles || []));
  localStorage.setItem('assortis_permissions', JSON.stringify(authData.permissions || []));
  localStorage.removeItem('assortis_connected_organization');
  localStorage.removeItem('assortis_current_organization_id');
};

export const clearAuthData = () => {
  localStorage.removeItem('assortis_auth_response');
  localStorage.removeItem('assortis_token');
  localStorage.removeItem('assortis_user_id');
  localStorage.removeItem('assortis_email');
  localStorage.removeItem('assortis_roles');
  localStorage.removeItem('assortis_permissions');
  localStorage.removeItem('assortis_user');
  localStorage.removeItem('assortis_current_user');
  localStorage.removeItem('assortis_connected_organization');
  localStorage.removeItem('assortis_current_organization_id');
  localStorage.removeItem('assortis_active_organization_profile');
};

export const getConnectedOrganizationApi = async (): Promise<ConnectedOrganizationResponse> => {
  const response = await fetch(`${API_BASE_URL}/profile/organization`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || 'Unable to load connected organization');
  }

  return response.json();
};

export const saveConnectedOrganization = (organization: ConnectedOrganizationResponse) => {
  localStorage.setItem('assortis_connected_organization', JSON.stringify(organization));
  localStorage.setItem('assortis_current_organization_id', String(organization.organizationId));
};

export const getStoredConnectedOrganization = (): ConnectedOrganizationResponse | null => {
  const raw = localStorage.getItem('assortis_connected_organization');

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const resolveCurrentOrganizationId = async (): Promise<number> => {
  try {
    const connectedOrganization = await getConnectedOrganizationApi();
    saveConnectedOrganization(connectedOrganization);

    return connectedOrganization.organizationId;
  } catch (error) {
    const storedOrganization = getStoredConnectedOrganization();

    if (storedOrganization?.organizationId) {
      return storedOrganization.organizationId;
    }

    const storedOrganizationId = localStorage.getItem('assortis_current_organization_id');

    if (storedOrganizationId) {
      return Number(storedOrganizationId);
    }

    throw error;
  }
};

export const authService = {
  login: async (emailOrData: string | LoginRequest, password?: string): Promise<LoginResponse> => {
    const data = typeof emailOrData === 'string'
      ? { email: emailOrData, password: password || '' }
      : emailOrData;

    return loginApi(data);
  },

  demoLogin: async (accountType: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/demo-login', { accountType });
  },

  register: async (formData: any): Promise<any> => {
    return apiClient.post('/auth/register', formData);
  },

  sendVerification: async (email: string): Promise<any> => {
    return apiClient.post('/auth/send-verification', { email });
  },

  verifyEmail: async (email: string, code: string): Promise<any> => {
    return apiClient.post('/auth/verify-email', { email, code });
  },

  forgotPassword: async (email: string): Promise<any> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  logout: clearAuthData,

  getToken: getAuthToken,

  getUser: () => {
    const user = localStorage.getItem('assortis_user');
    return user ? JSON.parse(user) : null;
  },
};
