const BASE_URL = "http://localhost:8082/api"

const getHeaders = () => {
  const token = localStorage.getItem('assortis_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
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
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }

    return response.json();
  },

  delete: async (endpoint: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (e) {}
      const err: any = new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      err.response = { data: errorData };
      throw err;
    }
  },
};
