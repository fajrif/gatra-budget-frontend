import api from '@/api/axios';
import type {
  Address,
  AddressResponse,
  Area,
  AreaResponse,
  BudgetItem,
  BudgetItemResponse,
  City,
  CityResponse,
  Client,
  ClientResponse,
  ContractType,
  ContractTypeResponse,
  CostType,
  CostTypeResponse,
  Country,
  CountryResponse,
  ListEnvelope,
  ListParams,
  LoginRequest,
  LoginResponse,
  ManagementFeeRow,
  ManagementFeeTotals,
  Project,
  ProjectResponse,
  ProjectSummary,
  StatusKontrak,
  Province,
  ProvinceResponse,
  Transaction,
  TransactionResponse,
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
export type UploadResource = 'users' | 'transactions';
export type UploadField = 'photo' | 'bukti_transaksi';

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

// Clients API (reads open to any authenticated user, writes admin-only)
export const clientsAPI = {
  getAll: (params?: ListParams) => api.get<ListEnvelope<'clients', Client>>('/clients', { params }),
  getById: (id: UUID) => api.get<ClientResponse>(`/clients/${id}`),
  create: (data: Partial<Client>) => api.post<ClientResponse>('/clients', data),
  update: (id: UUID, data: Partial<Client>) => api.put<ClientResponse>(`/clients/${id}`, data),
  delete: (id: UUID) => api.delete(`/clients/${id}`),
};

// Contract Types API (reads open to any authenticated user, writes admin-only)
export const contractTypesAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'contract_types', ContractType>>('/contract-types', { params }),
  getById: (id: UUID) => api.get<ContractTypeResponse>(`/contract-types/${id}`),
  create: (data: Partial<ContractType>) => api.post<ContractTypeResponse>('/contract-types', data),
  update: (id: UUID, data: Partial<ContractType>) =>
    api.put<ContractTypeResponse>(`/contract-types/${id}`, data),
  delete: (id: UUID) => api.delete(`/contract-types/${id}`),
};

// Cost Types API (reads open to any authenticated user, writes admin-only)
export const costTypesAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'cost_types', CostType>>('/cost-types', { params }),
  getById: (id: UUID) => api.get<CostTypeResponse>(`/cost-types/${id}`),
  create: (data: Partial<CostType>) => api.post<CostTypeResponse>('/cost-types', data),
  update: (id: UUID, data: Partial<CostType>) => api.put<CostTypeResponse>(`/cost-types/${id}`, data),
  delete: (id: UUID) => api.delete(`/cost-types/${id}`),
};

// Projects API (full CRUD, any authenticated user)
export const projectsAPI = {
  getAll: (params?: ListParams) =>
    api.get<ListEnvelope<'projects', Project>>('/projects', { params }),
  getById: (id: UUID) => api.get<ProjectResponse>(`/projects/${id}`),
  create: (data: Partial<Project>) => api.post<ProjectResponse>('/projects', data),
  update: (id: UUID, data: Partial<Project>) => api.put<ProjectResponse>(`/projects/${id}`, data),
  delete: (id: UUID) => api.delete(`/projects/${id}`),
};

// Budget Items API (full CRUD, any authenticated user). Children are
// server-computed by the BudgetItemSplitter — only create/update the parent.
export const budgetItemsAPI = {
  getAll: (params?: ListParams & { project_id?: string; parent_budget_id?: string }) =>
    api.get<ListEnvelope<'budget_items', BudgetItem>>('/budget-items', { params }),
  getById: (id: UUID) => api.get<BudgetItemResponse>(`/budget-items/${id}`),
  create: (data: {
    project_id: UUID;
    cost_type_id: UUID;
    kategori_anggaran: string;
    total_anggaran: number;
    deskripsi_anggaran?: string;
  }) => api.post<BudgetItemResponse>('/budget-items', data),
  update: (
    id: UUID,
    data: {
      project_id: UUID;
      cost_type_id: UUID;
      kategori_anggaran: string;
      total_anggaran: number;
      deskripsi_anggaran?: string;
    },
  ) => api.put<BudgetItemResponse>(`/budget-items/${id}`, data),
  delete: (id: UUID) => api.delete(`/budget-items/${id}`),
};

// Transactions API (full CRUD, any authenticated user). bulan_realisasi and
// the management-fee fields are server-computed — never send them.
export const transactionsAPI = {
  getAll: (params?: ListParams & { project_id?: string; cost_type_id?: string }) =>
    api.get<ListEnvelope<'transactions', Transaction>>('/transactions', { params }),
  getById: (id: UUID) => api.get<TransactionResponse>(`/transactions/${id}`),
  create: (data: {
    project_id: UUID;
    cost_type_id: UUID;
    tanggal_transaksi: string;
    tanggal_po_tagihan?: string;
    deskripsi_realisasi?: string;
    jumlah_realisasi: number;
    jumlah_tenaga_kerja?: number;
  }) => api.post<TransactionResponse>('/transactions', data),
  update: (
    id: UUID,
    data: {
      project_id: UUID;
      cost_type_id: UUID;
      tanggal_transaksi: string;
      tanggal_po_tagihan?: string;
      deskripsi_realisasi?: string;
      jumlah_realisasi: number;
      jumlah_tenaga_kerja?: number;
    },
  ) => api.put<TransactionResponse>(`/transactions/${id}`, data),
  delete: (id: UUID) => api.delete(`/transactions/${id}`),
};

// Non-sensitive per-project report sub-routes (open to any authenticated user)
export const projectReportsAPI = {
  getBudgetTrend: (projectId: UUID) =>
    api.get<{ budget_trend: { month: string; anggaran: number; realisasi: number }[] }>(
      `/projects/${projectId}/budget-trend`,
    ),
  getSLABreakdown: (projectId: UUID) =>
    api.get<{ sla_breakdown: Record<string, number> }>(`/projects/${projectId}/sla-breakdown`),
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

  // Admin-only financial reports. Callers must gate on user.role === 'admin';
  // the server rejects anything else with 403.
  getProjectsSummary: (params?: ListParams & { status_kontrak?: StatusKontrak }) =>
    api.get<ListEnvelope<'projects_summary', ProjectSummary>>('/reports/projects-summary', {
      params,
    }),
  getProjectSummary: (projectId: UUID) =>
    api.get<{ project_summary: ProjectSummary }>(`/reports/projects/${projectId}/summary`),
  getManagementFee: () =>
    api.get<{ rows: ManagementFeeRow[]; totals: ManagementFeeTotals }>('/reports/management-fee'),
};

export type { UserResponse };