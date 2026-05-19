import { API_BASE_URL } from '@app/config/api.config';

const getHeaders = (includeAuth = true) => {
  const token = localStorage.getItem('assortis_token');
  return {
    'Content-Type': 'application/json',
    ...(includeAuth && token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const getPostHeaders = (endpoint: string) => {
  const publicAuthEndpoints = ['/auth/login', '/auth/demo-login', '/auth/register', '/auth/send-verification', '/auth/verify-email', '/auth/forgot-password', '/auth/reset-password'];
  return getHeaders(!publicAuthEndpoints.includes(endpoint));
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('assortis_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  get: async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}

      if (response.status === 401) {
        // Handle unauthorized access (e.g., token expired)
        localStorage.removeItem('assortis_token');
        localStorage.removeItem('assortis_user');
        window.location.href = '/login';
      }
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }

    return response.json();
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getPostHeaders(endpoint),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}

      if (response.status === 401 && endpoint !== '/auth/login') {
        localStorage.removeItem('assortis_token');
        localStorage.removeItem('assortis_user');
        window.location.href = '/login';
      }
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }

    return response.json();
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      if (response.status === 401) {
        localStorage.removeItem('assortis_token');
        localStorage.removeItem('assortis_user');
        window.location.href = '/login';
      }
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }

    return response.json();
  },

  patch: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      if (response.status === 401) {
        localStorage.removeItem('assortis_token');
        localStorage.removeItem('assortis_user');
        window.location.href = '/login';
      }
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }

    return response.json();
  },

  delete: async (endpoint: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      if (response.status === 401) {
        localStorage.removeItem('assortis_token');
        localStorage.removeItem('assortis_user');
        window.location.href = '/login';
      }
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }
  },
};
