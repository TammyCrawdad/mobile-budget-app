import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (email: string, password: string, name: string) =>
    api.post('/api/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
};

export interface SearchParams {
  searchTerm?: string;
  categoryId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Helper to remove undefined values from params
function cleanParams(params: any): SearchParams {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  );
}

export const transactionAPI = {
  search: (params: SearchParams) => {
    const cleanedParams = cleanParams(params);
    console.log('[API] Calling search with params:', cleanedParams);
    return api.post('/api/transactions/search', cleanedParams);
  },
  getAll: () => api.get('/api/transactions'),
  create: (data: any) => api.post('/api/transactions', data),
  getCategories: () => api.get('/api/transactions/categories'),
};

export default api;
