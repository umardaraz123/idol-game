import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if user is already authenticated (not on login page)
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem('adminToken');
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  logout: () => api.post('/auth/logout'),
  
  getProfile: () => api.get('/auth/profile'),
};

// Content API
export const contentAPI = {
  getAll: (params?: any) => api.get('/content', { params }),
  
  getById: (id: string) => api.get(`/content/${id}`),
  
  create: (data: any) => api.post('/content', data),
  
  update: (id: string, data: any) => api.put(`/content/${id}`, data),
  
  delete: (id: string) => api.delete(`/content/${id}`),
};

// Admin API (combined for admin panel)
export const adminAPI = {
  // Content operations
  getContent: (params?: any) => api.get('/content', { params }),
  getContentById: (id: string) => api.get(`/content/${id}`),
  createContent: (data: any) => api.post('/content', data),
  updateContent: (id: string, data: any) => api.put(`/content/${id}`, data),
  deleteContent: (id: string) => api.delete(`/content/${id}`),
  
  // Media operations
  uploadMedia: (formData: FormData) => api.post('/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMedia: (params?: any) => api.get('/upload/files', { params }),
  deleteMedia: (id: string) => api.delete(`/upload/${id}`),
  
  // Query operations
  getQueries: (params?: any) => api.get('/queries', { params }),
  getQueryById: (id: string) => api.get(`/queries/${id}`),
  updateQueryStatus: (id: string, status: string) => api.patch(`/queries/${id}`, { status }),
  deleteQuery: (id: string) => api.delete(`/queries/${id}`),
};

// Media API
export const mediaAPI = {
  getAll: (params?: any) => api.get('/upload/files', { params }),
  
  upload: (formData: FormData, onProgress?: (progress: number) => void) => 
    api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }),
  
  delete: (id: string) => api.delete(`/upload/${id}`),
};

// Public API (for frontend)
export const publicAPI = {
  getContent: (language: string = 'en', params?: any) => 
    api.get(`/public/content`, { params: { language, ...params } }),
  
  getContentByType: (type: string, language: string = 'en') =>
    api.get(`/public/content/type/${type}`, { params: { language } }),
  
  getContentByKey: (key: string, language: string = 'en') =>
    api.get(`/public/content/${key}`, { params: { language } }),
  
  search: (query: string, language: string = 'en', params?: any) =>
    api.get(`/public/search`, { params: { q: query, language, ...params } }),
  
  getMeta: () =>
    api.get(`/public/meta`),
  
  // Query submission
  submitQuery: (data: { name: string; email: string; message: string }) =>
    api.post('/queries', { ...data, phone: '' }),
  
  // Songs
  getSongs: (language: string = 'en', params?: any) =>
    api.get(`/songs/public/all`, { params: { language, ...params } }),
  
  incrementSongPlay: (songId: string) =>
    api.post(`/songs/public/${songId}/play`),
};

// Songs API (Admin)
export const songsAPI = {
  getAll: (params?: any) => api.get('/songs', { params }),
  
  getById: (id: string) => api.get(`/songs/${id}`),
  
  create: (data: any) => api.post('/songs', data),
  
  update: (id: string, data: any) => api.put(`/songs/${id}`, data),
  
  delete: (id: string) => api.delete(`/songs/${id}`),
};

// Footer API
export const footerAPI = {
  // Public
  get: (language: string = 'en') => api.get(`/footer`, { params: { lang: language } }),
  
  // Admin
  getAdmin: () => api.get('/footer/admin'),
  
  save: (data: any) => api.post('/footer', data),
  
  addSocialIcon: (data: any) => api.post('/footer/social-icon', data),
  
  updateSocialIcon: (index: number, data: any) => api.put(`/footer/social-icon/${index}`, data),
  
  deleteSocialIcon: (index: number) => api.delete(`/footer/social-icon/${index}`),
};

// Logo API
export const logoAPI = {
  // Public
  get: () => api.get('/logo'),
  
  // Admin
  getAdmin: () => api.get('/logo/admin'),
  
  save: (data: any) => api.post('/logo', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default api;
