import { API_BASE_URL } from '@app/config/api.config';

const getHeaders = (includeAuth = true) => {
  const token = localStorage.getItem('assortis_token');
  return {
    'Content-Type': 'application/json',
    ...(includeAuth && token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const getPostHeaders = (endpoint: string) => {
  return getHeaders(!isPublicAuthEndpoint(endpoint));
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('assortis_token');

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const publicAuthEndpoints = [
  '/auth/login',
  '/auth/demo-login',
  '/auth/register',
  '/auth/send-verification',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const isPublicAuthEndpoint = (endpoint: string) => publicAuthEndpoints.includes(endpoint);

const notifyAuthRejected = (endpoint: string, status: number) => {
  if (status !== 401 || isPublicAuthEndpoint(endpoint)) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('assortis:auth-rejected', {
      detail: { endpoint, status },
    }),
  );
};

const throwApiError = async (response: Response, endpoint: string): Promise<never> => {
  let errorData: any = {};
  try {
    errorData = await response.json();
  } catch (e) {}

  notifyAuthRejected(endpoint, response.status);

  const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
  err.response = { status: response.status, data: errorData };
  throw err;
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
      await throwApiError(response, endpoint);
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
      await throwApiError(response, endpoint);
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
      await throwApiError(response, endpoint);
    }

    // Handle 204 No Content and other empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
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
      await throwApiError(response, endpoint);
    }

    // Handle 204 No Content and other empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return response.json();
  },

  delete: async (endpoint: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      await throwApiError(response, endpoint);
    }
  },
};
