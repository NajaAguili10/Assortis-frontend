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
