import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token from localStorage if available (dual-mode auth)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reservex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage if token expired
      if (localStorage.getItem('reservex_token')) {
        localStorage.removeItem('reservex_token');
        localStorage.removeItem('reservex_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
