import apiClient from './client';

export const authApi = {
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: async () => {
    localStorage.removeItem('reservex_token');
    localStorage.removeItem('reservex_user');
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors when clearing session cookie locally
    }
  }
};
