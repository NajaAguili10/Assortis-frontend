import { apiClient } from '@app/api/apiClient';

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  roles: string[];
  permissions: string[];
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
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
