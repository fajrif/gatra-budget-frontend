import api from './axios';

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/me'),
  updateMe: (data) => api.put('/me', data),
};

// Users API (admin only)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getAddresses: (userId, params) => api.get(`/users/${userId}/addresses`, { params }),
};

// Upload API
export const uploadAPI = {
  upload: (resource, field, id, formData) =>
    api.post(`/upload/${resource}/${field}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (resource, field, id) => api.delete(`/upload/${resource}/${field}/${id}`),
};

// Countries API
export const countriesAPI = {
  getAll: (params) => api.get('/countries', { params }),
  getById: (id) => api.get(`/countries/${id}`),
  create: (data) => api.post('/countries', data),
  update: (id, data) => api.put(`/countries/${id}`, data),
  delete: (id) => api.delete(`/countries/${id}`),
};

// Provinces API
export const provincesAPI = {
  getAll: (params) => api.get('/provinces', { params }),
  getById: (id) => api.get(`/provinces/${id}`),
  create: (data) => api.post('/provinces', data),
  update: (id, data) => api.put(`/provinces/${id}`, data),
  delete: (id) => api.delete(`/provinces/${id}`),
};

// Cities API
export const citiesAPI = {
  getAll: (params) => api.get('/cities', { params }),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

// Areas API
export const areasAPI = {
  getAll: (params) => api.get('/areas', { params }),
  getById: (id) => api.get(`/areas/${id}`),
  create: (data) => api.post('/areas', data),
  update: (id, data) => api.put(`/areas/${id}`, data),
  delete: (id) => api.delete(`/areas/${id}`),
};

// Addresses API (current user's own addresses)
export const addressesAPI = {
  getAll: (params) => api.get('/me/addresses', { params }),
  getMine: (params) => api.get('/me/addresses', { params }),
  getById: (id) => api.get(`/me/addresses/${id}`),
  create: (data) => api.post('/me/addresses', data),
  update: (id, data) => api.put(`/me/addresses/${id}`, data),
  delete: (id) => api.delete(`/me/addresses/${id}`),
  deleteMine: (id) => api.delete(`/me/addresses/${id}`),
};

// Reports API (add new report endpoints here)
export const reportsAPI = {
  getSample: (params) => api.get('/reports/sample', { params }),
};
