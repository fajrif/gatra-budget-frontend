import api from '@/api/axios';
import type {
  Address,
  AddressResponse,
  Area,
  AreaResponse,
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
  ImportResult,
  ImportRow,
  ListEnvelope,
  ListParams,
  LoginRequest,
  LoginResponse,
  Invoice,
  InvoiceResponse,
  InvoiceStatus,
  MonthlyReportRow,
  MonthlyReportTotals,
  ContractStatus,
  Project,
  ProjectResponse,
  ProjectSummary,
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
  import: (rows: ImportRow[]) => api.post<ImportResult>('/projects/import', { rows }),
};

// Transactions API (full CRUD, any authenticated user). bulan_realisasi is
// server-computed — never send it.
export interface TransactionPayload {
  project_id: UUID;
  cost_type_id: UUID;
  tanggal_transaksi: string;
  deskripsi_realisasi?: string;
  jumlah_realisasi: number;
  jumlah_tenaga_kerja?: number;
}

export const transactionsAPI = {
  getAll: (params?: ListParams & { project_id?: string; cost_type_id?: string }) =>
    api.get<ListEnvelope<'transactions', Transaction>>('/transactions', { params }),
  getById: (id: UUID) => api.get<TransactionResponse>(`/transactions/${id}`),
  create: (data: TransactionPayload) => api.post<Transaction>('/transactions', data),
  update: (id: UUID, data: TransactionPayload) => api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: UUID) => api.delete(`/transactions/${id}`),
  import: (rows: ImportRow[]) => api.post<ImportResult>('/transactions/import', { rows }),
};

// Invoices API (full CRUD, any authenticated user). Create/update return the
// bare invoice; get-by-id wraps it as `{ invoice }`.
export interface InvoicePayload {
  no_invoice: string;
  project_id: UUID;
  nama_invoice: string;
  tgl_tagihan: string;
  tgl_bayar?: string;
  status: InvoiceStatus;
  nilai: number;
  description?: string;
  manajemen_fee: number;
}

export const invoicesAPI = {
  getAll: (
    params?: ListParams & { project_id?: string; status?: InvoiceStatus; month?: string },
  ) => api.get<ListEnvelope<'invoices', Invoice>>('/invoices', { params }),
  getById: (id: UUID) => api.get<InvoiceResponse>(`/invoices/${id}`),
  create: (data: InvoicePayload) => api.post<Invoice>('/invoices', data),
  update: (id: UUID, data: InvoicePayload) => api.put<Invoice>(`/invoices/${id}`, data),
  delete: (id: UUID) => api.delete(`/invoices/${id}`),
  import: (rows: ImportRow[]) => api.post<ImportResult>('/invoices/import', { rows }),
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
  getProjectsSummary: (params?: ListParams & { contract_status?: ContractStatus }) =>
    api.get<ListEnvelope<'projects_summary', ProjectSummary>>('/reports/projects-summary', {
      params,
    }),
  getProjectSummary: (projectId: UUID) =>
    api.get<{ project_summary: ProjectSummary }>(`/reports/projects/${projectId}/summary`),
  getMonthly: (params?: { year?: number; project_id?: UUID }) =>
    api.get<{ year: number; rows: MonthlyReportRow[]; totals: MonthlyReportTotals }>(
      '/reports/monthly',
      { params },
    ),
};

export type { UserResponse };