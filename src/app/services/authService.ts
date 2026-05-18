import { apiClient } from '@app/api/apiClient';

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
  organizationId?: number;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
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

  logout: () => {
    localStorage.removeItem('assortis_token');
    localStorage.removeItem('assortis_user');
  },

  getToken: () => {
    return localStorage.getItem('assortis_token');
  },

  getUser: () => {
    const user = localStorage.getItem('assortis_user');
    return user ? JSON.parse(user) : null;
  }
};
