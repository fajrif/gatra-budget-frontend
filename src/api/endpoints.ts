import api from '@/api/axios';
import type {
  Address,
  AddressResponse,
  Area,
  AreaResponse,
  City,
  CityResponse,
  Country,
  CountryResponse,
  ListEnvelope,
  ListParams,
  LoginRequest,
  LoginResponse,
  Province,
  ProvinceResponse,
  UpdateMeRequest,
  User,
  UserRequest,
  UserResponse,
  UUID,
} from '@/types';

// Auth API
export const authAPI = {
  login: (credentials: LoginRequest) => api.post<LoginResponse>('/auth/login', credentials),
  getMe: () => api.get<User>('/me'),
  updateMe: (data: UpdateMeRequest) => api.put<User>('/me', data),
};

// Users API (admin only)
export const usersAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'users', User>>('/users', { params }),
  getById: (id: UUID) => api.get<User>(`/users/${id}`),
  create: (data: UserRequest) => api.post<User>('/users', data),
  update: (id: UUID, data: UserRequest) => api.put<User>(`/users/${id}`, data),
  delete: (id: UUID) => api.delete(`/users/${id}`),
  getAddresses: (userId: UUID, params?: ListParams) =>
    api.get<ListEnvelope<'addresses', Address>>(`/users/${userId}/addresses`, { params }),
};

/**
 * Upload path segments are interpolated into the URL. `handlers.uploads.go` keys
 * these off a `validCombinations` map, so both segments are constrained to the
 * literals the backend actually accepts (currently only `users` / `photo`).
 */
export type UploadResource = 'users';
export type UploadField = 'photo';

export const uploadAPI = {
  upload: (resource: UploadResource, field: UploadField, id: UUID, formData: FormData) =>
    api.post(`/upload/${resource}/${field}/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (resource: UploadResource, field: UploadField, id: UUID) =>
    api.delete(`/upload/${resource}/${field}/${id}`),
};

// Countries API
export const countriesAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'countries', Country>>('/countries', { params }),
  getById: (id: UUID) => api.get<CountryResponse>(`/countries/${id}`),
  create: (data: Partial<Country>) => api.post<CountryResponse>('/countries', data),
  update: (id: UUID, data: Partial<Country>) => api.put<CountryResponse>(`/countries/${id}`, data),
  delete: (id: UUID) => api.delete(`/countries/${id}`),
};

// Provinces API
export const provincesAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'provinces', Province>>('/provinces', { params }),
  getById: (id: UUID) => api.get<ProvinceResponse>(`/provinces/${id}`),
  create: (data: Partial<Province>) => api.post<ProvinceResponse>('/provinces', data),
  update: (id: UUID, data: Partial<Province>) => api.put<ProvinceResponse>(`/provinces/${id}`, data),
  delete: (id: UUID) => api.delete(`/provinces/${id}`),
};

// Cities API
export const citiesAPI = {
  getAll: (params?: ListParams) => api.get<ListEnvelope<'cities', City>>('/cities', { params }),
  getById: (id: UUID) => api.get<CityResponse>(`/cities/${id}`),
  create: (data: Partial<City>) => api.post<CityResponse>('/cities', data),
  update: (id: UUID, data: Partial<City>) => api.put<CityResponse>(`/cities/${id}`, data),
  delete: (id: UUID) => api.delete(`/cities/${id}`),
};

// Areas API
export const areasAPI = {
  getAll: (params?: ListParams) => api.get<ListEnvelope<'areas', Area>>('/areas', { params }),
  getById: (id: UUID) => api.get<AreaResponse>(`/areas/${id}`),
  create: (data: Partial<Area>) => api.post<AreaResponse>('/areas', data),
  update: (id: UUID, data: Partial<Area>) => api.put<AreaResponse>(`/areas/${id}`, data),
  delete: (id: UUID) => api.delete(`/areas/${id}`),
};

// Addresses API (current user's own addresses)
export const addressesAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'addresses', Address>>('/me/addresses', { params }),
  getMine: (params?: ListParams) =>
    api.get<ListEnvelope<'addresses', Address>>('/me/addresses', { params }),
  getById: (id: UUID) => api.get<AddressResponse>(`/me/addresses/${id}`),
  create: (data: Partial<Address>) => api.post<AddressResponse>('/me/addresses', data),
  update: (id: UUID, data: Partial<Address>) => api.put<AddressResponse>(`/me/addresses/${id}`, data),
  delete: (id: UUID) => api.delete(`/me/addresses/${id}`),
  deleteMine: (id: UUID) => api.delete(`/me/addresses/${id}`),
};

// Reports API (add new report endpoints here)
// NOTE: `/reports/sample` is a frontend placeholder — the Go backend has no
// /reports route registered, so this call 404s until the endpoint exists.
export const reportsAPI = {
  getSample: (params?: ListParams) =>
    api.get<ListEnvelope<'reports', unknown>>('/reports/sample', { params }),
};

export type { UserResponse };